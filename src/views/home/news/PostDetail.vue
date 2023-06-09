<script setup lang="ts">
import axios, { AxiosError } from "axios";
import { onMounted, ref } from "vue";
import { useToast } from "primevue/usetoast";
import type { IComment, IStoreCommentError, INews } from "@/shared/interface";
import router from "@/router";

const toast = useToast();
const loggedRole = ref(localStorage.getItem("role"));
const loggedUsername = ref(localStorage.getItem("username"));
const token = ref(localStorage.getItem("token"));

interface Props {
  id: string;
}
const props = defineProps<Props>();

const news = ref<INews>();
const comments = ref<IComment[]>();

const newComment = ref<string>("");

const errors = ref<IStoreCommentError>();

/**
 * gets post and comments from server on component mount
 */
onMounted(() => {
  if (props) {
    getNews(props.id), getComments(props.id);
  }
});

/**
 * gets specific post from server
 * @param id
 */
const getNews = async (id: string) => {
  const response = await axios.get<INews>(
    "http://127.0.0.1:8000/api/news/" + id
  );
  news.value = response.data;
};

/**
 * gets comments for specific post from server
 * @param id
 */
const getComments = async (id: string) => {
  const response = await axios.get<IComment[]>(
    "http://127.0.0.1:8000/api/news/" + id + "/comments"
  );
  comments.value = response.data;
};

/**
 * sends new comment to server
 * shows notification
 * reloads comments
 *
 * @param comment
 */
const addComment = async (comment: string) => {
  try {
    await axios({
      method: "post",
      url: "http://127.0.0.1:8000/api/news/comments",
      data: {
        username: loggedUsername.value,
        text: comment,
        news_id: props.id,
      },
      headers: { Authorization: `Bearer ${token.value}` },
    });
    errors.value = undefined;
    newComment.value = "";
    toast.add({
      severity: "success",
      summary: "Komentář přidán",
      life: 3000,
    });
    await getComments(props.id);
  } catch (error) {
    if (error instanceof AxiosError) {
      errors.value = error.response?.data;
      console.log(errors.value);
    } else {
      console.log("Unexpected error", error);
    }
    toast.add({
      severity: "error",
      summary: "Komentář",
      detail: "Komentář se nepodařilo přidat",
      life: 3000,
    });
    return;
  }
};

/**
 * deletes comment from server
 * shows notification
 * reloads comments
 *
 * @param comment
 */
const deleteComment = async (id: number) => {
  console.log(id);
  if (!window.confirm("Are you sure?")) {
    return;
  }
  try {
    await axios({
      method: "delete",
      url: "http://127.0.0.1:8000/api/news/comments/" + id,
      headers: { Authorization: `Bearer ${token.value}` },
    });
    toast.add({
      severity: "success",
      summary: "Komentář smazán",
      life: 3000,
    });
    await getComments(props.id);
  } catch {
    toast.add({
      severity: "error",
      summary: "Komentář",
      detail: "Komentář se nepodařilo smazat",
      life: 3000,
    });
    return;
  }
};

/**
 * deletes specific news by id
 * refreshes all news
 * shows notification
 * @param id
 */
const deleteNews = async (id: number) => {
  try {
    if (!window.confirm("Are you sure?")) {
      return;
    }
    await axios({
      method: "delete",
      url: "http://127.0.0.1:8000/api/news/" + id,
      headers: { Authorization: `Bearer ${token.value}` },
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "Novinku se nepodařilo smazat",
      detail: "Novinku se nepodařilo smazat",
      life: 3000,
    });
    return;
  }
  toast.add({
    severity: "success",
    summary: "Novinka",
    detail: "Novinka smazána",
    life: 3000,
  });
  router.push({ name: "home" });
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
            <div v-if="loggedRole === 'admin'">
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
                @click="deleteNews(news.id)"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
    <div v-else>
      <Card class="news-card">
        <template #content>
          <CardLoading></CardLoading>
        </template>
      </Card>
    </div>

    <div class="add-comment container mt-3" v-if="loggedRole">
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
          :username="comment.username"
          :showButtons="
            (loggedUsername && comment.username === loggedUsername) ||
            loggedRole === 'admin'
          "
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
