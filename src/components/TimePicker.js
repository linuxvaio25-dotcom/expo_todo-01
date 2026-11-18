import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../styles';
import { formatTime, pad, parseTime } from '../dates';
import Stepper from './Stepper';
import PickerFooter from './PickerFooter';

export default function TimePicker({ value, onChange, onClear, onClose }) {
  const parsed = value ? parseTime(value) : null;
  const [t, setT] = useState(() => ({
    h12: parsed ? parsed.h % 12 || 12 : 9,
    min: parsed ? parsed.min : 0,
    pm: parsed ? parsed.h >= 12 : false,
  }));

  const toText = (x) => formatTime((x.h12 % 12) + (x.pm ? 12 : 0), x.min);
  const update = (patch) => {
    const next = { ...t, ...patch };
    setT(next);
    onChange(toText(next));
  };

  return (
    <View>
      <View style={styles.timeRow}>
        <Stepper
          label="hour"
          value={String(t.h12)}
          onUp={() => update({ h12: (t.h12 % 12) + 1 })}
          onDown={() => update({ h12: ((t.h12 + 10) % 12) + 1 })}
        />
        <Text style={styles.timeColon}>:</Text>
        <Stepper
          label="minutes"
          value={pad(t.min)}
          onUp={() => update({ min: (t.min + 5) % 60 })}
          onDown={() => update({ min: (t.min + 55) % 60 })}
        />
        <View style={styles.ampm}>
          {['AM', 'PM'].map((label) => {
            const on = (label === 'PM') === t.pm;
            return (
              <Pressable
                key={label}
                onPress={() => update({ pm: label === 'PM' })}
                style={[styles.seg, on && styles.segOn]}
              >
                <Text style={[styles.segText, on && styles.segTextOn]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <PickerFooter
        onClear={onClear}
        onClose={() => {
          onChange(toText(t));
          onClose();
        }}
        closeLabel="Done"
      />
    </View>
  );
}