import React, { useState, useEffect, useRef } from 'react';
import { Animated, Easing, TextInput, View } from 'react-native';
import { C } from '../theme';
import { styles } from '../styles';
import { USE_NATIVE_DRIVER } from '../config';
import PillButton from './PillButton';

/* New-task composer: the field fades + zooms in with a green border and the
   Add button slides in below it. On submit it plays in reverse, then calls onSubmit. */
export default function Composer({ onSubmit }) {
  const [text, setText] = useState('');
  const p = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(p, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [p]);

  const submit = () => {
    const value = text.trim();
    Animated.timing(p, {
      toValue: 0,
      duration: 280,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => onSubmit(value));
  };

  return (
    <View style={styles.composer}>
      <Animated.View
        style={{
          opacity: p,
          transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
        }}
      >
        <TextInput
          autoFocus
          value={text}
          onChangeText={setText}
          onSubmitEditing={submit}
          returnKeyType="done"
          placeholder="type task here and press enter or the add button"
          placeholderTextColor={C.muted}
          style={[styles.field, { borderColor: C.green }]}
        />
      </Animated.View>

      <Animated.View
        style={{
          alignSelf: 'flex-start',
          marginTop: 12,
          opacity: p,
          transform: [
            { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) },
          ],
        }}
      >
        <PillButton label="Add" color={C.green} onPress={submit} />
      </Animated.View>
    </View>
  );
}