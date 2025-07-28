
<template>
  <div class="flash-editor-container">
    <div v-if="editor" class="editor-toolbar">
      <div class="toolbar-left">
        <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }" title="Bold">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79c0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79c0-1.52-.86-2.82-2.15-3.42M10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5"/></svg>
        </button>
        <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }" title="Italic">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>
        </button>
        <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }" title="Strikethrough">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67c0-.61.13-1.16.4-1.67c.26-.5.63-.93 1.11-1.29a5.73 5.73 0 0 1 1.7-.83c.66-.19 1.39-.29 2.18-.29c.81 0 1.54.11 2.21.34c.66.22 1.23.54 1.69.94c.47.4.83.88 1.08 1.43c.25.55.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85c-.09-.27-.24-.49-.44-.68c-.2-.19-.45-.33-.75-.44c-.3-.1-.66-.16-1.06-.16c-.39 0-.74.04-1.03.13c-.29.09-.53.21-.72.36c-.19.16-.34.34-.44.55c-.1.21-.15.43-.15.66c0 .48.25.88.74 1.21c.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25M21 12v-2H3v2h9.62c.18.07.4.14.55.2c.37.17.66.34.87.51s.35.36.43.57c.07.2.11.43.11.69c0 .23-.05.45-.14.66c-.09.2-.23.38-.42.53c-.19.15-.42.26-.71.35c-.29.08-.63.13-1.01.13c-.43 0-.83-.04-1.18-.13c-.35-.09-.65-.22-.89-.39c-.25-.17-.44-.37-.59-.62c-.15-.24-.22-.5-.22-.78h-3.01c0 .72.13 1.39.4 1.96c.26.58.66 1.07 1.17 1.48c.51.41 1.15.73 1.9.95c.75.23 1.59.34 2.5.34c.85 0 1.64-.13 2.34-.38c.69-.25 1.29-.61 1.77-1.06c.49-.45.86-.98 1.13-1.58c.26-.6.4-1.25.4-1.95c0-.39-.04-.75-.12-1.06c-.08-.31-.21-.6-.38-.85c-.17-.25-.37-.48-.61-.67c-.24-.19-.52-.35-.82-.49L21 12z"/></svg>
        </button>
        <div class="toolbar-divider"></div>
        <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }" title="Heading 1">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M5 4v3h5.5v12h3V7H19V4z"/></svg>
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }" title="Heading 2">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M3 4v3h5v12h3V7h5V4H3m9 14h8v-2h-5v-1l5-6V7h-8v2h5v1l-5 6v2Z"/></svg>
        </button>
        <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }" title="Bullet List">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M7 5h14v2H7zm0 8v-2h14v2zm0 6v-2h14v2zM3 5a1 1 0 1 1 2 0a1 1 0 0 1-2 0zm0 6a1 1 0 1 1 2 0a1 1 0 0 1-2 0zm0 6a1 1 0 1 1 2 0a1 1 0 0 1-2 0z"/></svg>
        </button>
        <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }" title="Ordered List">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M7 13v-2h14v2H7m0 6v-2h14v2H7M7 7V5h14v2H7M3 5v1.5h1V6h.5v.5H3V8h2V4H3v1m-1 8v4h3v-1H2v-.5h1V15H2v-.5h1V14H2v-.5h1V13H1m2.25 5.25A.75.75 0 0 0 2.5 17H1v1.5h1.5a.75.75 0 0 0 0 1.5H1V21h1.5a.75.75 0 0 0 .75-.75a.75.75 0 0 0-.75-.75a.75.75 0 0 0 .75-.75Z"/></svg>
        </button>
        <button @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ 'is-active': editor.isActive('codeBlock') }" title="Code Block">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M8 3a2 2 0 0 0-2 2v4.586l-1.293-1.293a1 1 0 0 0-1.414 1.414L6.586 13L3.293 16.293a1 1 0 1 0 1.414 1.414L6 16.414V21a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8zm2 4a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1z"/></svg>
        </button>
      </div>
      <div class="toolbar-right">
        <button @click="saveContent" :disabled="!canSave" class="save-btn" title="Save">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4M12 19c-1.66 0-3-1.34-3-3s1.34-3 3-3s3 1.34 3 3s-1.34 3-3 3m3-10H5V5h10v4Z"/></svg>
          Save
        </button>
      </div>
    </div>
    <editor-content :editor="editor" class="editor-content"/>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useEditor, EditorContent, VueNodeViewRenderer } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import CodeBlockWithButtons from './CodeBlockWithButtons.vue';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import go from 'highlight.js/lib/languages/go';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import yaml from 'highlight.js/lib/languages/yaml';

// 创建 lowlight 实例
const lowlight = createLowlight();

// 注册语言
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('css', css);
lowlight.register('html', html);
lowlight.register('json', json);
lowlight.register('bash', bash);
lowlight.register('c', c);
lowlight.register('cpp', cpp);
lowlight.register('go', go);
lowlight.register('ruby', ruby);
lowlight.register('rust', rust);
lowlight.register('swift', swift);
lowlight.register('typescript', typescript);
lowlight.register('yaml', yaml);

const props = defineProps({
  initialContent: {
    type: String,
    default: '',
  }
});

const emit = defineEmits(['update:modelValue', 'save-draft']);

// 计算是否可以保存
const canSave = computed(() => {
  if (!editor.value) return false;
  const content = editor.value.getHTML();
  const plainText = new DOMParser().parseFromString(content, 'text/html').body.textContent || "";
  return plainText.trim().length > 0;
});

const editor = useEditor({
  editorProps: {
    attributes: {
      spellcheck: 'false',
    },
  },
  content: props.initialContent,
  extensions: [
    StarterKit.configure({
      codeBlock: false, // 禁用默认的代码块，使用带高亮的版本
    }),
    CodeBlockLowlight.extend({
      addNodeView() {
        return VueNodeViewRenderer(CodeBlockWithButtons)
      },
    }).configure({
      lowlight,
    }),
  ],
  onUpdate: ({ editor }) => {
    // 当内容变化时发出事件
    emit('update:modelValue', editor.getHTML());
  },
});

const saveContent = () => {
  if (editor.value) {
    const htmlContent = editor.value.getHTML();
    emit('save-draft', htmlContent);
  }
};

// 暴露方法给父组件
const setContent = (content) => {
  if (editor.value) {
    editor.value.commands.setContent(content);
  }
};

const getContent = () => {
  if (editor.value) {
    return editor.value.getHTML();
  }
  return '';
};

defineExpose({
  setContent,
  getContent
});
</script>

/**
 * This scoped style block provides styling for the Flash Editor component.
 * It includes styles for both light and dark modes, with specific emphasis
 * on high contrast code blocks and syntax highlighting. The styles define
 * the layout and appearance of the editor container, toolbar, buttons,
 * and editor content, ensuring both functionality and aesthetic appeal
 * across different themes.
 */
<style scoped>
.flash-editor-container {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%; /* 确保容器占满父元素高度 */
  overflow: hidden; /* 防止自身滚动 */
}

.flash-editor-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  position: sticky; /* 固定工具栏 */
  top: 0;
  z-index: 10;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #d1d5db;
  margin: 0 8px;
}

.editor-toolbar button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.editor-toolbar button:hover {
  background: #e5e7eb;
  color: #111827;
}

.editor-toolbar button.is-active {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

.save-btn {
  background: #10b981 !important;
  color: #ffffff !important;
  border-color: #10b981 !important;
}

.save-btn:hover {
  background: #059669 !important;
  border-color: #059669 !important;
}

.save-btn:disabled {
  background: #94a3b8 !important;
  border-color: #94a3b8 !important;
  color: #ffffff !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.save-btn:disabled:hover {
  background: #94a3b8 !important;
  border-color: #94a3b8 !important;
}

.editor-content {
  padding: 70px; /* 调整内边距 */
  flex: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 内部滚动 */
}


.editor-content :deep(.ProseMirror) {
  min-height: 200px;
  outline: none;
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
}

.editor-content :deep(.ProseMirror p) {
  margin: 0 0 16px 0;
}

.editor-content :deep(.ProseMirror h1) {
  font-size: 2em;
  font-weight: 700;
  margin: 24px 0 16px 0;
  color: #111827;
}

.editor-content :deep(.ProseMirror h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin: 20px 0 12px 0;
  color: #111827;
}

.editor-content :deep(.ProseMirror ul),
.editor-content :deep(.ProseMirror ol) {
  padding-left: 24px;
  margin: 16px 0;
}

.editor-content :deep(.ProseMirror li) {
  margin: 4px 0;
}

/* --- Light Mode High Contrast Code Block --- */
.editor-content :deep(pre) {
  background: #091c41;; 
  color: #adbef3; /* Default Soft White */
  border-radius: 14px;
  padding: 12px;
  margin: 20px auto ;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  max-width: 70%;
  max-height: 60vh;
  overflow: auto;  
}
span {
  color: #005cc5 !important;
}
.editor-content :deep(.ProseMirror code) {
  background: #f3f4f6;
  color: #dc2626;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

.editor-content :deep(.ProseMirror pre code) {
  background: transparent;
  color: inherit;
  padding: 0;

}
.edit-section {
  overflow: hidden;
}
/* --- Final & Complete Syntax Highlighting --- */

/* Light Mode (on dark background) - "Vibrant Ink" */
.editor-content :deep(.hljs-comment) { color: #75715e; font-style: italic; } /* Grey */
.editor-content :deep(.hljs-attribute) { color: #fd971f; } /* Orange */
.editor-content :deep(.hljs-attr) { color: #fd971f; } /* Orange */
.editor-content :deep(.hljs-operator) { color: #f92672; } /* Pink */
.editor-content :deep(.hljs-keyword) { color: #f92672; } /* Pink */
.editor-content :deep(.hljs-string) { color: #e6db74; } /* Lemony-Chiffon */
.editor-content :deep(.hljs-variable), .editor-content :deep(.hljs-template-variable), .editor-content :deep(.hljs-subst) { color: #f8f8f2; } /* Soft White */
.editor-content :deep(.hljs-number), .editor-content :deep(.hljs-literal) { color: #ae81ff; } /* Purple */
.editor-content :deep(.hljs-type) { color: #66d9ef; font-style: italic; } /* Italic Cyan */
.editor-content :deep(.hljs-params) { color: #fd971f; } /* Orange */
.editor-content :deep(.hljs-built_in) { color: #a6e22e; } /* Bright Green */
.editor-content :deep(.hljs-title), .editor-content :deep(.hljs-function) { color: #a6e22e; } /* Bright Green */
.editor-content :deep(.hljs-property) { color: #66d9ef; } /* Cyan */
.editor-content :deep(.hljs-meta) { color: #f92672; } /* Pink */
.editor-content :deep(.hljs-selector-class) { color: #a6e22e; } /* Bright Green */
.editor-content :deep(.hljs-selector-id) { color: #fd971f; } /* Orange */
.editor-content :deep(.hljs-selector-tag) { color: #f92672; } /* Pink */
.editor-content :deep(.hljs-selector-attr) { color: #66d9ef; } /* Cyan */
.editor-content :deep(.hljs-selector-pseudo) { color: #ae81ff; } /* Purple */
.editor-content :deep(.hljs-tag) { color: #f92672; } /* Pink */
.editor-content :deep(.hljs-name) { color: #a6e22e; } /* Bright Green */
.editor-content :deep(.hljs-class) { color: #66d9ef; } /* Cyan */
.editor-content :deep(.hljs-regexp) { color: #e6db74; } /* Lemony-Chiffon */
.editor-content :deep(.hljs-link) { color: #66d9ef; text-decoration: underline; } /* Cyan */
.editor-content :deep(.hljs-symbol) { color: #ae81ff; } /* Purple */
.editor-content :deep(.hljs-bullet) { color: #f92672; } /* Pink */
.editor-content :deep(.hljs-code) { color: #e6db74; } /* Lemony-Chiffon */
.editor-content :deep(.hljs-formula) { color: #ae81ff; } /* Purple */
.editor-content :deep(.hljs-section) { color: #a6e22e; font-weight: bold; } /* Bright Green */
.editor-content :deep(.hljs-quote) { color: #75715e; font-style: italic; } /* Grey */
.editor-content :deep(.hljs-doctag) { color: #fd971f; } /* Orange */
.editor-content :deep(.hljs-deletion) { background: #f92672; color: #f8f8f2; } /* Pink background */
.editor-content :deep(.hljs-addition) { background: #a6e22e; color: #272822; } /* Green background */
.editor-content :deep(.hljs-emphasis) { font-style: italic; } /* Italic */
.editor-content :deep(.hljs-strong) { font-weight: bold; } /* Bold */

/* Dark Mode (on light background) - "Crystal Clear" */
.dark-mode .editor-content :deep(.hljs-comment) { color: #6a737d; font-style: italic; } /* Grey */
.dark-mode .editor-content :deep(.hljs-attribute) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-attr) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-operator) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-keyword) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-string) { color: #032f62; } /* Dark Blue */
.dark-mode .editor-content :deep(.hljs-variable), .dark-mode .editor-content :deep(.hljs-template-variable), .dark-mode .editor-content :deep(.hljs-subst) { color: #383a42; } /* Dark Slate Gray */
.dark-mode .editor-content :deep(.hljs-number), .dark-mode .editor-content :deep(.hljs-literal) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-type) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-params) { color: #e36209; } /* Orange */
.dark-mode .editor-content :deep(.hljs-built_in) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-title), .dark-mode .editor-content :deep(.hljs-function) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-property) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-meta) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-selector-class) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-selector-id) { color: #e36209; } /* Orange */
.dark-mode .editor-content :deep(.hljs-selector-tag) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-selector-attr) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-selector-pseudo) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-tag) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-name) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-class) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-regexp) { color: #032f62; } /* Dark Blue */
.dark-mode .editor-content :deep(.hljs-link) { color: #005cc5; text-decoration: underline; } /* Blue */
.dark-mode .editor-content :deep(.hljs-symbol) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-bullet) { color: #d73a49; } /* Red */
.dark-mode .editor-content :deep(.hljs-code) { color: #032f62; } /* Dark Blue */
.dark-mode .editor-content :deep(.hljs-formula) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-section) { color: #6f42c1; font-weight: bold; } /* Purple */
.dark-mode .editor-content :deep(.hljs-quote) { color: #6a737d; font-style: italic; } /* Grey */
.dark-mode .editor-content :deep(.hljs-doctag) { color: #e36209; } /* Orange */
.dark-mode .editor-content :deep(.hljs-deletion) { background: #d73a49; color: #ffffff; } /* Red background */
.dark-mode .editor-content :deep(.hljs-addition) { background: #28a745; color: #ffffff; } /* Green background */
.dark-mode .editor-content :deep(.hljs-emphasis) { font-style: italic; } /* Italic */
.dark-mode .editor-content :deep(.hljs-strong) { font-weight: bold; } /* Bold */
.dark-mode .editor-content :deep(.hljs-title), .dark-mode .editor-content :deep(.hljs-function) { color: #6f42c1; } /* Purple */
.dark-mode .editor-content :deep(.hljs-property) { color: #005cc5; } /* Blue */
.dark-mode .editor-content :deep(.hljs-meta) { color: #d73a49; } /* Red */
/* Dark Mode Styles */
.dark-mode .flash-editor-container {
  background-color: #1f2937; /* 深灰蓝背景 */
  border-color: #374151;
}

.dark-mode .editor-toolbar {
  background-color: #111827; /* 更深的背景 */
  border-bottom-color: #374151;
}

.dark-mode .toolbar-button {
  color: #d1d5db; /* 亮灰色图标 */
}

.dark-mode .toolbar-button:hover,
.dark-mode .toolbar-button.is-active {
  background-color: #374151;
  color: #ffffff;
}

.dark-mode .editor-content :deep(.ProseMirror) {
  color: #d1d5db; /* 亮灰色文本 */
}

.dark-mode .editor-content :deep(.ProseMirror p) {
    color: #d1d5db;
}

.dark-mode .editor-content :deep(.ProseMirror h1),
.dark-mode .editor-content :deep(.ProseMirror h2),
.dark-mode .editor-content :deep(.ProseMirror h3) {
    color: #f3f4f6;
}

/* --- Dark Mode High Contrast Code Block --- */
.dark-mode .editor-content :deep(pre) {
  background: #f8f8f2; /* 柔和白色背景 */
  max-height: 60vh;
  overflow: auto;
  color: #383a42; /* Default Dark Slate Gray */
}

.dark-mode .editor-content :deep(.ProseMirror pre code) {
  color: rgb(55, 170, 236);
}
</style>
