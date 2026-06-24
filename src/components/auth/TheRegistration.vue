<template>
  <div class="login-container">
    <h2 class="text-center">Create Account</h2>
    <form @submit.prevent>
      <div>
        <Label for="registerEmail">Email</Label>
        <Input type="email" id="registerEmail" v-model="registrationForm.email" required />
      </div>
      <div>
        <Label for="registerPassword">Password</Label>
        <Input type="password" id="registerPassword" v-model="registrationForm.password" required />
      </div>
      <div>
        <Label for="registerFirstName">First Name</Label>
        <Input type="text" id="registerFirstName" v-model="registrationForm.firstName" required />
      </div>
      <div>
        <Label for="registerLastName">Last Name</Label>
        <Input type="text" id="registerLastName" v-model="registrationForm.lastName" required />
      </div>
      <div class="action-container">
        <BaseButton @click.prevent="register">Register</BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useUserStore } from '@/stores/users';
import { router } from '@/router/index';
import { toast } from 'vue3-toastify';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const userStore = useUserStore();

const registrationForm = reactive({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
});

const register = async () => {
  if (!registrationForm.email || !registrationForm.password || !registrationForm.firstName || !registrationForm.lastName) {
    toast.error('Please check your inputs!');
    return;
  }
  try {
    const userResponse = await userStore.createAccount(registrationForm.email, registrationForm.password);
    if (!userResponse) {
      toast.error('Error during registration, please make sure your password is at least 8 characters');
      return;
    }
    const profileResponse = await userStore.setUserProfile({
      name: { firstName: registrationForm.firstName, lastName: registrationForm.lastName },
      contactInformation: { email: registrationForm.email },
    });
    if (!profileResponse) {
      toast.error('Error during registration, please review inputs');
      return;
    }
    router.push('/products').then(() => {
      toast.success('Welcome!');
    });
    return;
  } catch (error) {
    console.log(error);
  }
  toast.error('Error during registration');
};
</script>

<style scoped lang="scss">
h2 {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
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
