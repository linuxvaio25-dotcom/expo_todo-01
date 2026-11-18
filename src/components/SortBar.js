import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../styles';

const OPTIONS = [
  { key: 'added', label: 'Added' },
  { key: 'date', label: 'Date' },
];

export default function SortBar({ value, onChange }) {
  return (
    <View style={styles.sortRow}>
      <Text style={styles.sortLabel}>Sort by</Text>
      {OPTIONS.map((o) => {
        const on = value === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            style={[styles.seg, on && styles.segOn]}
          >
            <Text style={[styles.segText, on && styles.segTextOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}