import React, { useState, useEffect, useRef } from 'react';

function SpeechToText() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const socketRef = useRef(null);
  const finalTranscriptRef = useRef(''); // To store finalized transcriptions
  const interimTranscriptRef = useRef(''); // To store interim transcriptions
  const recorderRef = useRef(null); // To keep a reference to the recorder

  useEffect(() => {
    if (isListening) {
      startRecording();
    } else {
      stopRecording();
    }
    // eslint-disable-next-line
  }, [isListening]);

  const startRecording = async () => {
    try {
      // Clear previous text and transcripts when starting a new session
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      setText('');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      // Open a new WebSocket connection
      socketRef.current = new WebSocket('ws://localhost:5000');

      socketRef.current.onopen = () => {
        console.log('WebSocket connection opened');
      };

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
        if (event.data.size > 0 && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(event.data);
        }
      };

      recorder.start(250); // Send data every 250ms
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop(); // Stop the recorder
      recorderRef.current = null; // Reset the recorder reference
    }
    if (socketRef.current) {
      socketRef.current.close(); // Close the WebSocket
      socketRef.current = null; // Reset the WebSocket reference
      console.log('WebSocket connection closed');
    }
  };

  const toggleListen = () => {
    setIsListening((prevState) => !prevState);
  };

  return (
    <div>
      <h2>Speech to Text</h2>
      <button
        onClick={toggleListen}
        style={{
          backgroundColor: isListening ? 'red' : 'green',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <p style={{ color: '#fff', fontSize: '16px', marginTop: '20px' }}>{text}</p>
    </div>
  );
}

export default SpeechToText;
