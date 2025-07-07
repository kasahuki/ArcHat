import { defineStore } from 'pinia';

const CATEGORY_LIST = [
  { value: 'main', label: '主线', color: '#ff4d4f' },
  { value: 'branch', label: '支线', color: '#52c41a' },
  { value: 'schedule', label: '时间行程', color: '#1890ff' },
  { value: 'pending', label: '待决定', color: '#faad14' }
];

function getDefaultTodos() {
  // 兼容旧数据
  const raw = localStorage.getItem('todos');
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      // 升级为带分类结构
      return arr.map(t => ({ ...t, category: t.category || 'main' }));
    }
    return arr;
  } catch {
    return [];
  }
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: getDefaultTodos() // [{id, text, done, category}]
  }),
  actions: {
    addTodo(payload) {
      // payload: {text, category}
      this.todos.push({ id: Date.now(), text: payload.text, done: false, category: payload.category });
      this.save();
    },
    updateTodo(todo) {
      const idx = this.todos.findIndex(t => t.id === todo.id);
      if (idx !== -1) {
        this.todos[idx] = { ...todo };
        this.save();
      }
    },
    deleteTodo(id) {
      this.todos = this.todos.filter(t => t.id !== id);
      this.save();
    },
    save() {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    },
    reorderTodos(newList) {
      // newList: 当前分类下的排序结果
      // 需要将当前分类的 todos 替换为 newList，其他分类不变
      if (!newList.length) return;
      const cat = newList[0].category;
      const others = this.todos.filter(t => t.category !== cat);
      this.todos = [...others, ...newList];
      this.save();
    }
  }
}); 