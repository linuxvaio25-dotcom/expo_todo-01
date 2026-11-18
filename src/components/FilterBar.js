import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { C } from '../theme';
import { styles } from '../styles';

const OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'done', label: 'Done' },
];

export default function FilterBar({ query, onQueryChange, filter, onFilterChange }) {
  return (
    <View>
      <TextInput
        value={query}
        onChangeText={onQueryChange}
        placeholder="Search tasks"
        placeholderTextColor={C.muted}
        style={styles.searchInput}
      />
      <View style={styles.sortRow}>
        {OPTIONS.map((o) => {
          const on = filter === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => onFilterChange(o.key)}
              style={[styles.seg, on && styles.segOn]}
            >
              <Text style={[styles.segText, on && styles.segTextOn]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}