import { useState, useRef } from "react";

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function MicIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" {...common} {...props}>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3.5" />
      <path d="M8.5 21.5h7" />
    </svg>
  );
}

export function HomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...common} {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5a1 1 0 0 0 1 1h3.5v-5a1.5 1.5 0 0 1 1.5-1.5v0A1.5 1.5 0 0 1 13.5 15.5v5H17a1 1 0 0 0 1-1V10" />
    </svg>
  );
}

export function ReflectionsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...common} {...props}>
      <path d="M3.5 18.5 8.5 12l3.5 3 4-6 4.5 6" />
      <path d="M3.5 21h17" />
    </svg>
  );
}

export function SettingsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...common} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H4.5a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.04 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10.6a1.7 1.7 0 0 0 1.04-1.56V4.5a2 2 0 1 1 4 0v.09c0 .68.4 1.29 1.04 1.56.63.27 1.36.14 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.03c.27.63.88 1.04 1.56 1.04h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04Z" />
    </svg>
  );
}

export function ChevronRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...common} {...props}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
export default function VoiceRecorder() {
  //Keep tracks when the mic is recording and when it stopped
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  //Keeps the MediaRecorder instance between renders without causing the component to re-render whenever the recorder changes.
  const mediaRecorderRef = useRef(null);
  //Stores recorded audio chunks before they're combined into a single audio file.
  const audioChunksRef = useRef([]);

  // Format seconds into mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  //starts recording the audio
  const startRecording = async () => {
    try {
      try {
        //Request access to the microphone.
        //The browser will show a permission prompt the first time.
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        //A MediaRecorder instance that'll record the audio
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorderRef.current = mediaRecorder;

        audioChunksRef.current = [];

        // MediaRecorder calls this whenever a new piece of audio is available after recording
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
        setAudioURL("");
      } catch (error) {
        console.error("Error starting recording:", error);
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType
        });
      };
      const stopRecording = async () => {
        //Combine all the recorded audio chunks into one Blob.
        // A Blob is essentially a collection of binary data that
        // the browser can treat like a file.
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm"
        });
      };
      // without uploading the audio anywhere.
      const url = URL.createObjectURL(audioBlob);

      // Save the URL in React state so the audio player can use it.
      setAudioURL(url);

      // Stop every microphone track.
      stream.getTracks().forEach((track) => track.stop());

      // Begin collecting microphone data.
      recorder.start();

      // Update the UI to show that recording has started.
      setIsRecording(true);
    }
    catch (error) {
      console.error("Could not access microphone:", error);
    }
  };

  // Stops the current recording.
  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    // Make sure a recorder exists and is actually recording
    // before attempting to stop it.
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();

      // Immediately update the UI so the button changes back
      // to the "Start Recording" state.
      setIsRecording(false);
    }
  };

  return (
    <div>
      {/*
        We use one button for both actions.
        When recording is inactive it starts recording.
        When recording is active it stops recording.
      */}
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {/*
        Only show the audio player after we have successfully
        created a playable URL from a recording.
      */}
      {audioURL && (
        <audio controls src={audioURL}>
          Your browser does not support audio playback.
        </audio>
      )}
    </div>
  );
}
