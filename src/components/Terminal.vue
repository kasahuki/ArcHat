<template>


  <div class="wrap">
    <div class="terminal">
      <hgroup class="head">
        <p class="title">
          <svg
            width="16px"
            height="16px"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="2"
            stroke="currentColor"
            fill="none"
          >
            <path
              d="M7 15L10 12L7 9M13 15H17M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"
            ></path>
          </svg>
          Terminal
        </p>

        <button class="copy_toggle" tabindex="-1" type="button" @click="copyCmd" :class="{ copied }">
          <svg
            width="16px"
            height="16px"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="2"
            stroke="currentColor"
            fill="none"
          >
            <path
              d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"
            ></path>
            <path
              d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"
            ></path>
          </svg>
        </button>
      </hgroup>

      <div class="body">
        <pre class="pre">          <code>-&nbsp;</code>
          <code>start&nbsp;</code>
          <code class="cmd" :data-cmd="cmd" ref="cmdRef"></code>
        </pre>
      </div>
    </div>
  </div>


</template>
<script setup>
import { ref } from 'vue';
const copied = ref(false);
const cmdRef = ref(null);
defineProps({
  cmd: {
    type: String,
    required: true,
  },
});
function copyCmd() {
  const el = cmdRef.value;
  if (!el) return;
  const text = el.getAttribute('data-cmd');
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copied.value = true;
    setTimeout(() => copied.value = false, 1200);
  });
}
</script>
<style scoped>

.wrap {
  min-width: 50%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  z-index: 10;
  border: 0.5px solid #525252;
  border-radius: 8px;
  overflow: hidden;
}
.terminal {
  display: flex;
  flex-direction: column;

  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  min-height: 40px;
  padding-inline: 12px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background-color: #202425;
}
.title {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 2.5rem;
  user-select: none;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color : #fff;
}
.title > svg {
  height: 18px;
  width: 18px;
  margin-top: 2px;
  color: #006adc;
}
.copy_toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border: 0.65px solid #c1c2c5;
  margin-left: auto;
  border-radius: 6px;
  background-color: #202425;
  color: #8e8e8e;
  cursor: pointer;
}
.copy_toggle > svg {
  width: 20px;
  height: 20px;
}
.copy_toggle:active > svg > path,
.copy_toggle:focus-within > svg > path {
  animation: clipboard-check 500ms linear forwards;
}
.body {
  display: flex;
  flex-direction: column;
  position: relative;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  overflow-x: auto;
  padding: 1rem;
  line-height: 19px;
  color: white;
  background-color: black;
  white-space: nowrap;
}
.pre {
  display: flex;
  flex-direction: row;
  align-items: center;
  text-wrap: nowrap;
  white-space: pre;
  background-color: transparent;
  overflow: hidden;
  box-sizing: border-box;
  font-size: 16px;
}
.pre code:nth-child(1) {
  color: #575757;
}
.pre code:nth-child(2) {
  color: #e34ba9;
}
.cmd {
  height: 19px;
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: row;
}
.cmd::before {
  content: attr(data-cmd);
  position: relative;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  background-color: transparent;
  animation: inputs 8s steps(22) infinite;
}
.cmd::after {
  content: "";
  position: relative;
  display: block;
  height: 100%;
  overflow: hidden;
  background-color: transparent;
  border-right: 0.15em solid #e34ba9;
  animation: cursor 0.5s step-end infinite alternate, blinking 0.5s infinite;
}

@keyframes blinking {
  20%,
  80% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0);
  }
}
@keyframes cursor {
  50% {
    border-right-color: transparent;
  }
}
@keyframes inputs {
  0%,
  100% {
    width: 0;
  }
  10%,
  90% {
    width: 58px;
  }
  30%,
  70% {
    width: 215px;
    max-width: max-content;
  }
}
@keyframes clipboard-check {
  100% {
    color: #fff;
    d: path(
      "M 9 5 H 7 a 2 2 0 0 0 -2 2 v 12 a 2 2 0 0 0 2 2 h 10 a 2 2 0 0 0 2 -2 V 7 a 2 2 0 0 0 -2 -2 h -2 M 9 5 a 2 2 0 0 0 2 2 h 2 a 2 2 0 0 0 2 -2 M 9 5 a 2 2 0 0 1 2 -2 h 2 a 2 2 0 0 1 2 2 m -6 9 l 2 2 l 4 -4"
    );
  }
}
.copy_toggle.copied {
  background: #4cd964;
  color: #fff;
  border-color: #4cd964;
  transition: background 0.18s, color 0.18s, border 0.18s;
}
</style>