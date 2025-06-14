import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(true)

  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value
    if (isDarkMode.value) {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }
  }

  function initTheme() {
    if (isDarkMode.value) {
      document.body.classList.add('dark-theme')
    }
  }

  return {
    isDarkMode,
    toggleTheme,
    initTheme
  }
}) 