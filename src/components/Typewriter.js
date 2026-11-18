import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { styles } from '../styles';

export default function Typewriter({ text, onDone }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= text.length) {
      onDone && onDone();
      return;
    }
    const id = setTimeout(() => setCount((c) => c + 1), 45);
    return () => clearTimeout(id);
  }, [count, text, onDone]);

  const typing = count < text.length;
  return (
    <Text style={styles.headline}>
      {text.slice(0, count)}
      {typing ? '|' : ''}
    </Text>
  );
}