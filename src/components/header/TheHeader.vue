<template>
  <header class="w-full sticky top-0 z-50 bg-background">
    <div class="header-container">
      <Button class="hamburger-icon-container hover:bg-opacity-0" variant="ghost" @click="toggleMobileMenu">
        <HamburgerButton :isOpen />
      </Button>

      <div class="logo">
        <h1 class="logo-text"><router-link to="/">Danger Lettuce</router-link></h1>
      </div>

      <div class="flex flex-row justify-end">

        <div class="flex flex-row align-center gap-4">
          <router-link to="/login" v-if="!userStore.isLoggedIn">
            <Button variant="default" @click="closeMobileMenu" class="loginButton">Login</Button>
          </router-link>
          <div class="right-container">
            <TheSearch class="header-search" />
            <div class="cart" @click="closeMobileMenu">
              <router-link to="/cart">
                <ShoppingCartIcon />
                <span
                  class="absolute -top-1 -right-2 translate-middle w-5 h-5 leading-normal rounded-full flex justify-center items-center rounded-full bg-red-600 text-white">{{ cartItemCount }}</span>
              </router-link>
            </div>
          </div>
        </div>
        <nav class="justify-start items-center gap-4">
          <Sheet v-model:open="isOpen">
            <SheetContent side="left" class="mobile-menu-sheet p-0 bg-primary border-none" @openAutoFocus.prevent>
              <div class="mobile-menu">
                <div class="mobile-menu-search">
                  <TheSearch @navigate="closeMobileMenu" />
                </div>
                <div v-for="item in allowedNavLinks" :key="item.name" class="mobile-nav-link">
                  <Button variant="ghost" class="p-6 text-xl">
                    <router-link :to="item.path" @click="closeMobileMenu">{{ item.label }}</router-link>
                  </Button>
                </div>
                <div>
                  <router-link to="/login" v-if="!userStore.isLoggedIn">
                    <Button variant="ghost" @click="closeMobileMenu" class="p-6 text-xl">Login</Button>
                  </router-link>
                  <Button v-else variant="outline" @click="handleLogout" class="p-6 text-xl">Logout</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang='ts'>
  import { type Ref } from 'vue'
  import {
    Sheet,
    SheetContent,
  } from "@/components/ui/sheet"
  import { Button } from '@/components/ui/button'
  import { computed } from 'vue';
  import { navData } from '@/router/index'
  import { useUserStore } from '@/stores/users';
  import { useOrderStore } from '@/stores/order';
  import HamburgerButton from './HamburgerButton.vue'
  import TheSearch from '@/components/search/TheSearch.vue';
  import ShoppingCartIcon from '@/assets/icons/ShoppingCartIcon.vue'
  import { storeToRefs } from 'pinia';

  const userStore = useUserStore()
  const { cartItemCount } = storeToRefs(useOrderStore())
  const allowedNavLinks = computed(() => {
    let allowedNavData = navData.filter((ele) => { return ele.meta.showInNav })
    if (!userStore.isFamily) {
      allowedNavData = allowedNavData.filter((ele) => { return !ele.meta.requiresFamily })
    }
    if (!userStore.isAdmin) {
      allowedNavData = allowedNavData.filter((ele) => { return !ele.meta.requiresAdmin })
    }
    if (!userStore.isLoggedIn) {
      allowedNavData = allowedNavData.filter((ele) => { return !ele.meta.requiresLogin })
    }
    return allowedNavData
  })
  const isOpen: Ref<boolean> = defineModel({ default: false })
  function toggleMobileMenu() {
    isOpen.value = !isOpen.value
  }
  function closeMobileMenu() {
    isOpen.value = false
  }
  function handleLogout() {
    userStore.logoutUser()
    isOpen.value = false
  }

</script>

<style scoped lang='scss'>
  header {
    width: 100%;
    padding-top: .5rem;
    min-height: 4rem;
  }

  .header-search {
    display: none;
  }

  .header-container {
    display: grid;
    grid-template-columns: 1fr 4fr 1fr;
    flex-direction: row;
    justify-content: space-between;
    border: 2px solid black;
    border-radius: 3rem;
    padding-block: .3rem;
    padding-inline: 1.25rem;
    margin: auto;
    align-items: center;
    background: $navbar-bg;
  }

  .logo {
    font-weight: bold;
    font-size: clamp(1.5rem, 2.5vw, 2.75rem);
    font-family: 'Carter One', cursive;
    color: $cream;

  }

  .logo-text {
    text-shadow: 3px 2px 1px $medium-red;
    // text-box: trim-both cap alphabetic;
    // color: transparent;
    // background-clip: text;
    // background-image: $navbar-bg;
  }

  .logo-link {
    text-decoration: none;
    cursor: pointer;
  }

  .right-container {
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }

  .nav-menu {
    display: none;
    flex-direction: row;
    justify-content: space-evenly;
  }

  .loginButton {
    display: none;
  }

  .mobile-menu {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  .mobile-menu-sheet {
    background-color: $primary;
  }

  .mobile-menu:first-child {
    margin-top: 2rem;
  }

  .mobile-menu>* {
    margin-block: .5rem;
  }

  .mobile-menu-search {
    margin: .5rem auto;
  }

  .mobile-nav-link {
    font-size: 1.5rem;
  }

  .hamburger-icon-container {
    display: block;
  }

  .shop-button {
    display: none;
  }

  .router-link-exact-active.nav-link {
    border-radius: 0.4rem;
    text-decoration-color: #9fdb50 !important;
    text-decoration: underline;
    text-underline-offset: .5rem;
    text-decoration-thickness: .3rem;
  }

  .cart {
    align-items: center;
    justify-content: center;
    transform: scale(.8);
  }

  @media(min-width: 400px) {
    .header-container {
      padding-block: .1rem;
      padding-inline: 1rem;
    }

    .logo {
      font-size: clamp(1.75rem, 3vw, 2.75rem);
    }
  }

  @media(min-width: 600px) {
    .header-container {
      padding-block: 0.1rem;
      padding-inline: 2.5rem;
      grid-template-columns: 1fr 2fr 1fr;
    }

    .logo-text {
      text-shadow: 4px 4px 1px $medium-red;
    }

    .cart {
      transform: scale(1.0);
    }
  }

  @media(min-width: 900px) {
    .header-search {
      display: block;
    }

    .mobile-menu-search {
      display: none;
    }
  }
</style>