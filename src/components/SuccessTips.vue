<template>
<!-- From Uiverse.io by rzouga001 --> 
<div class="card"> 
  <button class="dismiss" type="button" @click="$emit('close')">×</button> 
  <div class="header"> 

<div class="div_image_v">
    <div class="image">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 7L9.00004 18L3.99994 13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
      </div> 
  </div> 
      <div class="content">
         <span class="title">{{ title }}</span> 
         <p class="message">{{ message }}</p> 
         </div> 
       
            </div> 
            </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '操作成功'
  },
  message: {
    type: String,
    default: '您的操作已成功完成'
  }
});

defineEmits(['close']);
</script>
<style scoped>
/* From Uiverse.io by rzouga001 */ 
.card {
  scale: 1.5;
  padding: 0;
  overflow: hidden;
  position: relative;
  text-align: left;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  background-color: #fff;
  animation: slideIn 0.4s ease-out;
  transform-origin: center;
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.div_image_v {
  background: #47c9a2;
  border-bottom: none;
  position: relative;
  text-align: center;
  margin: -20px -20px 0;
  border-radius: 5px 5px 0 0;
  padding: 35px;
}

.dismiss {
  z-index: 1000000;
  position: absolute;
  right: 1px;
  top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #D1D5DB;
  font-size: 1rem;
  font-weight: 300;
  border-radius: 7px;
  transition: .3s ease;
}

.dismiss:hover {
  background-color: #ee0d0d;
  border: 2px solid #ee0d0d;
  color: #fff;
}

.header {
  padding: 1.25rem 1rem 1rem 1rem;
}

.image {
  display: flex;
  margin-left: auto;
  margin-right: auto;
  background-color: #e2feee;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  animation: animate .6s linear alternate-reverse infinite;
  transition: .6s ease;
}

.image svg {
  color: #0afa2a;
  width: 2rem;
  height: 2rem;
}

.content {
  margin-top: 0.75rem;
  text-align: center;
}

.title {
  color: #066e29;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5rem;
}

.message {
  margin-top: 0.5rem;
  color: #595b5f;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

@keyframes animate {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.09);
  }
}
</style>