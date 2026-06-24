<template>
  <div class="base-container">
    <slot></slot>
  </div>
</template>

<style scoped>
.base-container {
  padding: 0 clamp(0.1dvw, 2.5dvw, 10dvw);
  margin-top: 1.5rem;
}
</style>
