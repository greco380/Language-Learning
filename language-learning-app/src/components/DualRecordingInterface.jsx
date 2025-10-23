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
    if (foreignRecording) {
      // If already recording, stop it
      if (window.currentForeignRecognition) {
        window.currentForeignRecognition.stop();
      }
      return;
    }

    setForeignError(null);
    setForeignWord('');
    setForeignRecording(true);

    try {
      const languageCode = speechService.getLanguageCode(foreignLanguage);
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = languageCode;
      recognition.interimResults = true; // Show interim results for better feedback
      recognition.maxAlternatives = 3; // Get more alternatives
      recognition.continuous = false;

      // Store recognition instance for manual stop
      window.currentForeignRecognition = recognition;

      let finalTranscript = '';
      let interimTranscript = '';

      recognition.onstart = () => {
        console.log('Foreign word recording started');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final) {
          finalTranscript = final;
          setForeignWord(final);
          console.log('Foreign word (final):', final);
        } else if (interim) {
          interimTranscript = interim;
          setForeignWord(interim + '...');
          console.log('Foreign word (interim):', interim);
        }
      };

      recognition.onerror = (event) => {
        console.error('Foreign recording error:', event.error);
        if (event.error === 'no-speech') {
          setForeignError('No speech detected. Please speak louder and closer to the microphone.');
        } else if (event.error === 'audio-capture') {
          setForeignError('Microphone not detected. Please check your microphone.');
        } else if (event.error === 'not-allowed') {
          setForeignError('Microphone permission denied. Please allow microphone access.');
        } else {
          setForeignError(`Recording failed: ${event.error}`);
        }
        setForeignRecording(false);
        window.currentForeignRecognition = null;
      };

      recognition.onend = () => {
        setForeignRecording(false);
        window.currentForeignRecognition = null;
        // Use the final transcript if we have it, otherwise use interim
        if (finalTranscript) {
          setForeignWord(finalTranscript);
        } else if (interimTranscript) {
          setForeignWord(interimTranscript);
        }
      };

      recognition.start();

      // Auto-stop after 10 seconds (increased from 5)
      setTimeout(() => {
        if (recognition && foreignRecording) {
          recognition.stop();
        }
      }, 10000);

    } catch (err) {
      console.error('Error starting foreign recording:', err);
      setForeignError(err.message);
      setForeignRecording(false);
      window.currentForeignRecognition = null;
    }
  };

  // Handle native word recording
  const handleNativeRecord = async () => {
    if (nativeRecording) {
      // If already recording, stop it
      if (window.currentNativeRecognition) {
        window.currentNativeRecognition.stop();
      }
      return;
    }

    setNativeError(null);
    setNativeWord('');
    setNativeRecording(true);

    try {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.interimResults = true; // Show interim results for better feedback
      recognition.maxAlternatives = 3; // Get more alternatives
      recognition.continuous = false;

      // Store recognition instance for manual stop
      window.currentNativeRecognition = recognition;

      let finalTranscript = '';
      let interimTranscript = '';

      recognition.onstart = () => {
        console.log('Native word recording started');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final) {
          finalTranscript = final;
          setNativeWord(final);
          console.log('Native word (final):', final);
        } else if (interim) {
          interimTranscript = interim;
          setNativeWord(interim + '...');
          console.log('Native word (interim):', interim);
        }
      };

      recognition.onerror = (event) => {
        console.error('Native recording error:', event.error);
        if (event.error === 'no-speech') {
          setNativeError('No speech detected. Please speak louder and closer to the microphone.');
        } else if (event.error === 'audio-capture') {
          setNativeError('Microphone not detected. Please check your microphone.');
        } else if (event.error === 'not-allowed') {
          setNativeError('Microphone permission denied. Please allow microphone access.');
        } else {
          setNativeError(`Recording failed: ${event.error}`);
        }
        setNativeRecording(false);
        window.currentNativeRecognition = null;
      };

      recognition.onend = () => {
        setNativeRecording(false);
        window.currentNativeRecognition = null;
        // Use the final transcript if we have it, otherwise use interim
        if (finalTranscript) {
          setNativeWord(finalTranscript);
        } else if (interimTranscript) {
          setNativeWord(interimTranscript);
        }
      };

      recognition.start();

      // Auto-stop after 10 seconds (increased from 5)
      setTimeout(() => {
        if (recognition && nativeRecording) {
          recognition.stop();
        }
      }, 10000);

    } catch (err) {
      console.error('Error starting native recording:', err);
      setNativeError(err.message);
      setNativeRecording(false);
      window.currentNativeRecognition = null;
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

          <div className="text-center min-h-[80px]">
            {foreignRecording && (
              <div>
                <p className="text-red-600 font-semibold animate-pulse mb-2">
                  Listening... Speak the foreign word
                </p>
                <p className="text-gray-600 text-sm">
                  Click button again to stop recording
                </p>
              </div>
            )}
            {foreignWord && !foreignRecording && (
              <div>
                <p className="text-green-600 font-semibold mb-1">Recorded:</p>
                <p className="text-gray-900 text-lg font-medium">{foreignWord.replace('...', '')}</p>
                <p className="text-gray-500 text-sm">({foreignLanguage})</p>
              </div>
            )}
            {foreignError && (
              <div>
                <p className="text-red-600 text-sm font-semibold mb-1">{foreignError}</p>
                <p className="text-gray-600 text-xs">Try speaking louder and closer to the mic</p>
              </div>
            )}
            {!foreignRecording && !foreignWord && !foreignError && (
              <div>
                <p className="text-gray-600 text-sm mb-1">Tap to record the foreign word</p>
                <p className="text-gray-500 text-xs">Speak clearly after clicking</p>
              </div>
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

            <div className="text-center min-h-[80px]">
              {nativeRecording && (
                <div>
                  <p className="text-red-600 font-semibold animate-pulse mb-2">
                    Listening... Speak the English word
                  </p>
                  <p className="text-gray-600 text-sm">
                    Click button again to stop recording
                  </p>
                </div>
              )}
              {nativeWord && !nativeRecording && (
                <div>
                  <p className="text-green-600 font-semibold mb-1">Recorded:</p>
                  <p className="text-gray-900 text-lg font-medium">{nativeWord.replace('...', '')}</p>
                  <p className="text-gray-500 text-sm">(English)</p>
                </div>
              )}
              {nativeError && (
                <div>
                  <p className="text-red-600 text-sm font-semibold mb-1">{nativeError}</p>
                  <p className="text-gray-600 text-xs">Try speaking louder and closer to the mic</p>
                </div>
              )}
              {!nativeRecording && !nativeWord && !nativeError && (
                <div>
                  <p className="text-gray-600 text-sm mb-1">Tap to record the English word</p>
                  <p className="text-gray-500 text-xs">Speak clearly after clicking</p>
                </div>
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
