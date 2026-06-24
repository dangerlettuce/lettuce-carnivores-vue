<template>
  <BaseContainer>
    <h2>Ebay sign in successful!</h2>
  </BaseContainer>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { handleEbayLogin } from '@/composables/useEbayUtils';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
const router = useRouter();
onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has('code') && urlParams.get('code') !== null) {
    const authCode = urlParams.get('code') as string;
    const res = await handleEbayLogin(authCode, urlParams.get('expires_in'));
    if (res) {
      toast.success('Handled ebay sign in');
      router.push('/plantAdmin');
    } else {
      toast.error('Error handling ebay signin', { autoClose: false });
    }
  }
});
</script>
