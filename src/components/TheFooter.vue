<template>
  <footer>
    <router-link to="/about">About</router-link>
    <router-link to="/about">Privacy Policy</router-link>
    <router-link to="/about">Terms of Service</router-link>
  </footer>
</template>

<style scoped>
  footer {
    display: flex;
    justify-content: center;
    height: 0;
    margin: 2rem 0;
    gap: 1.5rem;
  }

  a {
    font-size: .75rem;
  }

  @media print {
    footer {
        display: none;
    }
  }
</style>
