import { useEffect, useRef, useState } from 'react';
import { createProsodyAnalyzer } from '../utils/audioAnalyzer';
import './LiveRecordingModal.css';

export default function LiveRecordingModal({ onStop = () => { }, onCancel = () => { } }) {
  const [seconds, setSeconds] = useState(4);
  const [isExiting, setIsExiting] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [statusHint, setStatusHint] = useState('Listening — voice terrain forming');

  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const prosodyAnalyzerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recognitionRef = useRef(null);

  const audioChunksRef = useRef([]);
  const audioURLRef = useRef(null);
  const transcriptRef = useRef('');

  const smoothVolumeRef = useRef(0);
  const smoothSpectrumRef = useRef(new Float32Array(32));

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

    const particles = Array.from({ length: 35 }, () => ({
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

      let currentVolume = 0;
      let currentPitch = 0;
      let currentEnergy = 0;
      let currentFlux = 0;

      if (prosodyAnalyzerRef.current) {
        const sample = prosodyAnalyzerRef.current.getSample();
        currentPitch = sample.pitch || 0;
        currentEnergy = sample.energy || sample.rms || 0;
        currentFlux = sample.spectralFlux || 0;

        if (prosodyAnalyzerRef.current.analyser) {
          prosodyAnalyzerRef.current.analyser.smoothingTimeConstant = 0.85;
          prosodyAnalyzerRef.current.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          currentVolume = sum / (dataArray.length * 255);
        }
      } else {
        // Pure smooth sine wave simulation (no Math.random noise jitter)
        currentVolume = 0.28 + Math.sin(time * 1.5) * 0.16;
        currentPitch = 190 + Math.sin(time * 1.2) * 30;
        currentEnergy = currentVolume * 0.8;
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.floor(130 + Math.sin(time * 2.0 + i * 0.25) * 60);
        }
      }

      // Exponential lerp smoothing for 100% butter-smooth motion
      smoothVolumeRef.current += (currentVolume - smoothVolumeRef.current) * 0.08;
      const smoothVol = smoothVolumeRef.current;

      // Record metrics without causing React re-renders
      samplesRef.current.volumes.push(currentVolume);
      if (currentPitch) samplesRef.current.pitches.push(currentPitch);
      samplesRef.current.energies.push(currentEnergy);
      samplesRef.current.fluxes.push(currentFlux);

      // Render immersive soft sage gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#f2f7ef');
      bgGrad.addColorStop(0.5, '#e4efdf');
      bgGrad.addColorStop(1, '#bcd6b7');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render drifting ambient sparkle particles
      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < 0) p.y = 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render 4 silk-smooth layered terrain ridges using quadratic Bezier splines
      const layers = [
        { color: 'rgba(215, 233, 209, 0.85)', base: 0.50, amp: 36, speed: 0.35 },
        { color: 'rgba(195, 221, 188, 0.9)', base: 0.58, amp: 46, speed: 0.55 },
        { color: 'rgba(165, 204, 157, 0.95)', base: 0.66, amp: 56, speed: 0.75 },
        { color: '#97c78d', base: 0.74, amp: 66, speed: 0.95 },
      ];

      layers.forEach((layer, idx) => {
        const steps = 28;
        const sliceWidth = width / steps;

        // Moderate volume lift capped at 0.15 (keeps terrain comfortably below header)
        const volumeLift = Math.min(0.15, smoothVol * 0.22);
        const dynamicBase = layer.base - volumeLift;

        const points = [];
        for (let i = 0; i <= steps; i++) {
          const x = i * sliceWidth;
          const rawFreq = (dataArray[i % dataArray.length] || 0) / 255;

          // Smooth per-step spectrum value
          if (!smoothSpectrumRef.current[i]) smoothSpectrumRef.current[i] = rawFreq;
          smoothSpectrumRef.current[i] += (rawFreq - smoothSpectrumRef.current[i]) * 0.08;
          const freqVal = smoothSpectrumRef.current[i];

          const noise =
            Math.sin(i * 0.20 + time * layer.speed + idx) *
            Math.cos(i * 0.12 - time * 0.20);

          // Medium sensitivity sound swell
          const soundIntensitySwell = freqVal * 0.8 + smoothVol * 1.0;
          const displacement = noise * layer.amp + soundIntensitySwell * layer.amp * 0.5;

          // Smooth natural curve compression (eliminates flat-line clipping)
          const targetY = height * dynamicBase - displacement;
          const maxAllowedLift = height * 0.35;
          const rawLift = (height * layer.base) - targetY;
          const smoothLift = maxAllowedLift * Math.tanh(rawLift / maxAllowedLift);
          const y = (height * layer.base) - smoothLift;

          points.push({ x, y });
        }

        // Draw silk-smooth Quadratic Bezier Spline
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
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

    // Initialize Web Speech API for speech-to-text
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

      {/* Header matching Screenshot 1 */}
      <header className="live-header-screenshot">
        <button type="button" className="back-circle-btn" onClick={onCancel} aria-label="Go back">
          ←
        </button>
        <div className="timer-pill">{formatTimer(seconds)}</div>
      </header>

      {/* Floating Status Pill (Flicker-free steady text) */}
      <div className="listening-status-wrapper">
        <div className="listening-status-pill">
          {liveTranscript ? `"${liveTranscript.slice(-38)}..."` : statusHint}
        </div>
      </div>

      {/* Bottom Blue Stop Button */}
      <footer className="live-footer-screenshot">
        <button
          type="button"
          className="blue-stop-button"
          onClick={handleStopRecording}
          aria-label="Stop recording"
        >
          <div className="blue-stop-outer-ring" />
          <div className="blue-stop-core">
            <span className="stop-icon-square" />
          </div>
        </button>
      </footer>
    </div>
  );
}
