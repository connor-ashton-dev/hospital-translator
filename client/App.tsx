import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import Recorder from "./components/Recorder";
import Languages from "./components/Languages";

import { ItemType, ValueType } from "react-native-dropdown-picker";

export default function App() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string[]>([]);

  return (
    <View className="flex w-full h-full items-center justify-between bg-sky-50 py-28 px-10">
      <View className="bg-white px-6 py-2 rounded-full shadow">
        <Text className="text-2xl font-bold">
          Speaking with <Text className="text-blue-500 underline">Connor</Text>
        </Text>
      </View>

      <Languages
        setValue={setValue}
        setOpen={setOpen}
        value={value}
        open={open}
      />

      <Recorder value={value} />
      <StatusBar style="auto" />
    </View>
  );
}
