/**
 * Utility for Web Speech API (TTS)
 */

let voices: SpeechSynthesisVoice[] = [];

// Pre-load voices
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
  };
  voices = window.speechSynthesis.getVoices();
}

export const speakJapanese = (text: string) => {
  if (!window.speechSynthesis) return;

  // Stop any current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Find a Japanese voice
  const jpVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
  if (jpVoice) {
    utterance.voice = jpVoice;
  } else {
    // Fallback: just set lang and hope for the best
    utterance.lang = 'ja-JP';
  }

  utterance.rate = 0.7;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
};
