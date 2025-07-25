<template>
<div class="card" :style="computedStyle">
  <ul class="list">
    <template v-for="(item, idx) in items" :key="item.key || idx">
      <li :class="['element', item.class, { danger: item.danger }]" :style="item.style || ''">
        <label :for="item.key || 'item'+idx" @click="handleClick(item, $event)">
          <!-- 移除radio点 -->
          <span v-if="item.icon" class="menu-icon" v-html="item.icon"></span>
          {{ item.label }}
        </label>
      </li>
      <div v-if="item.separatorAfter" class="separator"></div>
    </template>
  </ul>
</div>

</template>
<script>
export default {
  name: 'RightKeyPop',
  props: {
    left: { type: [Number, String], default: null },
    top: { type: [Number, String], default: null },
    position: { type: String, default: 'fixed' },
    zIndex: { type: [Number, String], default: 99999 },
    items: {
      type: Array,
      default: () => [] // [{key, label, icon, checked, class, style, onClick, separatorAfter}]
    }
  },
  computed: {
    computedStyle() {
      const style = {
        position: this.position,
        zIndex: this.zIndex
      }
      if (this.left !== null) style.left = typeof this.left === 'number' ? this.left + 'px' : this.left
      if (this.top !== null) style.top = typeof this.top === 'number' ? this.top + 'px' : this.top
      return style
    }
  },
  methods: {
    handleClick(item, e) {
      if (typeof item.onClick === 'function') {
        item.onClick(e)
      }
      this.$emit('close')
    },
    hasSeparator(idx) {
      // 在有separatorAfter为true的项后插入分割线
      return this.items[idx] && this.items[idx].separatorAfter
    }
  }
}
</script>
<style>
/* From Uiverse.io by 3bdel3ziz-T */ 
.card {
  width: 200px;
  background-image: linear-gradient(139deg, rgba(209, 240, 247, 0.92) 0%, rgba(245,245,255,0.82) 100%);
  user-select: none;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.13), 0 1.5px 6px 0 rgba(64, 158, 255, 0.08);
  color: #222;
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
}
body.dark-theme .card,
.dark-mode .card {
  background: rgba(28, 30, 38, 0.96);
  background-image: linear-gradient(139deg, rgba(28, 30, 38, 0.98) 0%, rgba(32, 28, 40, 0.93) 100%);
  color: #e0e6f0;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.22), 0 1.5px 6px 0 rgba(64, 158, 255, 0.08);
  backdrop-filter: blur(22px) saturate(220%);
  -webkit-backdrop-filter: blur(22px) saturate(220%);
}
.card .separator {
  border-top: 1.5px solid #aeb0bd;
}
body.dark-theme .card .separator,
.dark-mode .card .separator {
  border-top: 1.5px solid #3b3bad;
}
.card .list {
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0px;
}

.card .list .element > label {
  display: flex;
  align-items: center;
  color: #7e8590;
  gap: 10px;
  transition: all 0.3s ease-out;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  background: none;
  user-select: none;
}
body.dark-theme .card .list .element > label,
.dark-mode .card .list .element > label {
  color: #bfc8e6;
}
.card .list .element label:hover,
.card .list .element label:active {
  background: linear-gradient(90deg, #4c4cee 0%, #2a2af3 100%);
  color: #fdfbfb;
}
body.dark-theme .card .list .element label:hover,
body.dark-theme .card .list .element label:active,
.dark-mode .card .list .element label:hover,
.dark-mode .card .list .element label:active {
  background: linear-gradient(90deg, #23232a 0%, #35355a 100%);
  color: #ffe066;
}
.card .list .element label:active {
  transform: scale(0.96);
}

body.dark-theme .card .list .element label:hover svg,
body.dark-theme .card .list .element label:active svg,
.dark-mode .card .list .element label:hover svg,
.dark-mode .card .list .element label:active svg {
  stroke: #ffe066;
}
.card .list .element.danger label:hover,
.card .list .element.danger label:active {
  background: rgba(243, 35, 32, 0.644);
  color: #fff;
  backdrop-filter: blur(8px) saturate(180%);
  -webkit-backdrop-filter: blur(8px) saturate(180%);
}
body.dark-theme .card .list .element.danger label:hover,
body.dark-theme .card .list .element.danger label:active,
.dark-mode .card .list .element.danger label:hover,
.dark-mode .card .list .element.danger label:active {
  background: rgba(250, 10, 6, 0.767);
  color: #fff;
  backdrop-filter: blur(10px) saturate(160%);
  -webkit-backdrop-filter: blur(10px) saturate(160%);
  box-shadow: 0 2px 8px 0 rgba(229, 57, 53, 0.08);
}
.card .list .element.danger label:hover svg,
.card .list .element.danger label:active svg,
body.dark-theme .card .list .element.danger label:hover svg,
body.dark-theme .card .list .element.danger label:active svg,
.dark-mode .card .list .element.danger label:hover svg,
.dark-mode .card .list .element.danger label:active svg {
  stroke: #fff;
  fill: #fff;
}
.menu-icon {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
  font-size: 18px;
}
</style>