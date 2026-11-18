import { Platform } from 'react-native';

// Native-driven animations aren't available on web, so fall back quietly there.
export const USE_NATIVE_DRIVER = Platform.OS !== 'web';