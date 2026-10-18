import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingScreen, SignInScreen, SignUpScreen } from './src/screens';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

const STORAGE_KEY = '@task_manager_tasks_v1';
const ONBOARDING_KEY = '@onboarding_completed_v1';
const AUTH_KEY = '@auth_user_v1';

// Sample default tasks shown the first time the app opens
const DEFAULT_TASKS: Task[] = [
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

type Screen = 'onboarding' | 'signIn' | 'signUp' | 'main';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const saveTasks = async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  };

  // Hydrate persisted state on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const storedOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
        const storedUser = await AsyncStorage.getItem(AUTH_KEY);
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUserEmail(parsed.email ?? null);
          } catch {}
        }
        if (!cancelled) {
          setCurrentScreen(storedOnboarding !== 'true' ? 'onboarding' : 'main');
        }
      } catch {
        if (!cancelled) {
          setCurrentScreen('main');
        }
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

  // Persist tasks, but never before hydration so the initial empty
  // state cannot overwrite what is already in storage
  useEffect(() => {
    if (!isHydrated) return;
    void saveTasks(tasks);
  }, [isHydrated, tasks]);

  const addTask = () => {
    if (!taskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskText.trim(),
      completed: false,
      priority,
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const clearCompleted = () => {
    const hasCompleted = tasks.some((t) => t.completed);
    if (!hasCompleted) return;

    Alert.alert('Xác nhận', 'Bạn có chắc muốn xoá tất cả việc đã hoàn thành?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá hết',
        style: 'destructive',
        onPress: () => setTasks(tasks.filter((t) => !t.completed)),
      },
    ]);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  const getPriorityColor = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  if (currentScreen === 'onboarding') {
    return (
      <SafeAreaProvider>
        <OnboardingScreen
          onComplete={async () => {
            try {
              await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            } catch {}
            setCurrentScreen('main');
          }}
          onSkip={async () => {
            try {
              await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            } catch {}
            setCurrentScreen('main');
          }}
          onSignIn={() => {
            setCurrentScreen('signIn');
          }}
          onSignUp={() => {
            setCurrentScreen('signUp');
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'signIn') {
    return (
      <SafeAreaProvider>
        <SignInScreen
          onBack={() => {
            setCurrentScreen('onboarding');
          }}
          onSuccess={async (email) => {
            try {
              await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
              await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ email }));
            } catch {}
            setUserEmail(email);
            setCurrentScreen('main');
          }}
          onNavigateToSignUp={() => {
            setCurrentScreen('signUp');
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'signUp') {
    return (
      <SafeAreaProvider>
        <SignUpScreen
          onBack={() => {
            setCurrentScreen('onboarding');
          }}
          onNavigateToSignIn={() => {
            setCurrentScreen('signIn');
          }}
          onSuccess={async (userData) => {
            try {
              await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
              await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ email: userData.email }));
            } catch {}
            setUserEmail(userData.email);
            setCurrentScreen('main');
          }}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Task Manager</Text>
            <Text style={styles.headerSubtitle}>
              {tasks.length > 0
                ? `${completedCount}/${tasks.length} việc đã hoàn thành`
                : 'Chưa có công việc nào'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setCurrentScreen('onboarding')}
              style={styles.onboardingBtn}
            >
              <Ionicons name="sparkles" size={14} color="#6F3FF3" />
              <Text style={styles.onboardingBtnText}>Tour</Text>
            </TouchableOpacity>

            {userEmail ? (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Đăng xuất', `Bạn có muốn đăng xuất khỏi ${userEmail}?`, [
                    { text: 'Huỷ', style: 'cancel' },
                    {
                      text: 'Đăng xuất',
                      style: 'destructive',
                      onPress: async () => {
                        await AsyncStorage.removeItem(AUTH_KEY);
                        setUserEmail(null);
                        setCurrentScreen('signIn');
                      },
                    },
                  ]);
                }}
                style={styles.userBtn}
              >
                <Ionicons name="person-circle-outline" size={16} color="#4F46E5" />
                <Text style={styles.userBtnText} numberOfLines={1}>
                  {userEmail.split('@')[0]}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setCurrentScreen('signIn')}
                style={styles.loginBtn}
              >
                <Ionicons name="log-in-outline" size={15} color="#4F46E5" />
                <Text style={styles.loginBtnText}>Sign In</Text>
              </TouchableOpacity>
            )}

            {completedCount > 0 && (
              <TouchableOpacity onPress={clearCompleted} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Dọn dẹp</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Priority Selector & Add Input */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="Thêm công việc mới..."
            placeholderTextColor="#9CA3AF"
            value={taskText}
            onChangeText={setTaskText}
            onSubmitEditing={addTask}
            returnKeyType="done"
          />

          <View style={styles.inputRow}>
            <View style={styles.priorityGroup}>
              {(['low', 'medium', 'high'] as const).map((p) => {
                const isSelected = priority === p;
                const label =
                  p === 'low' ? 'Thấp' : p === 'medium' ? 'Vừa' : 'Gấp';
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.priorityBadge,
                      isSelected && {
                        backgroundColor: getPriorityColor(p),
                        borderColor: getPriorityColor(p),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityBadgeText,
                        isSelected && { color: '#FFFFFF', fontWeight: 'bold' },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={addTask}
              style={[
                styles.addBtn,
                !taskText.trim() && styles.addBtnDisabled,
              ]}
              disabled={!taskText.trim()}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {(['all', 'active', 'completed'] as const).map((f) => {
            const isSelected = filter === f;
            const label =
              f === 'all'
                ? 'Tất cả'
                : f === 'active'
                ? 'Đang làm'
                : 'Hoàn thành';
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.filterTab,
                  isSelected && styles.filterTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isSelected && styles.filterTabTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Task List */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={64}
                color="#D1D5DB"
              />
              <Text style={styles.emptyText}>Không có công việc nào!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <TouchableOpacity
                onPress={() => toggleTask(item.id)}
                style={styles.checkBtn}
              >
                <Ionicons
                  name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={26}
                  color={item.completed ? '#10B981' : '#9CA3AF'}
                />
              </TouchableOpacity>

              <View style={styles.taskBody}>
                <Text
                  style={[
                    styles.taskTitle,
                    item.completed && styles.taskTitleCompleted,
                  ]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <View style={styles.taskFooter}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: getPriorityColor(item.priority) },
                    ]}
                  />
                  <Text style={styles.taskPriorityText}>
                    {item.priority === 'high'
                      ? 'Ưu tiên cao'
                      : item.priority === 'medium'
                      ? 'Ưu tiên vừa'
                      : 'Ưu tiên thấp'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => deleteTask(item.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  </SafeAreaProvider>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onboardingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
  },
  onboardingBtnText: {
    color: '#6F3FF3',
    fontSize: 13,
    fontWeight: '700',
  },
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  clearBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  userBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    maxWidth: 120,
  },
  userBtnText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  loginBtnText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priorityGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  priorityBadgeText: {
    fontSize: 12,
    color: '#4B5563',
  },
  addBtn: {
    backgroundColor: '#4F46E5',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#A5B4FC',
  },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 3,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#111827',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  checkBtn: {
    marginRight: 12,
  },
  taskBody: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  taskPriorityText: {
    fontSize: 12,
    color: '#6B7280',
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#9CA3AF',
  },
});
