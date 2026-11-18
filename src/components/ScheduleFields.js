import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles';
import { MONTHS, pad, parseDate, todayParts } from '../dates';
import SlideDown from './SlideDown';
import TimePicker from './TimePicker';
import PickerField from './PickerField';
import Calendar from './Calendar';

/* Start/end fields: tap one to slide in a calendar or time picker. */
export default function ScheduleFields({ draft, onChange, borderColor }) {
  const [picker, setPicker] = useState(null); // 'sd' | 'st' | 'ed' | 'et' | null
  const rows = [
    { label: 'Start on', date: 'sd', time: 'st' },
    { label: 'End on', date: 'ed', time: 'et' },
  ];
  const toggle = (key) => setPicker((p) => (p === key ? null : key));
  const set = (key, v) => onChange({ ...draft, [key]: v });
  const dateText = (s) => {
    const d = s ? parseDate(s) : null;
    return d ? `${MONTHS[d.mo - 1]} ${d.d}, ${d.y}` : '';
  };

  const isDate = picker === 'sd' || picker === 'ed';
  const selected = isDate ? parseDate(draft[picker]) : null;
  const initial = isDate
    ? selected || (picker === 'ed' && parseDate(draft.sd)) || todayParts()
    : null;

  return (
    <View>
      <View style={[styles.field, styles.scheduleBox, { borderColor }]}>
        {rows.map((r) => (
          <View key={r.label} style={styles.scheduleRow}>
            <Text style={styles.scheduleLabel}>{r.label}</Text>
            <PickerField
              flex={1.3}
              text={dateText(draft[r.date])}
              placeholder="Select date"
              active={picker === r.date}
              onPress={() => toggle(r.date)}
            />
            <PickerField
              flex={1}
              text={draft[r.time]}
              placeholder="Select time"
              active={picker === r.time}
              onPress={() => toggle(r.time)}
            />
          </View>
        ))}
      </View>

      {picker && (
        <SlideDown key={picker} style={styles.pickerPanel}>
          {isDate ? (
            <Calendar
              initial={initial}
              selected={selected}
              onSelect={(d) => {
                set(picker, `${pad(d.mo)}/${pad(d.d)}/${d.y}`);
                setPicker(null);
              }}
              onClear={() => {
                set(picker, '');
                setPicker(null);
              }}
              onClose={() => setPicker(null)}
            />
          ) : (
            <TimePicker
              value={draft[picker]}
              onChange={(v) => set(picker, v)}
              onClear={() => {
                set(picker, '');
                setPicker(null);
              }}
              onClose={() => setPicker(null)}
            />
          )}
        </SlideDown>
      )}
    </View>
  );
}