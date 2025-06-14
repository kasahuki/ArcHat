<template>
  <button :class="['custom-button', `custom-button--${type}`]">
    <span class="shadow"></span>
    <span class="edge"></span>
    <span class="front text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'danger',
    validator: (value) => ['danger', 'primary', 'text'].includes(value)
  }
});
</script>

<style scoped>
/* From Uiverse.io by cssbuttons-io */ 
.custom-button {
 position: relative;
 border: none;
 background: transparent;
 padding: 0;
 cursor: pointer;
 outline-offset: 4px;
 transition: filter 250ms;
 user-select: none;
 touch-action: manipulation;
 font-size: 14px;
}

.shadow {
 position: absolute;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 border-radius: 8px;
 background: hsl(0deg 0% 0% / 0.25);
 will-change: transform;
 transform: translateY(2px);
 transition: transform
    600ms
    cubic-bezier(.3, .7, .4, 1);
}

.edge {
 position: absolute;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 border-radius: 8px;
 transition: background 0.3s ease;
}

.front {
 display: block;
 position: relative;
 padding: 6px 12px;
 border-radius: 8px;
 font-size: 14px;
 color: white;
 will-change: transform;
 transform: translateY(-4px);
 transition: transform
    600ms
    cubic-bezier(.3, .7, .4, 1);
}

/* 危险按钮样式 */
.custom-button--danger .edge {
  background: linear-gradient(
    to left,
    hsl(340deg 100% 16%) 0%,
    hsl(340deg 100% 32%) 8%,
    hsl(340deg 100% 32%) 92%,
    hsl(340deg 100% 16%) 100%
  );
}

.custom-button--danger .front {
  background: hsl(345deg 100% 47%);
}

/* 主要按钮样式 */
.custom-button--primary .edge {
  background: linear-gradient(
    to left,
    hsl(210deg 100% 16%) 0%,
    hsl(210deg 100% 32%) 8%,
    hsl(210deg 100% 32%) 92%,
    hsl(210deg 100% 16%) 100%
  );
}

.custom-button--primary .front {
  background: hsl(210deg 100% 47%);
}

/* 文本按钮样式 */
.custom-button--text .edge {
  background: linear-gradient(
    to left,
    hsl(210deg 100% 16%) 0%,
    hsl(210deg 100% 32%) 8%,
    hsl(210deg 100% 32%) 92%,
    hsl(210deg 100% 16%) 100%
  );
}

.custom-button--text .front {
  background: transparent;
  color: hsl(210deg 100% 47%);
  box-shadow: none;
}

.custom-button:hover {
 filter: brightness(110%);
}

.custom-button:hover .front {
 transform: translateY(-6px);
 transition: transform
    250ms
    cubic-bezier(.3, .7, .4, 1.5);
}

.custom-button:active .front {
 transform: translateY(-2px);
 transition: transform 34ms;
}

.custom-button:hover .shadow {
 transform: translateY(4px);
 transition: transform
    250ms
    cubic-bezier(.3, .7, .4, 1.5);
}

.custom-button:active .shadow {
 transform: translateY(1px);
 transition: transform 34ms;
}

.custom-button:focus:not(:focus-visible) {
 outline: none;
}
</style>