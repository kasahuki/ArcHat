<template>
  <div class="archives-root">
    <div class="archives-title">
      ArcArchives
      <span class="subtitle">
        FlashThoughts
      </span>
    </div>

    <!-- 闪念画板 -->
    <div class="drawing-board-outer">
      <div class="drawing-board-apple" :class="{ fullscreen: isFullscreen }">
        <div class="drawing-board-header-apple" v-if="!isFullscreen">
          <h1><el-icon style="margin-right:8px;"><EditPen /></el-icon>Drawing Board</h1>
          <div>
            <DangerButton :type="showDrawingBoard ? 'danger' : 'success'" @click="showDrawingBoard = !showDrawingBoard">
              {{ showDrawingBoard ? '隐藏画板' : '展开画板' }}
            </DangerButton>
            <DangerButton type="primary" @click="toggleFullscreen" style="margin-left: 12px;">
              全屏
            </DangerButton>
          </div>
        </div>
        <button v-if="isFullscreen" class="fullscreen-exit-btn" @click="toggleFullscreen">
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59L7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4" />
          </svg>
        </button>
        <transition name="fade">
          <iframe v-if="showDrawingBoard" ref="drawingIframe" src="https://excalidraw.com" :style="iframeStyle"
            frameborder="0" class="drawing-iframe"></iframe>
        </transition>
      </div>
    </div>


    <!-- 闪念md卡片编辑器 -->
    <div class="drawing-board-outer">
      <div class="drawing-board-apple" >
      <div class="drawing-board-header-apple">
        <h1><el-icon style="margin-right:8px;"><Edit /></el-icon>Flash Editor</h1>
        <div>
          <DangerButton :type="showEditor ? 'danger' : 'success'" @click=";">
            {{ showEditor ? '隐藏' : '展开' }}
          </DangerButton>
          <DangerButton type="primary" @click=";" style="margin-left: 12px;">
            新增
          </DangerButton>
        </div>
      </div>
      </div>
    </div>

    <!-- Todo List 板块 -->
    <div class="drawing-board-outer">
      <div class="drawing-board-apple" >
      <div class="drawing-board-header-apple">
        <h1><el-icon style="margin-right:8px;"><List /></el-icon>Todo List</h1>
        <div>
          <DangerButton type="primary" @click="showTodoList = !showTodoList" style="margin-left: 12px;">
            {{ showTodoList ? '收起' : '展开' }}
          </DangerButton>
        </div>
      </div>
      <transition name="fade">
        <TodoList v-if="showTodoList" :todos="todoStore.todos" @add="handleAddTodo" @update="handleUpdateTodo" @delete="handleDeleteTodo" @reorder="handleReorderTodo" />
      </transition>
      </div>
    </div>
    <div class="drawing-board-outer" style="margin-bottom: 5rem;">
      <div class="drawing-board-apple" >
      <div class="drawing-board-header-apple">
        <h1><el-icon style="margin-right:8px;"><Files /></el-icon>My Resources</h1>
        <div>
          <DangerButton type="primary" @click="showResourceDrawer = !showResourceDrawer" style="margin-left: 12px;">
            {{ showResourceDrawer ? '收起' : '展开' }}
          </DangerButton>
        
        </div>
      </div>
      <ResourceDrawer :visible="showResourceDrawer" @close="showResourceDrawer = false" />
      </div>
    </div>
    <div class="arc-water-header">
      Trace Posts
    </div>
    <div style="display: flex; justify-content: center;   align-items: center; ; justify-content: space-around; ">

      <img src="/src/assets/image/flashThought.svg" alt="" width="25%" >
      <Terminal :cmd="cmd" style="width: 50%;"/>
    </div>
    <div class="flash-footer" >
      <MacWindowControls class="mac-window-controls" />
      <div class="arc-water-container">
        <img src="/src/assets/image/arcwater_logo.png" alt="" width="10%" >
        <div class="arc-water-search">
          <input v-model="arcwaterSearch" class="arcwater-search-input" placeholder="Type here..." @keyup.enter="handleArcwaterSearch" />
        </div>
        <DangerButton type="primary" @click="handleArcwaterSearch">
          <el-icon><Search /></el-icon> Search
        </DangerButton>
        <div class="arcwater-glass-btns">
          <button v-for="btn in glassBtns" :key="btn.label" class="glass-btn" :title="btn.label" :style="{ background: btn.bg }" @click="btn.action">
            <span v-if="btn.label === 'VSCode'" class="glass-btn-icon" v-html="vscodeSvg"></span>
            <span v-else-if="btn.label === 'Github'" class="glass-btn-icon" v-html="githubSvg"></span>
            <img v-else :src="btn.icon" :alt="btn.label" class="glass-btn-icon" />
          </button>
        </div>
     
      </div>
    </div>

  </div>

</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import DangerButton from '@/components/dangerButton.vue';
import EditorDrawer from '@/components/EditorDrawer.vue';
import ResourceDrawer from '@/components/ResourceDrawer.vue';
import TodoList from '@/components/TodoList.vue';
import { useTodoStore } from '@/stores/todo.js';
import { EditPen, Edit, List, Files, Search } from '@element-plus/icons-vue';
import MacWindowControls from '@/components/MacWindowControls.vue';
import Terminal from '@/components/Terminal.vue';
const showDrawingBoard = ref(false);
const isFullscreen = ref(false);
const showResourceDrawer = ref(false);
const showTodoList = ref(true);

const todoStore = useTodoStore();
const cmd = ref('https://www.arcwater.com/');

// 新增：arcwater搜索框内容
const arcwaterSearch = ref('');
function handleArcwaterSearch() {
  if (!arcwaterSearch.value.trim()) return;
  const q = encodeURIComponent(arcwaterSearch.value.trim());
  window.open(`https://www.baidu.com/s?wd=${q}`, '_blank');
}

const iframeStyle = computed(() => {
  if (isFullscreen.value) {
    return {
      width: '100vw',
      height: '100vh',
      borderRadius: '0',
      boxShadow: 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 4000,
      background: '#fff'
    };
  }
  return {
    width: '100%',
    height: '600px',
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(60,60,60,0.08)',
    background: '#f8fafc'
  };
});

function toggleFullscreen() {
  showDrawingBoard.value = true;
  isFullscreen.value = !isFullscreen.value;
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function handleAddTodo(payload) {
  todoStore.addTodo(payload);
}
function handleUpdateTodo(todo) {
  todoStore.updateTodo(todo);
}
function handleDeleteTodo(id) {
  todoStore.deleteTodo(id);
}

function handleReorderTodo(newList) {
  todoStore.reorderTodos(newList);
}

const glassBtns = [
  {
    label: '翻译',
    icon: 'https://api.iconify.design/mdi:google-translate.svg',
    bg: 'linear-gradient(135deg, #f7c948 0%, #4285F4 100%)',
    action: () => window.open('https://fanyi.baidu.com/', '_blank'),
  },
  {
    label: 'Bilibili',
    icon: 'https://api.iconify.design/simple-icons/bilibili.svg',
    bg: '#ff8acb',
    action: () => window.open('https://www.bilibili.com/', '_blank'),
  },
  {
    label: 'Github',
    icon: 'https://github.githubassets.com/favicons/favicon.svg',
    bg: '#fff',
    action: () => window.open('https://github.com/', '_blank'),
  },
  {
    label: 'Idea',
    icon: 'https://api.iconify.design/simple-icons/intellijidea.svg',
    bg: 'linear-gradient(135deg, #f44369 0%, #2c54f7 100%)',
    action: () => window.open('https://www.jetbrains.com/idea/', '_blank'),
  },
  {
    label: 'VSCode',
    icon: 'https://api.iconify.design/simple-icons/visualstudiocode.svg',
    bg: '#fff',
    action: () => window.open('https://vscode.dev/', '_blank'),
  },
];

const vscodeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="35"  viewBox="0 0 32 32"><path fill="#007acc" d="M29.821 4.321L24.023 2l-12.53 12.212l-7.66-5.827l-1.654.837V22.8l1.644.827l7.65-5.827L24.023 30l5.8-2.321V4.321ZM4.65 19.192v-6.374l3.55 3.167zM16 15.985l7.082-5.3v10.639l-7.092-5.339z"/></svg>`;
const githubSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32.77" height="32" viewBox="0 0 256 250"><path fill="#161614" d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46c6.397 1.185 8.746-2.777 8.746-6.158c0-3.052-.12-13.135-.174-23.83c-35.61 7.742-43.124-15.103-43.124-15.103c-5.823-14.795-14.213-18.73-14.213-18.73c-11.613-7.944.876-7.78.876-7.78c12.853.902 19.621 13.19 19.621 13.19c11.417 19.568 29.945 13.911 37.249 10.64c1.149-8.272 4.466-13.92 8.127-17.116c-28.431-3.236-58.318-14.212-58.318-63.258c0-13.975 5-25.394 13.188-34.358c-1.329-3.224-5.71-16.242 1.24-33.874c0 0 10.749-3.44 35.21 13.121c10.21-2.836 21.16-4.258 32.038-4.307c10.878.049 21.837 1.47 32.066 4.307c24.431-16.56 35.165-13.12 35.165-13.12c6.967 17.63 2.584 30.65 1.255 33.873c8.207 8.964 13.173 20.383 13.173 34.358c0 49.163-29.944 59.988-58.447 63.157c4.591 3.972 8.682 11.762 8.682 23.704c0 17.126-.148 30.91-.148 35.126c0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002C256 57.307 198.691 0 128.001 0m-80.06 182.34c-.282.636-1.283.827-2.194.39c-.929-.417-1.45-1.284-1.15-1.922c.276-.655 1.279-.838 2.205-.399c.93.418 1.46 1.293 1.139 1.931m6.296 5.618c-.61.566-1.804.303-2.614-.591c-.837-.892-.994-2.086-.375-2.66c.63-.566 1.787-.301 2.626.591c.838.903 1 2.088.363 2.66m4.32 7.188c-.785.545-2.067.034-2.86-1.104c-.784-1.138-.784-2.503.017-3.05c.795-.547 2.058-.055 2.861 1.075c.782 1.157.782 2.522-.019 3.08m7.304 8.325c-.701.774-2.196.566-3.29-.49c-1.119-1.032-1.43-2.496-.726-3.27c.71-.776 2.213-.558 3.315.49c1.11 1.03 1.45 2.505.701 3.27m9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033c-1.448-.439-2.395-1.613-2.103-2.626c.301-1.01 1.747-1.484 3.207-1.028c1.446.436 2.396 1.602 2.095 2.622m10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95c-1.53.034-2.769-.82-2.786-1.86c0-1.065 1.202-1.932 2.733-1.958c1.522-.03 2.768.818 2.768 1.868m10.555-.405c.182 1.03-.875 2.088-2.387 2.37c-1.485.271-2.861-.365-3.05-1.386c-.184-1.056.893-2.114 2.376-2.387c1.514-.263 2.868.356 3.061 1.403"/></svg>`;

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
@import '@/assets/styles/archives.night.css';
.arc-water-header {
  font-size: 2rem;
  font-weight: 700;
  color: #5371f7;
  letter-spacing: 1px;
  text-align: center;
}
.arc-water-search {
  width: 30rem;
  margin-bottom: 1rem;
}
.arc-water-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 3rem;
  gap: 1rem;
}
.mac-window-controls {
  position: absolute;
  top: 1%;
  left: 1%;
  width: 100%;
  padding: 8px;
  z-index: 10000;

}
.flash-footer {
  position: relative;
  margin-top: 5rem;
  height: 500px;
  width: 100%;
  background: #ffffff ;
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(6, 607, 235, 0.1), 0 1.5px 4px 0 rgba(7, 43, 245, 0.04);
}
.archives-root {
  min-height: 1500px;
  width: 88%;
  margin: 0 auto;
  padding: 60px 0 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.archives-title {
  font-size: 2.4rem;
  font-weight: 700;
  color: #5371f7;
  margin-bottom: 32px;
  letter-spacing: 1px;
  text-align: center;
}

.subtitle {
  display: block;
  font-size: 1.1rem;
  color: #888;
  font-weight: 400;
  margin-top: 8px;
  letter-spacing: 0.5px;
}

.drawing-board-outer {
  width: 100%;
  display: flex;
  justify-content: center;
}

.drawing-board-apple {
  border-radius: 24px;
  width: 100%;
  padding: 32px 32px 24px 32px;
  margin: 0 auto;
  transition: box-shadow 0.2s, border-radius 0.2s;
  position: relative;
}

.drawing-board-apple.fullscreen {
  border-radius: 0 !important;
  box-shadow: none !important;
  max-width: 100vw;
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4000;
}

.drawing-board-header-apple {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding: 0 8px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(71, 204, 31, 0.95);
  box-shadow: 0 8px 32px 0 rgba(60, 60, 60, 0.10), 0 1.5px 4px 0 rgba(0, 0, 0, 0.04);
}

.drawing-board-header-apple h1 {
  font-size: 1.7rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

.drawing-board-header-apple h1 .el-icon {
  font-size: 1.5em;
  margin-right: 10px;
  display: flex;
  align-items: center;
}

.drawing-iframe {
  border: none;
  transition: box-shadow 0.2s, border-radius 0.2s;
  display: block;
  margin: 0 auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fullscreen-exit-btn {
  position: fixed;
  top: 54px;
  right: 32px;
  z-index: 4100;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(60, 60, 60, 0.13);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  font-size: 1.5rem;
  color: #222;
}

.fullscreen-exit-btn:hover {
  background: #f2f2f2;
  box-shadow: 0 4px 24px rgba(60, 60, 60, 0.18);
}

.arcwater-search-input {
  width: 100%;
  font-size: 1.1rem;
  border: none;
  outline: none;
  background: #fff;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 1px 4px rgba(60,60,60,0.06);
  margin-bottom: 1rem;
}
.arcwater-search-input:focus {
  box-shadow: 0 4px 16px rgba(60,60,60,0.13);
}

.arcwater-glass-btns {
  display: flex;
  gap: 1.2rem;
  margin: 1.2rem 0 0.5rem 0;
  justify-content: center;
}
.glass-btn {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(60,60,60,0.10);
  backdrop-filter: blur(10px) saturate(1.3);
  -webkit-backdrop-filter: blur(10px) saturate(1.3);
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s, transform 0.18s;
  position: relative;
  overflow: hidden;
}
.glass-btn:hover {
  box-shadow: 0 6px 24px rgba(60,60,60,0.18);
  transform: translateY(-4px) scale(1.08);
  filter: brightness(1.08);
}
.glass-btn-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  filter: drop-shadow(0 1px 4px rgba(60,60,60,0.10));
}
.glass-btn svg {
  display: block;
  margin: 0 auto;
}
</style>
