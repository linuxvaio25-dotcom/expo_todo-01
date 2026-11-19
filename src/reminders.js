import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'reminders';
const SUPPORTED = Platform.OS === 'android' || Platform.OS === 'ios';

if (SUPPORTED) {
  // Decides what happens if a reminder arrives while the app is open.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensurePermission() {
  if (Platform.OS === 'android') {
    // Android needs a channel before it will show the permission prompt.
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Task reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  let { granted } = await Notifications.getPermissionsAsync();
  if (!granted) {
    ({ granted } = await Notifications.requestPermissionsAsync());
  }
  return granted;
}

async function doSync(reminders) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (reminders.length === 0) return;
  if (!(await ensurePermission())) return;

  for (const r of reminders) {
    await Notifications.scheduleNotificationAsync({
      content: { title: r.title, body: r.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: r.at,
        channelId: CHANNEL_ID,
      },
    });
  }
}

// Run syncs one at a time so two quick changes can't interleave and
// leave duplicate notifications behind.
let queue = Promise.resolve();
export function syncReminders(reminders) {
  if (!SUPPORTED) return Promise.resolve();
  queue = queue.then(() => doSync(reminders)).catch(() => {});
  return queue;
}