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

    <div class="elegant-divider"></div>

        <!-- 闪念md卡片编辑器 -->
    <div class="drawing-board-outer">
      <div class="drawing-board-apple">
        <div class="drawing-board-header-apple">
          <h1><el-icon style="margin-right:8px;"><Edit /></el-icon>Flash Editor</h1>
          <div>
            <DangerButton :type="showEditor ? 'danger' : 'success'" @click="showEditor = !showEditor">
              {{ showEditor ? '隐藏' : '展开' }}
            </DangerButton>
          </div>
        </div>
        <transition name="fade">
          <div v-if="showEditor" class="flash-editor-wrapper">
            <FlashEditor ref="flashEditorRef" @save-draft="handleSaveNote" @request-fullscreen="openFullscreenEditor" />
          </div>
        </transition>
        <transition name="fade">
                            <div v-if="showEditor" ref="notesGridRef" class="notes-grid">

                        <div v-for="note in notes" :key="note.id" class="note-card" :ref="el => setNoteCardRef(el, note.id)" @click.stop="editNote(note)" @contextmenu.prevent.stop="showContextMenu($event, note)">
              <div class="note-content" v-html="note.content"></div>
              <div class="note-actions">
                <button @click.stop="editNote(note)" class="edit-note-btn" title="编辑">
                  <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button>
                <button @click.stop="deleteNote(note.id)" class="delete-note-btn" title="删除">×</button>
              </div>
            </div>
          </div>
        </transition>

        <RightKeyPop
          v-if="contextMenu.visible"
          ref="rightKeyPopRef"
          :calculating-position="contextMenu.isCalculating"
          :left="contextMenu.x"
          :top="contextMenu.y"
          :items="contextMenuItems"
          style="z-index: 10000;"
          @close="hideContextMenu"
        />
    
    <!-- 编辑弹窗 -->
    <NoteEditModal 
      :visible="showEditModal" 
      :note="editingNote" 
      @close="closeEditModal" 
      @save="handleEditSave" 
    />

 
      </div>
      
    </div>
       <!-- 删除确认弹窗 -->
       <div class="warning-overlay" v-if="showWarningTip">
    <WorningTips
     

      :title="'删除确认'"
      :message="'您确定要删除这条笔记吗？此操作不可撤销。'"
      :confirm-text="'删除'"
      :cancel-text="'取消'"
      :confirm-button-color="'red'"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
    </div>

    <!-- Fullscreen Editor Modal -->
    <transition name="fade">
      <div v-if="showFullscreenEditor" class="fullscreen-editor-overlay" @click.self="closeFullscreenEditor">
      <div class="fullscreen-editor-container">
        <div class="fullscreen-editor-header">
          <div class="traffic-lights">
            <button class="traffic-light red" @click="closeFullscreenEditor"></button>
            <button class="traffic-light yellow"></button>
            <button class="traffic-light green"></button>
          </div>
          <div class="fullscreen-editor-title">Arc Editor</div>
        </div>
        <FlashEditor ref="fullscreenEditorRef" @save-draft="handleFullscreenSave" />
      </div>
    </div>
  </transition>

    <div class="elegant-divider"></div>

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

    <div class="elegant-divider"></div>

    <div  class="trace-post">
  
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
import { ref, computed, onMounted, onUnmounted, onUpdated, onBeforeUpdate, nextTick } from 'vue';
import { dragAndDrop } from '@formkit/drag-and-drop/vue';
import DangerButton from '@/components/dangerButton.vue';
import ResourceDrawer from '@/components/ResourceDrawer.vue';
import RightKeyPop from '@/components/RightKeyPop.vue';
import TodoList from '@/components/TodoList.vue';
import { useTodoStore } from '@/stores/todo.js';
import { EditPen, Edit, List, Files, Search } from '@element-plus/icons-vue';
import { Copy, Pencil, Trash2, MoreVertical, Share2, FileText, Send } from 'lucide-vue-next';
import FlashEditor from '@/components/FlashEditor.vue';
import NoteEditModal from '@/components/NoteEditModal.vue';
import WorningTips from '@/components/WorningTips.vue';
import MacWindowControls from '@/components/MacWindowControls.vue';
import Terminal from '@/components/Terminal.vue';
import { watch } from 'vue';
import ArcMessage from '@/utils/ArcMessage';
const showDrawingBoard = ref(false);
const isFullscreen = ref(false);
const showResourceDrawer = ref(false);
const showTodoList = ref(true);
const showEditor = ref(true);
const notes = ref([]);
const editingNote = ref(null);
const showEditModal = ref(false);
const showWarningTip = ref(false);
const noteToDeleteId = ref(null);
const flashEditorRef = ref(null);
const flashEditorWrapperRef = ref(null);
const showFullscreenEditor = ref(false);
const fullscreenEditorRef = ref(null);
const rightKeyPopRef = ref(null);
const notesGridRef = ref(null);

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  note: null,
  items: [],
  isCalculating: false
});

const contextMenuItems = computed(() => {
  const note = contextMenu.value.note;
  if (!note) return [];

  return [
    {
      key: 'copy',
      label: '复制内容',
      icon: Copy,
      onClick: () => {
        const textToCopy = new DOMParser().parseFromString(note.content, 'text/html').body.textContent || '';
        navigator.clipboard.writeText(textToCopy).then(() => {
          ArcMessage.success('内容复制成功！');
        }).catch(err => {
          ArcMessage.error('复制失败，请手动复制。');
          console.error('Copy failed:', err);
        });
      },
    },
    {
      key: 'edit',
      label: '编辑笔记',
      icon: Pencil,
      onClick: () => {
        editingNote.value = note;
        showEditModal.value = true;
      },
    },
    {
      key: 'delete',
      label: '删除卡片',
      icon: Trash2,
      danger: true,
      onClick: () => {
        if (note) {
          deleteNote(note.id);
        }
      },
      separatorAfter: true,
    },
    {
      key: 'more-actions',
      label: '更多操作',
      icon: MoreVertical,
      children: [
        {
          key: 'share',
          label: '分享笔记',
          icon: Share2,
          onClick: () => {
            ArcMessage.info('分享功能待实现');
          }
        },
        {
          key: 'export',
          label: '导出为PDF',
          icon: FileText,
          onClick: () => {
            ArcMessage.info('导出为PDF功能待实现');
          }
        },
        {
          key: 'submit',
          label: '提交笔记',
          icon: Send,
          onClick: () => {
            ArcMessage.info('提交笔记功能待实现');
          }
        }
      ]
    },
  ];
});

const showContextMenu = (event, note) => {
  event.preventDefault();

  contextMenu.value.isCalculating = true;
  contextMenu.value.note = note;
  contextMenu.value.visible = true;
  // Render invisibly at the click position to calculate size
  contextMenu.value.x = event.clientX;
  contextMenu.value.y = event.clientY;

  nextTick(() => {
    const menuEl = rightKeyPopRef.value?.$el;
    if (!menuEl) return;

    const rect = menuEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let finalX = event.clientX;
    let finalY = event.clientY;

    // Horizontal positioning
    if (event.clientX > viewportWidth / 2) {
      finalX = event.clientX - rect.width;
    }

    // Vertical positioning
    if (event.clientY > viewportHeight / 2) {
      finalY = event.clientY - rect.height;
    }

    // Edge clamping
    if (finalX < 0) finalX = 5;
    if (finalX + rect.width > viewportWidth) finalX = viewportWidth - rect.width - 5;
    if (finalY < 0) finalY = 5;
    if (finalY + rect.height > viewportHeight) finalY = viewportHeight - rect.height - 5;

    // Set the final position and make it visible
    contextMenu.value.x = finalX;
    contextMenu.value.y = finalY;
    contextMenu.value.isCalculating = false;

    window.addEventListener('click', hideContextMenu, { once: true });
    window.addEventListener('contextmenu', hideContextMenu, { once: true });
  });
};

const hideContextMenu = () => {
  if (contextMenu.value.visible) {
    contextMenu.value.visible = false;
    contextMenu.value.note = null;
    window.removeEventListener('click', hideContextMenu);
    window.removeEventListener('contextmenu', hideContextMenu);
  }
};


const handleKeydown = (e) => {
  if (e.key === 'Escape' && showFullscreenEditor.value) {
    closeFullscreenEditor();
  }
};


const getNoteSizeFromContent = (content) => {
  const text = new DOMParser().parseFromString(content, 'text/html').body.textContent || '';
  const length = text.length;
  if (length < 50) return 'small';
  if (length < 150) return 'medium';
  return 'large';
};



onMounted(() => {
  window.addEventListener('keydown', handleKeydown);

  const savedNotes = localStorage.getItem('flash-notes');
  if (savedNotes) {
    const parsedNotes = JSON.parse(savedNotes);
    notes.value = parsedNotes.map(note => ({
      ...note,
      size: note.size || getNoteSizeFromContent(note.content)
    }));
  }

  if (notesGridRef.value) {
    dragAndDrop({
      parent: notesGridRef.value,
      values: notes,
      handleEnd: () => {
        localStorage.setItem('flash-notes', JSON.stringify(notes.value));
      },
    });
  }
});

// 控制编辑器仅在聚焦时滚动
const handleEditorWheel = (event) => {
  const wrapper = flashEditorWrapperRef.value;
  if (wrapper && !wrapper.contains(document.activeElement)) {
    event.preventDefault();
  }
};

watch(showEditor, (isShown) => {
  nextTick(() => {
    const wrapper = flashEditorWrapperRef.value;
    if (wrapper) {
      if (isShown) {
        wrapper.addEventListener('wheel', handleEditorWheel, { passive: false });
      } else {
        wrapper.removeEventListener('wheel', handleEditorWheel);
      }
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  // 组件卸载时，确保清理事件监听器
  window.removeEventListener('click', hideContextMenu);
  window.removeEventListener('contextmenu', hideContextMenu);
});

const todoStore = useTodoStore();
const cmd = ref('https://www.arcwater.com/');

// --- 笔记卡片溢出检测逻辑 ---
const noteCardRefs = ref({});
const setNoteCardRef = (el, id) => {
  if (el) {
    noteCardRefs.value[id] = el;
  }
};

onBeforeUpdate(() => {
  noteCardRefs.value = {};
});

onMounted(() => {
  checkAllCardsOverflow();
});

onUpdated(() => {
  checkAllCardsOverflow();
});

const checkAllCardsOverflow = () => {
  nextTick(() => {
    for (const id in noteCardRefs.value) {
      const cardEl = noteCardRefs.value[id];
      if (cardEl) {
        const contentEl = cardEl.querySelector('.note-content');
        if (contentEl) {
          // CSS handles max-height, JS just checks if it overflowed to add the gradient class.
          const isOverflowing = contentEl.scrollHeight > contentEl.clientHeight;
          if (isOverflowing) {
            cardEl.classList.add('is-overflowing');
          } else {
            cardEl.classList.remove('is-overflowing');
          }
        }
      }
    }
  });
};



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

const handleSaveNote = (content) => {
  const newNote = { 
    id: Date.now(), 
    content,
  };
  notes.value.unshift(newNote);
  localStorage.setItem('flash-notes', JSON.stringify(notes.value));
  ArcMessage.info("保存修改成功","请尽快提交结果")
  flashEditorRef.value.clearContent();
};

const deleteNote = (noteId) => {
  noteToDeleteId.value = noteId;
  showWarningTip.value = true;
};

const confirmDelete = () => {
  if (noteToDeleteId.value) {
    notes.value = notes.value.filter(note => note.id !== noteToDeleteId.value);
    localStorage.setItem('flash-notes', JSON.stringify(notes.value));
  }
  cancelDelete();
};

const cancelDelete = () => {
  showWarningTip.value = false;
  noteToDeleteId.value = null;
};

const editNote = (note) => {
  editingNote.value = note;
  showEditModal.value = true;
};

const handleEditSave = (updatedNote) => {
  const index = notes.value.findIndex(note => note.id === updatedNote.id);
  if (index !== -1) {
    notes.value[index].content = updatedNote.content;
  }
  localStorage.setItem('flash-notes', JSON.stringify(notes.value));
  if(updatedNote.isSubmit === 0)
  ArcMessage.info("保存修改成功","请尽快提交结果")
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingNote.value = null;
};

const openFullscreenEditor = async () => {
  if (!flashEditorRef.value) return;
  const content = await flashEditorRef.value.getContent();
  showFullscreenEditor.value = true;
  await nextTick();
  if (fullscreenEditorRef.value) {
    fullscreenEditorRef.value.setContent(content);
  }
};

const closeFullscreenEditor = () => {
  showFullscreenEditor.value = false;
};

const handleFullscreenSave = async (content) => {
  if (flashEditorRef.value) {
    flashEditorRef.value.setContent(content);
  }
  await handleSaveNote(content);
  closeFullscreenEditor();
};

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
/* Fullscreen Editor Transition */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-scale-enter-to,
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}
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
.trace-post {
  margin: 12rem;
  background-color: #000511;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 5rem;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(60,60,60,0.06);
  margin-bottom: 1rem;
  width: 100%;

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
  margin-top: 12rem;
  height: 500px;
  width: 100%;
  background: #ffffff ;
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(6, 607, 235, 0.1), 0 1.5px 4px 0 rgba(7, 43, 245, 0.04);
}
.elegant-divider {
  width: 80%;
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
  margin: 4rem auto;
  border: 0;
}

.dark-mode .elegant-divider {
  background: linear-gradient(to right, transparent, #374151, transparent);
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

/* Flash Editor 高度限制 */
.flash-editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 500px; /* 限制编辑器最大高度 */
  overflow: hidden; /* 移除外层滚动，让内部处理 */
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.flash-editor-wrapper :deep(.flash-editor-container) {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  /* 让编辑器容器填满剩余空间 */
  min-height: 0;
}

.flash-editor-wrapper :deep(.editor-content) {
  flex-grow: 1;
  overflow-y: auto;
  /* 仅内容区滚动 */
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem; /* 增加卡片间距 */
  align-items: start; /* Align items to the start of the grid area */
}



.note-card {
  margin-top: 2rem;
  background: rgba(251, 255, 250, 0.95); /* 高透明毛玻璃 */
    -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-radius: 16px; /* More rounded corners */
  padding: 1.5rem; /* More padding */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), 
              box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), 
              border-color 0.3s ease;
  display: flex;
  flex-direction: column;

  
}

.note-card:hover {
  transform: translateY(-5px) scale(1.01); /* More pronounced lift and slight scale */
  border-color: #a5b4fc; /* Indigo accent on hover */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.note-content {
  margin-bottom: 2rem;
  max-height: 450px; /* Directly apply max-height */
  overflow: hidden;   /* Hide the overflowing content */
  position: relative;
}
.note-content :deep(a) {
  color: #10b981 !important;
}
/* 当内容溢出时，在内容区底部添加一个渐变蒙层提示用户 */
.note-card.is-overflowing .note-content::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: linear-gradient(to top, #ffffff, rgba(255, 255, 255, 0));
  pointer-events: none; /* 确保伪元素不影响点击 */
}

.dark-mode .note-card.is-overflowing .note-content::after {
    background: linear-gradient(to top, #1f2937, rgba(31, 41, 55, 0));
}





.note-content :deep(p) {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
}

.note-content :deep(h1) {
  font-size: 1.25em;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #111827;
}

.note-content :deep(h2) {
  font-size: 1.1em;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #111827;
}

.note-content :deep(pre) {
  background: #2d2d2d; /* 深木炭色 */
  color: #f8f8f2; /* 柔和白色 */
  border-radius: 6px;
  padding: 12px;
  margin: 12px 0;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
}



.note-content :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}
.dark-mode .note-content :deep(pre code) {
  background: transparent;

}


.note-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.note-card:hover .note-actions {
  opacity: 1;
}

/* Dark Mode Styles */
.dark-mode .note-card {
  background-color: rgba(27, 24, 37, 0.95); /* Dark slate gray with 95% opacity */
  border: none; /* Darker border */
  
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
}

.dark-mode .note-card:hover {
  border-color: #6366f1; /* Brighter Indigo for dark mode hover */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

.dark-mode .note-content :deep(p) {
  color: #d1d5db; /* 亮灰色文本 */
}

.dark-mode .note-content :deep(h1),
.dark-mode .note-content :deep(h2),
.dark-mode .note-content :deep(h3) {
  color: #f3f4f6;
}

/* --- Dark Mode High Contrast Code Block --- */
.dark-mode .note-content :deep(pre) {
  background: #f8f8f2; /* 柔和白色背景 */
  color: #2d2d2d;    /* 深木炭色文字 */
}


.dark-mode .note-actions button {
  background-color: #374151;
  color: #d1d5db;
}

.dark-mode .note-actions button:hover {
  background-color: #4b5563;
  color: #ffffff;
}

.edit-note-btn,
.delete-note-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;

}

.edit-note-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.edit-note-btn:hover {
  background: rgba(59, 130, 246, 0.2);
}

.delete-note-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-weight: 600;
}


.delete-note-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}
.dark-mode .delete-note-btn {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
  font-weight: 600 !important;
}
.dark-mode .delete-note-btn:hover {
  background: rgba(239, 68, 68, 0.2) !important;
}
.dark-mode .edit-note-btn {
  background: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6 !important;
}
.dark-mode .edit-note-btn:hover {
  background: rgba(59, 130, 246, 0.2) !important;
}

/* Fullscreen Editor Styles */
.fullscreen-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50000;
}

.fullscreen-editor-container {
  position: relative;
  width: 90vw;
  height: 90vh;
  background-color: var(--bg-color, #fff);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fullscreen-editor-header {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: var(--header-bg-color, #f0f0f0);
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.dark-mode .fullscreen-editor-header {
  background-color: #2d3748;
  border-bottom: 1px solid #4a5568;
}

.traffic-lights {
  display: flex;
  gap: 8px;
}

.traffic-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

.traffic-light.red { background-color: #ff5f56; }
.traffic-light.yellow { background-color: #ffbd2e; }
.traffic-light.green { background-color: #27c93f; }

.fullscreen-editor-title {
  color: var(--text-color, #333);
  font-weight: 600;
  margin: 0 auto;
  transform: translateX(-18px); /* Adjust for traffic lights width */
}

.dark-mode .fullscreen-editor-title {
  color: #e2e8f0;
}

.fullscreen-editor-container :deep(.flash-editor-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.fullscreen-editor-container :deep(.editor-content) {
  flex-grow: 1;
  overflow-y: auto;
}
</style>
