import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'todo-app:v1';

// Returns { tasks, sortBy } or null if nothing is saved yet.
export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const tasks = Array.isArray(data.tasks)
      ? // A task saved mid-edit shouldn't reopen mid-edit, so everything starts idle.
        data.tasks.map((t) => ({ ...t, mode: 'idle' }))
      : [];
    return { tasks, sortBy: data.sortBy === 'date' ? 'date' : 'added' };
  } catch (e) {
    return null;
  }
}

export async function saveState(state) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // Saving is best-effort; the app keeps working without it.
  }
}