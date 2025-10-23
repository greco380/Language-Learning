import { useState, useCallback } from 'react';
import speechService from '../services/speechService';
import { playAudioFeedback } from '../utils/audioProcessor';

/**
 * Custom hook for managing audio recording and speech recognition
 */
export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Start recording
   */
  const startRecording = useCallback(async (language = 'en-US') => {
    try {
      setError(null);
      setTranscription('');

      // Check if speech recognition is supported
      if (!speechService.isSpeechRecognitionSupported()) {
        throw new Error('Speech recognition is not supported in this browser');
      }

      // Request microphone permission first
      await speechService.requestMicrophonePermission();

      // Play recording start sound
      playAudioFeedback('recording');

      setIsRecording(true);

      // Start speech recognition
      const result = await speechService.startRecording({
        language,
        timeout: 30000,
        onStart: () => {
          console.log('Recording started');
        },
        onSpeechStart: () => {
          console.log('Speech detected');
        },
        onSpeechEnd: () => {
          console.log('Speech ended');
        },
      });

      // Success
      setTranscription(result.transcript);
      setIsRecording(false);
      playAudioFeedback('success');

      return result.transcript;
    } catch (err) {
      setError(err.message);
      setIsRecording(false);
      playAudioFeedback('error');
      throw err;
    }
  }, []);

  /**
   * Stop recording manually
   */
  const stopRecording = useCallback(() => {
    const stopped = speechService.stopRecording();
    if (stopped) {
      setIsRecording(false);
    }
    return stopped;
  }, []);

  /**
   * Clear transcription
   */
  const clearTranscription = useCallback(() => {
    setTranscription('');
    setError(null);
  }, []);

  /**
   * Reset all states
   */
  const reset = useCallback(() => {
    setIsRecording(false);
    setTranscription('');
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    isRecording,
    transcription,
    error,
    isProcessing,
    startRecording,
    stopRecording,
    clearTranscription,
    reset,
    setIsProcessing,
  };
};

export default useRecording;
