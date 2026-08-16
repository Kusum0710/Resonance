import { pipeline } from '@xenova/transformers';

let transcriberPromise = null;

function getTranscriber() {
    if (!transcriberPromise) {
        transcriberPromise = pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
    }
    return transcriberPromise;
}

export async function transcribeAudioBlob(blob) {
    const transcriber = await getTranscriber();
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const result = await transcriber(channelData);
    return result.text;
}