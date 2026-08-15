import { useEffect, useRef, useState } from 'react';
import { MicIcon } from './icons';
import './LiveRecordingModal.css';

export default function LiveRecordingModal({ onStop = () => {}, onCancel = () => {} }) {
  const [seconds, setSeconds] = useState(0);
  const [isSimulated, setIsSimulated] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Metrics collection
  const metricsRef = useRef({
    volumeSamples: [],
    pitchSamples: [],
    startTime: Date.now(),
  });

  useEffect(() => {
    let timerInterval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    let isSubscribed = true;

    async function initAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isSubscribed) return;
        streamRef.current = stream;

        // Setup MediaRecorder (from Kusum's reference)
        try {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          recorder.start();
        } catch (e) {
          console.warn('MediaRecorder init error:', e);
        }

        // Setup Web Audio API Analyser
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;

        startCanvasAnimation(analyser);
      } catch (err) {
        console.warn('Microphone access denied or unavailable. Switching to interactive simulation.', err);
        if (!isSubscribed) return;
        setIsSimulated(true);
        startCanvasAnimation(null);
      }
    }

    initAudio();

    return () => {
      isSubscribed = false;
      clearInterval(timerInterval);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startCanvasAnimation = (analyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;

    const dataArray = new Uint8Array(64);

    const render = () => {
      time += 0.03;
      const width = (canvas.width = canvas.clientWidth || window.innerWidth);
      const height = (canvas.height = canvas.clientHeight || window.innerHeight);

      let currentVolume = 0;
      let currentPitchVar = 0;

      if (analyserNode) {
        analyserNode.getByteFrequencyData(dataArray);
        let sum = 0;
        let peakFreq = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
          if (dataArray[i] > peakFreq) peakFreq = i;
        }
        currentVolume = sum / (dataArray.length * 255);
        currentPitchVar = peakFreq / dataArray.length;
      } else {
        // Interactive acoustic simulation if mic unavailable
        currentVolume = 0.25 + Math.sin(time * 2.5) * 0.2 + (Math.random() * 0.1);
        currentPitchVar = 0.3 + Math.cos(time * 1.8) * 0.25;
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.floor(
            128 + Math.sin(time * 3 + i * 0.2) * 80 + (Math.random() * 20)
          );
        }
      }

      setAudioLevel(currentVolume);
      metricsRef.current.volumeSamples.push(currentVolume);
      metricsRef.current.pitchSamples.push(currentPitchVar);

      // Render gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#121019');
      bgGrad.addColorStop(0.5, '#1e1a29');
      bgGrad.addColorStop(1, '#0d0b12');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render glowing sun / energy orb
      const orbX = width * 0.5;
      const orbY = height * 0.28;
      const orbRadius = 70 + currentVolume * 60;
      const sunGrad = ctx.createRadialGradient(orbX, orbY, 5, orbX, orbY, orbRadius);
      sunGrad.addColorStop(0, 'rgba(255, 200, 180, 0.9)');
      sunGrad.addColorStop(0.4, 'rgba(232, 160, 145, 0.4)');
      sunGrad.addColorStop(1, 'rgba(232, 160, 145, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
      ctx.fill();

      // Render 4 layered procedural terrain ridges
      const layers = [
        { color: 'rgba(232, 160, 145, 0.45)', base: 0.52, amp: 70, speed: 0.8 },
        { color: 'rgba(221, 127, 114, 0.65)', base: 0.62, amp: 85, speed: 1.1 },
        { color: 'rgba(200, 95, 85, 0.85)', base: 0.73, amp: 100, speed: 1.4 },
        { color: 'rgba(168, 68, 61, 0.98)', base: 0.84, amp: 120, speed: 1.7 },
      ];

      layers.forEach((layer, idx) => {
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.moveTo(0, height);

        const steps = 40;
        const sliceWidth = width / steps;

        for (let i = 0; i <= steps; i++) {
          const x = i * sliceWidth;
          const freqVal = dataArray[i % dataArray.length] / 255;
          const noise =
            Math.sin(i * 0.25 + time * layer.speed + idx) *
            Math.cos(i * 0.15 - time * 0.5);

          const displacement =
            (noise * layer.amp) + (freqVal * layer.amp * 1.5 * (currentVolume + 0.3));

          const y = height * layer.base - displacement;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const handleStopRecording = () => {
    const vols = metricsRef.current.volumeSamples;
    const pitches = metricsRef.current.pitchSamples;

    const avgVol = vols.length ? vols.reduce((a, b) => a + b, 0) / vols.length : 0.35;
    const maxVol = vols.length ? Math.max(...vols) : 0.5;
    const minVol = vols.length ? Math.min(...vols) : 0.1;
    const volVar = maxVol - minVol;

    const avgPitch = pitches.length ? pitches.reduce((a, b) => a + b, 0) / pitches.length : 0.4;
    const maxPitch = pitches.length ? Math.max(...pitches) : 0.6;
    const minPitch = pitches.length ? Math.min(...pitches) : 0.2;
    const pitchVar = maxPitch - minPitch;

    onStop({
      avgVolume: avgVol,
      volumeVariance: volVar,
      pitchVariance: pitchVar,
      durationSeconds: seconds,
    });
  };

  const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="live-recording-modal">
      <canvas ref={canvasRef} className="live-terrain-canvas" />

      <header className="live-header">
        <button type="button" className="close-btn" onClick={onCancel} aria-label="Cancel session">
          ✕
        </button>
        <div className="live-status">
          <span className="live-dot" />
          <span className="live-title">{isSimulated ? 'Simulated Voice' : 'Listening...'}</span>
        </div>
        <div className="timer-badge">{formatTimer(seconds)}</div>
      </header>

      <main className="live-center">
        <div className="mic-pulse-container" style={{ transform: `scale(${1 + audioLevel * 0.3})` }}>
          <div className="pulse-ring ring-1" />
          <div className="pulse-ring ring-2" />
          <div className="mic-core">
            <MicIcon />
          </div>
        </div>
        <p className="pitch-caption">
          Speak freely. Terrain is forming from your voice dynamics...
        </p>
      </main>

      <footer className="live-footer">
        <button
          type="button"
          className="stop-button"
          onClick={handleStopRecording}
        >
          <span className="stop-square" />
          <span>Stop Recording</span>
        </button>
      </footer>
    </div>
  );
}
