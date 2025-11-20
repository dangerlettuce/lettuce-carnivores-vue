<template>
  <div class="container">
    <form>
      <div>
        <label v-if="surveyData.great === true" for="additional-comments" >Thanks for letting us know how your order went! Please share any additional comments below.</label>
        <label v-if="surveyData.great === false" for="additional-comments" >We're sorry your order didn't meet your expectations.  Please let us know what we can do better. </label>
        <textarea id="additional-comments" rows="6" v-model="surveyData.additionalComments" @change="() => {isSaved = false;}"></textarea>
      </div>
      <BaseButton @click.prevent="saveFeedback(surveyData, true)">Save</BaseButton>
    </form>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, type Ref, onBeforeUnmount, type MaybeRef, unref } from 'vue';
import { saveItem } from '@/apis/dataServices'
import { toast } from 'vue3-toastify';
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/users';

const userStore = useUserStore();
const isSaved = ref(false);

type OrderFeedback = {
  id: string,
  email: string | null,
  orderId: string,
  great: boolean | null,
  additionalComments: string | null,
}

const surveyData: Ref<OrderFeedback> = ref({
  id: '',
  email: '',
  orderId: '',
  great: null,
  additionalComments: '',
})
onMounted(async() => {
  if(!userStore.isLoggedInOrAnonymous) {
    await userStore.loginAnonymously()
  }
  await setDataFromRouteParams();
  await saveFeedback(surveyData.value);
})

onBeforeUnmount(() => {
  if(isSaved.value === false) {
    saveFeedback(surveyData.value)
  }
})

async function saveFeedback(formData: MaybeRef<OrderFeedback>, showToast: boolean = false) {
  const data = unref(formData)
  if (!data || data.great === null) {
    console.error('Invalid data, wont save');
    return;
  }
  await saveItem('orderFeedback', {...data, savedTimestamp: Date.now()});
  if (showToast) {
    toast.success('Thanks for your feedback!');
  }
  isSaved.value = true;
}

async function setDataFromRouteParams() {
  const route = useRoute();
  const query = route.query
  surveyData.value.orderId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  if ('email' in query) {
    surveyData.value.email = Array.isArray(query.email) ? query.email[0] : query.email;
  }
  surveyData.value.id = `${surveyData.value.orderId} - ${surveyData.value.email !== null ? surveyData.value.email : Date.now()}`
  surveyData.value.great = route.path.includes('/great');
}
</script>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: clamp(40rem, 40dvw, 80rem);
}
  form {
    label {
      display: block;
      text-align: left;
      margin-block: .5rem;
    }
  }
  textarea {
    min-width: 100%;
    border-radius: .5rem;
    padding: .5rem;
  }
</style>