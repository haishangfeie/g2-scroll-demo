<template>
  <div id="app">
    <div id="nav">
      <router-link to="/demo1">demo1</router-link> |
      <router-link to="/demo2-1">demo2-1</router-link>
    </div>
    <router-view />
  </div>
</template>

<style lang="scss">
.container {
  width: 1152px;
  margin: 0 auto;
}
</style>
