/**
 * Tiny in-memory bridge for passing a picked value back from a pushed
 * screen (e.g. the exercise picker) to the screen that opened it, without
 * pulling in a state library. Safe because navigation within one app
 * session stays in the same JS runtime — nothing here needs to survive a
 * reload, only a push/pop.
 */
import type { Exercise } from '@/types';

let pendingExercisePick: ((exercises: Exercise[]) => void) | null = null;

export function setExercisePickerCallback(cb: (exercises: Exercise[]) => void) {
  pendingExercisePick = cb;
}

export function resolveExercisePick(exercises: Exercise[]) {
  pendingExercisePick?.(exercises);
  pendingExercisePick = null;
}

export function clearExercisePickerCallback() {
  pendingExercisePick = null;
}
