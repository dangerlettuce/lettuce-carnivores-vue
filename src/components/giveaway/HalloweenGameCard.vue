<template>
  <div class="game-card">
    <component v-if="dynamicComponent !== undefined" :is="dynamicComponent" :class="dynamicComponentClass"
      title="You found me!" />
    <Transition>
      <div class="action-container">
        <BaseButton type="trick" size="large" @pointerdown="onGameButtonPointerDown" @click="trick">Trick</BaseButton>
        <BaseButton type="treat" size="large" @pointerdown="onGameButtonPointerDown" @click="treat"
          :class="hideTreatButton ? 'fall-off-screen' : ''">Treat
        </BaseButton>
      </div>
    </Transition>
  </div>

  <Teleport to="body">
    <Transition>
      <div v-show="showGhost" @click="dismissGhost">
        <div class="ghost-card">
          <div class="ghost-icon-container">
            <GhostIcon class="ghost-icon" />
          </div>

          <div class="message-container">
            <div class="ghost-message">{{ ghostMessage }}</div>
            <h4></h4>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  <Teleport to="body">
    <Transition>
      <div v-show="showBlackout" class="blackout">
        <div class="flashlight"></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, shallowRef, onMounted, defineAsyncComponent } from 'vue';
  const BatIcon = defineAsyncComponent(() => import('@/assets/icons/halloween/BatIcon.vue'));
  const CandySuckerIcon = defineAsyncComponent(() => import('@/assets/icons/halloween/CandySuckerIcon.vue'));
  const CandyWrappedIcon = defineAsyncComponent(() => import('@/assets/icons/halloween/CandyWrappedIcon.vue'));
  const CauldronIcon = defineAsyncComponent(() => import('@/assets/icons/halloween/CauldronIcon.vue'));
  const GravestoneIcon = defineAsyncComponent(() => import('@/assets/icons/halloween/GravestoneIcon.vue'));
  const PumpkinIcon = defineAsyncComponent(() => import('@/assets/icons/halloween/PumpkinIcon.vue'));
  const SpiderwebIcon = defineAsyncComponent(() => import('@/assets/icons/halloween/SpiderwebIcon.vue'));
  const SpookyTreeIcon = defineAsyncComponent(() => import('@/assets/icons/halloween/SpookyTreeIcon.vue'));
  const VampireIcon = defineAsyncComponent(() => import('@/assets/icons/halloween/VampireIcon.vue'));
  const WitchIcon = defineAsyncComponent(() => import('@/assets/icons/halloween/WitchIcon.vue'));

  import GhostIcon from '@/assets/icons/halloween/GhostIcon.vue';
  import { useHalloweenGame } from './useHalloweenGame';
  import './halloweenTricks.css';

  const { showGhost, showBlackout, hideTreatButton, ghostMessage, trick, treat, onGameButtonPointerDown, dismissGhost, initializeGame } = useHalloweenGame();

  onMounted(async () => {
    await initializeGame();
    const random = Math.floor(Math.random() * 10) + 1;
    switch (random) {
      case 1:
        dynamicComponent.value = BatIcon;
        dynamicComponentClass.value = 'black-icon';
        break;
      case 2:
        dynamicComponent.value = CandySuckerIcon;
        break;
      case 3:
        dynamicComponent.value = CandyWrappedIcon;
        break;
      case 4:
        dynamicComponent.value = CauldronIcon;
        break;
      case 5:
        dynamicComponent.value = GravestoneIcon;
        break;
      case 6:
        dynamicComponent.value = SpiderwebIcon;
        break;
      case 7:
        dynamicComponent.value = SpookyTreeIcon;
        dynamicComponentClass.value = 'black-font';
        break;
      case 8:
        dynamicComponent.value = VampireIcon;
        break;
      case 9:
        dynamicComponent.value = WitchIcon;
        break;
      default:
        dynamicComponent.value = PumpkinIcon;
        dynamicComponentClass.value = '';
    }
  });
  const dynamicComponent = shallowRef();
  const dynamicComponentClass = ref('');
</script>

<style>
  .game-card {
    width: 20rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .action-container {
    margin-top: 1rem;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
  }

  .ghost-card {
    z-index: 9995;
    position: fixed;
    left: 50dvw;
    transform: translate(-50%, -50%);
    top: 50dvh;
    margin-inline: auto;
    width: fit-content;
    border-radius: 2rem;
    border: 0.5rem solid #f4f1dc;
    background-color: black;
    color: #f4f1dc;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .black-font {
    color: black;
  }

  .black-icon {
    filter: brightness(0) saturate(100%) invert(0%) sepia(100%) saturate(7459%) hue-rotate(59deg) brightness(89%) contrast(111%);
  }

  .ghost-icon {
    display: flex;
    filter: brightness(0) saturate(100%) invert(87%) sepia(31%) saturate(146%) hue-rotate(348deg) brightness(108%) contrast(91%);
    width: 100%;
    height: 100%;
    padding: 1rem;
  }

  .message-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    width: 18rem;
  }

  .ghost-message {
    text-align: center;
    font-size: 1.3rem;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.7s ease-in-out;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }

  @media (min-width: 80rem) {
    .ghost-card {
      flex-direction: row;
    }

    .ghost-icon {
      padding: 2rem;
    }

    .message-container {
      padding: 2rem 3rem 2rem 0;
      min-width: 30rem;
    }

    .ghost-message {
      font-size: 2rem;
    }
  }
</style>
