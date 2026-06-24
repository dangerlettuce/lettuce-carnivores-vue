<template>
  <div class="embla">
    <div class="embla__viewport" ref="emblaRef">
      <div class="embla__container">
        <div v-for="(photo, index) in photos" :key="photo.path" class="embla__slide">
          <img class="display-image" :src="getPhotoUrl(photo.path, 960)" />
        </div>
      </div>
    </div>

    <div class="embla-thumbs">
      <button class="arrow-button" @click="back">
        <ArrowLeft />
      </button>
      <div class="embla-thumbs__viewport" ref="emblaThumbsRef">
        <div class="embla-thumbs__container">
          <div
            v-for="(photo, index) in photos"
            :key="`${photo.path}-thumb`"
            class="embla-thumbs__slide"
            :class="index === selectedIndex ? 'embla-thumbs__slide--selected' : ''"
          >
            <button type="button" class="embla-thumbs__slide__button" @click="scrollTo(index)">
              <img class="thumb-image" :src="getPhotoUrl(photo.path, 256)" />
            </button>
          </div>
        </div>
      </div>
      <button class="arrow-button" @click="next">
        <ArrowRight />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { PhotoItem } from '@/types/Product';
import emblaCarouselVue from 'embla-carousel-vue';
import { getPhotoUrl } from '@/composables/usePhotoUtils';
import ArrowLeft from '@/assets/icons/ArrowLeft.vue';
import ArrowRight from '@/assets/icons/ArrowRight.vue';
const props = defineProps<{ photos: Array<PhotoItem> }>();
const [emblaRef, emblaApi] = emblaCarouselVue({ loop: true });
const [emblaThumbsRef, emblaThumbsApi] = emblaCarouselVue({ containScroll: 'keepSnaps', dragFree: true });
const selectedIndex = ref(0);

onMounted(() => {
  if (emblaApi.value) {
    emblaApi.value.on('select', () => {
      const selected = emblaApi.value!.selectedScrollSnap();
      selectedIndex.value = selected;
      emblaThumbsApi.value?.scrollTo(selected);
    });
  }
});
watch(
  () => props.photos,
  () => {
    scrollTo(0, true);
  },
);
function scrollTo(index: number, jump: boolean = false) {
  emblaApi.value!.scrollTo(index);
  emblaThumbsApi.value?.scrollTo(index);
  selectedIndex.value = index;
}
function back() {
  emblaApi.value?.scrollPrev();
  emblaThumbsApi.value?.scrollTo(emblaApi.value!.selectedScrollSnap());
  selectedIndex.value = emblaApi.value!.selectedScrollSnap();
}
function next() {
  emblaApi.value!.scrollNext();
  emblaThumbsApi.value?.scrollTo(emblaApi.value!.selectedScrollSnap());
  selectedIndex.value = emblaApi.value!.selectedScrollSnap();
}
</script>

<style scoped lang="scss">
.arrow-button {
  padding: 0.4rem;
  display: flex;
  align-items: center;
}

.embla {
  margin: auto;
  --slide-spacing: 1rem;
  --slide-size: 100%;
}

.embla__viewport {
  overflow: hidden;
  width: 100%;
  box-shadow: 0px -1px 10px 3px $bg-contrast;
  border-radius: 1.8rem;
}

.embla__container {
  display: flex;
  align-items: flex-start;
  touch-action: pan-y pinch-zoom;
  margin-left: calc(var(--slide-spacing) * -1);
}

.embla__slide {
  transform: translate3d(0, 0, 0);
  padding-left: var(--slide-spacing);
  flex: 0 0 100%;
  // min-width: 0;
  // height: 100dvw;
  max-height: 90dvw;
}

.display-image {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 1.8rem;
  object-fit: cover;
  box-shadow: 0px 5px 4px 2px $light-gray;
  aspect-ratio: 1/1;
}

.embla-thumbs {
  --thumbs-slide-spacing: 0.5rem;
  --thumbs-slide-height: 6rem;
  margin-top: var(--thumbs-slide-spacing);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
}

.embla-thumbs__viewport {
  overflow: hidden;
}

.embla-thumbs__container {
  display: flex;
  flex-direction: row;
  margin-left: calc(var(--thumbs-slide-spacing) * -1);
}

.embla-thumbs__slide {
  flex: 0 0 22%;
  min-width: 0;
  padding-left: var(--thumbs-slide-spacing);
  opacity: 45%;
  transition: opacity 1s;
  max-height: 10dvh;
}

.thumb-image {
  border-radius: 0.5rem;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 1/1;
}

.embla-thumbs__slide:hover {
  opacity: 80%;
}

.embla-thumbs__slide--selected {
  opacity: 100% !important;
}

@media (min-width: 50rem) {
  .embla-thumbs {
    --thumbs-slide-spacing: 0.8rem;
    --thumbs-slide-height: 10rem;
    margin-top: var(--thumbs-slide-spacing);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
  }

  .arrow-button {
    padding: 2rem;
  }

  .embla__slide {
    max-height: 40rem;
  }
}

@media (min-width: 60rem) {
  .embla__slide {
    max-height: 40rem;
  }
}

@media (min-width: 80rem) {
  .embla__slide {
    max-height: 75dvh;
  }
}

@media (min-width: 100rem) {
  .embla__slide {
    max-height: 75dvh;
  }

  .display-image {
    object-fit: cover;
  }
}
</style>
