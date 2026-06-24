<template>
  <div class="sign-in-options">
    <button v-for="provider of signInOptions" @click="loginPopup(provider.value)" class="sign-in-button" :class="provider.class">
      <span class="provider-icon-span"> <GoogleIcon v-if="provider.icon !== undefined" class="provider-icon" /> </span
      ><span style="margin-left: 0.7rem">{{ provider.buttonLabel }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { GoogleAuthProvider, EmailAuthProvider, PhoneAuthProvider } from 'firebase/auth';
import { toast } from 'vue3-toastify';
import GoogleIcon from '@/assets/icons/GoogleIcon.vue';
export const googleAuthProvider = new GoogleAuthProvider();
// const facebookAuthProvider = new FacebookAuthProvider()
// facebookAuthProvider.addScope('public_profile')
// facebookAuthProvider.addScope('email')
// export {facebookAuthProvider}
export const emailAuthProvider = new EmailAuthProvider();
export const phoneAuthProvider = new PhoneAuthProvider(auth);
</script>

<script setup lang="ts">
import { auth } from '@/apis/firebase';
import { useUserStore } from '@/stores/users';
import { router } from '@/router/index';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
const signInOptions = [
  { value: 'Google', buttonLabel: 'Sign in with Google', icon: true, class: 'google-button' },
  // {value: 'Facebook', buttonLabel: 'Sign in with Facebook', icon: 'src/assets/icons/facebook.svg'},
  // {value: 'Email', buttonLabel: 'Sign in with Email', class: 'email-button'},
  // {value: 'Phone', buttonLabel: 'Sign in with Phone', class: 'phone-button'},
  // {value: 'Guest', buttonLabel: 'Continue as Guest', class: 'guest-button'}
];
async function loginPopup(provider: string) {
  let authProvider;
  let authOptions = undefined;
  switch (provider) {
    case 'Google':
      authProvider = googleAuthProvider;
      break;
    // case 'Facebook':
    //     authProvider = facebookAuthProvider
    //     break;
    case 'Email':
      authProvider = emailAuthProvider;
      authOptions = { recaptchaParameters: { size: 'invisible' } };
      break;
    case 'Phone':
      authProvider = phoneAuthProvider;
      authOptions = { recaptchaParameters: { size: 'invisible' } };
      break;
    default:
      authProvider = undefined;
  }

  if (authProvider !== undefined) {
    await signInWithPopup(auth, authProvider).catch((reason) => {
      console.error('Failed sign', reason);
      toast.error('Unable to sign in');
      return;
    });
    if (router.currentRoute.value.path === '/login') {
      router.push('/products').then(() => {
        toast.success('Welcome!');
      });
    }
  }
  if (authProvider === undefined) {
    useUserStore().loginAnonymously();
  }
}
</script>

<style scoped>
.sign-in-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 12.5rem;
  font-weight: 1.5;
}
.sign-in-button:active {
  box-shadow: 0 3px #666;
  transform: translateY(4px);
}
.sign-in-button {
  border-radius: 0.5rem;
  color: black;
  background-color: white;
  padding: 0.25rem 0;
  text-align: start;
}
.provider-icon-span {
  display: inline-block;
  width: 1.5rem;
  margin-left: 0.4rem;
}
.provider-icon {
  width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-self: center;
  margin: 0 0.25rem 0.08rem;
}
.google-button {
  border: 1px solid hsl(353, 76%, 4%);
}
.email-button {
  background-color: hsl(12, 86%, 53%);
  border: 1px solid hsl(353, 76%, 4%);
  color: white;
  font-weight: 1.5;
}
.phone-button {
  background-color: hsl(160, 86%, 53%);
  border: 1px solid hsl(353, 76%, 4%);
  color: rgb(14, 67, 52);
}
.guest-button {
  background-color: hsl(50, 96%, 55%);
  border: 1px solid hsl(353, 76%, 4%);
  color: rgb(14, 67, 52);
  font-weight: 1.5;
}
</style>
