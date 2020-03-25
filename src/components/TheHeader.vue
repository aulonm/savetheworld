<template>
  <header class="header">
    <div class="container navbar">
      <router-link to="/" class="home-link">
        <img alt="Oslo kommune logo" src="../assets/logo.svg" />
      </router-link>
      <button class="button">
        Logg inn
        <font-awesome-icon icon="user-circle" />
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'TheHeader',
};
</script>

<style scoped lang="scss">
@import '../styles/_colors.scss';

.header {
  width: 100%;
  height: 5rem;
  background-color: white;
}

.navbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 100%;

  .home-link {
    display: inline-flex;
    align-self: center;
    height: 4rem;
  }
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 254px;
  max-width: 253px;
  min-height: 50px;
  padding: 15px;
  color: $osg-color-blue-dark;
  font-weight: 500;
  font-size: 18px;
  text-decoration: none;
  background: white;
  border: 2px solid $osg-color-blue-dark;
  border-style: none;

  &:hover {
    color: $osg-color-blue-hover;
    text-decoration: underline;
    border: 2px solid $osg-color-blue-hover;
  }

  &:active {
    color: white;
    text-decoration: none;
    background-color: $osg-color-blue-hover;
    border: 2px solid $osg-color-blue-hover;
  }
}
</style>
