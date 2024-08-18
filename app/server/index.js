const express = require('express');
const cors = require('cors');
const { SpeechClient } = require('@google-cloud/speech');
const WebSocket = require('ws');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const speechClient = new SpeechClient({
  keyFilename: '../../keys/google-speech-to-text-key.json',
});

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  const recognizeStream = speechClient
    .streamingRecognize({
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
      },
      interimResults: true, // Return partial results
    })
    .on('error', (error) => {
      console.error('Error during streaming:', error);
      ws.close();
    })
    .on('data', (data) => {
      if (data.results[0] && data.results[0].alternatives[0]) {
        let transcript = data.results[0].alternatives[0].transcript;
        if (data.results[0].isFinal) {
          transcript += ' [FINAL]'; // Mark the transcript as final
        }
        ws.send(transcript);
      }
    });

  ws.on('message', (message) => {
    recognizeStream.write(message);
  });

  ws.on('close', () => {
    recognizeStream.end();
    console.log('Client disconnected');
  });
});
