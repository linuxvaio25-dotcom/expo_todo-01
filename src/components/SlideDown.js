import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { USE_NATIVE_DRIVER } from '../config';

/* Fades in and slides down into place when it mounts.
   Give it a new `key` to replay the animation. */
export default function SlideDown({ children, style, delay = 0 }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(p, {
      toValue: 1,
      duration: 320,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [p, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: p,
          transform: [
            { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}