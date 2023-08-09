import { Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Audio } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";

export default function Recorder() {
  const [audioClip, setAudioClip] = useState<Audio.Recording>();
  const [isRecording, setIsRecording] = useState(false);
  const [uri, setUri] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setIsRecording(true);
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setAudioClip(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    setLoading(true);
    setIsRecording(false);
    await audioClip!.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    if (audioClip) {
      const uri = audioClip.getURI();
      setAudioClip(undefined);
      if (uri) {
        setUri(uri);
        parseAudio(uri);
      }
    }
  }

  async function translate(text: string, locale: string) {
    //TODO: Fix this
    let myLocale = "";
    if (locale == "en") myLocale = "es";
    else myLocale = "en";

    const res = await fetch(
      "https://hospital-translator.uc.r.appspot.com/translate?text=" +
        encodeURIComponent(text) +
        "&target=" +
        myLocale
    );

    try {
      const json = await res.json();
      return json.message;
    } catch (error) {
      console.log("error with translating", error);
      return "";
    }
  }

  async function detect(text: string) {
    const res = await fetch(
      "https://hospital-translator.uc.r.appspot.com/detect?text=" +
        encodeURIComponent(text)
    );
    try {
      const json = await res.json();
      return json.message;
    } catch (error) {
      console.log("error with detecting");
    }
  }

  async function speak(text: string, locale: string) {
    let myLocale = "";
    if (locale == "en") myLocale = "es";
    else myLocale = "en";
    const res = await fetch(
      "http://192.168.86.191:8080/speak?text=" + text + "&lang=" + myLocale
    );
    const data = await res.json();
    const base64 = data.message;
    const soundObject = new Audio.Sound();

    try {
      // You might need a data URI depending on how Expo handles base64 strings
      await soundObject.loadAsync({
        uri: `data:audio/mp3;base64,${base64}`,
      });
      await soundObject.playAsync();
    } catch (error) {
      // Handle the error accordingly
      console.error("Error playing the audio", error);
    }
  }

  async function parseAudio(uri: string) {
    const fileUri = uri.replace("file://", "");
    const file = { uri: fileUri, name: "recording.m4a", type: "audio/m4a" };
    const formData = new FormData();
    formData.append("model", "whisper-1");
    formData.append("file", file as unknown as Blob);
    formData.append("response_format", "text");
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      headers: {
        Authorization: "Bearer " + process.env.EXPO_PUBLIC_OPENAI_API_KEY,
        "Content-Type": "multipart/form-data",
      },
      method: "POST",
      body: formData,
    });
    const text = await res.text();

    const locale = await detect(text);

    const translatedText = await translate(text, locale);
    speak(translatedText, locale);

    setText(translatedText);
    setLoading(false);
  }
  return (
    <>
      <View className="h-72 w-full my-20 p-4 rounded-xl bg-white shadow">
        {/*TODO: Make scrollable  */}
        <Text>
          {loading ? "Loading ..." : text}
          {text.length === 0 && !loading
            ? "Press record to start translating..."
            : ""}
        </Text>
      </View>
      <TouchableOpacity
        className="bg-blue-500 flex items-center justify-center w-20 h-20 rounded-full shadow"
        onPress={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? (
          <FontAwesome name="microphone-slash" size={40} color="white" />
        ) : (
          <FontAwesome name="microphone" size={40} color="white" />
        )}
      </TouchableOpacity>
    </>
  );
}
