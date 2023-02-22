<script setup lang="ts">
import type News from "@/components/News.vue";
import newsApi, { type INewsWithComment } from "@/api/news";
import { onMounted, ref } from "vue";
import type { PageState } from "primevue/paginator";

const { news, getNews, destroyNews } = newsApi();
const visibleNews = ref<INewsWithComment[]>([]);

onMounted(async () => {
  await getNews();
  if (news.value) {
    visibleNews.value = news.value.slice(0, 3);
  }
});

const deleteNews = async (id: number) => {
  console.log(id);
  await destroyNews(id);
  await getNews();
};

function onPage(event: PageState) {
  console.log(event);
  if (news.value) {
    visibleNews.value = news.value.slice(event.first, event.first + event.rows);
  }
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
              </template>
            </Card>
          </div>
        </div>
        <div class="col">
          <div class="row pb-2">
            <div class="news mt-5">
              <Card>
                <template #title> Plán akcí </template>
                <template #content>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Inventore sed consequuntur error repudiandae numquam deserunt
                  quisquam repellat libero asperiores earum nam nobis, culpa
                  ratione quam perferendis esse, cupiditate neque quas!
                </template>
              </Card>
            </div>
          </div>
          <div class="row pt-3">
            <div class="news">
              <Card>
                <template #title> Novinky z okolí </template>
                <template #content>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Inventore sed consequuntur error repudiandae numquam deserunt
                  quisquam repellat libero asperiores earum nam nobis, culpa
                  ratione quam perferendis esse, cupiditate neque quas!
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
