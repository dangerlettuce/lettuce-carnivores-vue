<template>
    <div v-if="showBanner" class="banner" :class="bannerStyle">
      <router-link v-if="bannerDetails?.link" :to="bannerDetails.link">{{ bannerDetails.message }}</router-link>
      <p v-else>{{bannerDetails?.message}}</p>
  </div>
</template>

<script setup lang="ts">
  import { useBannerMessage } from '@/composables/useBannerMessage';

  const { bannerDetails, showBanner, getBannerDetails } = useBannerMessage();

  await getBannerDetails();
  
  const bannerStyle = bannerDetails.value?.style ?? 'default'
</script>

<style scoped lang='scss'>
    .banner {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 2.5rem;
      width: 100%;
      border-radius: .4rem;
  }

  .default {
    color: black;
    background-color: $accent-orange;
  }

  .warning {
    color: black;
    background-color: $medium-red;
  }

  .info {
    color: white;
    background-color: $info;
  }

  .sale {
    color: black;
    background-color: $accent-orange;
  }
</style>