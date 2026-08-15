import { useRef, useState } from "react";

export default function VoiceRecorder() {
    //Keep tracks when the mic is recording and when it stopped
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState("");
    //Keeps the MediaRecorder instance between renders without causing the component to re-render whenever the recorder changes.
    const mediaRecorderRef = useRef(null);
    //Stores recorded audio chunks before they're combined into a single audio file.
    const chunksRef = useRef([]);

    //starts recording the audio
    const startRecording = async () => {
        try {
            //Request access to the microphone.
            //The browser will show a permission prompt the first time.

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            //Create a MediaRecorder instance that'll record the audio
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;

            audioChunksRef.current = [];

            audioRecorder.ref
        }
    }

}