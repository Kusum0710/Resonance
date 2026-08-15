import { useEffect, useRef, useState } from 'react';
import { createProsodyAnalyzer } from '../utils/audioAnalyzer';
import './LiveRecordingModal.css';

export default function LiveRecordingModal({ onStop = () => { }, onCancel = () => { } }) {
  const [seconds, setSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveBiomeHint, setLiveBiomeHint] = useState('Listening — voice terrain forming');

  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const prosodyAnalyzerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recognitionRef = useRef(null);

  // Audio chunks and final URL
  const audioChunksRef = useRef([]);
  const audioURLRef = useRef(null);
  const transcriptRef = useRef('');

  // Sample accumulation for neural net
  const samplesRef = useRef({
    volumes: [],
    pitches: [],
    energies: [],
    fluxes: [],
  });

  const cleanupAudioResources = () => {
    setTimeout(() => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
        if (prosodyAnalyzerRef.current) {
          prosodyAnalyzerRef.current.destroy();
          prosodyAnalyzerRef.current = null;
        }
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

  const startCanvasAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;

    const dataArray = new Uint8Array(64);

    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2.2 + 1,
      speed: Math.random() * 0.0012 + 0.0005,
      alpha: Math.random() * 0.6 + 0.25,
    }));

    const render = () => {
      time += 0.025;
      const width = (canvas.width = canvas.clientWidth || 430);
      const height = (canvas.height = canvas.clientHeight || 800);

      let currentVolume;
      let currentPitch;
      let currentEnergy;
      let currentFlux;

      if (prosodyAnalyzerRef.current) {
        const sample = prosodyAnalyzerRef.current.getSample();
        currentPitch = sample.pitch;
        currentEnergy = sample.energy || sample.rms || 0;
        currentFlux = sample.spectralFlux || 0;

        if (prosodyAnalyzerRef.current.analyser) {
          prosodyAnalyzerRef.current.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          currentVolume = sum / (dataArray.length * 255);
        }
      } else {
        // Fallback procedural oscillation
        currentVolume = 0.25 + Math.sin(time * 2) * 0.15 + Math.random() * 0.05;
        currentPitch = 190 + Math.sin(time * 1.5) * 35;
        currentEnergy = currentVolume * 0.8;
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.floor(120 + Math.sin(time * 2.5 + i * 0.2) * 60);
        }
      }

      setAudioLevel(currentVolume);

      // Collect for neural net metrics
      samplesRef.current.volumes.push(currentVolume);
      if (currentPitch) samplesRef.current.pitches.push(currentPitch);
      samplesRef.current.energies.push(currentEnergy);
      samplesRef.current.fluxes.push(currentFlux);

      // Dynamic status hint based on prosody
      if (currentVolume > 0.6) {
        setLiveBiomeHint('High energy surge — volcanic peaks rising');
      } else if (currentPitch && currentPitch > 230) {
        setLiveBiomeHint('High pitch variance — mountain range forming');
      } else if (currentVolume < 0.2 && time > 2) {
        setLiveBiomeHint('Quiet rhythm — meadow valley settling');
      }

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#f2f7ef');
      bgGrad.addColorStop(0.5, '#e4efdf');
      bgGrad.addColorStop(1, '#bcd6b7');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Drifting particles
      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < 0) p.y = 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Animated multi-layer mountain ridges responding to prosody
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

        const steps = 32;
        const sliceWidth = width / steps;

        for (let i = 0; i <= steps; i++) {
          const x = i * sliceWidth;
          const freqVal = dataArray[i % dataArray.length] / 255;
          const noise =
            Math.sin(i * 0.3 + time * layer.speed + idx) *
            Math.cos(i * 0.2 - time * 0.4);

          const displacement =
            noise * layer.amp + freqVal * layer.amp * 1.3 * (currentVolume + 0.35);

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

  useEffect(() => {
    let isSubscribed = true;
    const timerInterval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Initialize Web Speech API for temporary transcription
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          const cleaned = currentTranscript.trim();
          transcriptRef.current = cleaned;
          setLiveTranscript(cleaned);
        };

        recognition.onerror = (e) => {
          console.warn('Speech recognition warning:', e.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition start failed:', e);
      }
    }

    async function initAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isSubscribed) return;
        streamRef.current = stream;

        // MediaRecorder for playback Blob
        try {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];

          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: recorder.mimeType || 'audio/webm',
            });
            audioURLRef.current = URL.createObjectURL(audioBlob);
          };

          recorder.start();
        } catch (e) {
          console.warn('MediaRecorder error:', e);
        }

        // Web Audio API + Pitchy + Meyda Prosody Analyzer
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);

        const prosodyAnalyzer = createProsodyAnalyzer(audioCtx, source, 1024);
        prosodyAnalyzerRef.current = prosodyAnalyzer;

        startCanvasAnimation();
      } catch (err) {
        console.warn('Microphone access fallback:', err);
        if (!isSubscribed) return;
        startCanvasAnimation();
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

  const handleStopRecording = () => {
    if (isExiting) return;
    setIsExiting(true);

    const vols = samplesRef.current.volumes;
    const pitches = samplesRef.current.pitches;
    const energies = samplesRef.current.energies;
    const fluxes = samplesRef.current.fluxes;

    const payload = {
      volumeSamples: vols,
      pitchSamples: pitches,
      energySamples: energies,
      fluxSamples: fluxes,
      durationSeconds: Math.max(4, seconds),
      transcript: transcriptRef.current || liveTranscript,
      audioURL: audioURLRef.current,
    };

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
          {liveTranscript ? `"${liveTranscript.slice(-38)}..."` : liveBiomeHint}
        </div>
      </div>

      <footer className="live-footer-screenshot">
        <button
          type="button"
          className="blue-stop-button"
          onClick={handleStopRecording}
          aria-label="Stop recording"
        >
          <div
            className="blue-stop-outer-ring"
            style={{ transform: `scale(${1 + audioLevel * 0.3})` }}
          />
          <div className="blue-stop-core">
            <span className="stop-icon-square" />
          </div>
        </button>
      </footer>
    </div>
  );
}
