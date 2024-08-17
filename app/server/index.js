const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { SpeechClient } = require('@google-cloud/speech');
const fs = require('fs');
const util = require('util');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const speechClient = new SpeechClient({
  keyFilename: '../../keys/google-speech-to-text-key.json' // Ensure this path points to your JSON key file
});

const upload = multer({ dest: 'uploads/' });

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const fileName = req.file.path;
    const file = await util.promisify(fs.readFile)(fileName);

    const audioBytes = file.toString('base64');

    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
      },
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    res.json({ transcription });

    fs.unlinkSync(fileName); // Clean up the uploaded file
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
