import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import Recorder from './components/Recorder';

export default function App() {
  return (
    <View className='flex-1 items-center bg-sky-50 py-28 px-10'>
      <View className='bg-white px-6 py-2 rounded-full shadow'>
        <Text className='text-2xl font-bold'>
          Speaking with <Text className='text-blue-500 underline'>Connor</Text>
        </Text>
      </View>
      <Recorder />
      <StatusBar style='auto' />
    </View>
  );
}
