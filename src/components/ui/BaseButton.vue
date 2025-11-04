<template>
    <button :class="[type, size, type === 'close' ? '' : 'base-button']"><slot></slot><span v-if="isLoading" class="spinner-border"></span></button>
</template>

<script setup lang="ts">
const props = defineProps({
    type: {
        type: String,
        default: 'primary'
    },
    isLoading: {
        type: Boolean,
        required: false,
    },
    size: {
        type: String,
        default: 'normal'
    }
})


</script>

<style scoped lang="scss">
    .base-button {
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 0 4px rgb(35, 59, 59);
        height: fit-content
    }
    .base-button:hover {
        filter: brightness(105%);
    }
    .base-button:active {
        box-shadow: inset 0px 0px 0px #c1c1c1;
        outline: none;
    }
    .base-button:disabled {
        filter: brightness(75%);
        cursor:not-allowed;
    }
    .spinner-border {
        height: 1rem;
        width: 1rem;
        margin-left: 1rem;
    }

    .primary {
        background-color: $primary;
        color: black;
        border: none;
    }
    .info {
        background-color: #00A0E5;
        color: white;
        border: none;
    }
    .secondary {
        background-color: gray;
        color: black;
        border: none;
    }
    .warning {
        background-color: #FFBF46;
        color: black;
        border: none;
    } 
    .danger {
        background-color: $medium-red;
        color: white;
        border: 0;
    }
    .primary-outline {
        border: 1px solid #9fdb50;
        color: #9fdb50;
        background-color: transparent;
    }
    .primary-outline:hover {
        border: 1px solid #9fdb50;
        background-color: #9fdb50;
        color: black;
    }
    .secondary-outline {
        border: 1px solid gray;
        color: inherit;
        background-color: transparent;
    }
    .secondary-outline:hover {
        border: 1px solid gray;
        background-color: inherit;
        color: inherit;
    }
    .checkout {
        background: linear-gradient(0.15turn,#FFBF46, #fccb72, #FFBF46);
        color: black;
    }
    .close {
        position: absolute;

        opacity: 0.3;
        border: none;
        background-color: transparent;

    }

    .close:hover {
        opacity: 1;
    }
    .close:before, .close:after {
        position: absolute;
        content: ' ';
        height: 2rem;
        width: 6px;
        background-color: #333;
    }
    .close:before {
        transform: rotate(45deg);
    }
    .close:after {
        transform: rotate(-45deg);
    }
    .trick {
        background: linear-gradient(0.15turn,#BFDA7A, #5E32BA);
        color: white;
    }

    .treat {
        background: linear-gradient(0.0turn,#ffffff, #EB6123, #F5CD08 );
        color: white;
    }

    .small {
        font-size: .875rem;
        padding: .25rem .5rem;
        border-radius: .2rem;
    }

    .normal {
        font-size: 1rem;
        padding: .5rem;
        border-radius: .5rem;
    }

    .large {
        font-size: 1.25rem;
        padding: .5rem 1.5rem;
        border-radius: .5rem;
    }

</style>
