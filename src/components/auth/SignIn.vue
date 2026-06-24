<template>
  <div class="login-container">
    <h2 class="text-center">Login</h2>
    <form @submit.prevent>
      <div class="">
        <Label for="loginEmail">Email</Label>
        <Input type="email" class="" placeholder="" id="loginEmail" v-model="loginEmail" />
      </div>

      <div class="mt-3">
        <Label for="loginPassword">Password</Label>
        <Input type="password" class="" placeholder="" id="loginPassword" v-model="loginPassword" />
      </div>
      <div class="action-container">
        <div>
          <BaseButton type="info" @click.prevent="resetPassword">Trouble signing in?</BaseButton>
        </div>
        <div><BaseButton @click.prevent="login">Login</BaseButton></div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/users';
import { router } from '@/router/index';
import { toast } from 'vue3-toastify';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

//import ProviderLogin from '@/components/auth/ProviderLogin.vue';

const { loginWithGoogle, logInUser } = useUserStore();
const loginEmail = ref('');
const loginPassword = ref('');

async function login() {
  if (!areInputsValid()) {
    toast.error('Unable to login, please check username/password');
    return;
  }
  try {
    const loginSuccess = await logInUser(loginEmail.value, loginPassword.value);

    if (!loginSuccess) {
      toast.error('Login unsuccessful, please try again');
      return;
    }
    if (router.currentRoute.value.fullPath === '/login') {
      router.push('/products').then(() => {
        toast.success('Welcome!');
      });
    }
  } catch (error) {
    console.log(error);
    toast.error('Sorry, something went wrong');
  }
}

async function googleLogin() {
  await loginWithGoogle();
}

function resetPassword() {
  router.push('resetpassword');
}

function areInputsValid() {
  if (!loginEmail.value || loginEmail.value.length < 8 || !loginPassword.value || loginPassword.value.length < 8) {
    return false;
  }
  return true;
}
</script>

<style scoped lang="scss">
h2 {
  text-align: center;
  font-size: 1.5rem;
}

.login-container {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  border: 2px solid $bg-contrast;
  border-radius: 0.5rem;
}

.action-container {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
  margin-block: 1rem;
}

@media (min-width: 30rem) {
  .login-container {
    padding: 2rem 4rem;
  }
}
</style>
<!-- 
TODO Bootstrap: Fix form styles -->
