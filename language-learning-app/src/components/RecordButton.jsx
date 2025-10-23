import React, { useState } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { useRecording } from '../hooks/useRecording';
import { useAppContext } from '../context/AppContext';
import openaiService from '../services/openaiService';

const RecordButton = ({ onRecordComplete }) => {
  const { isRecording, transcription, error, startRecording, reset, setIsProcessing } = useRecording();
  const { selectedLanguage, addWord } = useAppContext();
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleRecordClick = async () => {
    if (isRecording) {
      return; // Already recording
    }

    setResult(null);
    reset();

    try {
      // Start recording
      const transcript = await startRecording('en-US');
      console.log('Transcription:', transcript);

      // Process the transcription
      setProcessing(true);
      setIsProcessing(true);

      // Extract word and language using AI
      const extracted = await openaiService.extractWordAndLanguage(
        transcript,
        selectedLanguage
      );

      console.log('Extracted:', extracted);

      // Save the word
      const savedWord = await addWord({
        word: extracted.word,
        language: extracted.language,
        context: extracted.originalTranscription,
      });

      // Show success result
      setResult({
        success: true,
        word: extracted.word,
        language: extracted.language,
      });

      // Call callback if provided
      if (onRecordComplete) {
        onRecordComplete(savedWord);
      }

      // Clear result after 3 seconds
      setTimeout(() => {
        setResult(null);
        reset();
      }, 3000);

    } catch (err) {
      console.error('Recording error:', err);
      setResult({
        success: false,
        error: err.message,
      });

      // Clear error after 3 seconds
      setTimeout(() => {
        setResult(null);
        reset();
      }, 3000);
    } finally {
      setProcessing(false);
      setIsProcessing(false);
    }
  };

  const getButtonState = () => {
    if (processing) return 'processing';
    if (isRecording) return 'recording';
    if (result) return result.success ? 'success' : 'error';
    return 'idle';
  };

  const buttonState = getButtonState();

  const stateStyles = {
    idle: {
      bg: 'bg-primary-500 hover:bg-primary-600',
      border: 'border-primary-600',
      icon: Mic,
      iconColor: 'text-white',
      pulse: false,
    },
    recording: {
      bg: 'bg-red-500 hover:bg-red-600',
      border: 'border-red-600',
      icon: Mic,
      iconColor: 'text-white',
      pulse: true,
    },
    processing: {
      bg: 'bg-yellow-500',
      border: 'border-yellow-600',
      icon: Loader,
      iconColor: 'text-white',
      pulse: false,
    },
    success: {
      bg: 'bg-green-500',
      border: 'border-green-600',
      icon: Mic,
      iconColor: 'text-white',
      pulse: false,
    },
    error: {
      bg: 'bg-red-500',
      border: 'border-red-600',
      icon: MicOff,
      iconColor: 'text-white',
      pulse: false,
    },
  };

  const currentStyle = stateStyles[buttonState];
  const Icon = currentStyle.icon;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Record Button */}
      <button
        onClick={handleRecordClick}
        disabled={isRecording || processing}
        className={`relative w-32 h-32 rounded-full ${currentStyle.bg} ${currentStyle.border} border-4 shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed`}
      >
        {/* Pulsing ring animation */}
        {currentStyle.pulse && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
        )}

        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <Icon
            size={48}
            className={`${currentStyle.iconColor} ${
              buttonState === 'processing' ? 'animate-spin' : ''
            }`}
          />
        </div>
      </button>

      {/* Status Text */}
      <div className="text-center min-h-[60px]">
        {buttonState === 'idle' && (
          <p className="text-gray-600 text-sm">
            Tap to record
          </p>
        )}

        {buttonState === 'recording' && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-red-600 font-semibold animate-pulse">
              Listening...
            </p>
            <p className="text-gray-500 text-sm">
              Say: "Please say [word] in {selectedLanguage}"
            </p>
          </div>
        )}

        {buttonState === 'processing' && (
          <p className="text-yellow-600 font-semibold">
            Processing...
          </p>
        )}

        {buttonState === 'success' && result && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-green-600 font-semibold text-lg">
              ✓ Word Added!
            </p>
            <p className="text-gray-700">
              <span className="font-medium">{result.word}</span>
              <span className="text-gray-500 text-sm"> ({result.language})</span>
            </p>
          </div>
        )}

        {buttonState === 'error' && result && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-red-600 font-semibold">
              ✗ Error
            </p>
            <p className="text-gray-600 text-sm max-w-xs">
              {result.error}
            </p>
          </div>
        )}

        {error && !result && (
          <p className="text-red-600 text-sm">
            {error}
          </p>
        )}

        {transcription && !result && !processing && (
          <p className="text-gray-600 text-sm italic">
            "{transcription}"
          </p>
        )}
      </div>
    </div>
  );
};

export default RecordButton;
