<script setup lang="ts">

  import newsApi from '@/api/news';
  import { reactive, ref } from 'vue';

  const { storeNews, getNews } = newsApi();

  const form = reactive ({
    title: "",
    text: "",
  })

  const displayModal = ref(false);

  const openModal = () => {
    displayModal.value = true;
  };

  const closeModal = () => {
    form.title = '';
    form.text = '';
    displayModal.value = false;
  }

  const save = (form:{title:string, text:string}) => {
    storeNews(form);
    closeModal();
  }
</script>

<template>
  <Button @click="openModal" label="Nová aktualita" class="p-button-raised p-button-success" icon="pi pi-plus"/>
  <Dialog header="Nová aktualita" v-model:visible="displayModal" :breakpoints="{'960px': '75vw', '640px': '90vw'}" :style="{width: '50vw'}" :modal="true">
    <form>
      <div class="my-6">
        <span class="p-float-label">
          <InputText id="title" type="text" v-model="form.title" />
          <label for="title">Titulek</label>
        </span>
      </div>
      <div>
        <h5 id="text-area-text">Text aktuality</h5>
        <Textarea v-model="form.text" :autoResize="true" rows="5" cols="50" aria-labelledby="text-area-text" />
      </div>
    </form>
    <template #footer>
      <Button label="Zpět" icon="pi pi-times" @click="closeModal()" class="p-button-text"/>
      <Button label="Přidat Aktualitu" icon="pi pi-check" @click="save(form)" />
    </template>
  </Dialog>
</template>

<style>
</style>