<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </div>
  <router-view />
</template>

<style>
#app {
  font-family: Poppins, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100vh;
  font-size: 14px;
}

nav {
  transform: none !important;
}

#nav {
  display: none;
  padding: 30px;

  a {
    font-weight: bold;
    color: #97a2b6;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

* {
  font-family: Poppins;
}
</style>
