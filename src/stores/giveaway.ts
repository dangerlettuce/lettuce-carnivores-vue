import { defineStore } from 'pinia'
import { useUserStore } from './users';
import { ref, type Ref } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { collection, getDocs, query, where} from 'firebase/firestore';
import type {Giveaway, GiveawayEntry, GiveawayFormData } from '@/types/Giveaway'
import { db } from '@/apis/firebase'
export const useGiveawayStore = defineStore('giveaway', () => {

    const userStore = useUserStore()
    const giveawayName = ref('')
    const entryStartTime = ref()
    const entryEndTime = ref()
    const isGameActive = ref(false)
    const isGameComplete = ref(false)
    const isEntered = ref(false)
    const hasBeenRickRolled = ref(false)
    const giveawayCollectionName = 'giveaways'

    //giveaway specifics
    const password = ref('')
    const myLetters: Ref<string[]> = ref([])
    const myBlanks: Ref<string[]> = ref([])
    const bypassGame = ref(false)
    const remainingLetters: Ref<string[]> = ref([])
    function newGame() {
        //reset old game, if it exists
        entryStartTime.value = new Date()
        isGameComplete.value = false
        remainingLetters.value.length = 0
        remainingLetters.value = password.value.toLowerCase().split("")
        myLetters.value.length = 0
        bypassGame.value = false
        hasBeenRickRolled.value = false

        //populate data for new game
        myBlanks.value = Array(password.value.length).fill('_')
        isGameActive.value = true


    }
    function addLetter() {
        if(remainingLetters.value.length === 0 || myBlanks.value.length === 0) { console.error('no remaining letters / blanks'); return }
        const newLetter = remainingLetters.value.shift()
        myLetters.value.push(newLetter!)
        myBlanks.value.pop()
        if(myBlanks.value.length === 0 || myLetters.value.length >= password.value.length) {checkAnswer()}
        return newLetter
    }

    function checkAnswer() {
        const myAnswer = myLetters.value.join('')
        const isCorrect = myAnswer.toLowerCase() === password.value.toLowerCase()
        if(!isCorrect) {
            return false
        } else {
            isGameComplete.value = true
            entryEndTime.value = new Date()
            return true
        }
    }
    const isSaving = ref(false)
    async function submitGiveawayEntry(entryData: GiveawayFormData) {
        isSaving.value = true
        if(!userStore.isLoggedInOrAnonymous) {
            await userStore.loginAnonymously()
        }
        const giveawayEntry: GiveawayEntry = {giveawayName: giveawayName.value, ...entryData, uid: userStore.user?.uid ?? '', entryStartTime: entryStartTime.value, entryEndTime: entryEndTime.value, bypassGame: bypassGame.value}
        const functions = getFunctions()
        const submitGiveawayEntryFunction: Function = httpsCallable(functions, 'giveawayService')
        const res = await submitGiveawayEntryFunction(giveawayEntry).catch((e: any) => {
            console.error(e)
            isSaving.value = false
            return {success: false, error: true, message: e.message, errorDetails: e}
        })
        isSaving.value = false
        return res.data
    }
    const isGiveawayLoading = ref(false)
    const isGiveawayActive = ref(false)
    async function fetchActiveGiveaway() {
        isGiveawayLoading.value = true
        if(giveawayDetails.value !== undefined) { return }
        const q = query(collection(db, giveawayCollectionName), where('active', '==', true))
        const querySnapshot = await getDocs(q)
        if(querySnapshot.docs.length > 1) {
            console.error('Multiple active giveaways, check db')
            isGiveawayLoading.value = false
            return
        }
        if(querySnapshot.docs.length === 0) {
            isGiveawayLoading.value = false
            return
        }
        setGiveawayData(querySnapshot.docs[0].data() as unknown as Giveaway)
        isGiveawayLoading.value = false
        isGiveawayActive.value = true
    }

    const giveawayDetails: Ref<Giveaway | undefined> = ref(undefined)
    function setGiveawayData(data: Giveaway) {
        giveawayDetails.value = {...data}
        isGiveawayActive.value = data.active
        giveawayName.value = data.name
        password.value = data.gameData.password

    }
    return {
        isGameActive,
        isGameComplete,
        bypassGame,
        newGame,
        myLetters,
        myBlanks,
        submitGiveawayEntry,
        addLetter,
        fetchActiveGiveaway,
        giveawayDetails,
        hasBeenRickRolled,
        isGiveawayLoading,
        isGiveawayActive
    }

})
