// Audio processing utilities

let mediaRecorder = null;
let audioChunks = [];
let stream = null;

/**
 * Start audio recording
 */
export const recordAudio = async () => {
  try {
    // Request microphone access
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Create media recorder
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    // Collect audio data
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // Start recording
    mediaRecorder.start();

    return {
      success: true,
      message: 'Recording started',
    };
  } catch (error) {
    console.error('Error starting audio recording:', error);
    return {
      success: false,
      message: error.message || 'Failed to start recording',
    };
  }
};

/**
 * Stop audio recording and return audio blob
 */
export const stopAudioRecording = () => {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error('No recording in progress'));
      return;
    }

    mediaRecorder.onstop = () => {
      // Create audio blob
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

      // Stop all tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }

      // Reset recorder
      mediaRecorder = null;
      audioChunks = [];

      resolve({
        audioBlob,
        audioUrl: URL.createObjectURL(audioBlob),
      });
    };

    mediaRecorder.onerror = (error) => {
      reject(error);
    };

    // Stop recording
    mediaRecorder.stop();
  });
};

/**
 * Play audio feedback (success/error sounds)
 */
export const playAudioFeedback = (type = 'success') => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === 'success') {
    // Success: ascending notes
    oscillator.frequency.value = 523.25; // C5
    oscillator.start(audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.stop(audioContext.currentTime + 0.2);
  } else if (type === 'error') {
    // Error: descending note
    oscillator.frequency.value = 392.00; // G4
    oscillator.start(audioContext.currentTime);
    oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.1); // E4
    oscillator.stop(audioContext.currentTime + 0.25);
  } else if (type === 'recording') {
    // Recording: single beep
    oscillator.frequency.value = 440; // A4
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
};

/**
 * Convert audio blob to base64 (for API transmission)
 */
export const convertBlobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert audio blob to WAV format (if needed)
 */
export const convertToWav = async (audioBlob) => {
  // Note: This is a placeholder. Full implementation would require
  // a library like wavesurfer.js or custom audio processing
  // For now, we'll just return the original blob
  return audioBlob;
};

/**
 * Check if audio recording is supported
 */
export const isAudioRecordingSupported = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Get current recording state
 */
export const getRecordingState = () => {
  if (!mediaRecorder) return 'inactive';
  return mediaRecorder.state;
};

/**
 * Play audio from URL
 */
export const playAudio = (audioUrl) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);

    audio.onended = () => resolve();
    audio.onerror = (error) => reject(error);

    audio.play().catch(reject);
  });
};

/**
 * Get audio duration from blob
 */
export const getAudioDuration = (audioBlob) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(URL.createObjectURL(audioBlob));

    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };

    audio.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Check microphone permission status
 */
export const checkMicrophonePermission = async () => {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' });
    return result.state; // 'granted', 'denied', or 'prompt'
  } catch (error) {
    console.error('Error checking microphone permission:', error);
    return 'prompt';
  }
};
