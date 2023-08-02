const express = require('express');
const bodyParser = require('body-parser'); // Middleware to parse JSON data
const { Translate } = require('@google-cloud/translate').v2;

const app = express();
const cors = require('cors');
app.use(cors());

const translate = new Translate();

// Middleware to parse JSON data
app.use(bodyParser.json());

async function translateText(text, target) {
  let [translations] = await translate.translate(text, target);
  translations = Array.isArray(translations) ? translations : [translations];
  return translations[0];
}

async function detectLanguage(text) {
  let [detections] = await translate.detect(text);
  detections = Array.isArray(detections) ? detections : [detections];
  return detections[0];
}

// GET request to translate text
app.get('/translate', async (req, res) => {
  const data = req.query;

  const { text, target } = data;
  const translation = await translateText(text, target);
  res.send(JSON.stringify({ message: translation }));
});

app.get('/detect', async (req, res) => {
  const data = req.query;
  const { text } = data;
  const detection = await detectLanguage(text);
  res.send(JSON.stringify({ message: detection }));
});

// Start the server
app.listen(1337, () => {
  console.log('Server is running on port 1337');
});
