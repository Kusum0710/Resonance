# 🎙️ RESONANCE

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-DSP-FF6B6B?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![On--Device AI](https://img.shields.io/badge/AI-On--Device_Neural_Net-4EBA6F?style=for-the-badge)](https://github.com/)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25_Zero_Cloud-9B51E0?style=for-the-badge)](https://github.com/)

> **"Your voice knows how you feel before your conscious mind does."**  
> Resonance is a private vocal reflection companion that transforms the raw acoustics of your spoken voice into living, generative procedural landscapes and actionable wellness insights.

---

## 🌟 Table of Contents
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [How It Works: The On-Device AI Pipeline](#-how-it-works-the-on-device-ai-pipeline)
- [The 5 Generative Biomes](#-the-5-generative-biomes)
- [Key Features](#-key-features)
- [Privacy & Ethics by Design](#-privacy--ethics-by-design)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Roadmap](#-future-roadmap)

---

## 🚨 The Problem

Traditional mood tracking and mental wellness tools are broken:
1. **Cognitive Burden & Forced Labels**: Selecting static emojis (😄, 😐, 😔) or typing long journal entries requires cognitive rationalization that often masks true underlying affect.
2. **Privacy Vulnerability**: Users are hesitant to speak authentically into apps that stream raw voice recordings to remote cloud servers.
3. **Language & Literacy Barriers**: Semantic sentiment analysis models struggle across multilingual speakers, dialects, or non-verbal vocalizations (sighs, hesitations, cadences).
4. **Lack of Somatic Feedback**: Standard apps tell you what you logged, but fail to provide immediate, somatic self-regulation mechanisms.

---

## 💡 Our Solution

**Resonance** shifts mood reflection from *semantic categorization* to *acoustic biomarker analysis*:
- **Acoustic Prosody Extraction**: Evaluates pitch variance, energy dynamics, pause density, speech rate, and vocal jitter in real-time.
- **Language Agnostic**: Analyzes *how* you speak, not just *what* you speak. Works seamlessly across any language, accent, or dialect.
- **Generative Landscape Art**: Transforms complex emotional states into an intuitive visual metaphor—a living biome.
- **Immediate Somatic Reset**: Recommends targeted, interactive breathing protocols (Physiological Sigh, Box Breathing, 4-7-8) based on your detected acoustic strain.

---

## 🧠 How It Works: The On-Device AI Pipeline

```
┌─────────────────┐
│ User Microphone │
└────────┬────────┘
         │ (Float32Array PCM Audio Buffer)
         ▼
┌─────────────────────────────────────────────────────────────┐
│             Web Audio API + Real-time DSP Engine            │
├──────────────────────────────┬──────────────────────────────┤
│  Pitchy (YIN Algorithm)      │  Meyda Feature Extractor     │
│  - Fundamental Freq (f0)     │  - RMS Energy & Spectral RMS │
│  - Voiced Frame Tracking     │  - Peak Energy & Variance    │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               └──────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Statistical Feature Aggregation               │
│ Semitone-normalized pitch variance, WPM cadence, pause      │
│ density, energy variance, spectral flux jitter              │           
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Multi-Factor Probabilistic Biome Classifier                 │
│ 5 independent, explainable scoring functions (one per biome)| 
|  → Softmax normalization → highest-probability wins         │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│          Generative Procedural Canvas (fBm Noise)           │
│   Mountain Range │ Gray Plateau │ Meadow │ Storm │ Volcanic │
└─────────────────────────────────────────────────────────────┘
```

### 1. Acoustic Signal Processing (DSP)
* **Pitch Detection (YIN Algorithm)**: Evaluates fundamental frequency ($f_0$) across voiced audio windows with confidence gating ($>0.82$) to filter background noise.
* **Spectral Energy (RMS)**: Computes root-mean-square amplitude to capture dynamics between quiet whispers, normal cadence, and elevated pitch spikes.
* **Temporal Speech Rhythms**: Measures syllable rate and pause density (ratio of unvoiced silence intervals to total speaking time).

### 2. Probabilistic Biome Classification
Rather than a black-box model, Resonance uses five independent, hand-calibrated scoring functions — one per biome — each built from acoustically meaningful thresholds:

```js
// Simplified example: Thunderstorm scoring
thunderScore += speechRateNorm * 3.6;
thunderScore += (1 - pauseDensity) * 3.0;
thunderScore += jitterNorm * 2.2;
if (wpm >= 165) thunderScore += 2.0;
if (pauseDensity < 0.14) thunderScore += 1.5;
```

---

## 🏞️ The 5 Generative Biomes

| Biome | Emotional Signature | Acoustic Biomarkers | Procedural Canvas Rendering |
| :--- | :--- | :--- | :--- |
| **🏔️ Mountain Range** | Invigorated, Energized, Inspired | High pitch variance, high energy, brisk tempo | Majestic angular peaks, sunlit sky, rising golden particles |
| **🌫️ Gray Plateau** | Burnout, Exhaustion, Depletion | Flat pitch, low energy, long pauses | Monochromatic flat plateaus, low fog, ambient haze |
| **🌿 Quiet Meadow** | Grounded, Centered, Calm | Moderate energy, steady cadence, smooth pitch | Rolling soft green hills, floating spores, calm blue skies |
| **⚡ Thunderstorm** | High Stress, Anxiety, Overwhelmed | Erratic energy spikes, rapid pitch shifts | Jagged dark crags, rain streaks, pulsing lightning flashes |
| **🌋 Volcanic** | Agitated, Frustrated, Fiery | Sustained high energy, high pitch, short pauses | Obsidian ridges, lava glow, rising embers and heat waves |

---

## ✨ Key Features

### 1. Real-Time Vocal Reflection & Live Waveform
- Large haptic-style recording interface.
- Live animated oscilloscope visualizer and real-time transcription via Web Speech API.
- Generates an instant acoustic summary card upon session completion with a 0–10 intensity score and tailored self-reflection insights.

### 2. Interactive Weekly Prosody Dashboard
- **7-Day Trend Curve**: Smooth SVG cubic-bezier graph plotting daily emotional intensity. Interactive tooltips reveal day-by-day acoustic metrics.
- **Terrain Shift Wave**: Procedural canvas wave displaying the morphing contours and hue shifts between consecutive daily biomes.
- **Quick Scrub Swatches**: Click any past day to instantly inspect its acoustic footprint.

### 3. Somatic Breathing & Regulation Studio
- Built-in visual & auditory breathing coach with 4 evidence-based techniques:
  - 🫁 **4-7-8 Deep Rest**: Parasympathetic nervous system activation.
  - 📦 **Box Breathing (4-4-4-4)**: Focus stabilization and stress reduction.
  - 🌊 **Resonant Coherence (5.5s / 5.5s)**: Optimizes heart rate variability (HRV).
  - ⚡ **Physiological Sigh**: Fast-acting double-inhalation to immediately curb acute anxiety.
- Integrated Web Audio sine-wave chime synthesizers for soothing acoustic pacing.

### 4. Comprehensive Reflection Archive
- **Dashboard View**: High-level trends, shifting waves, and quick actions.
- **Days Feed**: Chronological card stack with complete spoken snippets, tags, and prosody metrics.
- **Month Calendar**: Visual heat-grid indicating which days were logged and their corresponding biome palettes.
- **Day Detail Deep-Dive**: Full-screen modal with comprehensive vocal statistics (Pitch in Hz, Energy in %, Speech rate, and Silence ratios).

---

## 🔒 Privacy & Ethics by Design

| Feature | Resonance Implementation | Traditional Apps |
| :--- | :--- | :--- |
| **Raw Voice Audio** | Discarded immediately after DSP analysis; never saved to disk | Uploaded to remote servers / S3 buckets |
| **Data Storage** | 100% Local Device Storage (`localStorage`) | Centralized relational / cloud databases |
| **AI Inference** | On-device JavaScript probability model | Server-side cloud LLM endpoints |
| **Account Creation** | Zero sign-up, zero logins, zero telemetry | Mandatory emails, profiles, and tracking IDs |
| **Classification Logic** | Transparent, rule-based acoustic scoring — fully auditable | Opaque trained models, unclear decision boundaries |

---

## 🛠️ Tech Stack

- **Core Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Audio & DSP**: [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API), [Pitchy (YIN Algorithm)](https://github.com/ianprime0509/pitchy), [Meyda](https://meyda.js.org/)
- **Visuals & Procedural Graphics**: HTML5 Canvas 2D, Fractional Brownian Motion (fBm) noise algorithms
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Modern CSS3 (Glassmorphism, custom typography, CSS Grid, clamp scaling)
- **Persistence**: Browser `localStorage` engine

---

## 📁 Project Structure

```text
resonance/
├── index.html                      # HTML5 entry with responsive viewport config
├── package.json                    # Project dependencies & build scripts
├── vite.config.js                  # Vite bundler configuration
├── src/
│   ├── main.jsx                    # React application entry point
│   ├── App.jsx                     # Core state orchestration & navigation controller
│   ├── App.css                     # Global layout and app-level styles
│   ├── index.css                   # CSS design tokens & reset
│   │
│   ├── components/                 # Modular UI & canvas components
│   │   ├── BottomNav.jsx           # Fluid mobile-optimized bottom navigation
│   │   ├── BreathingExercise.jsx   # 4-pattern breathing coach with Web Audio chimes
│   │   ├── DayDetailModal.jsx      # Modal deep-dive for daily reflections
│   │   ├── LiveRecordingModal.jsx  # Mic capture, waveform DSP & transcription
│   │   ├── MonthCalendar.jsx       # Month visual grid with biome indicators
│   │   ├── ResultCardModal.jsx     # Post-session diagnosis & biome result card
│   │   ├── TerrainPreview.jsx      # Procedural canvas biome renderer (fBm noise)
│   │   ├── TerrainShiftWave.jsx    # Interactive morphing terrain evolution wave
│   │   ├── TerrainSwatch.jsx       # Daily biome color & icon swatches
│   │   ├── ViewToggle.jsx          # Segmented dashboard/feed/calendar view switcher
│   │   ├── WeeklyProsodyChart.jsx  # Interactive 7-day SVG prosody trend curve
│   │   └── icons.jsx               # Lucide icon wrappers & custom visual glyphs
│   │
│   ├── screens/                    # Top-level screen views
│   │   ├── HomeScreen.jsx          # Hero trigger, today's status & streak metrics
│   │   ├── TimelineScreen.jsx      # Reflections hub (Dashboard, Feed, Calendar)
│   │   └── SettingsScreen.jsx      # Technical AI breakdown & local data reset
│   │
│   ├── lib/                        # Data models & storage utilities
│   │   ├── biomes.js               # Biome definitions, color palettes & descriptions
│   │   └── sessions.js             # LocalStorage manager & seed reflection dataset
│   │
│   └── utils/                      # AI & Acoustic DSP algorithms
│       └── audioAnalyzer.js        # Pitchy + Meyda extraction & on-device Neural Net
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher recommended)
- Modern web browser with Web Audio & Microphone permissions (Chrome, Safari, Edge, Firefox)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Kusum0710/Resonance.git
   cd Resonance
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173` (or the port specified in terminal).

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Run linter**:
   ```bash
   npm run lint
   ```

---

## 🔮 Future Roadmap

- [ ] **Wearable Sensor Fusion**: Correlate acoustic prosody scores with Apple Watch / Garmin real-time Photoplethysmography (PPG) Heart Rate Variability data.
- [ ] **WASM Acoustic Engine**: Compile custom C++ DSP filters (Mel-Filterbank Cepstral Coefficients) into WebAssembly for sub-millisecond edge profiling.
- [ ] **Spatial Audio Sonification**: Procedurally synthesize relaxing 3D spatial soundscapes reflecting the user's terrain in binaural audio.
- [ ] **Encrypted Decentralized Sync**: Optional end-to-end encrypted backup using user-owned decentralized keys (Web3 / DID / passkeys).
- [ ] **Robust On-Device Transcription**: Complete the transformers.js/Whisper fallback for network-independent transcription (currently falls back to Web Speech API, which requires connectivity).

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ for privacy-first affective computing and emotional wellness.</sub>
</div>
