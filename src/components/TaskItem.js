import React, { useState, useEffect, useRef } from 'react';
import { Animated, Easing, Text, TextInput, View } from 'react-native';
import { C } from '../theme';
import { styles } from '../styles';
import { USE_NATIVE_DRIVER } from '../config';
import { EMPTY_DRAFT, formatPart, scheduleToDraft, validateSchedule } from '../dates';
import SlideDown from './SlideDown';
import ScheduleFields from './ScheduleFields';
import PillButton from './PillButton';
import IconButton from './IconButton';

export default function TaskItem({ number, task, onUpdate, onRemove }) {
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