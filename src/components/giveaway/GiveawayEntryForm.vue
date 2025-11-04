<template>
    <div class="form-container">
        <h2 class="text-2xl font-bold mb-1 text-center">Enter Giveaway</h2>
        <FormKit
            type="form"
            :actions="false"
        >

            <FormKit
                type="text"
                name="name"
                label="Name"
                outer-class="mb-3"
                placeholder=""
                help="Please enter a name we can use in a public announcement if you win (you don't need to include your full real name)."
                validation="required"
                v-model="formData.name"
            />
            <h3 class="text-2xl font-bold mb-1 text-center">Contact Method</h3>
            <FormKit
                type="text"
                name="email"
                label="Email"
                outer-class="mb-3"
                validation="email|required"
                v-model="formData.email"
            />
            <FormKit 
                type="text"
                name="instagramUsername"
                label="Instagram Account Name  (Optional)"
                outer-class="mb-3"
                help="Please ensure your privacy settings allow message requests"
                v-model="formData.instagramUsername"
            />
            <FormKit 
                type="text"
                name="facebookUsername"
                label="Facebook Account Name (Optional)"
                outer-class="mb-3"
                v-model="formData.facebookUsername"
            />
            <p>The information provided will only be used to facilitate the giveaway.  This information will NEVER be used for marketing or sold/shared with any third parties.  Your information will be deleted within 60 days of the close of the giveaway.</p>
            <FormKit type="submit">
                <BaseButton @click="submitHandler" type='treat'>Submit Entry</BaseButton>
            </FormKit>
        </FormKit>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { toast } from 'vue3-toastify'
import { useGiveawayStore } from '@/stores/giveaway';
import { storeToRefs } from 'pinia'

const formData = ref({name: '', email: '', instagramUsername: '', facebookUsername: ''})
const { isGameComplete, isGameActive} = storeToRefs(useGiveawayStore())

async function submitHandler() {
    try {
        const res = await useGiveawayStore().submitGiveawayEntry(
            {
                displayName: formData.value.name,
                email: formData.value.email,
                instagram: formData.value.instagramUsername,
                facebook: formData.value.facebookUsername,
            }
        )
        if(res.success) {
            toast.success('Thanks for entering the giveaway!', {autoClose: 5000})
            isGameComplete.value = true
            isGameActive.value = false
        } else if (!res.errorDetails?.isDataValid) {
            toast.error(`Something went wrong: \n${res.message}. Please try again or contact support@dangerlettuce.com.`, {autoClose: false})
        } else if (!res.errorDetails?.isUniqueEntry) {
            toast.error(`This entry appears to be a duplicate. Please contact support@dangerlettuce.com if you believe this is not correct.`, {autoClose: false})
        } else {
            toast.error(`Something went wrong: \n${res.message}. Please try again or contact support@dangerlettuce.com.`, {autoClose: false})
        }
    } catch(e) {
        console.error(e)
        toast.error('Something went wrong, please try again or contact support@dangerlettuce.com.')
    }
}


</script>

<style scoped>
    .form-container {
        border: 2px solid salmon;
        border-radius: 2rem;
        padding: 1rem;
    }
    [data-invalid] * {
        border-color: salmon;

    }
    .formkit-message {
        color: salmon;
    }
    @media (min-width: 80rem) {
        .form-container {
            padding: 1.5rem;
        }
    }
</style>