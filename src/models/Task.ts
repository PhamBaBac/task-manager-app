export type Priority = 'low' | 'medium' | 'high';

export type TaskFilter = 'all' | 'active' | 'completed';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}

/**
 * Sample tasks shown the first time the app opens, before anything
 * has been persisted to storage.
 */
export const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Chào mừng bạn đến với Task Manager! 👋',
    completed: false,
    priority: 'high',
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'Chạm vào dấu tích tròn để hoàn thành task',
    completed: true,
    priority: 'medium',
    createdAt: Date.now() - 10000,
  },
  {
    id: '3',
    title: 'Vuốt hoặc bấm nút thùng rác để xoá',
    completed: false,
    priority: 'low',
    createdAt: Date.now() - 20000,
  },
];