<script setup lang="ts">
import type News from "@/components/News.vue";
import newsApi, { type INewsWithComment } from "@/api/news";
import { onMounted, ref } from "vue";
import type { PageState } from "primevue/paginator";
import { useToast } from "primevue/usetoast";
import axios from "axios";
import type { IEvent } from "@/shared/interface";

const toast = useToast();

const { news, getNews, destroyNews } = newsApi();
const visibleNews = ref<INewsWithComment[]>([]);
const events = ref<IEvent[]>();

onMounted(async () => {
  await getNews();
  if (news.value) {
    visibleNews.value = news.value.slice(0, 3);
  }
  await getEvents();
});

const deleteNews = async (id: number) => {
  console.log(id);
  await destroyNews(id);
  toast.add({
    severity: "success",
    summary: "Article deleted",
    detail: "Article deleted",
    life: 3000,
  });
  await getNews();
  if (news.value) {
    visibleNews.value = news.value.slice(0, 3);
  }
};

function onPage(event: PageState) {
  console.log(event);
  if (news.value) {
    visibleNews.value = news.value.slice(event.first, event.first + event.rows);
  }
}

function onEventPage(event: PageState) {
  console.log(event);
}

async function getEvents() {
  const response = await axios.get<IEvent[]>("http://127.0.0.1:8000/api/event");
  events.value = response.data;
}

async function deleteEvent(id: number) {
  try {
    await axios.delete("http://127.0.0.1:8000/api/event/" + id);
  } catch {
    toast.add({
      severity: "error",
      summary: "Akce",
      detail: "Akci se nepodařilo smazat",
      life: 3000,
    });
    return;
  }
  toast.add({
    severity: "success",
    summary: "Akce",
    detail: "Akce smazána",
    life: 3000,
  });
  await getEvents();
}
</script>

<template>
  <main>
    <div class="container">
      <div class="row">
        <div class="col-7">
          <div class="news mt-5">
            <Card class="news-cards">
              <template #title>
                <div class="d-flex justify-content-between container my-3">
                  Aktuality
                  <Button
                    @click="$router.push('/createNews')"
                    label="Nová aktualita"
                    class="p-button-raised p-button-success"
                    icon="pi pi-plus"
                  />
                </div>
              </template>
              <template #content>
                <div v-if="visibleNews.length > 0">
                  <div v-for="oneNews in visibleNews">
                    <News
                      :id="oneNews.news.id"
                      :title="oneNews.news.title"
                      :text="oneNews.news.text"
                      :dateCreated="oneNews.news.created_at"
                      :commentCount="oneNews.commentCount"
                      @delete="deleteNews"
                    ></News>
                  </div>
                  <Paginator
                    :rows="3"
                    :totalRecords="news?.length"
                    @page="onPage($event)"
                  ></Paginator>
                </div>
                <div v-else>
                  <ProgressSpinner></ProgressSpinner>
                </div>
              </template>
            </Card>
          </div>
        </div>
        <div class="col">
          <div class="row pb-2">
            <div class="news mt-5">
              <Card>
                <template #title>
                  <div class="d-flex justify-content-between container my-3">
                    Kalendář akcí
                    <Button
                      label="Nová akce"
                      class="p-button-raised p-button-success"
                      icon="pi pi-plus"
                    />
                  </div>
                </template>
                <template #content>
                  <template v-if="events">
                    <template v-if="events.length === 0"> Zadne akce </template>
                    <div class="events">
                      <Event
                        v-for="event in events"
                        :name="event.name"
                        :date="event.date"
                        :description="event.description"
                        @delete="deleteEvent(event.id)"
                      ></Event>
                      <Paginator
                        :rows="3"
                        @page="onEventPage($event)"
                      ></Paginator>
                    </div>
                  </template>
                  <template v-else>
                    <ProgressSpinner></ProgressSpinner>
                  </template>
                </template>
              </Card>
            </div>
          </div>
          <div class="row pt-3">
            <div class="news">
              <Card>
                <template #title> Novinky z okolí </template>
                <template #content>
                  <ProgressSpinner></ProgressSpinner>
                </template>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
.news-cards {
  border-radius: 25px;
  background-color: #f7e2c6;
}
</style>
