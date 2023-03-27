<script setup lang="ts">
import type { IInfo, IStoreUserError, IUser } from "@/shared/interface";
import axios, { AxiosError } from "axios";
import { onMounted, reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";

const toast = useToast();
interface Props {
  username: string;
}
const props = defineProps<Props>();

const loggedRole = ref(localStorage.getItem("role"));
const loggedUsername = ref(localStorage.getItem("username"));
const token = ref(localStorage.getItem("token"));

const displayPasswordModal = ref(false);
const displayEditModal = ref(false);
const errors = ref<IStoreUserError>();

const passwordForm = reactive({
  current_password: "",
  new_password: "",
});

const userForm = reactive({
  username: "",
  name: "",
  surname: "",
  email: "",
});

const user = ref<IUser>();
const info = ref<IInfo>();
const points = ref<number>();

onMounted(() => {
  getUser();
  getUserInfo();
});

function openPasswordModal() {
  displayPasswordModal.value = true;
}

function closePasswordModal() {
  displayPasswordModal.value = false;
  resetPasswordForm();
}

function openEditModal() {
  displayEditModal.value = true;
  if (user.value) {
    (userForm.email = user.value.email),
      (userForm.username = user.value.username),
      (userForm.name = user.value.name),
      (userForm.surname = user.value.surname);
  }
}

function closeEditModal() {
  displayEditModal.value = false;
}

function resetPasswordForm() {
  (passwordForm.current_password = ""), (passwordForm.new_password = "");
}

async function getUser() {
  const response = await axios<IUser>({
    method: "get",
    url: "http://127.0.0.1:8000/api/users/" + props.username,
    headers: { Authorization: `Bearer ${token.value}` },
  });
  user.value = response.data;
}

async function getUserInfo() {
  const response = await axios<IInfo>({
    method: "get",
    url: "http://127.0.0.1:8000/api/users/" + props.username + "/info",
    headers: { Authorization: `Bearer ${token.value}` },
  });
  info.value = response.data;
  points.value = countPoints(info.value.doneActivities);
}

async function changePassword(data: {
  current_password: string;
  new_password: string;
}) {
  try {
    await axios({
      method: "put",
      url: "http://127.0.0.1:8000/api/users/" + props.username + "/password",
      data: data,
      headers: { Authorization: `Bearer ${token.value}` },
    });
    toast.add({
      severity: "success",
      detail: "Heslo změněno",
      life: 3000,
    });
    closePasswordModal();
  } catch {
    toast.add({
      severity: "error",
      detail: "Heslo se nepodařilo změnit",
      life: 3000,
    });
  }
}

function countPoints(
  array: {
    name: string;
    weight: number;
  }[]
): number {
  return array.reduce((sum, activity) => sum + activity.weight, 0);
}

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
    await getUser();
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
      <template #title
        ><div class="d-flex justify-content-between container my-3">
          Uživatel {{ username }}
          <div class="user-buttons">
            <Button
              v-if="loggedUsername === props.username"
              label="Upravit údaje"
              icon="pi pi-user"
              class="p-button-raised p-button-success"
              @click="openEditModal()"
            />
            <Button
              v-if="loggedUsername === props.username"
              label="Změnit heslo"
              icon="pi pi-lock"
              class="p-button-raised p-button-success"
              @click="openPasswordModal()"
            />
          </div>
        </div>
      </template>
      <template #content>
        <div v-if="user">
          <h5>{{ user.name }}</h5>
          <h5>{{ user.surname }}</h5>
          <h5>{{ user.email }}</h5>
          Celkem získáno bodů: {{ points }}
          <TabView>
            <TabPanel header="Aktivity">
              <template v-if="info">
                <div class="activities-scrollable">
                  <table class="table table-hover">
                    <tbody>
                      <tr v-for="activity in info.activities">
                        <th>
                          <Button
                            v-tooltip.top.focus="
                              `${
                                activity.description
                                  ? activity.description
                                  : 'Žádný popis'
                              }`
                            "
                            icon="pi pi-question-circle"
                            class="p-button-sm"
                          />
                          {{ activity.name }}
                        </th>
                        <td>{{ activity.weight }} xp</td>
                        <td>
                          <Checkbox
                            :disabled="true"
                            :value="{
                              name: activity.name,
                              weight: activity.weight,
                            }"
                            name="category"
                            v-model="info.doneActivities"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
            </TabPanel>
            <TabPanel header="Docházka"
              ><template v-if="info">
                <div class="activities-scrollable">
                  <table class="table table-hover">
                    <tbody>
                      <tr v-for="day in info.attendance">
                        <th>
                          {{ `${new Date(day.date).toLocaleDateString()}` }}
                        </th>
                        <td>
                          <Checkbox
                            :disabled="true"
                            :value="{
                              id: day.id,
                            }"
                            name="category"
                            v-model="info.attended"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
            </TabPanel>
            <TabPanel header="Turnaje"> </TabPanel>
          </TabView>
        </div>
      </template>
    </Card>

    <Dialog
      header="Změnit heslo"
      v-model:visible="displayPasswordModal"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '50vw' }"
      :modal="true"
    >
      <form @submit.prevent="changePassword(passwordForm)">
        <div class="m-4">
          <h5 id="text-area-text">Aktuální heslo</h5>
          <Password
            v-model="passwordForm.current_password"
            :feedback="false"
            toggleMask
            :class="`${false ? 'p-invalid' : ''}`"
          />
        </div>
        <div class="m-4">
          <h5 id="text-area-text">Nové heslo</h5>
          <Password
            v-model="passwordForm.new_password"
            :feedback="false"
            toggleMask
            :class="`${false ? 'p-invalid' : ''}`"
          />
        </div>
        <div class="m-4">
          <Button
            label="Zpět"
            icon="pi pi-times"
            @click="closePasswordModal()"
            class="p-button-text"
          />
          <Button
            type="submit"
            label="Změnit"
            icon="pi pi-check-square"
            class="p-button-raised"
          ></Button>
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
      <form @submit.prevent="edit(userForm)">
        <div class="my-6 user-form">
          <h5 id="text-area-text">Username</h5>
          <InputText
            type="text"
            disabled="true"
            v-model="userForm.username"
            :class="`${errors?.errors.username ? 'p-invalid' : ''}`"
          />
          <h5 id="text-area-text">email</h5>
          <InputText
            type="text"
            v-model="userForm.email"
            :class="`${errors?.errors.email ? 'p-invalid' : ''}`"
          />
          <div v-if="errors">
            <div v-if="errors.errors.email">
              <small id="title-help" class="p-error">{{
                errors.errors.email[0]
              }}</small>
            </div>
          </div>
          <h5 id="text-area-text">Jméno</h5>
          <InputText
            type="text"
            v-model="userForm.name"
            :class="`${errors?.errors.name ? 'p-invalid' : ''}`"
          />
          <div v-if="errors">
            <div v-if="errors.errors.name">
              <small id="title-help" class="p-error">{{
                errors.errors.name[0]
              }}</small>
            </div>
          </div>
          <h5 id="text-area-text">Příjmení</h5>
          <InputText
            type="text"
            v-model="userForm.surname"
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
        <div>
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

<style>
.user-buttons {
  margin: 5px;
}
.user-buttons Button {
  margin: 2px;
}
</style>
