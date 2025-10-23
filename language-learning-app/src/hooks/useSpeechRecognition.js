import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for speech recognition with browser compatibility
 */
export const useSpeechRecognition = (options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  /**
   * Start speech recognition
   */
  const startListening = useCallback(async (language = 'en-US') => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = options.continuous || false;
      recognition.interimResults = options.interimResults || true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        if (options.onStart) options.onStart();
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (final) {
          setTranscript(prev => prev + final);
        }
        setInterimTranscript(interim);

        if (options.onResult) {
          options.onResult({ final, interim });
        }
      };

      recognition.onerror = (event) => {
        setError(event.error);
        setIsListening(false);
        if (options.onError) options.onError(event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (options.onEnd) options.onEnd();
      };

      recognition.start();
    } catch (err) {
      setError(err.message);
      setIsListening(false);
    }
  }, [isSupported, options]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  /**
   * Reset transcript
   */
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
