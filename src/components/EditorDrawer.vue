<template>
  <el-drawer
    :model-value="visible"
    title="内容编辑器"
    direction="rtl"
    size="80%"
    @close="emits('close')"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <div class="editor-layout">
      <textarea class="editor-input" v-model="localContent"></textarea>
      <div class="editor-preview">
        <CodeBlock language="markdown" :code="localContent" />
      </div>
    </div>
    <template #footer>
      <div class="footer-actions">
        <el-button @click="resetEditor">重置</el-button>
        <el-button type="primary" @click="saveContent">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElButton, ElDrawer, ElMessage } from 'element-plus';
import CodeBlock from './CodeBlock.vue';

const props = defineProps({
  visible: Boolean,
  content: String
});
const emits = defineEmits(['update:content', 'close']);

const localContent = ref('');

watch(() => props.visible, (newVal) => {
  if (newVal) {
    localContent.value = props.content;
  }
}, { immediate: true });

const handleUpdate = (newContent) => {
  localContent.value = newContent;
};

const resetEditor = () => {
  localContent.value = '';
  ElMessage.success('内容已重置');
};

const saveContent = () => {
  emits('update:content', localContent.value);
  emits('close');
  ElMessage.success('内容已保存');
};

const handleClose = () => {
  emits('close');
};
</script>

<style scoped>
.editor-layout {
  display: flex;
  height: 100%;
  gap: 1rem;
}

.editor-input,
.editor-preview {
  width: 50%;
  height: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 1rem;
  box-sizing: border-box;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-y: auto;
  background-color: #282c34;
  color: #abb2bf;
}

.editor-input {
  resize: none;
  border-color: #444;
}

.editor-input:focus {
  outline: none;
  border-color: #61afef;
}

.editor-preview {
  border-color: #444;
}

.footer-actions {
  text-align: right;
}

</style>