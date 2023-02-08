<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, RouterView } from "vue-router";

const visible = ref(false);
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container">
      <RouterLink to="/" class="navbar-brand" @click="visible = !visible"
        >Šachy Kuřim</RouterLink
      >
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        @click="visible = !visible"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div
        class="collapse navbar-collapse"
        :class="visible ? 'collapse' : ''"
        id="navbarSupportedContent"
      >
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <RouterLink to="/about" class="nav-link" @click="visible = !visible"
              >O klubu</RouterLink
            >
          </li>
          <li class="nav-item active">
            <RouterLink to="/chess" class="nav-link" @click="visible = !visible"
              >Chess</RouterLink
            >
          </li>
          <li class="nav-item">
            <RouterLink
              to="/activities"
              class="nav-link"
              @click="visible = !visible"
              >Aktivity</RouterLink
            >
          </li>
          <li class="nav-item">
            <RouterLink
              to="/attendance"
              class="nav-link"
              @click="visible = !visible"
              >Docházka</RouterLink
            >
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item">
            <span class="nav-link">Login</span>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <RouterView />
</template>

<style scoped>
nav {
  background-color: #fca503;
}
</style>
