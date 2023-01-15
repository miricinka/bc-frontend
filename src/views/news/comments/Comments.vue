<script setup lang="ts">
import type { IComment, IStoreCommentError, News } from "@/api/news";
import axios, { AxiosError } from "axios";
import { onMounted, ref } from "vue";

interface Props {
  id: string;
}
const props = defineProps<Props>();

const news = ref<News>();
const comments = ref<IComment[]>();

const newComment = ref<string>("");

const errors = ref<IStoreCommentError>();

onMounted(() => {
  getNews(props.id), getComments(props.id);
});

const getNews = async (id: string) => {
  const response = await axios.get<News>(
    "http://127.0.0.1:8000/api/news/" + id
  );
  news.value = response.data;
};

const getComments = async (id: string) => {
  const response = await axios.get<IComment[]>(
    "http://127.0.0.1:8000/api/news/" + id + "/comments"
  );
  comments.value = response.data;
};

const addComment = async (comment: string) => {
  try {
    await axios.post("http://127.0.0.1:8000/api/news/comments", {
      text: comment,
      news_id: props.id,
    });
    errors.value = undefined;
    newComment.value = "";
    await getComments(props.id);
  } catch (error) {
    if (error instanceof AxiosError) {
      errors.value = error.response?.data;
      console.log(errors.value);
    } else {
      console.log("Unexpected error", error);
    }
  }
};

const deleteComment = async (id: number) => {
  console.log(id);
  if (!window.confirm("Are you sure?")) {
    return;
  }
  await axios.delete("http://127.0.0.1:8000/api/news/comments/" + id);
  await getComments(props.id);
};
</script>

<template>
  <div class="container mt-5">
    <div v-if="news">
      <Card class="news-card">
        <template #title>
          {{ news.title }}
          <Divider align="right">
            <div class="inline-flex align-items-center">
              <b>{{ `${new Date(news.created_at).toLocaleDateString()}` }}</b>
            </div>
          </Divider>
        </template>
        <template #content> {{ news.text }} </template>
        <template #footer>
          <div class="d-flex justify-content-between">
            <div>
              <Button
                label="Editovat"
                class="p-button-raised mx-1"
                icon="pi pi-file-edit"
                @click="$router.push({ path: `/news/${id}/edit` })"
              />
              <Button
                label="Smazat"
                class="p-button-raised p-button-danger mx-1"
                icon="pi pi-trash"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div class="add-comment container mt-3">
      <Card class="add-comment-card">
        <template #title> Nový komentář </template>
        <template #content>
          <form @submit.prevent="addComment(newComment)">
            <div>
              <Textarea
                id="title"
                type="text"
                cols="50"
                :autoResize="true"
                v-model="newComment"
                :class="`${errors?.errors.text ? 'p-invalid' : ''}`"
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
              <Button label="Přidat" icon="pi pi-check" type="submit" />
            </div>
          </form>
        </template>
      </Card>
    </div>

    <div v-if="comments">
      <div v-for="comment in comments">
        <Comment
          :id="comment.id"
          :text="comment.text"
          :dateCreated="comment.created_at"
          @delete="deleteComment"
          @reload="getComments(props.id)"
        ></Comment>
      </div>
    </div>
  </div>
</template>

<style>
.add-comment-card {
  width: 60%;
  border-radius: 25px;
}
</style>
