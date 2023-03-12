<script setup lang="ts">
import axios from "axios";
import { reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";
import type { IToken, ILoginResponse } from "@/shared/interface";
import router from "@/router";

const toast = useToast();
const loginError = ref<boolean>(false);

const form = reactive({
  email: "",
  password: "",
});
async function login(data: { email: string; password: string }) {
  loginError.value = false;
  try {
    const response: ILoginResponse = await axios.post(
      "http://127.0.0.1:8000/api/login",
      data
    );
    //setting token to local browser storage
    localStorage.setItem("token", response.data.token);
    const token = localStorage.getItem("token");
    console.log(token);
    toast.add({
      severity: "success",
      summary: "Vítejte!",
      life: 3000,
    });
    router.push("/");
  } catch (error) {
    loginError.value = true;
    toast.add({
      severity: "error",
      summary: "Přihlášení",
      detail: "Neúspěšné přihlášení",
      life: 3000,
    });
    return;
  }
}
</script>
<template>
  <div class="container mt-5">
    <Card class="login">
      <template #title> <div class="container my-3">Přihlášení</div></template>
      <template #content>
        <form @submit.prevent="login(form)">
          <div class="m-4">
            <h5 id="text-area-text">Email</h5>
            <InputText
              type="text"
              style="width: 70%"
              v-model="form.email"
              :class="`${loginError ? 'p-invalid' : ''}`"
            />
          </div>
          <div class="m-4">
            <h5 id="text-area-text">Heslo</h5>
            <Password
              v-model="form.password"
              :feedback="false"
              toggleMask
              :class="`${loginError ? 'p-invalid' : ''}`"
            />
          </div>
          <div class="m-4">
            <Button
              type="submit"
              label="Přihlásit se"
              icon="pi pi-sign-in"
              class="p-button-raised"
            ></Button>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>
<style>
.p-password {
  width: 70% !important;
}

.p-password-input {
  width: 100%;
}
</style>
