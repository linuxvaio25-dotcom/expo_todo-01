import React from 'react';
import { Pressable, Text } from 'react-native';
import { C } from '../theme';
import { styles } from '../styles';

export default function PickerField({ text, placeholder, active, onPress, flex }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pickerField, { flex }, active && { borderColor: C.blue }]}
    >
      <Text style={[styles.pickerFieldText, !text && { color: C.muted }]} numberOfLines={1}>
        {text || placeholder}
      </Text>
    </Pressable>
  );
}