<template>
  <div class="letter-card">
    <span class="letter"><slot></slot></span>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lacquer&display=swap');

.letter-card {
  background-color: rgb(129, 180, 53);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem;
  height: 4rem;
  width: 4rem;
}
.letter {
  color: #ece2a4;
  font-family: 'Lacquer', system-ui;
  font-weight: 400;
  font-style: normal;
  vertical-align: middle;
  margin: 0;
  font-size: 2.5rem;
}

@media (min-width: 80rem) {
  .letter-card {
    height: 7rem;
    width: 7rem;
    border-radius: 0.5rem;
  }
  .letter {
    font-size: 5rem;
  }
}

/* @import url('https://fonts.googleapis.com/css2?family=Eater&display=swap');
    .eater-regular {
    font-family: "Eater", serif;
    font-weight: 400;
    font-style: normal;
    } */
</style>
