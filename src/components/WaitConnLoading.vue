<template>
  <div class="layout">
    

<div class="main">
  <div class="dog">
    <div class="dog__paws">
      <div class="dog__bl-leg leg">
        <div class="dog__bl-paw paw"></div>
        <div class="dog__bl-top top"></div>
      </div>
      <div class="dog__fl-leg leg">
        <div class="dog__fl-paw paw"></div>
        <div class="dog__fl-top top"></div>
      </div>
      <div class="dog__fr-leg leg">
        <div class="dog__fr-paw paw"></div>
        <div class="dog__fr-top top"></div>
      </div>
    </div>

    <div class="dog__body">
      <div class="dog__tail"></div>
    </div>

    <div class="dog__head">
      <div class="dog__snout">
        <div class="dog__nose"></div>
        <div class="dog__eyes">
          <div class="dog__eye-l"></div>
          <div class="dog__eye-r"></div>
        </div>
      </div>
    </div>

    <div class="dog__head-c">
      <div class="dog__ear-l"></div>
      <div class="dog__ear-r"></div>
    </div>
  </div>
</div>
<div class="loading-text">  
  <span>Connection Waking...</span>
</div>
</div>
</template>
<script setup>

</script>
<style scoped>
/* From Uiverse.io by elijahgummer */ 
.layout {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.loading-text {
  font-size: 40px;
  font-weight: 600;
  position: relative;
  display: flex;
}

@keyframes loading-bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  20% {
    transform: translateY(-8px) scale(1.1);
    opacity: 1;
  }
  40% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  60% {
    opacity: 0.7;
  }
  80% {
    opacity: 1;
  }
}

.loading-text span {
  display: inline-block;
  letter-spacing: 2px;
}

.loading-text span::after {
  content: '';
}

.loading-text span {
  animation: loading-bounce 1.2s infinite;
}

.loading-text span::after {
  content: '';
}

.loading-text .zzz {
  display: inline-block;
  font-size: 18px;
  color: #8bb3f4;
  margin-left: 12px;
  position: relative;
  opacity: 0.8;
  animation: zzz-float 2.2s infinite;
}

.loading-text .zzz .z {
  display: inline-block;
  font-family: 'Comic Sans MS', 'Arial', sans-serif;
  font-size: 18px;
  color: #8bb3f4;
  opacity: 0.7;
  margin-right: 2px;
  animation: zzz-bounce 2.2s infinite;
}

.loading-text .zzz .z:nth-child(1) {
  animation-delay: 0s;
  font-size: 16px;
  opacity: 0.5;
  top: 0;
}
.loading-text .zzz .z:nth-child(2) {
  animation-delay: 0.3s;
  font-size: 18px;
  opacity: 0.7;
  top: -4px;
}
.loading-text .zzz .z:nth-child(3) {
  animation-delay: 0.6s;
  font-size: 20px;
  opacity: 1;
  top: -8px;
}

@keyframes zzz-bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-8px) scale(1.1);
    opacity: 1;
  }
  60% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
}

@keyframes zzz-float {
  0% {
    opacity: 0.7;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-8px);
  }
  100% {
    opacity: 0.7;
    transform: translateY(0);
  }
}
.main {
  position: relative;
  width: 23.5vmax;
  height: 23.5vmax;
  display: flex;
  justify-content: center;
  align-items: center;
}

.leg {
  position: absolute;
  bottom: 0;
  width: 2vmax;
  height: 2.125vmax;
}

.paw {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 1.95vmax;
  height: 1.875vmax;
  overflow: hidden;
}

.paw::before {
  content: "";
  position: absolute;
  width: 3.75vmax;
  height: 3.75vmax;
  border-radius: 50%;
}

.top {
  position: absolute;
  bottom: 0;
  left: 0.75vmax;
  height: 4.5vmax;
  width: 2.625vmax;
  border-top-left-radius: 1.425vmax;
  border-top-right-radius: 1.425vmax;
  transform-origin: bottom right;
  transform: rotateZ(90deg) translateX(-0.1vmax) translateY(1.5vmax);
  z-index: -1;
  background-image: linear-gradient(70deg, transparent 20%, #ff8b56 20%);
}

.dog {
  position: relative;
  width: 22.5vmax;
  height: 8.25vmax;
}

.dog::before {
  content: "";
  position: absolute;
  bottom: -0.75vmax;
  right: -0.15vmax;
  width: 100%;
  height: 1.5vmax;
  background-color: rgba(28, 49, 48, 0.1);
  border-radius: 50%;
  z-index: -1000;
  animation: shadow 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.dog__head {
  position: absolute;
  left: 4.5vmax;
  bottom: 0;
  width: 9.75vmax;
  height: 8.25vmax;
  border-top-left-radius: 4.05vmax;
  border-top-right-radius: 4.05vmax;
  border-bottom-right-radius: 3.3vmax;
  border-bottom-left-radius: 3.3vmax;
  background-color: #ff8147;
  animation: head 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.dog__head-c {
  position: absolute;
  left: 1.5vmax;
  bottom: 0;
  width: 9.75vmax;
  height: 8.25vmax;
  animation: head 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
  z-index: -1;
}

.dog__snout {
  position: absolute;
  left: -1.5vmax;
  bottom: 0;
  width: 7.5vmax;
  height: 3.75vmax;
  border-top-right-radius: 3vmax;
  border-bottom-right-radius: 3vmax;
  border-bottom-left-radius: 4.5vmax;
  background-color: #d7dbd2;
  animation: snout 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.dog__snout::before {
  content: "";
  position: absolute;
  left: -0.1125vmax;
  top: -0.15vmax;
  width: 1.875vmax;
  height: 1.125vmax;
  border-top-right-radius: 3vmax;
  border-bottom-right-radius: 3vmax;
  border-bottom-left-radius: 4.5vmax;
  background-color: #1c3130;
  animation: snout-b 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.dog__nose {
  position: absolute;
  top: -1.95vmax;
  left: 40%;
  width: 0.75vmax;
  height: 2.4vmax;
  border-radius: 0.525vmax;
  transform-origin: bottom;
  transform: rotateZ(10deg);
  background-color: #d7dbd2;
}

.dog__eye-l,
.dog__eye-r {
  position: absolute;
  top: -0.9vmax;
  width: 0.675vmax;
  height: 0.375vmax;
  border-radius: 50%;
  background-color: #1c3130;
  animation: eye 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.dog__eye-l {
  left: 27%;
}

.dog__eye-r {
  left: 65%;
}

.dog__ear-l,
.dog__ear-r {
  position: absolute;
  width: 10.5vmax;
  height: 3.375vmax;
  border-top-left-radius: 0vmax;
  border-top-right-radius: 0vmax;
  border-bottom-right-radius: 3.3vmax;
  border-bottom-left-radius: 3.3vmax;
  background-color: #e26538;
}

.dog__ear-l {
  top: 1.5vmax;
  left: 6vmax;
  transform-origin: bottom left;
  transform: rotateZ(-50deg);
  z-index: -1;
  animation: ear-l 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.dog__ear-r {
  top: 1.5vmax;
  right: 3vmax;
  transform-origin: bottom right;
  transform: rotateZ(20deg);
  z-index: -2;
  animation: ear-r 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.dog__body {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  position: absolute;
  bottom: 0.3vmax;
  left: 3.75vmax;
  width: 18.75vmax;
  height: 7.2vmax;
  border-top-left-radius: 3vmax;
  border-top-right-radius: 6vmax;
  border-bottom-right-radius: 1.5vmax;
  border-bottom-left-radius: 6vmax;
  background-color: #ff702e;
  z-index: -2;
  animation: body 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.dog__tail {
  position: absolute;
  right: -3vmax;
  height: 1.5vmax;
  width: 4.5vmax;
  background-color: #e96839;
  border-radius: 1.5vmax;
}

.dog__paws {
  position: absolute;
  bottom: 0;
  left: 7.5vmax;
  width: 12vmax;
  height: 3vmax;
}

.dog__bl-leg {
  left: -3vmax;
  z-index: -10;
}

.dog__bl-paw::before {
  background-color: #bec4b6;
}

.dog__bl-top {
  background-image: linear-gradient(80deg, transparent 20%, #e96839 20%);
}

.dog__fl-leg {
  z-index: 10;
  left: 0;
}

.dog__fl-paw::before {
  background-color: #d7dbd2;
}

.dog__fr-leg {
  right: 0;
}

.dog__fr-paw::before {
  background-color: #d7dbd2;
}

/*==============================*/

@keyframes head {
  0%,
  10%,
  20%,
  26%,
  28%,
  90%,
  100% {
    height: 8.25vmax;
    bottom: 0;
    transform-origin: bottom right;
    transform: rotateZ(0);
  }
  5%,
  15%,
  22%,
  24%,
  30% {
    height: 8.1vmax;
  }
  32%,
  50% {
    height: 8.25vmax;
  }
  55%,
  60% {
    bottom: 0.75vmax;
    transform-origin: bottom right;
    transform: rotateZ(0);
  }
  70%,
  80% {
    bottom: 0.75vmax;
    transform-origin: bottom right;
    transform: rotateZ(10deg);
  }
}

@keyframes body {
  0%,
  10%,
  20%,
  26%,
  28%,
  32%,
  100% {
    height: 7.2vmax;
  }
  5%,
  15%,
  22%,
  24%,
  30% {
    height: 7.05vmax;
  }
}

@keyframes ear-l {
  0%,
  10%,
  20%,
  26%,
  28%,
  82%,
  100% {
    transform: rotateZ(-50deg);
  }
  5%,
  15%,
  22%,
  24% {
    transform: rotateZ(-48deg);
  }
  30%,
  31% {
    transform: rotateZ(-30deg);
  }
  32%,
  80% {
    transform: rotateZ(-60deg);
  }
}

@keyframes ear-r {
  0%,
  10%,
  20%,
  26%,
  28% {
    transform: rotateZ(20deg);
  }
  5%,
  15%,
  22%,
  24% {
    transform: rotateZ(18deg);
  }
  30%,
  31% {
    transform: rotateZ(10deg);
  }
  32% {
    transform: rotateZ(25deg);
  }
}

@keyframes snout {
  0%,
  10%,
  20%,
  26%,
  28%,
  82%,
  100% {
    height: 3.75vmax;
  }
  5%,
  15%,
  22%,
  24% {
    height: 3.45vmax;
  }
}

@keyframes snout-b {
  0%,
  10%,
  20%,
  26%,
  28%,
  98%,
  100% {
    width: 1.875vmax;
  }
  5%,
  15%,
  22%,
  24% {
    width: 1.8vmax;
  }
  34%,
  98% {
    width: 1.275vmax;
  }
}

@keyframes shadow {
  0%,
  10%,
  20%,
  26%,
  28%,
  30%,
  84%,
  100% {
    width: 99%;
  }
  5%,
  15%,
  22%,
  24% {
    width: 101%;
  }
  34%,
  81% {
    width: 96%;
  }
}

@keyframes eye {
  0%,
  30% {
    width: 0.675vmax;
    height: 0.3vmax;
  }
  32%,
  59%,
  90%,
  100% {
    width: 0.525vmax;
    height: 0.525vmax;
    transform: translateY(0);
  }
  60%,
  75% {
    transform: translateY(-0.3vmax);
  }
  80%,
  85% {
    transform: translateY(0.15vmax);
  }
}

</style>