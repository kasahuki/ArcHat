<template>
  <el-drawer :model-value="visible" size="90%" :with-header="false" direction="ttb" class="markdown-drawer"
    :modal="false" @close="handleClose">
    <div class="editor-wrapper">
      <div class="editor-header">
        <div class="window-controls">
          <span class="control-btn close" @click="handleClose"></span>
          <span class="control-btn minimize"></span>
          <span class="control-btn maximize"></span>
        </div>
        <div class="header-content">
          <h5>Arcwater</h5>
          <h4>发表文章</h4>
        </div>
      </div>
      <div class="editor-container">
        <div class="toolbar-container">
          <div ref="editorContainer" class="vditor-container"></div>
          <div class="toolbar-buttons">
            <el-button class="toolbar-btn" @click="resetEditor">重置</el-button>
            <el-button type="primary" class="toolbar-btn" @click="saveContent">保存</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, shallowRef, watch, onBeforeUnmount, nextTick } from 'vue';
import { ElButton, ElDrawer, ElMessage } from 'element-plus';
import Vditor from 'vditor';
import 'vditor/dist/index.css';

const props = defineProps({
  visible: Boolean,
  content: String
});
const emits = defineEmits(['update:content', 'close']);

const editorContainer = ref(null);
const vditorInstance = shallowRef(null);
const isEditorLoading = ref(false);

watch(() => props.visible, async (val) => {
  if (val) {
    await nextTick();
    initEditor();
  } else {
    if (vditorInstance.value) {
      vditorInstance.value.destroy();
      vditorInstance.value = null;
    }
  }
});

const initEditor = async () => {
  if (isEditorLoading.value || !editorContainer.value) return;
  if (vditorInstance.value) {
    vditorInstance.value.destroy();
    vditorInstance.value = null;
  }
  try {
    isEditorLoading.value = true;
    vditorInstance.value = new Vditor(editorContainer.value, {
      mode: 'ir',
      theme: 'classic',
      height: '100%',
      toolbar: [
        'emoji', 'headings', 'bold', 'italic', 'strike', 'link',
        '|', 'list', 'ordered-list', 'check', 'outdent', 'indent',
        '|', 'quote', 'line', 'code', 'inline-code', 'table',
        '|', 'upload', 'preview', 'fullscreen'
      ],
      cache: { enable: false },
      value: props.content,
      input: (value) => {
        emits('update:content', value);
      },
      upload: {
        accept: 'image/*',
        multiple: true,
        handler: async (files) => {
          // 这里需要你根据实际项目引入上传API
          // const formData = new FormData();
          // files.forEach(file => formData.append('file', file));
          // const res = await fileUploadService(formData);
          // const imageUrl = res.data;
          // const imgHtml = `<img src="${imageUrl}" alt="${files[0].name}" style="width: 70%; height: auto;" />`;
          // vditorInstance.value.insertValue(imgHtml);
          // return '';
          ElMessage.warning('请在项目中实现图片上传逻辑');
          return '';
        }
      },
      after: () => {
        isEditorLoading.value = false;
      },
      typewriterMode: true,
      lang: 'zh_CN',
      counter: { enable: true },
      undoDelay: 200,
      tab: '\t',
      preview: {
        delay: 0,
        maxWidth: 1000,
        mode: 'both',
        markdown: {
          toc: true,
          mark: true,
          footnotes: true,
          autoSpace: true,
        },
        math: { engine: 'KaTeX' },
        theme: {
          current: 'light',
          path: 'https://cdn.jsdelivr.net/npm/vditor@3.9.4/dist/css/content-theme'
        },
        hljs: {
          enable: true,
          style: 'github',
          lineNumber: true,
          langs: [
            'xml', 'css', 'html', 'javascript', 'typescript', 'jsx', 'tsx', 'vue', 'vue-html', 'bash', 'json', 'yaml', 'markdown', 'python', 'java', 'go', 'rust', 'sql', 'php', 'ruby', 'shell', 'docker', 'nginx'
          ]
        }
      }
    });
  } catch (error) {
    ElMessage.error('编辑器加载失败，请重试');
    isEditorLoading.value = false;
  }
};

const resetEditor = () => {
  if (vditorInstance.value) {
    vditorInstance.value.setValue('');
    emits('update:content', '');
    ElMessage.success('内容已重置');
  }
};

const saveContent = () => {
  if (vditorInstance.value) {
    const content = vditorInstance.value.getValue();
    emits('update:content', content);
    emits('close');
    ElMessage.success('内容已保存');
  }
};

const handleClose = () => {
  emits('close');
};

onBeforeUnmount(() => {
  if (vditorInstance.value) {
    vditorInstance.value.destroy();
    vditorInstance.value = null;
  }
});
</script>

<style scoped>
/* 复制原有编辑器相关样式 */
.editor-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #2c3e50, #3498db);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 3rem;
}

.window-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-left: 0.5rem;
}

.control-btn {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.control-btn.close {
  background-color: #ff5f56;
  border: 0.0625rem solid #e0443e;
}

.control-btn.minimize {
  background-color: #ffbd2e;
  border: 0.0625rem solid #dea123;
}

.control-btn.maximize {
  background-color: #27c93f;
  border: 0.0625rem solid #1aab29;
}

.header-content {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.header-content h5 {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  font-weight: 400;
}

.header-content h4 {
  margin: 0;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.editor-container {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  margin: 0.5rem;
  border-radius: 0.8rem;
  overflow: hidden;
}

.toolbar-container {
  height: 100%;
  position: relative;
}

:deep(.vditor-toolbar) {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(5px);
  border-radius: 0.6rem 0.6rem 0 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.5rem 1rem !important;
}

.toolbar-buttons {
  position: absolute;
  right: 1rem;
  top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  z-index: 10;
}

.toolbar-btn {
  height: 2rem;
  padding: 0 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.toolbar-btn:first-child {
  background-color: rgba(255, 95, 86, 0.9);
  color: white;
}

.toolbar-btn:first-child:hover {
  background-color: rgba(255, 95, 86, 1);
}

.toolbar-btn:last-child {
  background-color: rgba(39, 201, 63, 0.9);
  color: white;
}

.toolbar-btn:last-child:hover {
  background-color: rgba(39, 201, 63, 1);
}

:deep(.vditor-content) {
  background: white;
  border-radius: 0 0 0.6rem 0.6rem;
}

:deep(.vditor-ir)::-webkit-scrollbar,
:deep(.vditor-preview)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

:deep(.vditor-ir)::-webkit-scrollbar-thumb,
:deep(.vditor-preview)::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

:deep(.vditor-ir)::-webkit-scrollbar-thumb:hover,
:deep(.vditor-preview)::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid transparent;
  background-clip: padding-box;
}

:deep(.vditor-ir)::-webkit-scrollbar-track,
:deep(.vditor-preview)::-webkit-scrollbar-track {
  background: transparent;
}
</style>