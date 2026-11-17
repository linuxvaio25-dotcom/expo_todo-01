import React from 'react';
import { View } from 'react-native';
import { C } from '../theme';
import { styles } from '../styles';
import PillButton from './PillButton';

export default function PickerFooter({ onClear, onClose, closeLabel }) {
  return (
    <View style={styles.pickerFooter}>
      <PillButton label="Clear" color={C.muted} onPress={onClear} />
      <PillButton label={closeLabel} color={C.blue} onPress={onClose} />
    </View>
  );
}