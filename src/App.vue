<template>
  <div class="page-container">
    <TheHeader />
    <main>
      <RouterView />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import TheHeader from '@/components/header/TheHeader.vue';
import TheFooter from '@/components/TheFooter.vue';
</script>

<style lang="scss">
  @use '@/assets/scss/main.scss';
  a {
      text-decoration: none;
  }

  li {
    list-style: none;
  }

  main {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    padding-inline: 2dvw;
    width: 100%;
    flex: 1;
    align-items: flex-start;
  }

  .page-container {
    margin: auto;
    width: 98dvw;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  @media(min-width: 425px) {
    .page-container  {
      width: 90dvw;
    }
  }

</style>
