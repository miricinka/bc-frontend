<script setup lang="ts">
import router from "@/router";
import axios, { AxiosError } from "axios";
import { onMounted, ref } from "vue";
import { useToast } from "primevue/usetoast";
import type { IStoreNewsError, INews } from "@/shared/interface";

const toast = useToast();

const token = ref(localStorage.getItem("token"));

interface Props {
  id: string;
}
const props = defineProps<Props>();

const news = ref<INews>();
const errors = ref<IStoreNewsError>();

onMounted(() => getNews(props.id));

const getNews = async (id: string) => {
  const response = await axios.get<INews>(
    "http://127.0.0.1:8000/api/news/" + id
  );
  news.value = response.data;
};

const updateNews = async (id: string) => {
  try {
    await axios({
      method: "put",
      url: "http://127.0.0.1:8000/api/news/" + id,
      data: news.value,
      headers: { Authorization: `Bearer ${token.value}` },
    });
    toast.add({
      severity: "success",
      summary: "Novinka upravena",
      life: 3000,
    });
    await router.push("/");
  } catch (error) {
    if (error instanceof AxiosError) {
      errors.value = error.response?.data;
    } else {
      toast.add({
        severity: "error",
        summary: "Novinku se nepodařilo upravit",
        life: 3000,
      });
    }
  }
};
</script>

<template>
  <div class="container mt-5">
    <Card>
      <template #title> Upravit novinku </template>
      <template #content>
        <div v-if="news">
          <form @submit.prevent="updateNews(id)">
            <div class="my-6">
              <h5 id="text-area-text">Titulek</h5>
              <Textarea
                id="title"
                type="text"
                cols="50"
                :autoResize="true"
                v-model="news.title"
              />
              <div v-if="errors">
                <div v-if="errors.errors.title">
                  <small id="title-help" class="p-error">{{
                    errors.errors.title[0]
                  }}</small>
                </div>
              </div>
            </div>
            <div>
              <h5 id="text-area-text">Text aktuality</h5>
              <Textarea
                v-model="news.text"
                :autoResize="true"
                rows="5"
                cols="50"
                aria-labelledby="text-area-text"
                :class="`${errors?.errors.title ? 'p-invalid' : ''}`"
              />
              <div v-if="errors">
                <div v-if="errors.errors.text">
                  <small id="title-help" class="p-error">{{
                    errors.errors.text[0]
                  }}</small>
                </div>
              </div>
            </div>
            <div>
              <Button
                label="Zpět"
                icon="pi pi-times"
                @click="$router.push('/')"
                class="p-button-text"
              />
              <Button
                label="Upravit Aktualitu"
                icon="pi pi-check"
                type="submit"
              />
            </div>
          </form>
        </div>
      </template>
    </Card>
  </div>
</template>
