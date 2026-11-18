import React, { useState, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';
import { C } from '../theme';
import { styles } from '../styles';
import { sortByDate } from '../dates';
import SlideDown from '../components/SlideDown';
import Typewriter from '../components/Typewriter';
import Composer from '../components/Composer';
import TaskItem from '../components/TaskItem';
import SortBar from '../components/SortBar';
import ClearCompleted from '../components/ClearCompleted';
import { loadState, saveState } from '../storage';
import FilterBar from '../components/FilterBar';

const HEADLINE = 'What task would you like to add today?';

export default function App() {
  const [typed, setTyped] = useState(false);
  const [composing, setComposing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState('added'); // 'added' | 'date'
  const [loaded, setLoaded] = useState(false);
  const nextId = useRef(1);
  const [clearing, setClearing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'done'
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(Date.now());

  // Load saved tasks once, when the app opens.
  useEffect(() => {
    let alive = true;
    loadState().then((saved) => {
      if (!alive) return;
      if (saved) {
        setTasks(saved.tasks);
        setSortBy(saved.sortBy);
        nextId.current = saved.tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      }
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Save whenever tasks or the sort choice change. Wait until loading has
  // finished so the empty starting list never overwrites what was saved.
  useEffect(() => {
    if (loaded) saveState({ tasks, sortBy });
  }, [tasks, sortBy, loaded]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const addTask = (text) => {
    setComposing(false);
    if (!text) return;
    setTasks((prev) => [
      ...prev,
      { id: nextId.current++, text, completed: false, mode: 'askDate', schedule: null },
    ]);
  };

  useEffect(() => {
    if (completedCount === 0) setClearing(false);
  }, [completedCount]);

  const updateTask = (id, patch) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const removeTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const completedCount = tasks.filter((t) => t.completed).length;
  const clearCompleted = () => setTasks((prev) => prev.filter((t) => !t.completed));

  // const visibleTasks = sortBy === 'date' ? sortByDate(tasks) : tasks;

  const sorted = sortBy === 'date' ? sortByDate(tasks) : tasks;
  const q = query.trim().toLowerCase();
  const visibleTasks = sorted.filter((t) => {
    const matchesFilter =
      filter === 'all' || (filter === 'active' ? !t.completed : t.completed);
    const matchesQuery = !q || t.text.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

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
            {tasks.length > 1 && <SortBar value={sortBy} onChange={setSortBy} />}
            {tasks.length > 0 && (
              <FilterBar
                query={query}
                onQueryChange={setQuery}
                filter={filter}
                onFilterChange={setFilter}
              />
            )}
            {visibleTasks.map((task, i) => (
              <TaskItem
                key={task.id}
                number={i + 1}
                task={task}
                onUpdate={(patch) => updateTask(task.id, patch)}
                onRemove={() => removeTask(task.id)}
                fadeOut={clearing && task.completed}
                now={now}
              />
            ))}

            {tasks.length > 0 && visibleTasks.length === 0 && (
              <Text style={styles.prompt}>No tasks match your filter.</Text>
            )}

            {/* {completedCount > 0 && ( */}
            {completedCount > 0 && !clearing && (
              <ClearCompleted count={completedCount} onConfirm={clearCompleted} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}