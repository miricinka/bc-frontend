<script setup lang="ts">

  import newsApi from '@/api/news';
  import router from '@/router';
  import { reactive } from 'vue';

  const { storeNews, getNews, errors } = newsApi();

  const form = reactive ({
    title: "",
    text: "",
  })

  const save = async (form:{title:string, text:string}) => {
    await storeNews(form);
    await getNews();
    await router.push('/');
  }
</script>

<template>
  <Dialog header="Nová aktualita" :visible="true" :breakpoints="{'960px': '75vw', '640px': '90vw'}" :style="{width: '50vw'}" :modal="true" :closable="false">
    <form @submit.prevent="storeNews(form)">
      <div class="my-6">
        <span class="p-float-label">
          <InputText id="title" type="text" v-model="form.title" />
          <div v-if="errors">
            <div v-if="errors.errors.title">
              <span class="text-sm text-red-400">{{ errors.errors.title[0] }}</span>
            </div>
          </div>
          <label for="title">Titulek</label>
        </span>
      </div>
      <div>
        <h5 id="text-area-text">Text aktuality</h5>
        <Textarea v-model="form.text" :autoResize="true" rows="5" cols="50" aria-labelledby="text-area-text" />
      </div>
      <div>
      <Button label="Zpět" icon="pi pi-times" @click="$router.back()" class="p-button-text"/>
      <Button label="Přidat Aktualitu" icon="pi pi-check" type="submit" />
    </div>
    </form>
  </Dialog>
</template>

<style>
</style>