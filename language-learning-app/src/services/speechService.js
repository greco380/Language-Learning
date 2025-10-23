// Speech recognition service using Web Speech API

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.silenceTimer = null;

    // Check browser compatibility
    this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!this.SpeechRecognition;
  }

  /**
   * Check if speech recognition is supported
   */
  isSpeechRecognitionSupported() {
    return this.isSupported;
  }

  /**
   * Initialize speech recognition
   */
  initRecognition(language = 'en-US') {
    if (!this.isSupported) {
      throw new Error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    this.recognition = new this.SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = language;

    return this.recognition;
  }

  /**
   * Start recording and return a promise with the transcription
   */
  startRecording(options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already recording'));
        return;
      }

      const {
        language = 'en-US',
        timeout = 30000, // 30 seconds default timeout
        onStart = () => {},
        onSpeechStart = () => {},
        onSpeechEnd = () => {},
      } = options;

      const recognition = this.initRecognition(language);
      let finalTranscript = '';
      let timeoutTimer = null;

      // Timeout handler
      timeoutTimer = setTimeout(() => {
        if (this.isListening) {
          recognition.stop();
          reject(new Error('Recording timeout - no speech detected'));
        }
      }, timeout);

      // Recognition started
      recognition.onstart = () => {
        this.isListening = true;
        onStart();
        console.log('Speech recognition started');
      };

      // Speech started (user is speaking)
      recognition.onspeechstart = () => {
        onSpeechStart();
        console.log('Speech detected');
      };

      // Speech ended (user stopped speaking)
      recognition.onspeechend = () => {
        onSpeechEnd();
        console.log('Speech ended');
      };

      // Results received
      recognition.onresult = (event) => {
        clearTimeout(timeoutTimer);

        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;

        finalTranscript = transcript;

        console.log('Transcript:', transcript, 'Confidence:', confidence);
      };

      // Recognition ended
      recognition.onend = () => {
        this.isListening = false;
        clearTimeout(timeoutTimer);

        if (finalTranscript) {
          resolve({
            transcript: finalTranscript,
            timestamp: new Date().toISOString(),
          });
        } else {
          reject(new Error('No speech was detected'));
        }
      };

      // Error handler
      recognition.onerror = (event) => {
        this.isListening = false;
        clearTimeout(timeoutTimer);

        let errorMessage = 'Speech recognition error';

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone detected. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'aborted':
            errorMessage = 'Recording was aborted.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        reject(new Error(errorMessage));
      };

      // Start recognition
      try {
        recognition.start();
      } catch (error) {
        this.isListening = false;
        clearTimeout(timeoutTimer);
        reject(error);
      }
    });
  }

  /**
   * Stop recording manually
   */
  stopRecording() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      return true;
    }
    return false;
  }

  /**
   * Check if currently recording
   */
  getIsListening() {
    return this.isListening;
  }

  /**
   * Request microphone permissions
   */
  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks immediately - we just needed to request permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      throw new Error('Microphone access denied. Please allow microphone access in your browser settings.');
    }
  }

  /**
   * Get available languages (common ones)
   */
  getAvailableLanguages() {
    return [
      { code: 'en-US', name: 'English (US)' },
      { code: 'es-ES', name: 'Spanish (Spain)' },
      { code: 'es-MX', name: 'Spanish (Mexico)' },
      { code: 'fr-FR', name: 'French' },
      { code: 'de-DE', name: 'German' },
      { code: 'it-IT', name: 'Italian' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)' },
      { code: 'pt-PT', name: 'Portuguese (Portugal)' },
      { code: 'ja-JP', name: 'Japanese' },
      { code: 'ko-KR', name: 'Korean' },
      { code: 'zh-CN', name: 'Chinese (Simplified)' },
      { code: 'zh-TW', name: 'Chinese (Traditional)' },
      { code: 'ru-RU', name: 'Russian' },
      { code: 'ar-SA', name: 'Arabic' },
    ];
  }

  /**
   * Get language code from language name
   */
  getLanguageCode(languageName) {
    const languages = this.getAvailableLanguages();
    const found = languages.find(lang =>
      lang.name.toLowerCase().includes(languageName.toLowerCase())
    );
    return found ? found.code : 'en-US';
  }
}

export default new SpeechService();
