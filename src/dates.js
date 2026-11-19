export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const EMPTY_DRAFT = { sd: '', st: '', ed: '', et: '' };
export const pad = (n) => String(n).padStart(2, '0');

export function parseDate(s) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const mo = +m[1];
  const d = +m[2];
  const y = +m[3];
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return { y, mo, d };
}

// Accepts "9:30 AM", "9am", "9:30pm" or 24-hour "14:30".
export function parseTime(s) {
  const t = s.trim();
  const m = /^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m?\.?$/i.exec(t);
  if (m) {
    const h = +m[1];
    const min = m[2] ? +m[2] : 0;
    if (h < 1 || h > 12 || min > 59) return null;
    const isPm = m[3].toLowerCase() === 'p';
    return { h: (h % 12) + (isPm ? 12 : 0), min };
  }
  const m2 = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (m2) {
    const h = +m2[1];
    const min = +m2[2];
    if (h > 23 || min > 59) return null;
    return { h, min };
  }
  return null;
}

export const formatTime = (h, min) => `${h % 12 || 12}:${pad(min)} ${h >= 12 ? 'PM' : 'AM'}`;
export const formatPart = (p) => `${MONTHS[p.mo - 1]} ${p.d}, ${p.y} at ${formatTime(p.h, p.min)}`;
export const toMs = (p) => new Date(p.y, p.mo - 1, p.d, p.h, p.min).getTime();

function parsePart(label, date, time) {
  if (!date && !time) return { part: null };
  if (!date || !time) return { error: `${label} needs both a date and a time.` };
  const d = parseDate(date);
  if (!d) return { error: 'Enter the date as MM/DD/YYYY.' };
  const t = parseTime(time);
  if (!t) return { error: 'Enter the time like 9:30 AM.' };
  return { part: { ...d, ...t } };
}

export function validateSchedule(draft, allowEmpty) {
  const s = parsePart('Start on', draft.sd, draft.st);
  if (s.error) return { error: s.error };
  const e = parsePart('End on', draft.ed, draft.et);
  if (e.error) return { error: e.error };
  if (!s.part && !e.part) {
    return allowEmpty
      ? { schedule: null }
      : { error: 'Add a start or end date and time, or tap ✕ to skip.' };
  }
  if (s.part && e.part && toMs(e.part) <= toMs(s.part)) {
    return { error: 'End on must be after Start on.' };
  }
  return { schedule: { start: s.part, end: e.part } };
}

export function scheduleToDraft(schedule) {
  const fromPart = (p) =>
    p
      ? { date: `${pad(p.mo)}/${pad(p.d)}/${p.y}`, time: formatTime(p.h, p.min) }
      : { date: '', time: '' };
  const s = fromPart(schedule && schedule.start);
  const e = fromPart(schedule && schedule.end);
  return { sd: s.date, st: s.time, ed: e.date, et: e.time };
}

export function todayParts() {
  const now = new Date();
  return { y: now.getFullYear(), mo: now.getMonth() + 1, d: now.getDate() };
}

// Soonest start date first (falls back to the end date). Tasks with no dates go last.
export function sortByDate(tasks) {
  const key = (t) => {
    const p = t.schedule && (t.schedule.start || t.schedule.end);
    return p ? toMs(p) : Infinity;
  };
  return [...tasks].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    if (ka === kb) return a.id - b.id;
    return ka < kb ? -1 : 1;
  });
}

const SOON_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Returns 'overdue', 'soon' or null.
export function dueStatus(task, now = Date.now()) {
  const s = task.schedule;
  if (task.completed || !s) return null;

  const due = s.end || s.start;
  if (!due) return null;
  if (toMs(due) < now) return 'overdue';

  const soon = [s.start, s.end].some(
    (p) => p && toMs(p) >= now && toMs(p) <= now + SOON_MS
  );
  return soon ? 'soon' : null;
}

export function buildReminders(tasks, now = Date.now()) {
  const list = [];
  tasks.forEach((t) => {
    if (t.completed || !t.schedule) return;
    const { start, end } = t.schedule;
    if (start && toMs(start) > now) {
      list.push({ key: `${t.id}-start`, title: 'Starting now', body: t.text, at: toMs(start) });
    }
    if (end && toMs(end) > now) {
      list.push({ key: `${t.id}-end`, title: 'Due now', body: t.text, at: toMs(end) });
    }
  });
  // iOS only keeps 64 pending notifications, so keep the soonest ones.
  return list.sort((a, b) => a.at - b.at).slice(0, 60);
}
