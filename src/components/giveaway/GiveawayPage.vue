<template>
        <div v-if="!isGiveawayActive" class="giveaway-banner">
            {{ giveawayBannerMessage }}
        </div>
        <div v-else class="giveaway-container">

            <div class="giveaway-header">
                <div class="giveaway-body">
                    <h3>{{ giveawayDetails?.description }}</h3>
                    <p>{{ giveawayDetails?.prize }}</p>
                    <p>{{ giveawayDetails?.duration }}</p>
                    <p>{{ giveawayDetails?.summary }}</p>
                    <p>{{ giveawayDetails?.winnerAnnounced }}</p>
                    <div class="action-container margin-bottom">
                        <BaseButton type="info" @click.prevent="expandHelp">Need Help?</BaseButton>
                        <BaseButton type="info" @click.prevent="expandRules">*Rules</BaseButton>
                    </div>
                    <Transition>
                        <div v-show="showHelp">
                            <p>{{gameHelpLine1}} <span><BaseButton @click.prevent="" type='treat'>Treat</BaseButton></span> button on any of the 'View Details' pages.</p>
                            <p>{{gameHelpLine2}}</p>
                            <p v-if="isGameActive">Not interested in playing the game? <BaseButton size="small" @click="setBypassGame">Click here</BaseButton> to skip it and enter the contest</p>
                        </div>
                    </Transition>
                    <Transition>
                        <div v-show="showRules">
                            <p>{{`Valid in the United States only. The winner will be contacted via their selected contact method within 48 hours of the close of the contest and will need to respond within 31 calendar days with a valid U.S. shipping address. Failing to provide a valid contact method or eligible shipping address within 31 calendar days will void their claim to the prize. Odds are winning depend on the number of entries into the giveaway, with each entrant having one chance to win. Prize valued at $${giveawayDetails?.prizeValue?.toString()} but may not be exchanged for a cash prize. No purchase necessary, and neither purchase, nor completion of the game will increase odds of winning. Void where prohibited.`}}</p>
                        </div>
                    </Transition>
                </div>
                <Transition>
                    <GiveawayEntryForm v-show="isGameComplete || bypassGame" />
                </Transition>
            </div>
            <component :is="activeGame" class="game" />
        </div>


</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import HalloweenLetterGame from './HalloweenLetterGame.vue';
import GiveawayEntryForm from './GiveawayEntryForm.vue';
import { useGiveawayStore } from '@/stores/giveaway'
import { storeToRefs } from 'pinia'
    const activeGame = HalloweenLetterGame
    const gameHelpLine1 = `Go to the 'Shop' link in that navigation menu and click on any of the plants.  Then find the`
    const gameHelpLine2 = `Once you collect all the letters, come back to this page to submit your name for the contest`

    const {isGiveawayActive, isGiveawayLoading, giveawayDetails, isGameActive, isGameComplete, bypassGame} = storeToRefs(useGiveawayStore())
    const { newGame, fetchActiveGiveaway } = useGiveawayStore()
    const showHelp = ref(false)
    function expandHelp() {
        showHelp.value = !showHelp.value
    }
    const showRules = ref(false)
    function expandRules() {
        showRules.value = !showRules.value
    }
    function setBypassGame() {
        bypassGame.value = !bypassGame.value
        showHelp.value = false
    }
    const giveawayBannerMessage = computed(() => {
        if(isGiveawayLoading.value) {
            return 'Loading giveaway details...'
        }
        if(!isGiveawayLoading.value && !isGiveawayActive.value) {
            return 'Sorry, there is not an active giveaway at this time.  Please follow us on Instagram or Facebook to stay up to date with our latest sales and giveaways.'
        }
    })
onMounted( async()=> {
    await fetchActiveGiveaway()

    if(!isGameActive.value && !isGameComplete.value) {
        newGame()
    }
})
</script>

<style scoped>
    p {
        margin: .2rem 0;
    }
    h3 {
        margin: 0 0 .2rem 0;
    }
    .action-container {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        gap: 1rem;
    }
    .giveaway-banner {
        display: flex;
        justify-content: center;
        margin-inline: 4rem;
        margin-block: 4rem;
    }
    .giveaway-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin-bottom: 2rem;
    }
    .giveaway-body {
        align-items: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .giveaway-header {
        max-width: 90dvw;
        margin-inline: 5dvw;

        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
    .game {
        width: 85dvw;
        margin: 0 1rem;
    }
    .margin-bottom {
        margin-bottom: 1rem;
    }
    p {
        text-justify: newspaper;
        text-align: center;
    }
    .v-enter-active,
    .v-leave-active {
        transition: opacity .7s ease-in-out;
    }

    .v-enter-from,
    .v-leave-to {
        opacity: 0;
    }
    @media (min-width: 50rem) {
        .game {
            width: clamp(40rem, 50rem, 60rem);
        }
        .giveaway-header {
            width: clamp(30rem, 100%, 40rem);
        }
        .giveaway-container {
            flex-direction: row;
        }
    }



</style>
