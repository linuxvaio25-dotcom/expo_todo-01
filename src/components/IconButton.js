import React from 'react';
import { Pressable, Text } from 'react-native';
import { styles } from '../styles';

export default function IconButton({ glyph, color, onPress, label }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.iconBtn,
        { borderColor: color },
        pressed && { backgroundColor: color + '33' },
      ]}
    >
      <Text style={[styles.iconBtnText, { color }]}>{glyph}</Text>
    </Pressable>
  );
}