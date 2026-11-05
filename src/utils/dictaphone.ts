// Dictaphone & Speech Recognition Service for EduAI
// Supports Armenian (hy-AM) speech-to-text with Web Speech API and live audio visualization

// TypeScript declarations for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export interface DictaphoneCallbacks {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onAudioLevel?: (level: number) => void; // 0.0 to 1.0
  onError?: (errorMessage: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class DictaphoneService {
  private recognition: SpeechRecognitionInstance | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isListening = false;
  private callbacks: DictaphoneCallbacks | null = null;
  private currentLanguage = 'hy-AM';

  static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  }

  static hasSpeechRecognition(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  async start(
    callbacks: DictaphoneCallbacks,
    language: string = 'hy-AM'
  ): Promise<boolean> {
    this.cancel(); // Abort any active recognition and clean audio stream first
    this.callbacks = callbacks;
    this.currentLanguage = language;

    // 1. Initialize microphone audio stream for real-time visualizer
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          const source = this.audioContext.createMediaStreamSource(this.mediaStream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 64;
          source.connect(this.analyser);

          const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

          const updateVolume = () => {
            if (!this.analyser || !this.isListening) return;
            this.analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const normalizedLevel = Math.min(1, average / 100);

            if (this.callbacks?.onAudioLevel) {
              this.callbacks.onAudioLevel(normalizedLevel);
            }

            this.animFrameId = requestAnimationFrame(updateVolume);
          };

          updateVolume();
        }
      }
    } catch (err) {
      console.warn('Microphone stream initialization warning:', err);
      // We still attempt SpeechRecognition even if AudioContext stream was restricted
    }

    // 2. Initialize Speech Recognition
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        let accumulatedText = '';

        recognition.onstart = () => {
          this.isListening = true;
          this.callbacks?.onStart?.();
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            accumulatedText += finalTranscript;
          }

          const currentText = accumulatedText + interimTranscript;
          this.callbacks?.onTranscript(currentText.trim(), false);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          let friendlyMsg = 'Ձայնագրության սխալ տեղի ունեցավ:';
          if (event.error === 'not-allowed') {
            friendlyMsg = 'Խոսափողի (միկրոֆոնի) մուտքը մերժված է: Խնդրում ենք թույլատրել բրաուզերում:';
          } else if (event.error === 'no-speech') {
            friendlyMsg = 'Ձայն չլսվեց: Փորձեք կրկին խոսել:';
          } else if (event.error === 'network') {
            friendlyMsg = 'Ցանցային կապի խնդիր: Ստուգեք ինտերնետ կապը:';
          }
          this.callbacks?.onError?.(friendlyMsg);
        };

        recognition.onend = () => {
          this.isListening = false;
          this.cleanupAudio();
          this.callbacks?.onEnd?.();
        };

        this.recognition = recognition;
        recognition.start();
        this.isListening = true;
        return true;
      } catch (e) {
        console.error('Speech recognition start failed:', e);
        this.callbacks?.onError?.('Չհաջողվեց գործարկել ձայնի ճանաչումը:');
        this.stop();
        return false;
      }
    } else {
      // SpeechRecognition not supported in this browser
      this.callbacks?.onError?.('Ձեր բրաուզերը չի աջակցում Web Speech Recognition: Խորհուրդ է տրվում օգտագործել Chrome կամ Edge:');
      this.stop();
      return false;
    }
  }

  stop(): void {
    this.isListening = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore already stopped
      }
      this.recognition = null;
    }

    this.cleanupAudio();
    this.callbacks?.onEnd?.();
  }

  cancel(): void {
    this.isListening = false;

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }

    this.cleanupAudio();
    this.callbacks?.onEnd?.();
  }

  private cleanupAudio(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {
        // ignore
      }
      this.audioContext = null;
    }

    this.analyser = null;
  }

  getListeningStatus(): boolean {
    return this.isListening;
  }
}
