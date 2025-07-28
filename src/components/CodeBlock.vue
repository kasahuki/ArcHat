<template>
  <div class="code-block-container">
    <div class="code-header" v-if="language">
      <span class="language-label">{{ language }}</span>
      <button class="copy-button" @click="copyCode" :title="copyTooltip">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="m5 15-4-4 4-4"></path>
        </svg>
      </button>
    </div>
    <pre class="code-content" :class="{ 'with-header': language }"><code :class="`language-${language || 'plaintext'}`" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import hljs from 'highlight.js';

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'plaintext'
  }
});

const copyTooltip = ref('复制代码');

const highlightedCode = computed(() => {
  if (!props.code) return '';
  
  try {
    if (props.language && hljs.getLanguage(props.language)) {
      return hljs.highlight(props.code, { language: props.language }).value;
    } else {
      return hljs.highlightAuto(props.code).value;
    }
  } catch (error) {
    console.warn('代码高亮失败:', error);
    return props.code;
  }
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    copyTooltip.value = '已复制!';
    setTimeout(() => {
      copyTooltip.value = '复制代码';
    }, 2000);
  } catch (error) {
    console.error('复制失败:', error);
    copyTooltip.value = '复制失败';
    setTimeout(() => {
      copyTooltip.value = '复制代码';
    }, 2000);
  }
};
</script>

<style scoped>
.code-block-container {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e5e9;
  background: #f8f9fa;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f1f3f4;
  border-bottom: 1px solid #e1e5e9;
  font-size: 12px;
}

.language-label {
  color: #5f6368;
  font-weight: 500;
  text-transform: uppercase;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.copy-button {
  background: none;
  border: none;
  color: #5f6368;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.copy-button:hover {
  background: #e8eaed;
  color: #1a73e8;
}

.code-content {
  margin: 0;
  padding: 16px;
  background: #091c41;
  color: #adbef3;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  overflow: auto;
  max-height: 60vh;
  white-space: pre;
}

.code-content.with-header {
  border-radius: 0;
}

.code-content code {
  background: transparent;
  color: inherit;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
}

/* 语法高亮样式 - 基于你在 FlashEditor 中的配色 */
.code-content :deep(.hljs-comment) { 
  color: #75715e; 
  font-style: italic; 
}

.code-content :deep(.hljs-keyword) { 
  color: #f92672; 
}

.code-content :deep(.hljs-string) { 
  color: #e6db74; 
}

.code-content :deep(.hljs-variable),
.code-content :deep(.hljs-template-variable),
.code-content :deep(.hljs-subst) { 
  color: #f8f8f2; 
}

.code-content :deep(.hljs-number) { 
  color: #ae81ff; 
}

.code-content :deep(.hljs-function) { 
  color: #a6e22e; 
}

.code-content :deep(.hljs-class),
.code-content :deep(.hljs-type) { 
  color: #66d9ef; 
}

.code-content :deep(.hljs-attr),
.code-content :deep(.hljs-attribute) { 
  color: #fd971f; 
}

.code-content :deep(.hljs-built_in) { 
  color: #f92672; 
}

.code-content :deep(.hljs-tag) { 
  color: #f92672; 
}

.code-content :deep(.hljs-name) { 
  color: #a6e22e; 
}

.code-content :deep(.hljs-selector-id),
.code-content :deep(.hljs-selector-class) { 
  color: #a6e22e; 
}

.code-content :deep(.hljs-property) { 
  color: #66d9ef; 
}

.code-content :deep(.hljs-literal) { 
  color: #ae81ff; 
}

.code-content :deep(.hljs-meta) { 
  color: #75715e; 
}

.code-content :deep(.hljs-doctag) { 
  color: #e6db74; 
}

.code-content :deep(.hljs-title) { 
  color: #a6e22e; 
}

/* 暗色主题支持 */
.dark-mode .code-block-container {
  border-color: #374151;
  background: #1f2937;
}

.dark-mode .code-header {
  background: #374151;
  border-bottom-color: #4b5563;
}

.dark-mode .language-label {
  color: #d1d5db;
}

.dark-mode .copy-button {
  color: #d1d5db;
}

.dark-mode .copy-button:hover {
  background: #4b5563;
  color: #60a5fa;
}

.dark-mode .code-content {
  background: #f8f8f2;
  color: #383a42;
}

/* 暗色主题下的语法高亮 */
.dark-mode .code-content :deep(.hljs-comment) { 
  color: #a0a1a7; 
  font-style: italic; 
}

.dark-mode .code-content :deep(.hljs-keyword) { 
  color: #a626a4; 
}

.dark-mode .code-content :deep(.hljs-string) { 
  color: #50a14f; 
}

.dark-mode .code-content :deep(.hljs-variable),
.dark-mode .code-content :deep(.hljs-template-variable),
.dark-mode .code-content :deep(.hljs-subst) { 
  color: #383a42; 
}

.dark-mode .code-content :deep(.hljs-number) { 
  color: #986801; 
}

.dark-mode .code-content :deep(.hljs-function) { 
  color: #4078f2; 
}

.dark-mode .code-content :deep(.hljs-class),
.dark-mode .code-content :deep(.hljs-type) { 
  color: #c18401; 
}

.dark-mode .code-content :deep(.hljs-attr),
.dark-mode .code-content :deep(.hljs-attribute) { 
  color: #986801; 
}

.dark-mode .code-content :deep(.hljs-built_in) { 
  color: #a626a4; 
}

.dark-mode .code-content :deep(.hljs-tag) { 
  color: #e45649; 
}

.dark-mode .code-content :deep(.hljs-name) { 
  color: #e45649; 
}

.dark-mode .code-content :deep(.hljs-selector-id),
.dark-mode .code-content :deep(.hljs-selector-class) { 
  color: #4078f2; 
}

.dark-mode .code-content :deep(.hljs-property) { 
  color: #383a42; 
}

.dark-mode .code-content :deep(.hljs-literal) { 
  color: #0184bb; 
}

.dark-mode .code-content :deep(.hljs-meta) { 
  color: #a0a1a7; 
}

.dark-mode .code-content :deep(.hljs-doctag) { 
  color: #a0a1a7; 
}

.dark-mode .code-content :deep(.hljs-title) { 
  color: #4078f2; 
}

/* 滚动条样式 */
.code-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.dark-mode .code-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.dark-mode .code-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
}

.dark-mode .code-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
