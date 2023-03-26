<script setup lang="ts">
import type { IInfo, IUser } from "@/shared/interface";
import axios from "axios";
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

const passwordForm = reactive({
  current_password: "",
  new_password: "",
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
</script>
<template>
  <div class="container mt-5">
    <Card class="user">
      <template #title
        ><div class="d-flex justify-content-between container my-3">
          Uživatel {{ username }}
          <div>
            <Button
              v-if="loggedUsername === props.username"
              label="Upravit údaje"
              icon="pi pi-user"
              class="p-button-raised p-button-success"
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
  </div>
</template>
