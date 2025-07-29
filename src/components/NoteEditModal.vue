<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" :class="{ 'fullscreen': isFullScreen }" @click.stop>
      <div class="modal-header">
        <div class="window-controls">
          <div class="control-dot close" @click="handleClose"></div>
          <div class="control-dot minimize" @click="toggleFullScreen"></div>
          <div class="control-dot expand"></div>
        </div>
        <div class="modal-title">Edit Now</div>
      </div>

      <div class="modal-content">
        <div class="edit-section">
          <FlashEditor ref="editorRef" @input="handleEditorInput" @save-draft="handleSaveDraft" />
        </div>
      </div>
      <div class="modal-footer">
        <danger-button @click="handleClose" type="orange">取消</danger-button>
        <danger-button type="primary" :disabled="!canSave || isSubmitting" @click="handleSave">{{ isSubmitting ? '提交中...' : '提交' }}</danger-button>
      </div>
     
    </div>
    
  </div>
  
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue';
import FlashEditor from './FlashEditor.vue';
import arcmessage from '../utils/ArcMessage.js';
import { marked } from 'marked';
import hljs from 'highlight.js';
import ArcMessage from '../utils/ArcMessage.js';
import DangerButton from '@/components/dangerButton.vue';

const props = defineProps({
  visible: Boolean,
  note: Object
});

const emit = defineEmits(['close', 'save']);

const editorRef = ref(null);
const isFullScreen = ref(false);
const editorContent = ref('');
const isSubmitting = ref(false);

// 计算是否可以保存
const canSave = computed(() => {
  const plainText = new DOMParser().parseFromString(editorContent.value || '', 'text/html').body.textContent || "";
  return plainText.trim().length > 0;
});

// 配置marked以使用highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
});

const renderedContent = computed(() => {
  if (isPreviewMode.value && editorRef.value) {
    const content = editorRef.value.getContent();
    return marked(content);
  }
  return '';
});

const handleClose = () => {
  emit('close');
};

const handleOverlayClick = () => {
  // 在全屏模式下，点击遮罩层不关闭
  if (!isFullScreen.value) {
    handleClose();
  }
};

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value;
};

const handleEditorInput = (content) => {
  editorContent.value = content;
};



// 模拟调用后端API的函数
const submitNoteToBackend = (note) => {
  ArcMessage.info("提交成功",note)
  console.log(note)
  
};

const handleSaveDraft = () => {
  if (!editorRef.value) return;
  const content = editorRef.value.getContent();
  emit('save', { ...props.note, content,isSubmit:0 });
};

const handleSave = async () => {
  if (!editorRef.value || isSubmitting.value) return;

  const content = editorRef.value.getContent();
  const plainText = new DOMParser().parseFromString(content, 'text/html').body.textContent || "";

  if (!plainText.trim()) {
    arcmessage.warning('笔记内容不能为空！');
    return;
  }

  isSubmitting.value = true;

  try {
    // 调用模拟的后端接口
    const response = await submitNoteToBackend({ ...props.note, content });
  

    // 提交成功后，仍然触发 save 事件以更新父组件UI，确保本地数据同步
    emit('save', { ...props.note, content,isSubmit:1 });
    handleClose();

  } catch (error) {
    arcmessage.error(error.message || '提交失败，请检查网络连接。');
  } finally {
    isSubmitting.value = false;
  }
};

watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 重置状态
    isFullScreen.value = false;

    // 使用 nextTick 确保 editorRef 可用
    nextTick(() => {
      if (props.note && editorRef.value) {
        editorRef.value.setContent(props.note.content);
      }
    });
  }
});

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50000; /* Ensure it's on top */
  animation: fadeIn 0.2s ease-out;
}
.modal-container {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 50vw; /* Default width */
  height: 80vh; /* Default height */
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s forwards;
}

.modal-container.fullscreen {
  width: 95vw; /* Fullscreen width */
  height: 95vh; /* Fullscreen height */
}
.modal-content {
  flex: 1; /* 占据所有剩余空间 */
  overflow-y: auto; /* 只在垂直方向滚动 */
  display: flex;
  flex-direction: column;
  min-height: 0; /* flexbox hack, to make it scrollable */
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  flex-shrink: 0; /* 防止页眉收缩 */
  position: relative; /* 移除 sticky，因为父级已经是 flex 布局 */
  z-index: 10;
}

.window-controls {
  display: flex;
  gap: 8px;
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.control-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
}

.control-dot.close { background-color: #ff5f56; }
.control-dot.minimize { background-color: #ffbd2e; }
.control-dot.expand { background-color: #27c93f; cursor: not-allowed; }

.modal-title {
  font-size: 22px;
  font-weight: 600;
  color: #5586f0;
  text-align: center;
  flex-grow: 1;
}

.btn-toggle-preview {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #e5e7eb;
  border: 1px solid #d1d5db;
  color: #374151;
}
.btn-toggle-preview:hover { background: #d1d5db; }



.edit-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 确保子元素可以正确滚动 */
  min-height: 0; /* flexbox hack，防止内容溢出 */
}

.edit-section :deep(.flash-editor-container) {
  border-radius: 0;
  box-shadow: none;

}

:deep(.editor-toolbar) {
  background-color: #f3f4f6;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}



.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 24px;
  flex-shrink: 0; /* 防止页脚收缩 */
  border-top: 1px solid #e5e7eb;
  z-index: 10;
}



@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideIn { from { opacity: 0; transform: translateY(-20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }



/* Dark Mode Styles */
.dark-mode .modal-container {
  background: #1f2937; /* 深灰蓝背景 */
  border: 1px solid #374151;
}

.dark-mode .modal-header {
  border-bottom-color: #374151; /* 暗色模式下的分隔线 */
}

.dark-mode .modal-footer {
  border-top-color: #374151; /* 暗色模式下的分隔线 */
}

.dark-mode  .dark-mode .modal-footer {
  background: #111827; /* 更深的背景 */
  border-color: #374151;
}
.dark-mode  modal
.dark-mode .modal-title {
  color: #f3f4f6; /* 亮灰色文字 */
}

.dark-mode .btn-toggle-preview {
  background: #374151;
  border-color: #4b5563;
  color: #d1d5db;
}
.dark-mode .btn-toggle-preview:hover { background: #4b5563; }



/* Preview Dark Mode */
.dark-mode .preview-content :deep(h1), .dark-mode .preview-content :deep(h2) {
    color: #f3f4f6;
}
.dark-mode .preview-content :deep(p) {
    color: #d1d5db;
}




</style>
