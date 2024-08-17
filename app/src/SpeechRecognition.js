import React, { useState, useEffect } from 'react';

function SpeechToText() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useEffect(() => {
    if (isListening) {
      startRecording();
    } else if (mediaRecorder) {
      stopRecording();
    }
    // eslint-disable-next-line
  }, [isListening]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const audioBlob = event.data;
          await handleFileUpload(audioBlob);
        }
      };

      recorder.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorder.stop();
  };

  const handleFileUpload = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    try {
      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setText(data.transcription);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const toggleListen = () => {
    setIsListening(prevState => !prevState);
  };

  return (
    <div>
      <h2>Speech to Text</h2>
      <button onClick={toggleListen}>
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <p>{text}</p>
    </div>
  );
}

export default SpeechToText;
