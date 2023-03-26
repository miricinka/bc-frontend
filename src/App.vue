<script setup lang="ts">
import axios from "axios";
import { reactive, ref } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useToast } from "primevue/usetoast";
import router from "./router";
import type { ILoginResponse } from "./shared/interface";

const toast = useToast();

const visible = ref(false);
const displayModal = ref(false);
const loginError = ref<boolean>(false);

const token = ref(localStorage.getItem("token"));
const loggedUsername = ref(localStorage.getItem("username"));
const loggedRole = ref(localStorage.getItem("role"));

const loginForm = reactive({
  username: "",
  password: "",
});

function openLoginModal() {
  displayModal.value = true;
}

async function login(data: { username: string; password: string }) {
  loginError.value = false;
  try {
    const response: ILoginResponse = await axios.post(
      "http://127.0.0.1:8000/api/login",
      data
    );
    //setting token and username to local browser storage
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("username", response.data.username);
    localStorage.setItem("role", response.data.role);
    token.value = localStorage.getItem("token");
    loggedUsername.value = localStorage.getItem("username");
    loggedRole.value = localStorage.getItem("role");
    toast.add({
      severity: "success",
      summary: "Vítejte!",
      life: 3000,
    });
    displayModal.value = false;
    router.go(0);
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

async function logout() {
  try {
    axios({
      method: "post",
      url: "http://127.0.0.1:8000/api/logout",
      headers: { Authorization: `Bearer ${token.value}` },
    });
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    loggedUsername.value = null;
    loggedRole.value = null;
    token.value = null;
    toast.add({
      severity: "success",
      summary: "Úspěšně odhlášeno",
      life: 3000,
    });
    router.push("/");
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Odhlášení",
      detail: "Něco se nepovedlo",
      life: 3000,
    });
    return;
  }
}
</script>

<template>
  <Toast />
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container">
      <RouterLink to="/" class="navbar-brand" @click="visible = !visible"
        >Šachy Kuřim</RouterLink
      >
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        @click="visible = !visible"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div
        class="collapse navbar-collapse"
        :class="visible ? 'collapse' : ''"
        id="navbarSupportedContent"
      >
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <RouterLink to="/chess" class="nav-link" @click="visible = !visible"
              >Chess</RouterLink
            >
          </li>
          <li class="nav-item" v-if="loggedRole">
            <RouterLink
              to="/activities"
              class="nav-link"
              @click="visible = !visible"
              >Aktivity</RouterLink
            >
          </li>
          <li class="nav-item" v-if="loggedRole">
            <RouterLink
              to="/attendance"
              class="nav-link"
              @click="visible = !visible"
              >Docházka</RouterLink
            >
          </li>
          <li class="nav-item">
            <RouterLink
              to="/tournaments"
              class="nav-link"
              @click="visible = !visible"
              >Turnaje</RouterLink
            >
          </li>
          <li class="nav-item" v-if="loggedRole === 'admin'">
            <RouterLink to="/users" class="nav-link" @click="visible = !visible"
              >Uživatelé</RouterLink
            >
          </li>
        </ul>
        <ul class="navbar-nav">
          <li v-if="loggedUsername">
            <RouterLink
              :to="{
                name: 'user',
                params: { username: loggedUsername },
              }"
              class="nav-link"
              @click="visible = !visible"
              >{{ loggedUsername }}</RouterLink
            >
          </li>
          <li v-if="token && loggedUsername" class="nav-item align-items">
            <Button plain text label="Odhlásit se" @click="logout()"></Button>
          </li>
          <li v-else class="nav-link">
            <Button label="Přihlásit se" @click="openLoginModal()"></Button>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <Dialog
    header="Přihlásit se"
    v-model:visible="displayModal"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '50vw' }"
    :modal="true"
  >
    <form @submit.prevent="login(loginForm)">
      <div class="m-4">
        <h5 id="text-area-text">Přihlašovací jméno</h5>
        <InputText
          type="text"
          v-model="loginForm.username"
          style="width: 70%"
          :class="`${loginError ? 'p-invalid' : ''}`"
        />
      </div>
      <div class="m-4">
        <h5 id="text-area-text">Heslo</h5>
        <Password
          v-model="loginForm.password"
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
  </Dialog>

  <body>
    <RouterView />
  </body>
  <Footer></Footer>
</template>

<style>
nav {
  background-color: #fca503;
}

body {
  min-height: 78vh;
  display: flex;
  flex-direction: column;
}
.p-password {
  width: 70% !important;
}

.p-password-input {
  width: 100%;
}
</style>
