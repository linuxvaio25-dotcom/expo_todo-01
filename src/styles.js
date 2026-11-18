import { StyleSheet } from 'react-native';
import { C } from './theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 24, paddingTop: 48, paddingBottom: 80 },

  headline: {
    color: C.text,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
    minHeight: 76,
  },

  plusWrap: { marginTop: 20, alignSelf: 'flex-start' },
  plus: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: { color: C.green, fontSize: 32, lineHeight: 36, fontWeight: '300' },

  composer: { marginTop: 20 },

  field: {
    backgroundColor: C.surface,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: C.text,
  },
  fieldStatic: { minHeight: 48, justifyContent: 'center' },
  fieldText: { color: C.text, fontSize: 16 },

  scheduleWrap: { marginTop: 10 },
  scheduleBox: { paddingVertical: 8 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  scheduleLabel: { width: 62, color: C.muted, fontSize: 14 },
  scheduleValue: { flex: 1, color: C.text, fontSize: 14 },
  pickerField: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  pickerFieldText: { color: C.text, fontSize: 14 },
  pickerPanel: {
    marginTop: 8,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.blue,
    borderRadius: 12,
    padding: 12,
  },
  pickerFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },

  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  calNav: { width: 40, height: 36, alignItems: 'center', justifyContent: 'center' },
  calNavText: { color: C.blue, fontSize: 26, lineHeight: 30 },
  calTitle: { color: C.text, fontSize: 15, fontWeight: '600' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.2857%', height: 38, alignItems: 'center', justifyContent: 'center' },
  calWeekday: { color: C.muted, fontSize: 12 },
  calDay: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  calDaySelected: { backgroundColor: C.blue },
  calDayToday: { borderWidth: 1.5, borderColor: C.blue },
  calDayText: { color: C.text, fontSize: 14 },
  calDayTextOn: { color: C.bg, fontWeight: '700' },

  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginVertical: 4 },
  stepper: { alignItems: 'center' },
  stepBtn: { width: 52, height: 36, alignItems: 'center', justifyContent: 'center' },
  stepGlyph: { color: C.blue, fontSize: 16 },
  stepValue: { color: C.text, fontSize: 28, fontWeight: '600', minWidth: 52, textAlign: 'center' },
  timeColon: { color: C.muted, fontSize: 28 },
  ampm: { gap: 8 },
  seg: { borderWidth: 1.5, borderColor: C.blue, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, alignItems: 'center' },
  segOn: { backgroundColor: C.blue },
  segText: { color: C.blue, fontWeight: '600', fontSize: 14 },
  segTextOn: { color: C.bg },

  error: { color: C.red, fontSize: 13, marginTop: 8 },

  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  searchInput: {
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: C.text,
    marginBottom: 12,
  },
  sortLabel: { color: C.muted, fontSize: 14 },
  clearWrap: { alignItems: 'flex-start' },

  list: { marginTop: 32 },
  row: { flexDirection: 'row', marginBottom: 24 },
  number: {
    width: 32,
    paddingTop: 12,
    color: C.muted,
    fontSize: 18,
    fontWeight: '600',
  },
  rowBody: { flex: 1 },

  stack: { marginTop: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  prompt: { color: C.muted, fontSize: 14, marginBottom: 2 },

  pill: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pillText: { fontSize: 14, fontWeight: '600' },

  iconBtn: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  iconBtnText: { fontSize: 20, fontWeight: '700' },
});