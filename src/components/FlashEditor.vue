
<template>
  <div class="flash-editor-container">
    <div v-if="editor" class="editor-toolbar">
      <div class="toolbar-left">
        <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }" title="Bold"><b>B</b></button>
        <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }" title="Italic"><i>I</i></button>
        <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'is-active': editor.isActive('underline') }" title="Underline"><u>U</u></button>
        <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }" title="Strikethrough"><s>S</s></button>
        <div class="toolbar-divider"></div>
        <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }" title="Heading 1">H1</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }" title="Heading 2">H2</button>
        <div class="toolbar-divider"></div>
        <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }" title="Bullet List">&#x2022;</button>
        <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }" title="Ordered List">1.</button>
        <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }" title="Blockquote">&#x201C;&#x201D;</button>
        <button @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ 'is-active': editor.isActive('codeBlock') }" title="Code Block">&lt;/&gt;</button>
        <div class="toolbar-divider"></div>
        <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" title="Undo">&#x21A9;</button>
        <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" title="Redo">&#x21AA;</button>
        <div class="toolbar-divider"></div>
        <button @click="emit('request-fullscreen')" title="Fullscreen">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M5 19h4v-2H7v-2H5v4zM5 7h2V5h2V3H5v4zm14 12h-4v2h4v-4h-2v2zm0-14h-2v2h-2v2h4V3z"/></svg>
        </button>
      </div>
      <div class="toolbar-right">
        <danger-button @click="saveContent" :disabled="!canSave" type="gradient-green">
        <span  style="display: flex;align-items: center; color: #c9ea63 !important;"><svg xmlns="http://www.w3.org/2000/svg" width="20"  viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h11.175q.4 0 .763.15t.637.425l2.85 2.85q.275.275.425.638t.15.762V19q0 .825-.587 1.413T19 21zm7-3q1.25 0 2.125-.875T15 15t-.875-2.125T12 12t-2.125.875T9 15t.875 2.125T12 18m-5-8h7q.425 0 .713-.288T15 9V7q0-.425-.288-.712T14 6H7q-.425 0-.712.288T6 7v2q0 .425.288.713T7 10"/></svg> <b style="color: #fff; margin-left: 5px;">保存</b> </span>
         
           </danger-button>
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
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import dangerButton from '@/components/dangerButton.vue';
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

const emit = defineEmits(['update:modelValue', 'save-draft', 'request-fullscreen']);

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
    Placeholder.configure({
      placeholder: '开始记录你的想法...',
    }),
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
    Underline,
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
const clearContent = () => {
  if(editor.value) {
    editor.value.commands.setContent('');
    localStorage.removeItem('flash-editor-draft');
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
  getContent,
  clearContent
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
  font-family: 'Inter', sans-serif;
  border: none;
  background-color: transparent;
  color: #374151;
  padding: 8px 12px;
  margin: 0 2px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
}

.editor-toolbar button:hover {
  background-color: #f3f4f6;
}
:deep(.toolbar-right button) {
  padding: 0 !important;
}
:deep(.toolbar-right button):hover  {
  background-color: transparent !important;
}
.editor-toolbar button.is-active {
  background-color: #e0e7ff;
  color: #3b82f6;
}

.editor-toolbar button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}



.editor-content {
  padding: 70px; /* 调整内边距 */
  flex: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 内部滚动 */
}
.editor-content :deep( a) {
  color: #10b981 !important;
}

.editor-content :deep(.ProseMirror) {
  height: 500px;
  outline: none;
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
}

.editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
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
