<template>
  <article class="card" :class="applyBg">
    <figure>
      <router-link :to="link">
        <img :src="cardImageUrl" :class="cardImageUrl == placeholderUrl ? 'placeholderImage' : 'cardImage'" :alt="`An image of ${name}`" />
      </router-link>
    </figure>
    <div class="card-details background-color" ref="card">
      <header class="card-title">
        <h5 class="card-name" @click="$router.push(link)">{{ name }}</h5>
      </header>
      <footer class="card-footer">
        <div class="price">
          {{ formattedPrice }}
        </div>
        <BaseButton type="primary" size="normal" @click="$router.push(link)">View Details</BaseButton>
      </footer>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getPhotoUrl, placeholderUrl } from '@/composables/usePhotoUtils';
import { useIntersectionObserver, useWindowSize } from '@vueuse/core';

const props = defineProps<{
  name: string;
  price: number | string;
  link: string;
  photoUrl: string | undefined | null;
  index: number;
}>();
const cardImageUrl = computed(() => {
  return getPhotoUrl(props.photoUrl ?? null);
});
const formattedPrice = computed(() => {
  if (typeof props.price === 'number') {
    return props.price > 0 ? USDollar.format(props.price) : '-';
  } else {
    return props.price || '-';
  }
});
const { width } = useWindowSize();
const applyBg = computed(() => {
  if (width.value > 450) return '';
  if (cardIsVisible.value) return 'position-0';
});
const card = ref();
const cardIsVisible = ref(false);
const { stop } = useIntersectionObserver(card, ([entry], observerElement) => {
  cardIsVisible.value = entry?.isIntersecting || false;
});

//TODO: Move USDollar to composables
const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

const gradientColor = computed(() => {
  const remainder = props.index % 6;
  const plusOne = remainder + 1;
  // if(props.index === 0) return '#80d80e'
  if (plusOne % 6 === 0) return '#20eacc';
  if (plusOne % 5 === 0) return '#aa93fc';
  if (plusOne % 4 === 0) return '#ff6949';
  if (plusOne % 3 === 0) return '#006b90';
  if (plusOne % 2 === 0) return '#FFBF46';
  return '#80d80e';
});
</script>

<style scoped lang="scss">
.card {
  display: flex;
  flex-direction: column;
  border-radius: 2em;
  overflow: hidden;
  justify-content: space-between;
  // filter: brightness(105%);
  box-shadow: 0px -1px 8px 2px $bg-contrast;
}

figure:hover,
.card:hover,
.card-details:hover {
  .background-color {
    background-position: 0 0;
  }
}

.position-0 {
  .background-color {
    background-position: 0 0;
  }
}

.background-color {
  background: inherit;
  background-image: linear-gradient(to right, v-bind(gradientColor), $light-cream);
  transition: background-position 2.5s;
  background-size: 300% 100%;
  background-position: 100% 0;
}

img {
  display: block;
  height: 100%;
  width: 100%;
  object-fit: cover;
  aspect-ratio: 1 / 1;
}

h5 {
  font-size: 1.2rem;
  text-align: center;
  align-content: center;
  padding-inline: 1.5rem;
}

.placeholderImage {
  box-sizing: border-box;
  padding-top: 1rem;
  margin: auto;
  object-fit: cover;
  object-position: center;
  align-items: center;

  img {
    text-align: center;
    margin: auto auto;
  }
}

.card-title {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 0.5rem 0.2rem;
  cursor: pointer;
}

.card-name {
  line-height: 1.2em;
  height: 3.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
}

.price {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
}

.card-footer {
  display: flex;
  flex-direction: row;
  padding-inline: 1rem;
  padding-bottom: 1rem;
  overflow: hidden;
  display: flex;
  justify-content: space-around;
}

@media (min-width: 35rem) {
  .background-color {
    background-image: linear-gradient(to right, v-bind(gradientColor), v-bind(gradientColor), $light-cream 75%);
    transition: background-position 1.3s;
  }
}

@media (prefers-reduced-motion) {
  .background-color {
    transition: none;
  }
}
</style>
