<template>
  <article class="guide-card">
    <section class="text-section" :class="altStyle ? 'alt-style' : ''">
      <header class="article-header">
        <h2>{{ careData.label }} Care</h2>
      </header>
      <ul class="care-guide">
        <li v-for="item in careItems" :key="item.label" class="text-item" :class="altStyle ? 'space-between' : ''">
          <div class="icon-with-label" :class="altStyle ? 'alt-style' : ''">
            <img :src="item.iconUrl" :alt="item.iconAltText" class="icon" :class="item.class" :title="item.label" />
            <span class="icon-label">{{ item.label }}</span>
          </div>
          <p>
            {{ item.textContent }}
          </p>
        </li>
      </ul>
    </section>
    <section class="image-section" :class="altStyle ? 'order-two' : ''">
      <img :src="sectionImageUrl" :alt="'an image of ' + careData.label" />
    </section>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { getPhotoUrl } from '@/composables/usePhotoUtils';
const props = defineProps(['careData', 'altStyle']);

const sectionImageUrl = computed(() => {
  return getPhotoUrl(props.careData.referencePhotoPath, null);
});
import globeIcon from '@/assets/icons/globe-icon.svg?url';
import waterIcon from '@/assets/icons/water-icon.svg?url';
import humidityIcon from '@/assets/icons/humidity-icon.svg?url';
import lightIcon from '@/assets/icons/sun-icon.svg?url';
import mediaIcon from '@/assets/icons/media-icon.svg?url';
import tempIcon from '@/assets/icons/temperature-icon.svg?url';
import foodIcon from '@/assets/icons/insect-icon.svg?url';
const careItems = [
  {
    label: 'Locale',
    iconUrl: globeIcon,
    iconAltText: 'globe icon',
    textContent: props.careData.locale,
    class: 'globe-icon',
  },
  {
    label: 'Water',
    iconUrl: waterIcon,
    iconAltText: 'water icon',
    textContent: props.careData.water,
    class: 'water-icon',
  },
  {
    label: 'Humidity',
    iconUrl: humidityIcon,
    iconAltText: 'humidity icon',
    textContent: props.careData.humidity,
    class: 'humidity-icon',
  },
  {
    label: 'Light',
    iconUrl: lightIcon,
    iconAltText: 'light icon',
    textContent: props.careData.light,
    class: 'light-icon',
  },
  {
    label: 'Media',
    iconUrl: mediaIcon,
    iconAltText: 'media icon',
    textContent: props.careData.media,
    class: 'media-icon',
  },
  {
    label: 'Temp',
    iconUrl: tempIcon,
    iconAltText: 'temperature icon',
    textContent: props.careData.temperature,
    class: 'temperature-icon',
  },
  {
    label: 'Food',
    iconUrl: foodIcon,
    iconAltText: 'insect icon',
    textContent: props.careData.fertilization,
    class: 'fertilization-icon',
  },
];
</script>

<style scoped>
h2 {
  font-size: 1.5rem;
}
p,
ul {
  text-align: justify;
  text-justify: inter-word;
  margin: 0.25em 0.37em;
  padding: 0;
}

.guide-card {
  display: flex;
  flex-direction: column;
  /* flex-wrap: nowrap; */
  /* background-color: rgb(46, 46, 46); */
  border-radius: 1.5rem;
  overflow: hidden;
  padding: 0;
  justify-content: space-around;
  margin: 2em 0;
}

.alt-style {
  order: 2;
}

.icon {
  width: 3rem;
  height: 3rem;
  display: inline-flex;
  align-self: center;
  margin: 0;
}

.water-icon {
  filter: invert(45%) sepia(97%) saturate(759%) hue-rotate(191deg) brightness(94%) contrast(95%);
}

.humidity-icon {
  filter: invert(81%) sepia(12%) saturate(1026%) hue-rotate(167deg) brightness(100%) contrast(98%);
}

.icon-with-label {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  display: flex;
}

.icon-label {
  font-size: 0.75em;
  justify-content: center;
  padding: 0;
  margin-bottom: 0.1em;
  display: flex;
  /* color: rgb(216, 227, 196); */
}

.text-item {
  flex-direction: row;
  display: flex;
  margin: 0.7em 0;
  list-style-type: none;
}
.space-between {
  justify-content: space-between;
}

.image-section {
  display: block;
  justify-content: center;
}

.image-section img {
  width: 100%;
  max-height: 30rem;
  padding: 0;
  object-fit: cover;
  justify-content: flex-end;
}

.text-section {
  display: flex;
  flex-direction: column;
  padding: 0.5em 0.5em;
  line-height: 1.4;
  order: 1;
}

.care-guide {
  display: flex;
  flex-direction: column;
}

.care-guide p {
  display: flex;
  align-items: center;
  padding: 0px 0.25em;
}

.care-guide ul {
  list-style: none;
  /* padding-inline-start: 0; */
  margin: 4px 30px;
}

.care-guide li {
  padding: 0.1em 0px;
}

.text-plus-list {
  display: flex;
  flex-direction: column;
}

.article-header {
  display: flex;
  justify-content: center;
}

@media (min-width: 1150px) {
  .order-one {
    order: 1;
  }
  .order-two {
    order: 2;
  }
  .container-alt .text-section {
    order: 2 important!;
  }

  .text-section {
    flex: 2;
  }

  .image-section {
    display: flex;
    margin: 0;
    justify-content: flex-end;
  }

  .image-section img {
    flex: 1;
    margin: 0;
    padding: 0;
    flex-basis: 15em;
    width: 35rem;
    max-height: 100%;
  }

  .icon {
    width: 3em;
    height: 3em;
  }
  .guide-card {
    flex-direction: row;
  }
}
</style>
