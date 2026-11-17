import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { C } from '../theme';
import { styles } from '../styles';
import {
  EMPTY_DRAFT,
  MONTHS,
  formatPart,
  formatTime,
  pad,
  parseDate,
  parseTime,
  scheduleToDraft,
  todayParts,
  validateSchedule,
} from '../dates';

// Native-driven animations aren't available on web, so fall back quietly there.
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const HEADLINE = 'What task would you like to add today?';

/* ---------- Small animation helper ----------
   Fades in and slides down into place when it mounts.
   Give it a new `key` to replay the animation. */
function SlideDown({ children, style, delay = 0 }) {
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

/* ---------- Typewriter headline ---------- */
function Typewriter({ text, onDone }) {
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

/* ---------- Small buttons ---------- */
function PillButton({ label, color, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        { borderColor: color },
        pressed && { backgroundColor: color + '33' },
      ]}
    >
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </Pressable>
  );
}

function IconButton({ glyph, color, onPress, label }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.iconBtn,
        { borderColor: color },
        pressed && { backgroundColor: color + '33' },
      ]}
    >
      <Text style={[styles.iconBtnText, { color }]}>{glyph}</Text>
    </Pressable>
  );
}

/* ---------- New-task composer ----------
   Field fades + zooms in with a green border; the Add button slides in
   below it. On submit, everything plays in reverse, then calls onSubmit. */
function Composer({ onSubmit }) {
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

/* ---------- Calendar & time pickers ---------- */
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function PickerFooter({ onClear, onClose, closeLabel }) {
  return (
    <View style={styles.pickerFooter}>
      <PillButton label="Clear" color={C.muted} onPress={onClear} />
      <PillButton label={closeLabel} color={C.blue} onPress={onClose} />
    </View>
  );
}

function Calendar({ initial, selected, onSelect, onClear, onClose }) {
  const [view, setView] = useState({ y: initial.y, mo: initial.mo });
  const today = todayParts();

  const shift = (delta) =>
    setView((v) => {
      const idx = v.y * 12 + (v.mo - 1) + delta;
      return { y: Math.floor(idx / 12), mo: (idx % 12) + 1 };
    });

  const firstWeekday = new Date(view.y, view.mo - 1, 1).getDay();
  const daysInMonth = new Date(view.y, view.mo, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const is = (p, d) => !!p && p.y === view.y && p.mo === view.mo && p.d === d;

  return (
    <View>
      <View style={styles.calHeader}>
        <Pressable onPress={() => shift(-1)} style={styles.calNav} accessibilityLabel="Previous month">
          <Text style={styles.calNavText}>‹</Text>
        </Pressable>
        <Text style={styles.calTitle}>
          {MONTH_NAMES[view.mo - 1]} {view.y}
        </Text>
        <Pressable onPress={() => shift(1)} style={styles.calNav} accessibilityLabel="Next month">
          <Text style={styles.calNavText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.calGrid}>
        {WEEKDAYS.map((w, i) => (
          <View key={`w${i}`} style={styles.calCell}>
            <Text style={styles.calWeekday}>{w}</Text>
          </View>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <View key={`e${i}`} style={styles.calCell} />
          ) : (
            <Pressable
              key={d}
              style={styles.calCell}
              onPress={() => onSelect({ y: view.y, mo: view.mo, d })}
              accessibilityLabel={`${MONTH_NAMES[view.mo - 1]} ${d}, ${view.y}`}
            >
              <View
                style={[
                  styles.calDay,
                  is(today, d) && !is(selected, d) && styles.calDayToday,
                  is(selected, d) && styles.calDaySelected,
                ]}
              >
                <Text style={[styles.calDayText, is(selected, d) && styles.calDayTextOn]}>{d}</Text>
              </View>
            </Pressable>
          )
        )}
      </View>

      <PickerFooter onClear={onClear} onClose={onClose} closeLabel="Close" />
    </View>
  );
}

function Stepper({ value, onUp, onDown, label }) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onUp} style={styles.stepBtn} accessibilityLabel={`Increase ${label}`}>
        <Text style={styles.stepGlyph}>▲</Text>
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable onPress={onDown} style={styles.stepBtn} accessibilityLabel={`Decrease ${label}`}>
        <Text style={styles.stepGlyph}>▼</Text>
      </Pressable>
    </View>
  );
}

function TimePicker({ value, onChange, onClear, onClose }) {
  const parsed = value ? parseTime(value) : null;
  const [t, setT] = useState(() => ({
    h12: parsed ? parsed.h % 12 || 12 : 9,
    min: parsed ? parsed.min : 0,
    pm: parsed ? parsed.h >= 12 : false,
  }));

  const toText = (x) => formatTime((x.h12 % 12) + (x.pm ? 12 : 0), x.min);
  const update = (patch) => {
    const next = { ...t, ...patch };
    setT(next);
    onChange(toText(next));
  };

  return (
    <View>
      <View style={styles.timeRow}>
        <Stepper
          label="hour"
          value={String(t.h12)}
          onUp={() => update({ h12: (t.h12 % 12) + 1 })}
          onDown={() => update({ h12: ((t.h12 + 10) % 12) + 1 })}
        />
        <Text style={styles.timeColon}>:</Text>
        <Stepper
          label="minutes"
          value={pad(t.min)}
          onUp={() => update({ min: (t.min + 5) % 60 })}
          onDown={() => update({ min: (t.min + 55) % 60 })}
        />
        <View style={styles.ampm}>
          {['AM', 'PM'].map((label) => {
            const on = (label === 'PM') === t.pm;
            return (
              <Pressable
                key={label}
                onPress={() => update({ pm: label === 'PM' })}
                style={[styles.seg, on && styles.segOn]}
              >
                <Text style={[styles.segText, on && styles.segTextOn]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <PickerFooter
        onClear={onClear}
        onClose={() => {
          onChange(toText(t));
          onClose();
        }}
        closeLabel="Done"
      />
    </View>
  );
}

/* ---------- Start/end fields: tap one to slide in a calendar or time picker ---------- */
function PickerField({ text, placeholder, active, onPress, flex }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pickerField, { flex }, active && { borderColor: C.blue }]}
    >
      <Text style={[styles.pickerFieldText, !text && { color: C.muted }]} numberOfLines={1}>
        {text || placeholder}
      </Text>
    </Pressable>
  );
}

function ScheduleFields({ draft, onChange, borderColor }) {
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

/* ---------- A single task ---------- */
function TaskItem({ number, task, onUpdate, onRemove }) {
  const [draft, setDraft] = useState(task.text);
  const [sched, setSched] = useState(EMPTY_DRAFT);
  const [error, setError] = useState('');
  const enter = useRef(new Animated.Value(0)).current;

  // Entrance
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 340,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [enter]);

  const removeWithFade = () => {
    Animated.timing(enter, {
      toValue: 0,
      duration: 260,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(onRemove);
  };

  const { mode, completed, schedule } = task;
  const showForm = mode === 'scheduling' || (mode === 'editing' && !!schedule);
  const showView = !!schedule && !showForm;

  let borderColor = C.line;
  if (completed) borderColor = C.gray;
  if (mode === 'editing') borderColor = C.yellow;
  if (mode === 'deleting') borderColor = C.red;

  const backToIdle = () => {
    setError('');
    onUpdate({ mode: 'idle' });
  };

  // Date & time prompt
  const answerYes = () => {
    setSched(EMPTY_DRAFT);
    setError('');
    onUpdate({ mode: 'scheduling' });
  };
  const addDateLater = answerYes;

  const saveSchedule = () => {
    const result = validateSchedule(sched, false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError('');
    onUpdate({ schedule: result.schedule, mode: 'idle' });
  };

  // Editing
  const startEdit = () => {
    setDraft(task.text);
    setSched(schedule ? scheduleToDraft(schedule) : EMPTY_DRAFT);
    setError('');
    onUpdate({ mode: 'editing' });
  };
  const saveEdit = () => {
    const patch = { text: draft.trim() || task.text, mode: 'idle' };
    // Saving an edit on a completed task puts it back on the active list.
    if (completed) patch.completed = false;
    if (schedule) {
      const result = validateSchedule(sched, true);
      if (result.error) {
        setError(result.error);
        return;
      }
      patch.schedule = result.schedule;
    }
    setError('');
    onUpdate(patch);
  };

  return (
    <Animated.View
      style={[
        styles.row,
        {
          opacity: enter,
          transform: [
            { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
          ],
        },
      ]}
    >
      <Text style={[styles.number, completed && { color: C.gray }]}>{number}</Text>

      <View style={styles.rowBody}>
        {/* The task itself */}
        {mode === 'editing' ? (
          <TextInput
            autoFocus
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={saveEdit}
            returnKeyType="done"
            style={[styles.field, { borderColor }]}
          />
        ) : (
          <View style={[styles.field, styles.fieldStatic, { borderColor }]}>
            <Text
              style={[
                styles.fieldText,
                completed && { color: C.gray, textDecorationLine: 'line-through' },
              ]}
            >
              {task.text}
            </Text>
          </View>
        )}

        {/* Separate date & time field below the task */}
        {showForm && (
          <SlideDown key="sched-form" style={styles.scheduleWrap}>
            <ScheduleFields
              draft={sched}
              onChange={setSched}
              borderColor={mode === 'editing' ? C.yellow : C.blue}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </SlideDown>
        )}

        {showView && (
          <SlideDown key="sched-view" style={styles.scheduleWrap}>
            <View style={[styles.field, styles.scheduleBox, { borderColor: completed ? C.gray : C.line }]}>
              {schedule.start && (
                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleLabel}>Start on</Text>
                  <Text style={[styles.scheduleValue, completed && { color: C.gray }]}>
                    {formatPart(schedule.start)}
                  </Text>
                </View>
              )}
              {schedule.end && (
                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleLabel}>End on</Text>
                  <Text style={[styles.scheduleValue, completed && { color: C.gray }]}>
                    {formatPart(schedule.end)}
                  </Text>
                </View>
              )}
            </View>
          </SlideDown>
        )}

        {/* Options that slide in beneath. The key replays the slide. */}
        {mode === 'askDate' && (
          <SlideDown key="ask" style={styles.stack}>
            <Text style={styles.prompt}>
              Would you like to add a start and end date and time to this task?
            </Text>
            <View style={styles.actions}>
              <PillButton label="Yes" color={C.blue} onPress={answerYes} />
              <PillButton label="No" color={C.muted} onPress={backToIdle} />
            </View>
          </SlideDown>
        )}

        {mode === 'scheduling' && (
          <SlideDown key="scheduling" style={styles.actions}>
            <IconButton glyph="✓" color={C.green} label="Save date and time" onPress={saveSchedule} />
            <IconButton glyph="✕" color={C.red} label="Skip date and time" onPress={backToIdle} />
          </SlideDown>
        )}

        {mode === 'idle' && !completed && (
          <SlideDown key="actions" style={styles.actions}>
            <PillButton label="Complete" color={C.green} onPress={() => onUpdate({ completed: true })} />
            <PillButton label="Edit" color={C.yellow} onPress={startEdit} />
            <PillButton label="Delete" color={C.red} onPress={() => onUpdate({ mode: 'deleting' })} />
            {!schedule && <PillButton label="Add date" color={C.blue} onPress={addDateLater} />}
          </SlideDown>
        )}

        {mode === 'idle' && completed && (
          <SlideDown key="completed" style={styles.stack}>
            <Text style={styles.prompt}>Task completed. Would you like to edit or delete it?</Text>
            <View style={styles.actions}>
              <PillButton label="Edit" color={C.yellow} onPress={startEdit} />
              <PillButton label="Delete" color={C.red} onPress={() => onUpdate({ mode: 'deleting' })} />
            </View>
          </SlideDown>
        )}

        {mode === 'editing' && (
          <SlideDown key="editing" style={styles.actions}>
            <IconButton glyph="✓" color={C.green} label="Save changes" onPress={saveEdit} />
            <IconButton glyph="✕" color={C.red} label="Discard changes" onPress={backToIdle} />
          </SlideDown>
        )}

        {mode === 'deleting' && (
          <SlideDown key="deleting" style={styles.stack}>
            <Text style={[styles.prompt, { color: C.red }]}>
              Do you really want to delete this task?
            </Text>
            <View style={styles.actions}>
              <IconButton glyph="✓" color={C.green} label="Yes, delete" onPress={removeWithFade} />
              <IconButton glyph="✕" color={C.red} label="No, keep it" onPress={backToIdle} />
            </View>
          </SlideDown>
        )}
      </View>
    </Animated.View>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [typed, setTyped] = useState(false);
  const [composing, setComposing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const nextId = useRef(1);

  const addTask = (text) => {
    setComposing(false);
    if (!text) return;
    setTasks((prev) => [
      ...prev,
      { id: nextId.current++, text, completed: false, mode: 'askDate', schedule: null },
    ]);
  };

  const updateTask = (id, patch) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const removeTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Typewriter text={HEADLINE} onDone={() => setTyped(true)} />

          {/* "+" slides in under the headline once typing finishes */}
          {typed && !composing && (
            <SlideDown key="plus" style={styles.plusWrap}>
              <Pressable
                onPress={() => setComposing(true)}
                accessibilityLabel="Add a task"
                style={({ pressed }) => [styles.plus, pressed && { backgroundColor: C.green + '33' }]}
              >
                <Text style={styles.plusText}>+</Text>
              </Pressable>
            </SlideDown>
          )}

          {composing && <Composer onSubmit={addTask} />}

          <View style={styles.list}>
            {tasks.map((task, i) => (
              <TaskItem
                key={task.id}
                number={i + 1}
                task={task}
                onUpdate={(patch) => updateTask(task.id, patch)}
                onRemove={() => removeTask(task.id)}
              />
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}