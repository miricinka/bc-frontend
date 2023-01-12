<script setup lang="ts">
import type { News } from "@/api/news";
import router from "@/router";
import axios from "axios";
import { onMounted, ref } from "vue";

interface Props {
  id: string;
}
const props = defineProps<Props>();

const news = ref<News>();

onMounted(() => getSkill(props.id));

const getSkill = async (id: string) => {
  const response = await axios.get("http://127.0.0.1:8000/api/news/" + id);
  news.value = response.data;
};
</script>

<template>
  <div class="container mt-5">
    <Card>
      <template #title> Upravit novinku </template>
      <template #content>
        <div v-if="news">
          <form>
            <div class="my-6">
              <h5 id="text-area-text">Titulek</h5>
              <Textarea
                id="title"
                type="text"
                cols="50"
                :autoResize="true"
                v-model="news.title"
              />
            </div>
            <div>
              <h5 id="text-area-text">Text aktuality</h5>
              <Textarea
                v-model="news.text"
                :autoResize="true"
                rows="5"
                cols="50"
                aria-labelledby="text-area-text"
              />
            </div>
            <div>
              <Button
                label="Zpět"
                icon="pi pi-times"
                @click="$router.push('/')"
                class="p-button-text"
              />
              <Button label="Přidat Aktualitu" icon="pi pi-check" />
            </div>
          </form>
        </div>
      </template>
    </Card>
  </div>
</template>
