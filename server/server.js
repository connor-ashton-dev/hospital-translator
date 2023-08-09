const express = require("express");
const bodyParser = require("body-parser"); // Middleware to parse JSON data
const { Translate } = require("@google-cloud/translate").v2;
const textToSpeech = require("@google-cloud/text-to-speech");

const app = express();
const cors = require("cors");
app.use(cors());
const port = process.env.PORT || 1337;

const translate = new Translate();

// Middleware to parse JSON data
app.use(bodyParser.json());

async function translateText(text, target) {
  let [translations] = await translate.translate(text, target);
  translations = Array.isArray(translations) ? translations : [translations];
  return translations[0];
}

async function listVoices(languageCode) {
  const client = new textToSpeech.TextToSpeechClient();

  const [result] = await client.listVoices({ languageCode });
  const voices = result.voices;

  voices.forEach((voice) => {
    console.log(`${voice.name} (${voice.ssmlGender}): ${voice.languageCodes}`);
  });
}

async function synthesize(text, lang) {
  const textToSpeech = require("@google-cloud/text-to-speech");

  const client = new textToSpeech.TextToSpeechClient();

  const request = {
    input: { text: text },
    voice: { languageCode: lang, ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  };

  const [response] = await client.synthesizeSpeech(request);
  const audioContent = response.audioContent;
  return audioContent;
}

async function detectLanguage(text) {
  let [detections] = await translate.detect(text);
  detections = Array.isArray(detections) ? detections : [detections];
  return detections[0];
}

// GET request to translate text
app.get("/translate", async (req, res) => {
  const data = req.query;
  console.log(data);

  const { text } = data;
  const translation = await translateText(text, target);
  res.send(JSON.stringify({ message: translation }));
});

app.get("/speak", async (req, res) => {
  const data = req.query;
  const { text, lang } = data;
  const audioContent = await synthesize(text, lang);
  // turn buffer to base64
  const base64 = audioContent.toString("base64");
  res.send(JSON.stringify({ message: base64 }));
});

app.get("/detect", async (req, res) => {
  const data = req.query;
  const { text } = data;
  const detection = await detectLanguage(text);
  res.send(JSON.stringify({ message: detection }));
});

app.get("/checkhealth", (req, res) => {
  res.send("Server is running");
});

// Start the server
app.listen(port, () => {
  console.log("Server is running on port " + port);
});
