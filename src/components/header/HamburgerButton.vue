<template>
  <button class="hamburger flex" ref="hamburgerButton" :data-state="state" aria-controls="primary-navigation"
    :aria-expanded="isOpen">
    <svg fill="var(--button-color)" class="hamburger" viewBox="0 0 100 120" width="100" height="120">
      <rect class="line top" width="100" height="20" y="15" rx="8">
      </rect>
      <rect class="line middle" width="100" height="20" y="50" rx="8">
      </rect>
      <rect class="line bottom" width="100" height="20" y="85" rx="8">
      </rect>
    </svg>
  </button>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  const props = defineProps<{
    isOpen: boolean
  }>()

  const hamburgerButton = ref()
  const state = computed(() => {
    return props.isOpen ? 'opened' : 'closed'
  })

</script>

<style scoped>
  button {
    background: transparent;
    border-radius: 1rem;
  }

  .hamburger {
    --button-color: #333;
    background: transparent;
    transform: scale(1.25);
  }

  .hamburger .line {
    transition: y 200ms ease-in 200ms, rotate 200ms ease-in, opacity 0ms 200ms;
    transform-origin: center;
  }

  .hamburger[aria-expanded="true"] .line {
    transition: y 200ms ease-in, rotate 200ms ease-in 200ms, opacity 0ms 200ms;
  }

  .hamburger[aria-expanded="true"] :is(.top, .bottom) {
    y: 50;
  }

  .hamburger[aria-expanded="true"] .top {
    rotate: 45deg;
  }

  .hamburger[aria-expanded="true"] .middle {
    opacity: 0;
  }

  .hamburger[aria-expanded="true"] .bottom {
    rotate: -45deg;
  }

</style>