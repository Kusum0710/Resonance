/* eslint-disable react-hooks/immutability */
import { useEffect, useRef, useState } from 'react';
import './LiveRecordingModal.css';

export default function LiveRecordingModal({ onStop = () => { }, onCancel = () => { } }) {
  const [seconds, setSeconds] = useState(4);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Stores temporary pieces of the voice recording.
  // These will later be combined into one Blob when recording stops.
  const audioChunksRef = useRef([]);

  // Holds the temporary audio URL created when MediaRecorder stops.
  const audioURLRef = useRef(null);

  const metricsRef = useRef({
    volumeSamples: [],
    pitchSamples: [],
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

        try {
          // Create a MediaRecorder connected to the microphone stream.
          const recorder = new MediaRecorder(stream);

          mediaRecorderRef.current = recorder;

          // Clear chunks from any previous recording session.
          audioChunksRef.current = [];

          // Collect each temporary piece of recorded audio.
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          // Once recording has completely stopped, we combine the chunks
          // into one temporary audio Blob using the same pattern as VoiceRecorder.
          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: recorder.mimeType,
            });

            // Create a temporary URL that points to the audio Blob.
            const audioURL = URL.createObjectURL(audioBlob);

            // Store it so handleStopRecording can include it in the payload.
            audioURLRef.current = audioURL;
          };

          // Start recording.
          recorder.start();
        } catch (e) {
          console.warn('MediaRecorder init:', e);
        }

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
        console.warn('Microphone access fallback:', err);
        if (!isSubscribed) return;
        startCanvasAnimation(null);
      }
    }

    initAudio();

    return () => {
      isSubscribed = false;
      clearInterval(timerInterval);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      cleanupAudioResources();
    };
  }, []);

  const cleanupAudioResources = () => {
    setTimeout(() => {
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      } catch (e) {
        console.warn('Cleanup error:', e);
      }
    }, 50);
  };

  const startCanvasAnimation = (analyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;

    const dataArray = new Uint8Array(64);

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2 + 1,
      speed: Math.random() * 0.001 + 0.0005,
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const render = () => {
      time += 0.025;
      const width = (canvas.width = canvas.clientWidth || 430);
      const height = (canvas.height = canvas.clientHeight || 800);

      let currentVolume = 0;
      // eslint-disable-next-line no-useless-assignment
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
        currentVolume = 0.28 + Math.sin(time * 2) * 0.18 + Math.random() * 0.08;
        currentPitchVar = 0.35 + Math.cos(time * 1.5) * 0.2;
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.floor(130 + Math.sin(time * 2.5 + i * 0.2) * 70);
        }
      }

      setAudioLevel(currentVolume);
      metricsRef.current.volumeSamples.push(currentVolume);
      metricsRef.current.pitchSamples.push(currentPitchVar);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#f2f7ef');
      bgGrad.addColorStop(0.5, '#e4efdf');
      bgGrad.addColorStop(1, '#bcd6b7');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < 0) p.y = 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      const layers = [
        { color: 'rgba(215, 233, 209, 0.85)', base: 0.42, amp: 45, speed: 0.6 },
        { color: 'rgba(195, 221, 188, 0.9)', base: 0.54, amp: 55, speed: 0.9 },
        { color: 'rgba(165, 204, 157, 0.95)', base: 0.66, amp: 65, speed: 1.2 },
        { color: '#97c78d', base: 0.78, amp: 75, speed: 1.5 },
      ];

      layers.forEach((layer, idx) => {
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.moveTo(0, height);

        const steps = 30;
        const sliceWidth = width / steps;

        for (let i = 0; i <= steps; i++) {
          const x = i * sliceWidth;
          const freqVal = dataArray[i % dataArray.length] / 255;
          const noise =
            Math.sin(i * 0.3 + time * layer.speed + idx) *
            Math.cos(i * 0.2 - time * 0.4);

          const displacement =
            noise * layer.amp + freqVal * layer.amp * 1.2 * (currentVolume + 0.4);

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
    if (isExiting) return;
    setIsExiting(true);

    const vols = metricsRef.current.volumeSamples;
    const pitches = metricsRef.current.pitchSamples;

    const avgVol = vols.length ? vols.reduce((a, b) => a + b, 0) / vols.length : 0.45;
    const volVar = vols.length ? Math.max(...vols) - Math.min(...vols) : 0.35;
    const pitchVar = pitches.length ? Math.max(...pitches) - Math.min(...pitches) : 0.4;

    const payload = {
      avgVolume: avgVol,
      volumeVariance: volVar,
      pitchVariance: pitchVar,
      durationSeconds: seconds,
      audioURL: audioURLRef.current,
    };

    // Smooth transition delay (120ms) before triggering result popup
    setTimeout(() => {
      onStop(payload);
    }, 120);
  };

  const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`live-recording-modal ${isExiting ? 'live-recording-modal--exiting' : ''}`}>
      <canvas ref={canvasRef} className="live-terrain-canvas" />

      <header className="live-header-screenshot">
        <button type="button" className="back-circle-btn" onClick={onCancel} aria-label="Go back">
          ←
        </button>
        <div className="timer-pill">{formatTimer(seconds)}</div>
      </header>

      <div className="listening-status-wrapper">
        <div className="listening-status-pill">
          Listening — forming voice terrain...
        </div>
      </div>

      <footer className="live-footer-screenshot">
        <button
          type="button"
          className="blue-stop-button"
          onClick={handleStopRecording}
          aria-label="Stop recording"
        >
          <div className="blue-stop-outer-ring" style={{ transform: `scale(${1 + audioLevel * 0.25})` }} />
          <div className="blue-stop-core">
            <span className="stop-icon-square" />
          </div>
        </button>
      </footer>
    </div>
  );
}
