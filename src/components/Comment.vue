<script setup lang="ts">
import type { IStoreCommentError } from "@/shared/interface";
import axios, { AxiosError } from "axios";
import { ref } from "vue";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const emit = defineEmits(["delete", "reload"]);
const token = ref(localStorage.getItem("token"));
interface Props {
  id: number;
  text: string;
  dateCreated: string;
  username: string | null;
  showButtons: boolean;
}
const props = defineProps<Props>();

const isEditing = ref<boolean>(false);
const editedComment = ref<string>("");
const errors = ref<IStoreCommentError>();

function toggleEdit() {
  isEditing.value = true;
  editedComment.value = props.text;
}

async function editComment(text: string) {
  try {
    await axios({
      method: "put",
      url: "http://127.0.0.1:8000/api/news/comments/" + props.id,
      data: {
        text: text,
      },
      headers: { Authorization: `Bearer ${token.value}` },
    });
    isEditing.value = false;
    errors.value = undefined;
    toast.add({
      severity: "success",
      detail: "Komentář upraven",
      life: 3000,
    });
    emit("reload");
  } catch (error) {
    toast.add({
      severity: "error",
      detail: "Komentář se nepodařilo uložit",
      life: 3000,
    });
    if (error instanceof AxiosError) {
      errors.value = error.response?.data;
      console.log(errors.value);
    } else {
      console.log("Unexpected error", error);
    }
  }
}
</script>

<template>
  <div class="container my-3">
    <Card v-if="!isEditing" class="comment-card">
      <template #title>
        <Divider align="left">
          <div class="inline-flex align-items-center">
            <b>{{ `${new Date(props.dateCreated).toLocaleDateString()}` }}</b>
            <span class="ml-3 mr-2">
              <template v-if="username">
                <template v-if="username === 'admin'">Admin</template>
                <template v-else-if="token">
                  <RouterLink
                    :to="{
                      name: 'user',
                      params: { username: username },
                    }"
                    >{{ username }}</RouterLink
                  >
                </template>
                <template v-else>{{ username }}</template>
              </template>
              <template v-else> Smazaný uživatel </template>
            </span>
            <span class="pi pi-user"> </span>
          </div>
        </Divider>
      </template>
      <template #content>
        {{ props.text }}
      </template>
      <template #footer>
        <div class="d-flex justify-content-end">
          <div v-if="showButtons">
            <Button
              label="Editovat"
              class="p-button-raised mx-1"
              icon="pi pi-file-edit"
              @click="toggleEdit()"
            />
            <Button
              label="Smazat"
              class="p-button-raised p-button-danger mx-1"
              icon="pi pi-trash"
              @click="$emit('delete', id)"
            />
          </div>
        </div>
      </template>
    </Card>
    <Card v-if="isEditing" class="comment-card">
      <template #content>
        <form @submit.prevent="editComment(editedComment)">
          <div>
            <Textarea
              id="title"
              type="text"
              cols="50"
              :autoResize="true"
              v-model="editedComment"
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
          <div class="d-flex">
            <div>
              <Button
                label="Zpět"
                class="p-button-raised mx-1"
                icon="pi pi-times"
                @click="(isEditing = false), (errors = undefined)"
              />
              <Button
                label="Uložit"
                class="p-button-raised mx-1"
                icon="pi pi-check"
                type="submit"
              />
            </div>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<style>
.comment-card {
  width: 60%;
  border-radius: 25px;
}
</style>
