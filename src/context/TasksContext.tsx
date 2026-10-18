import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { DEFAULT_TASKS, type Priority, type Task } from '../models/Task';

const STORAGE_KEY = '@task_manager_tasks_v1';
const ONBOARDING_KEY = '@onboarding_completed_v1';

interface TasksContextValue {
  /** False until persisted state has been read from storage. */
  isHydrated: boolean;
  /** True while the onboarding flow should be shown instead of the task list. */
  showOnboarding: boolean;
  tasks: Task[];
  addTask: (title: string, priority: Priority) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearCompleted: () => void;
  completeOnboarding: () => void;
  replayOnboarding: () => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function useTasks(): TasksContextValue {
  const value = useContext(TasksContext);
  if (!value) {
    throw new Error('useTasks must be used inside a <TasksProvider />');
  }
  return value;
}

export function TasksProvider({ children }: PropsWithChildren) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Hydrate persisted state once on mount.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const storedOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!cancelled) {
          setOnboardingDone(storedOnboarding === 'true');
        }
      } catch (e) {
        console.error('Failed to load onboarding flag', e);
      }

      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed: Task[] | null =
          jsonValue != null ? JSON.parse(jsonValue) : null;
        if (!cancelled) {
          setTasks(parsed ?? DEFAULT_TASKS);
        }
      } catch (e) {
        console.error('Failed to load tasks', e);
        if (!cancelled) {
          setTasks(DEFAULT_TASKS);
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist tasks, but never before hydration so the initial empty state
  // cannot overwrite what is already in storage.
  useEffect(() => {
    if (!isHydrated) return;
    void (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (e) {
        console.error('Failed to save tasks', e);
      }
    })();
  }, [isHydrated, tasks]);

  const persistOnboarding = useCallback(async (done: boolean) => {
    setOnboardingDone(done);
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, done ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to save onboarding flag', e);
    }
  }, []);

  const addTask = useCallback((title: string, priority: Priority) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const newTask: Task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: trimmed,
      completed: false,
      priority,
      createdAt: Date.now(),
    };

    setTasks((current) => [newTask, ...current]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((current) => current.filter((task) => !task.completed));
  }, []);

  const completeOnboarding = useCallback(() => {
    void persistOnboarding(true);
  }, [persistOnboarding]);

  const replayOnboarding = useCallback(() => {
    void persistOnboarding(false);
  }, [persistOnboarding]);

  const value = useMemo<TasksContextValue>(
    () => ({
      isHydrated,
      showOnboarding: isHydrated && !onboardingDone,
      tasks,
      addTask,
      toggleTask,
      deleteTask,
      clearCompleted,
      completeOnboarding,
      replayOnboarding,
    }),
    [
      isHydrated,
      onboardingDone,
      tasks,
      addTask,
      toggleTask,
      deleteTask,
      clearCompleted,
      completeOnboarding,
      replayOnboarding,
    ]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}