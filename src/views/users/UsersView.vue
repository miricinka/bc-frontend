<script setup lang="ts">
import type { IStoreUserError, IUser } from "@/shared/interface";
import axios, { AxiosError } from "axios";
import { onMounted, reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";
import router from "@/router";

const toast = useToast();

const token = ref(localStorage.getItem("token"));
const loggedRole = ref(localStorage.getItem("role"));

const users = ref<IUser[]>();

const newUserForm = reactive({
  username: "",
  name: "",
  surname: "",
  email: "",
  password: "",
});

const errors = ref<IStoreUserError>();

/**
 * shows users page if logged in
 */
onMounted(() => {
  if (!token.value) {
    router.push("/notAuth");
  }
  getUsers();
});

const displayAddModal = ref(false);
const displayEditModal = ref(false);

/**
 * opends add user modal
 */
function openAddModal() {
  displayAddModal.value = true;
}

/**
 * closes add user modal
 */
function closeAddModal() {
  displayAddModal.value = false;
  resetForm();
}

/**
 * opens edit user info modal
 * prefills form
 */
function openEditModal(user: IUser) {
  displayEditModal.value = true;
  (newUserForm.email = user.email),
    (newUserForm.username = user.username),
    (newUserForm.name = user.name),
    (newUserForm.surname = user.surname);
}

/**
 * closes edit user info modal
 */
function closeEditModal() {
  displayEditModal.value = false;
}

/**
 * resets user info form
 */
function resetForm() {
  (newUserForm.email = ""),
    (newUserForm.username = ""),
    (newUserForm.name = ""),
    (newUserForm.surname = ""),
    (newUserForm.password = "");
}

/**
 * gets users from server
 */
async function getUsers() {
  const response = await axios<IUser[]>({
    method: "get",
    url: "http://127.0.0.1:8000/api/users/",
    headers: { Authorization: `Bearer ${token.value}` },
  });
  users.value = response.data;
}

/**
 * deletes specific user on server
 * shows notification
 * @param username
 */
async function deleteUser(username: string) {
  if (!window.confirm("Opravdu chcete uživatele smazat?")) {
    return;
  }
  try {
    await axios({
      method: "delete",
      url: "http://127.0.0.1:8000/api/users/" + username,
      headers: { Authorization: `Bearer ${token.value}` },
    });
    await getUsers();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Uživatel",
      detail: "Uživatele se nepodařilo smazat",
      life: 3000,
    });
    return;
  }
  toast.add({
    severity: "success",
    summary: "Uživatel",
    detail: "Uživatel smazán",
    life: 3000,
  });
}

/**
 * adds new user on server
 * reloads users
 * shows notifications
 * @param data
 */
async function submit(data: {
  username: string;
  name: string;
  surname: string;
  email: string;
  password: string;
}) {
  try {
    await axios({
      method: "post",
      url: "http://127.0.0.1:8000/api/users",
      data: data,
      headers: { Authorization: `Bearer ${token.value}` },
    });
    await getUsers();
    resetForm();
    closeAddModal();
  } catch (error) {
    if (error instanceof AxiosError) {
      errors.value = error.response?.data;
      console.log(errors.value);
    }
    toast.add({
      severity: "error",
      summary: "Uživatel",
      detail: "Uživatele se nepodařilo vyvořit",
      life: 3000,
    });
    return;
  }
  toast.add({
    severity: "success",
    summary: "Uživatel",
    detail: "Uživatel vytvořen",
    life: 3000,
  });
}

/**
 * edits user info on server
 * shows notifications
 * reloads users
 *
 * @param data
 */
async function edit(data: {
  username: string;
  name: string;
  surname: string;
  email: string;
}) {
  try {
    await axios({
      method: "put",
      url: "http://127.0.0.1:8000/api/users/" + data.username,
      data: data,
      headers: { Authorization: `Bearer ${token.value}` },
    });
    await getUsers();
    resetForm();
    closeEditModal();
  } catch (error) {
    if (error instanceof AxiosError) {
      errors.value = error.response?.data;
    }
    toast.add({
      severity: "error",
      summary: "Uživatel",
      detail: "Uživatele se nepodařilo upravit",
      life: 3000,
    });
    return;
  }
  toast.add({
    severity: "success",
    summary: "Uživatel",
    detail: "Uživatel upraven",
    life: 3000,
  });
}
</script>
<template>
  <div class="container mt-5">
    <Card class="user">
      <template #title>
        <div class="d-flex justify-content-between container my-3">
          Uživatelé
          <Button
            v-if="loggedRole === 'admin'"
            label="Přidat uživatele"
            icon="pi pi-plus"
            class="p-button-raised p-button-success"
            @click="openAddModal()"
          /></div
      ></template>
      <template #content>
        <template v-if="users">
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">Jméno</th>
                <th scope="col">Příjmení</th>
                <th scope="col">email</th>
                <th scope="col"></th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users">
                <th scope="row">{{ user.username }}</th>
                <td>{{ user.name }}</td>
                <td>{{ user.surname }}</td>
                <td>{{ user.email }}</td>
                <td v-if="loggedRole === 'admin'">
                  <Button
                    label="Smazat"
                    icon="pi pi-trash"
                    class="p-button-raised p-button-danger"
                    @click="deleteUser(user.username)"
                  ></Button>
                </td>
                <td v-if="loggedRole === 'admin'">
                  <Button
                    label="Upravit"
                    icon="pi pi-trash"
                    class="p-button-raised"
                    @click="openEditModal(user)"
                  ></Button>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-else>
          <TableLoading></TableLoading>
        </template>
      </template>
    </Card>
    <Dialog
      header="Nový uživatel"
      v-model:visible="displayAddModal"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '60vw' }"
      :modal="true"
    >
      <form @submit.prevent="submit(newUserForm)">
        <div class="user-form">
          <div class="m-4">
            <h5 id="text-area-text">Username</h5>
            <InputText
              type="text"
              v-model="newUserForm.username"
              :class="`${errors?.errors.username ? 'p-invalid' : ''}`"
            />
            <div v-if="errors">
              <div v-if="errors.errors.username">
                <small id="title-help" class="p-error">{{
                  errors.errors.username[0]
                }}</small>
              </div>
            </div>
          </div>
          <div class="m-4">
            <h5 id="text-area-text">email</h5>
            <InputText
              type="text"
              v-model="newUserForm.email"
              :class="`${errors?.errors.email ? 'p-invalid' : ''}`"
            />
            <div v-if="errors">
              <div v-if="errors.errors.email">
                <small id="title-help" class="p-error">{{
                  errors.errors.email[0]
                }}</small>
              </div>
            </div>
          </div>
          <div class="m-4">
            <h5 id="text-area-text">Jméno</h5>
            <InputText
              type="text"
              v-model="newUserForm.name"
              :class="`${errors?.errors.name ? 'p-invalid' : ''}`"
            />
            <div v-if="errors">
              <div v-if="errors.errors.name">
                <small id="title-help" class="p-error">{{
                  errors.errors.name[0]
                }}</small>
              </div>
            </div>
          </div>
          <div class="m-4">
            <h5 id="text-area-text">Příjmení</h5>
            <InputText
              type="text"
              v-model="newUserForm.surname"
              :class="`${errors?.errors.surname ? 'p-invalid' : ''}`"
            />
            <div v-if="errors">
              <div v-if="errors.errors.surname">
                <small id="title-help" class="p-error">{{
                  errors.errors.surname[0]
                }}</small>
              </div>
            </div>
          </div>
          <div class="m-4">
            <h5 id="text-area-text">Heslo</h5>
            <Password
              v-model="newUserForm.password"
              :feedback="false"
              toggleMask
              :class="`${errors?.errors.password ? 'p-invalid' : ''}`"
            />
            <div v-if="errors">
              <div v-if="errors.errors.password">
                <small id="title-help" class="p-error">{{
                  errors.errors.password[0]
                }}</small>
              </div>
            </div>
          </div>
        </div>
        <div class="m-4">
          <Button
            label="Zpět"
            icon="pi pi-times"
            @click="closeAddModal()"
            class="p-button-text"
          />
          <Button label="Nahrát" icon="pi pi-check" type="submit" />
        </div>
      </form>
    </Dialog>
    <Dialog
      header="Upravit Uživatele"
      v-model:visible="displayEditModal"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '60vw' }"
      :modal="true"
    >
      <form @submit.prevent="edit(newUserForm)">
        <div class="user-form">
          <div class="m-4">
            <h5 id="text-area-text">Username</h5>
            <InputText
              type="text"
              disabled="true"
              v-model="newUserForm.username"
              :class="`${errors?.errors.username ? 'p-invalid' : ''}`"
            />
          </div>
          <div class="m-4">
            <h5 id="text-area-text">email</h5>
            <InputText
              type="text"
              v-model="newUserForm.email"
              :class="`${errors?.errors.email ? 'p-invalid' : ''}`"
            />
            <div v-if="errors">
              <div v-if="errors.errors.email">
                <small id="title-help" class="p-error">{{
                  errors.errors.email[0]
                }}</small>
              </div>
            </div>
          </div>
          <div class="m-4">
            <h5 id="text-area-text">Jméno</h5>
            <InputText
              type="text"
              v-model="newUserForm.name"
              :class="`${errors?.errors.name ? 'p-invalid' : ''}`"
            />
            <div v-if="errors">
              <div v-if="errors.errors.name">
                <small id="title-help" class="p-error">{{
                  errors.errors.name[0]
                }}</small>
              </div>
            </div>
          </div>
          <div class="m-4">
            <h5 id="text-area-text">Příjmení</h5>
            <InputText
              type="text"
              v-model="newUserForm.surname"
              :class="`${errors?.errors.surname ? 'p-invalid' : ''}`"
            />
            <div v-if="errors">
              <div v-if="errors.errors.surname">
                <small id="title-help" class="p-error">{{
                  errors.errors.surname[0]
                }}</small>
              </div>
            </div>
          </div>
        </div>
        <div class="m-4">
          <Button
            label="Zpět"
            icon="pi pi-times"
            @click="closeEditModal()"
            class="p-button-text"
          />
          <Button label="Nahrát" icon="pi pi-check" type="submit" />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<style></style>
