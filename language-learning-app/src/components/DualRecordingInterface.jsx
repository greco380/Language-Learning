import React, { useState } from 'react';
import { Mic, MicOff, Loader, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import speechService from '../services/speechService';

const DualRecordingInterface = ({ onRecordComplete }) => {
  const { addWord } = useAppContext();

  // Foreign word state
  const [foreignLanguage, setForeignLanguage] = useState('Spanish');
  const [foreignWord, setForeignWord] = useState('');
  const [foreignRecording, setForeignRecording] = useState(false);
  const [foreignError, setForeignError] = useState(null);

  // Native word state
  const [inputMode, setInputMode] = useState('audio'); // 'audio' or 'text'
  const [nativeWord, setNativeWord] = useState('');
  const [nativeRecording, setNativeRecording] = useState(false);
  const [nativeError, setNativeError] = useState(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const availableLanguages = speechService.getAvailableLanguages();

  // Handle foreign word recording
  const handleForeignRecord = async () => {
    if (foreignRecording) return;

    setForeignError(null);
    setForeignWord('');
    setForeignRecording(true);

    try {
      const languageCode = speechService.getLanguageCode(foreignLanguage);
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = languageCode;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Foreign word recording started');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setForeignWord(transcript);
        console.log('Foreign word:', transcript);
      };

      recognition.onerror = (event) => {
        console.error('Foreign recording error:', event.error);
        setForeignError(`Recording failed: ${event.error}`);
        setForeignRecording(false);
      };

      recognition.onend = () => {
        setForeignRecording(false);
      };

      recognition.start();

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (recognition) {
          recognition.stop();
        }
      }, 5000);

    } catch (err) {
      console.error('Error starting foreign recording:', err);
      setForeignError(err.message);
      setForeignRecording(false);
    }
  };

  // Handle native word recording
  const handleNativeRecord = async () => {
    if (nativeRecording) return;

    setNativeError(null);
    setNativeWord('');
    setNativeRecording(true);

    try {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Native word recording started');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNativeWord(transcript);
        console.log('Native word:', transcript);
      };

      recognition.onerror = (event) => {
        console.error('Native recording error:', event.error);
        setNativeError(`Recording failed: ${event.error}`);
        setNativeRecording(false);
      };

      recognition.onend = () => {
        setNativeRecording(false);
      };

      recognition.start();

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (recognition) {
          recognition.stop();
        }
      }, 5000);

    } catch (err) {
      console.error('Error starting native recording:', err);
      setNativeError(err.message);
      setNativeRecording(false);
    }
  };

  // Handle text input for native word
  const handleNativeTextChange = (e) => {
    setNativeWord(e.target.value);
    setNativeError(null);
  };

  // Submit word pair
  const handleSubmit = async () => {
    if (!foreignWord.trim() || !nativeWord.trim()) {
      setSubmitResult({
        success: false,
        error: 'Please record/enter both words'
      });
      setTimeout(() => setSubmitResult(null), 3000);
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const wordData = {
        foreignWord: {
          text: foreignWord.trim(),
          language: foreignLanguage,
          audio: null
        },
        nativeWord: {
          text: nativeWord.trim(),
          language: 'English',
          audio: null,
          inputMode: inputMode
        }
      };

      const savedWord = await addWord(wordData);

      setSubmitResult({
        success: true,
        foreignWord: foreignWord,
        nativeWord: nativeWord
      });

      if (onRecordComplete) {
        onRecordComplete(savedWord);
      }

      // Clear form after 2 seconds
      setTimeout(() => {
        setForeignWord('');
        setNativeWord('');
        setSubmitResult(null);
      }, 2000);

    } catch (err) {
      console.error('Error saving word:', err);
      setSubmitResult({
        success: false,
        error: err.message
      });
      setTimeout(() => setSubmitResult(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const getForeignButtonState = () => {
    if (foreignRecording) return 'recording';
    if (foreignWord) return 'success';
    if (foreignError) return 'error';
    return 'idle';
  };

  const getNativeButtonState = () => {
    if (nativeRecording) return 'recording';
    if (nativeWord) return 'success';
    if (nativeError) return 'error';
    return 'idle';
  };

  const buttonStyles = {
    idle: 'bg-primary-500 hover:bg-primary-600 border-primary-600',
    recording: 'bg-red-500 border-red-600 animate-pulse',
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600'
  };

  return (
    <div className="space-y-6">
      {/* Foreign Word Recording */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Foreign Word</h3>
          <select
            value={foreignLanguage}
            onChange={(e) => setForeignLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {availableLanguages.map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleForeignRecord}
            disabled={foreignRecording}
            className={`w-24 h-24 rounded-full ${buttonStyles[getForeignButtonState()]} border-4 shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {foreignRecording ? (
              <Mic size={36} className="text-white" />
            ) : foreignWord ? (
              <Check size={36} className="text-white" />
            ) : foreignError ? (
              <MicOff size={36} className="text-white" />
            ) : (
              <Mic size={36} className="text-white" />
            )}
          </button>

          <div className="text-center min-h-[60px]">
            {foreignRecording && (
              <p className="text-red-600 font-semibold animate-pulse">
                Listening... Speak the foreign word
              </p>
            )}
            {foreignWord && !foreignRecording && (
              <div>
                <p className="text-green-600 font-semibold mb-1">Recorded:</p>
                <p className="text-gray-900 text-lg font-medium">{foreignWord}</p>
                <p className="text-gray-500 text-sm">({foreignLanguage})</p>
              </div>
            )}
            {foreignError && (
              <p className="text-red-600 text-sm">{foreignError}</p>
            )}
            {!foreignRecording && !foreignWord && !foreignError && (
              <p className="text-gray-600 text-sm">Tap to record the foreign word</p>
            )}
          </div>
        </div>
      </div>

      {/* Native Word Recording/Input */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">English Translation</h3>
          <select
            value={inputMode}
            onChange={(e) => {
              setInputMode(e.target.value);
              setNativeWord('');
              setNativeError(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="audio">Audio</option>
            <option value="text">Text</option>
          </select>
        </div>

        {inputMode === 'audio' ? (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleNativeRecord}
              disabled={nativeRecording}
              className={`w-24 h-24 rounded-full ${buttonStyles[getNativeButtonState()]} border-4 shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {nativeRecording ? (
                <Mic size={36} className="text-white" />
              ) : nativeWord ? (
                <Check size={36} className="text-white" />
              ) : nativeError ? (
                <MicOff size={36} className="text-white" />
              ) : (
                <Mic size={36} className="text-white" />
              )}
            </button>

            <div className="text-center min-h-[60px]">
              {nativeRecording && (
                <p className="text-red-600 font-semibold animate-pulse">
                  Listening... Speak the English word
                </p>
              )}
              {nativeWord && !nativeRecording && (
                <div>
                  <p className="text-green-600 font-semibold mb-1">Recorded:</p>
                  <p className="text-gray-900 text-lg font-medium">{nativeWord}</p>
                  <p className="text-gray-500 text-sm">(English)</p>
                </div>
              )}
              {nativeError && (
                <p className="text-red-600 text-sm">{nativeError}</p>
              )}
              {!nativeRecording && !nativeWord && !nativeError && (
                <p className="text-gray-600 text-sm">Tap to record the English word</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-md">
              <input
                type="text"
                value={nativeWord}
                onChange={handleNativeTextChange}
                placeholder="Type the English translation..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
              />
            </div>
            {nativeWord && (
              <div className="text-center">
                <p className="text-green-600 font-semibold mb-1">Entered:</p>
                <p className="text-gray-900 text-lg font-medium">{nativeWord}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={submitting || !foreignWord || !nativeWord}
          className="w-full max-w-md btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader size={20} className="animate-spin" />
              Saving...
            </span>
          ) : (
            'Save Word Pair'
          )}
        </button>

        {/* Submit Result */}
        {submitResult && (
          <div className={`w-full max-w-md p-4 rounded-lg ${
            submitResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {submitResult.success ? (
              <div className="text-center">
                <p className="text-green-600 font-semibold text-lg mb-2">
                  Word Pair Saved!
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">{submitResult.foreignWord}</span>
                  {' '}→{' '}
                  <span className="font-medium">{submitResult.nativeWord}</span>
                </p>
              </div>
            ) : (
              <p className="text-red-600 text-center">{submitResult.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DualRecordingInterface;
