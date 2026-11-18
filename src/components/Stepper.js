import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../styles';

export default function Stepper({ value, onUp, onDown, label }) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onUp} style={styles.stepBtn} accessibilityLabel={`Increase ${label}`}>
        <Text style={styles.stepGlyph}>▲</Text>
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable onPress={onDown} style={styles.stepBtn} accessibilityLabel={`Decrease ${label}`}>
        <Text style={styles.stepGlyph}>▼</Text>
      </Pressable>
    </View>
  );
}