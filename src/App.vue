<template>
  <div class="app">
    <div class="main">
      <the-header />
      <router-view class="router" />
    </div>
  </div>
</template>

<script>
import TheHeader from './components/TheHeader.vue';

export default {
  components: { TheHeader },
};

// Using a class on body to determine how to style focus states
document.body.addEventListener('mousedown', function () {
  document.body.classList.add('using-mouse');
});
document.body.addEventListener('keydown', function () {
  document.body.classList.remove('using-mouse');
});
</script>

<style lang="scss">
.app {
  display: flex;
}

.main {
  flex-grow: 1;
}

.router {
  min-height: calc(100vh - 5rem);
  padding-bottom: 4rem;
}
</style>
