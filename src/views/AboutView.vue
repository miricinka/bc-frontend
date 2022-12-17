<script setup lang="ts">
  import CreateNews from '@/components/CreateNews.vue';
import { ref } from '@vue/reactivity';

  const value = ref<string>()

  const displayModal = ref(false);

  function openModal(){
    displayModal.value = true;
    console.log("display modal");
  }

</script>

<template>
  <div class="container">
    <div class="about">
      <h1>This is an about page</h1>
    </div>
    <span class="p-float-label">
      <InputText id="username" type="text" v-model="value" />
      <label for="username">Username</label>
    </span>
    <Button label="Greet" @click="openModal()"></Button>
  </div>
  <CreateNews></CreateNews>
</template>

<style>
</style>


