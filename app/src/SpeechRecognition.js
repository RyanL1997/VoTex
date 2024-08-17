import React, { useState, useEffect, useRef } from 'react';

function SpeechToText() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const socketRef = useRef(null);
  const finalTranscriptRef = useRef(''); // To store finalized transcriptions
  const interimTranscriptRef = useRef(''); // To store interim transcriptions

  useEffect(() => {
    if (isListening) {
      startRecording();
    } else if (socketRef.current) {
      stopRecording();
    }
    // eslint-disable-next-line
  }, [isListening]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      socketRef.current = new WebSocket('ws://localhost:5000');

      socketRef.current.onmessage = (event) => {
        const result = event.data.trim();
        if (result.includes('[FINAL]')) {
          // Final result, update the final transcript
          finalTranscriptRef.current += result.replace('[FINAL]', '') + ' ';
          interimTranscriptRef.current = ''; // Clear interim transcript
          setText(finalTranscriptRef.current); // Update displayed text with final transcript
        } else {
          // Interim result, update interim transcript
          interimTranscriptRef.current = result;
          setText(finalTranscriptRef.current + interimTranscriptRef.current);
        }
      };

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(event.data);
        }
      };

      recorder.start(250); // Send data every 250ms
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  const toggleListen = () => {
    setIsListening((prevState) => !prevState);
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
