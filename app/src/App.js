import React from 'react';
import './App.css';
import SpeechToText from './SpeechRecognition';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>VoTex</h1>
        <SpeechToText />
      </header>
    </div>
  );
}

export default App;
