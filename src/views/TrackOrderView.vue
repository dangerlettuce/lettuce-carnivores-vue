<template>
  <div v-if="isError">Sorry, we were unable to find tracking for your package. Please contact support@dangerlettuce.com us if this issue persists.</div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue';
import { useRoute } from 'vue-router';

const isError = ref(false);
const trackingUrl: Ref<string | null> = ref(null);

onMounted(() => {
  parseDataFromRoute();
  if (isError.value === false && trackingUrl.value) {
    window.location.href = trackingUrl.value;
    return;
  }
  console.error('Unable to redirect to tracking url due to an error');
})

function parseDataFromRoute(){
  const route = useRoute();
  const query = route.query;
  let trackingNumber = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;

  let carrier: string | null = null;
  if ('carrier' in query) {
    carrier = Array.isArray(query.carrier) ? query.carrier[0] : query.carrier;;
  }
  if (!trackingNumber || !carrier ) {
    console.error(`invalid tracking ${trackingNumber} or carrier ${carrier}`)
    isError.value = true;
    return;
  }
  
  switch(carrier.toLocaleLowerCase()) {
    case 'ups':
      trackingUrl.value = `https://www.ups.com/track?TypeOfInquiryNumber=T&InquiryNumber1=${trackingNumber}`
      break;
    case 'usps':
      trackingUrl.value = `https://tools.usps.com/go/TrackConfirmAction_input?origTrackNum=${trackingNumber}`;
      break;
    case 'fedex':
      trackingUrl.value = `https://www.fedex.com/apps/fedextrack?trknbr=${trackingNumber}`;
      break;
    default:
      console.error(`Invalid carrier ${carrier}. Unable to generate email template`)
      isError.value = true;
      return null;
    }
  }

</script>