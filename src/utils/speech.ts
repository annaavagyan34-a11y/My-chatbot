// Web Speech API text-to-speech utility with Armenian support detection

export class SpeechService {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;

  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static onEndCallback: (() => void) | null = null;

  static isSupported(): boolean {
    return !!this.synth;
  }

  static stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
      if (this.onEndCallback) {
        this.onEndCallback();
        this.onEndCallback = null;
      }
    }
  }

  static speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: () => void
  ): boolean {
    if (!this.synth) return false;

    this.stop();

    // Clean text of markdown characters for cleaner audio
    const cleanText = text
      .replace(/[*_#`~>]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/---/g, '')
      .replace(/\n+/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // slightly slower for educational comprehension
    utterance.pitch = 1.0;

    // Look for Armenian or regional voices
    const voices = this.synth.getVoices();
    const hyVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('hy') ||
        v.name.toLowerCase().includes('armenian')
    );

    if (hyVoice) {
      utterance.voice = hyVoice;
      utterance.lang = hyVoice.lang;
    } else {
      utterance.lang = 'hy-AM';
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      if (onError) onError();
    };

    this.currentUtterance = utterance;
    this.onEndCallback = onEnd || null;

    this.synth.speak(utterance);
    return true;
  }
}
