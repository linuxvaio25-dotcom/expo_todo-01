import React from 'react';
import { Pressable, Text } from 'react-native';
import { styles } from '../styles';

export default function PillButton({ label, color, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        { borderColor: color },
        pressed && { backgroundColor: color + '33' },
      ]}
    >
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </Pressable>
  );
}