<template>
  <form @submit.prevent v-if="!hasEmailBeenSent">
    <h4 class="">Enter your email</h4>
    <p>If the email matches a registered account, you will receive an email in a minute or two.</p>
    <Input type="email" class="form-input" placeholder="email" id="loginEmail" v-model="loginEmail" />
    <div class="my-4">
      <BaseButton @click.prevent="resetPassword">Reset Password</BaseButton>
    </div>
  </form>
  <div v-else>
    <p>Reset email has been sent. Please follow the instructions in that email.</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/users';
import { toast } from 'vue3-toastify';
import { Input } from '@/components/ui/input';
const userStore = useUserStore();
const loginEmail = ref('');
const hasEmailBeenSent = ref(false);

async function resetPassword() {
  const res = await userStore.requestPasswordReset(loginEmail.value);
  if (res && res.success) {
    hasEmailBeenSent.value = true;
    toast.success('Reset Email Sent!');
  } else {
    toast.error('Sorry, something went wrong. Please try again');
    hasEmailBeenSent.value = false;
  }
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.form-input {
  margin-block: 1rem;
  max-width: 30rem;
}
</style>
