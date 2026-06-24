<template>
  <div class="login-layout">
    <SignIn />
    <TheRegistration />
  </div>
</template>

<script setup lang="ts">
import SignIn from '@/components/auth/SignIn.vue';
import TheRegistration from '@/components/auth/TheRegistration.vue';
</script>

<style scoped>
.login-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3rem;
}
@media (min-width: 60rem) {
  .login-layout {
    flex-direction: row;
    gap: 5rem;
  }
}
</style>
