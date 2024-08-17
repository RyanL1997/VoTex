import React, { useState } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

function SpeechToText() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleListen = () => {
    if (isListening) {
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setText(transcript);
      };
      recognition.onerror = (event) => {
        console.error("Error occurred in recognition: ", event.error);
      };
    } else {
      recognition.stop();
    }
  };

  const toggleListen = () => {
    setIsListening(prevState => !prevState);
    handleListen();
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
