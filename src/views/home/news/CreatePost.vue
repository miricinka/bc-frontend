<script setup lang="ts">
import router from "@/router";
import axios, { AxiosError } from "axios";
import { reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";
import type { IStoreNewsError } from "@/shared/interface";

const toast = useToast();

const token = ref(localStorage.getItem("token"));

const errors = ref<IStoreNewsError>();

const form = reactive({
  title: "",
  text: "",
});

const store = async (data: { title: string; text: string }) => {
  try {
    await axios({
      method: "post",
      url: "http://127.0.0.1:8000/api/news",
      data: data,
      headers: { Authorization: `Bearer ${token.value}` },
    });
    toast.add({
      severity: "success",
      summary: "Novinka vytvořena",
      life: 3000,
    });
    await router.push("/");
  } catch (error) {
    if (error instanceof AxiosError) {
      errors.value = error.response?.data;
      console.log(errors.value);
    } else {
      toast.add({
        severity: "error",
        summary: "Novinka",
        detail: "Novinku se nepodařilo vytvořit",
        life: 3000,
      });
    }
  }
};
</script>
<template>
  <div class="container mt-5">
    <Card>
      <template #title> Přidat novinku </template>
      <template #content>
        <form @submit.prevent="store(form)">
          <div class="my-6">
            <h5 id="text-area-text">Titulek</h5>
            <Textarea
              id="title"
              type="text"
              cols="50"
              :autoResize="true"
              v-model="form.title"
              :class="`${errors?.errors.title ? 'p-invalid' : ''}`"
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
              v-model="form.text"
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
            <Button label="Přidat Aktualitu" icon="pi pi-check" type="submit" />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>
