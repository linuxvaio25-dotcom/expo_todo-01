import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { C } from '../theme';
import { styles } from '../styles';
import SlideDown from './SlideDown';
import PillButton from './PillButton';
import IconButton from './IconButton';

export default function ClearCompleted({ count, onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  const noun = count === 1 ? 'task' : 'tasks';

  // Different keys make React treat these as separate components,
  // so each one replays the slide-in when you switch between them.
  if (!confirming) {
    return (
      <SlideDown key="clear" style={styles.clearWrap}>
        <PillButton
          label={`Clear completed (${count})`}
          color={C.red}
          onPress={() => setConfirming(true)}
        />
      </SlideDown>
    );
  }

  return (
    <SlideDown key="confirm" style={styles.clearWrap}>
      <Text style={[styles.prompt, { color: C.red }]}>
        Delete {count} completed {noun}?
      </Text>
      <View style={styles.actions}>
        <IconButton glyph="✓" color={C.green} label="Yes, clear completed" onPress={onConfirm} />
        <IconButton glyph="✕" color={C.red} label="No, keep them" onPress={() => setConfirming(false)} />
      </View>
    </SlideDown>
  );
}