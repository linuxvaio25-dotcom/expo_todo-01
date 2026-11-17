import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../styles';
import { todayParts } from '../dates';
import PickerFooter from './PickerFooter';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Calendar({ initial, selected, onSelect, onClear, onClose }) {
  const [view, setView] = useState({ y: initial.y, mo: initial.mo });
  const today = todayParts();

  const shift = (delta) =>
    setView((v) => {
      const idx = v.y * 12 + (v.mo - 1) + delta;
      return { y: Math.floor(idx / 12), mo: (idx % 12) + 1 };
    });

  const firstWeekday = new Date(view.y, view.mo - 1, 1).getDay();
  const daysInMonth = new Date(view.y, view.mo, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const is = (p, d) => !!p && p.y === view.y && p.mo === view.mo && p.d === d;

  return (
    <View>
      <View style={styles.calHeader}>
        <Pressable onPress={() => shift(-1)} style={styles.calNav} accessibilityLabel="Previous month">
          <Text style={styles.calNavText}>‹</Text>
        </Pressable>
        <Text style={styles.calTitle}>
          {MONTH_NAMES[view.mo - 1]} {view.y}
        </Text>
        <Pressable onPress={() => shift(1)} style={styles.calNav} accessibilityLabel="Next month">
          <Text style={styles.calNavText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.calGrid}>
        {WEEKDAYS.map((w, i) => (
          <View key={`w${i}`} style={styles.calCell}>
            <Text style={styles.calWeekday}>{w}</Text>
          </View>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <View key={`e${i}`} style={styles.calCell} />
          ) : (
            <Pressable
              key={d}
              style={styles.calCell}
              onPress={() => onSelect({ y: view.y, mo: view.mo, d })}
              accessibilityLabel={`${MONTH_NAMES[view.mo - 1]} ${d}, ${view.y}`}
            >
              <View
                style={[
                  styles.calDay,
                  is(today, d) && !is(selected, d) && styles.calDayToday,
                  is(selected, d) && styles.calDaySelected,
                ]}
              >
                <Text style={[styles.calDayText, is(selected, d) && styles.calDayTextOn]}>{d}</Text>
              </View>
            </Pressable>
          )
        )}
      </View>

      <PickerFooter onClear={onClear} onClose={onClose} closeLabel="Close" />
    </View>
  );
}