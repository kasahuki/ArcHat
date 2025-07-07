// 引入 mitt 库
import mitt from 'mitt';

// 创建一个 mitt 实例，相当于事件中心
const emitter = mitt();

// 导出该实例，供其他组件使用
export default emitter;

// 使用第三方库 mitt 来创建一个 事件总线（Event Bus），用于 跨组件通信，比 Vue 自带的 $emit 更加轻量、独立于组件层级结构，非常适合 兄弟组件 或 全局事件传递 的场景。