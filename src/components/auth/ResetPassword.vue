<template>
  <form class="flex flex-column">
    <h4 class="my-4">Enter your new password</h4>
    <div class="">
      <input type="password" class="form-control" id="loginpassword" v-model="loginPassword" />
    </div>
    <div class="my-4">
      <BaseButton @click.prevent="changePassword">Change Password</BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const loginPassword = ref('');

function changePassword() {
  console.log(loginPassword.value);
}
</script>

<!-- TODO: Bootstrap update form -->
