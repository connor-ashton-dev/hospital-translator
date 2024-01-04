import { Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";
import { decode } from "html-entities";

type RecorderProps = {
  value: string[];
};

export default function Recorder({ value }: RecorderProps) {
  const [audioClip, setAudioClip] = useState<Audio.Recording>();
  const [isRecording, setIsRecording] = useState(false);
  const [uri, setUri] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function startRecording() {
    if (value.length == 2) {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        setIsRecording(true);
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );
        setAudioClip(recording);
      } catch (err) {
        console.error("Failed to start recording", err);
      }
    } else {
      //TODO: Add error message
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
    const locale1 = value[0];
    const locale2 = value[1];
    let myLocale = "";

    if (locale == locale1) {
      myLocale = locale2;
    } else {
      myLocale = locale1;
    }

    const res = await fetch(
      "https://hospital-translator.uc.r.appspot.com/translate?text=" +
        encodeURIComponent(text) +
        "&target=" +
        myLocale,
    );

    try {
      const json = await res.json();
      return decode(json.message);
    } catch (error) {
      console.log("error with translating", error);
      return "";
    }
  }

  async function detect(text: string) {
    const res = await fetch(
      "https://hospital-translator.uc.r.appspot.com/detect?text=" +
        encodeURIComponent(text),
    );
    try {
      const json = await res.json();
      return json.message;
    } catch (error) {
      console.log("error with detecting");
    }
  }

  async function speak(text: string, locale: string) {
    const locale1 = value[0];
    const locale2 = value[1];
    let myLocale = "";

    if (locale == locale1) {
      myLocale = locale2;
    } else {
      myLocale = locale1;
    }

    const res = await fetch(
      "https://hospital-translator.uc.r.appspot.com/speak?text=" +
        text +
        "&lang=" +
        myLocale,
    );
    const data = await res.json();
    const base64 = data.message;
    const sound = new Audio.Sound();

    try {
      await FileSystem.writeAsStringAsync(
        FileSystem.documentDirectory + "myText.mp3",
        base64,
        {
          encoding: FileSystem.EncodingType.Base64,
        },
      );
      await sound.loadAsync({
        uri: FileSystem.documentDirectory + "myText.mp3",
      });

      await sound.playAsync();
      // delete file
    } catch (error) {
      // Handle the error accordingly
      console.error("Error playing the audio", error);
    } finally {
      await FileSystem.deleteAsync(FileSystem.documentDirectory + "myText.mp3");
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
      <View className="h-80 w-full mt-10 mb-20 p-4 rounded-xl bg-white shadow">
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
