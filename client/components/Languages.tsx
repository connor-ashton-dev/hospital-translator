import React, { useState } from "react";
import { Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

type LanguageProps = {
  value: string[];
  open: boolean;
  setValue: React.Dispatch<React.SetStateAction<string[]>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const LanguageChoices = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Italian", value: "it" },
  { label: "Chinese (Simplified)", value: "zh-CN" },
  { label: "Chinese (Traditional)", value: "zh-TW" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Russian", value: "ru" },
  { label: "Portuguese", value: "pt" },
  { label: "Hindi", value: "hi" },
  { label: "Arabic", value: "ar" },
  { label: "Dutch", value: "nl" },
  { label: "Swedish", value: "sv" },
  { label: "Greek", value: "el" },
  { label: "Norwegian", value: "no" },
  { label: "Danish", value: "da" },
  { label: "Finnish", value: "fi" },
  { label: "Polish", value: "pl" },
  // add more languages as needed
];

const Languages = ({ open, value, setOpen, setValue }: LanguageProps) => {
  const [items, setItems] = useState(LanguageChoices);

  return (
    <View className="mt-10">
      <DropDownPicker
        open={open}
        placeholder="Select languages"
        value={value}
        multiple={true}
        mode="BADGE"
        style={{
          borderColor: "white",
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
        min={0}
        max={2}
        items={items}
        setOpen={setOpen}
        listMode="MODAL"
        setValue={setValue}
        setItems={setItems}
      />
    </View>
  );
};

export default Languages;
