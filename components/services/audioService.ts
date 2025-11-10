import { generateSpeech } from './geminiService';

// Helper functions for decoding audio data from the API
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    // The raw audio data from the API is 16-bit PCM.
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Normalize the 16-bit signed integer to a float between -1.0 and 1.0
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


/**
 * Manages all audio playback for the application using the Web Audio API.
 * This service must be initialized by a user gesture (e.g., a click).
 */
export class AudioService {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private isMuted: boolean = false;
    private loadingOscillator: OscillatorNode | null = null;
    private inputFocusGain: GainNode | null = null;
    private inputFocusOscillator: OscillatorNode | null = null;
    private currentSpeechSource: AudioBufferSourceNode | null = null;

    /**
     * Initializes the AudioContext. Must be called after a user interaction.
     */
    public init(): void {
        if (this.audioContext) return;
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            if (this.isMuted) {
                this.masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            }
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
        }
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.audioContext) {
            const newGain = this.isMuted ? 0 : 1;
            this.masterGain.gain.linearRampToValueAtTime(newGain, this.audioContext.currentTime + 0.1);
        }
        if (this.isMuted) {
            this.stopCurrentSpeech();
            this.stopInputFocusSound();
            this.stopLoadingLoop();
        }
        return this.isMuted;
    }

    public playActivationComplete(): void {
        if (!this.audioContext || !this.masterGain || this.isMuted) return;
        
        const time = this.audioContext.currentTime;
        const gainNode = this.audioContext.createGain();
        gainNode.connect(this.masterGain);

        const oscillator = this.audioContext!.createOscillator();
        const filter = this.audioContext!.createBiquadFilter();
            
        const bufferSize = this.audioContext!.sampleRate * 1; 
        const buffer = this.audioContext!.createBuffer(1, bufferSize, this.audioContext!.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.audioContext!.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, time);
        filter.frequency.exponentialRampToValueAtTime(4000, time + 0.4);
        filter.Q.value = 1;
        
        gainNode.gain.setValueAtTime(0.3, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        
        noise.connect(filter);
        filter.connect(gainNode);
        noise.start(time);
        noise.stop(time + 0.5);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, time);
        oscillator.connect(gainNode);
        oscillator.start(time);
        oscillator.stop(time + 0.5);
    }
    
    public startInputFocusSound(): void {
        if (!this.audioContext || this.inputFocusOscillator || this.isMuted) return;

        this.inputFocusOscillator = this.audioContext.createOscillator();
        this.inputFocusGain = this.audioContext.createGain();

        this.inputFocusOscillator.type = 'sine';
        this.inputFocusOscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);

        this.inputFocusGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.inputFocusGain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.5);
        
        this.inputFocusOscillator.connect(this.inputFocusGain);
        this.inputFocusGain.connect(this.masterGain!);
        this.inputFocusOscillator.start();
    }

    public stopInputFocusSound(): void {
        if(this.inputFocusOscillator && this.inputFocusGain && this.audioContext) {
            this.inputFocusGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
            this.inputFocusOscillator.stop(this.audioContext.currentTime + 0.5);
            this.inputFocusOscillator = null;
            this.inputFocusGain = null;
        }
    }


    public startLoadingLoop(): void {
        if (!this.audioContext || this.loadingOscillator || this.isMuted) return;

        this.loadingOscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        this.loadingOscillator.type = 'sine';
        this.loadingOscillator.frequency.value = 60;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 2);

        this.loadingOscillator.connect(gainNode);
        gainNode.connect(this.masterGain!);
        this.loadingOscillator.start();
    }
    
    public stopLoadingLoop(): void {
        if (this.loadingOscillator && this.audioContext) {
            this.loadingOscillator.stop(this.audioContext.currentTime + 1);
            this.loadingOscillator = null;
        }
    }

    // --- Text-to-Speech Methods ---

    public stopCurrentSpeech(): void {
        if (this.currentSpeechSource) {
            this.currentSpeechSource.onended = null; // Prevent onended from firing on manual stop
            this.currentSpeechSource.stop();
            this.currentSpeechSource = null;
        }
    }

    private async playSpeech(base64Audio: string): Promise<AudioBufferSourceNode> {
        return new Promise(async (resolve, reject) => {
            if (!this.audioContext || !this.masterGain) {
                this.init();
                if (!this.audioContext || !this.masterGain) {
                    return reject(new Error("AudioContext not available."));
                }
            }
    
            try {
                // The API returns raw PCM data at a 24kHz sample rate.
                const audioBytes = decode(base64Audio);
                const audioBuffer = await decodeAudioData(audioBytes, this.audioContext, 24000, 1);
    
                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.masterGain);
                source.start();
                this.currentSpeechSource = source;
                resolve(source); 
            } catch (error) {
                console.error("Failed to decode or play speech audio.", error);
                reject(error);
            }
        });
    }

    public async speakText(text: string): Promise<AudioBufferSourceNode> {
        if (this.isMuted) {
            return Promise.reject(new Error("Audio is muted."));
        }

        this.stopCurrentSpeech();

        const base64Audio = await generateSpeech(text);
        const sourceNode = await this.playSpeech(base64Audio);
        return sourceNode;
    }
}
