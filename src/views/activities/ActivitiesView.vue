<script setup lang="ts">
import type {
  IActivity,
  IUsernamePoints,
  IUser,
  IUserActivityTable,
} from "@/shared/interface";
import axios, { AxiosError } from "axios";
import { onMounted, reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";
import router from "@/router";

const toast = useToast();
const loggedRole = ref(localStorage.getItem("role"));
const token = ref(localStorage.getItem("token"));

const usersPoints = ref<IUsernamePoints[]>();
const first = ref<IUsernamePoints>();
const second = ref<IUsernamePoints>();
const third = ref<IUsernamePoints>();
const otherUsers = ref<IUsernamePoints[]>();

onMounted(() => {
  if (!token.value) {
    router.push("/notAuth");
  }
  getActivitiesUsers();
  getUsersPoints();
});

const table = ref<IUserActivityTable>();
const displayModal = ref(false);

const form = reactive({
  name: "",
  weight: 5,
  description: "",
});

function openModal() {
  displayModal.value = true;
}

function closeModal() {
  displayModal.value = false;
}

/**
 * gets table with all activities and all users
 */
const getActivitiesUsers = async () => {
  const response = await axios({
    method: "get",
    url: "http://127.0.0.1:8000/api/userActivitiesTable/",
    headers: { Authorization: `Bearer ${token.value}` },
  });
  table.value = response.data;
};

async function getUsersPoints() {
  const response = await axios({
    method: "get",
    url: "http://127.0.0.1:8000/api/users/points",
    headers: { Authorization: `Bearer ${token.value}` },
  });
  usersPoints.value = response.data;
  if (usersPoints.value) {
    first.value = usersPoints.value[0] || null;
    second.value = usersPoints.value[1] || null;
    third.value = usersPoints.value[2] || null;
    otherUsers.value = usersPoints.value.slice(3) || null;
  }
}

/**
 * counts points based on done activities for specific user
 * @param student user to count points for
 */
function countPoints(student: IUser): number {
  let sum: number = 0;
  if (table.value) {
    sum = [...table.value.done].reduce(
      (total, entry) =>
        entry.username === student.username
          ? total + getActivityWeight(entry.activity)
          : total,
      0
    );
  }
  return sum;
}

function getActivityWeight(activityName: string): number {
  let weight;
  if (table.value) {
    weight = table.value.activities.find(
      (entry) => entry.name === activityName
    )?.weight;
  }
  if (weight) {
    return weight;
  }
  return 0;
}

async function checkboxChange(activity: IActivity, student: IUser) {
  if (table.value) {
    if (
      table.value.done.find(
        (entry) =>
          entry.activity === activity.name &&
          entry.username === student.username
      )
    ) {
      await axios({
        method: "delete",
        url: "http://127.0.0.1:8000/api/activityDone",
        data: {
          username: student.username,
          activity: activity.name,
        },
        headers: { Authorization: `Bearer ${token.value}` },
      });
    } else {
      await axios({
        method: "post",
        url: "http://127.0.0.1:8000/api/activityDone",
        data: {
          username: student.username,
          activity: activity.name,
        },
        headers: { Authorization: `Bearer ${token.value}` },
      });
    }
  }
}

const store = async (data: {
  name: string;
  weight: number;
  description: string;
}) => {
  try {
    await axios({
      method: "post",
      data: data,
      url: "http://127.0.0.1:8000/api/activity/",
      headers: { Authorization: `Bearer ${token.value}` },
    });
    toast.add({
      severity: "success",
      summary: "Aktivita",
      detail: "Aktivita přidána",
      life: 3000,
    });
    await getActivitiesUsers();
    closeModal();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Aktivita",
      detail: "Aktivitu se nepodařilo vytvořit",
      life: 3000,
    });
  }
};

async function deleteActivity(activity: IActivity) {
  if (!window.confirm("Opravdu chcete aktivitu smazat?")) {
    return;
  }
  try {
    await axios({
      method: "delete",
      url: "http://127.0.0.1:8000/api/activity/" + activity.name,
      headers: { Authorization: `Bearer ${token.value}` },
    });
    toast.add({
      severity: "success",
      summary: "Aktivita",
      detail: "Aktivita smazána",
      life: 3000,
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "Aktivita",
      detail: "Aktivitu se nepodařilo smazat",
      life: 3000,
    });
    return;
  }
  await getActivitiesUsers();
}

function redirectToUser(winner: IUsernamePoints | undefined) {
  if (winner) {
    router.push({
      name: "user",
      params: { username: winner.username },
    });
  }
}
</script>

<template>
  <div class="container mt-5">
    <Card class="activities">
      <template #title>
        <div class="d-flex justify-content-between container my-3">
          Aktivity
          <Button
            v-if="loggedRole === 'admin'"
            label="Přidat aktualitu"
            icon="pi pi-plus"
            class="p-button-raised p-button-success"
            @click="openModal()"
          />
        </div>
      </template>
      <template #content>
        <template v-if="table">
          <TabView>
            <TabPanel header="Pořadí">
              <div class="podium">
                <div class="winner second" @click="redirectToUser(second)">
                  <span class="position">2</span>
                  <div v-if="second">
                    <h2>
                      {{ second.username }}
                    </h2>
                    <h2>{{ second.activities_sum_weight }} xp</h2>
                  </div>
                </div>
                <div class="winner first" @click="redirectToUser(first)">
                  <span class="position">1</span>
                  <div v-if="first">
                    <h2>{{ first.username }}</h2>
                    <h2>{{ first.activities_sum_weight }} xp</h2>
                  </div>
                </div>
                <div class="winner third" @click="redirectToUser(third)">
                  <span class="position">3</span>
                  <div v-if="third">
                    <h2>{{ third.username }}</h2>
                    <h2>{{ third.activities_sum_weight || 0 }} xp</h2>
                  </div>
                </div>
              </div>
              <table class="points table table-hover">
                <thead>
                  <tr>
                    <th>Pořadí</th>
                    <th>Login</th>
                    <th>Body</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(user, index) in otherUsers">
                    <td>{{ index + 4 }}.</td>
                    <td>
                      <RouterLink
                        :to="{
                          name: 'user',
                          params: { username: user.username },
                        }"
                        ><h2>{{ user.username }}</h2></RouterLink
                      >
                    </td>
                    <td>{{ user.activities_sum_weight || 0 }} xp</td>
                  </tr>
                </tbody>
              </table></TabPanel
            >
            <TabPanel header="Splněno">
              <div class="activities-scrollable">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th scope="col"></th>
                      <th scope="col" v-for="activity in table.activities">
                        <div class="d-flex flex-column">
                          <span>
                            {{ activity.name }}
                            <Button
                              v-if="loggedRole === 'admin'"
                              icon="pi pi-trash"
                              @click="deleteActivity(activity)"
                              class="p-button-danger p-button-sm"
                            />
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
                          </span>
                          <span> {{ activity.weight }} xp </span>
                        </div>
                      </th>
                      <th scope="col">Celkem</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="student in table.users">
                      <th scope="row">
                        <RouterLink
                          :to="{
                            name: 'user',
                            params: { username: student.username },
                          }"
                          ><h2>{{ student.username }}</h2></RouterLink
                        >
                      </th>
                      <td v-for="activity in table.activities">
                        <Checkbox
                          :disabled="loggedRole !== 'admin'"
                          :value="{
                            activity: activity.name,
                            username: student.username,
                          }"
                          name="category"
                          v-model="table.done"
                          @click="checkboxChange(activity, student)"
                        />
                      </td>
                      <td>{{ countPoints(student) }} xp</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabPanel>
          </TabView>
        </template>
        <template v-else>
          <TableLoading></TableLoading>
        </template>
      </template>
    </Card>
    <Dialog
      header="Nová aktivita"
      v-model:visible="displayModal"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '50vw' }"
      :modal="true"
    >
      <form @submit.prevent="store(form)">
        <div>
          <div class="m-4">
            <h5 id="text-area-text">Název</h5>
            <InputText type="text" v-model="form.name" />
          </div>
          <div class="m-4">
            <h5 id="text-area-text">Váha</h5>
            <InputNumber
              inputId="minmax-buttons"
              v-model="form.weight"
              mode="decimal"
              showButtons
              :min="0"
              :max="100"
            />
          </div>
          <div class="m-4">
            <h5 id="text-area-text">Popis</h5>
            <Textarea
              v-model="form.description"
              :autoResize="true"
              rows="5"
              cols="50"
              aria-labelledby="text-area-text"
            />
          </div>
        </div>
        <div class="m-4">
          <Button
            label="Zpět"
            icon="pi pi-times"
            @click="closeModal()"
            class="p-button-text"
          />
          <Button label="Přidat Aktivitu" icon="pi pi-check" type="submit" />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<style>
div.activities-scrollable table {
  table-layout: fixed;
  word-wrap: break-word;
}

div.activities-scrollable table th,
table td {
  overflow: hidden;
}

.activities-scrollable {
  overflow-x: auto;
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 160px;
}

.winner {
  position: relative;
  width: 150px;
  height: 80px;
  margin: 0 25px;
  text-align: center;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.position {
  height: 35px;
  width: 35px;
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  background-color: #3e3e3e;
  padding: 5px 10px;
  border-radius: 50%;
}

.first {
  z-index: 3;
  transform: translateY(-37.5px);
  background-color: #fcd116;
}

.second {
  z-index: 2;
  transform: translateY(-25px);
  background-color: #d0d0d0;
}

.third {
  z-index: 1;
  transform: translateY(-12.5px);
  background-color: #cd7f32;
}

.winner:hover {
  transform: scale(1.1);
}

.podium .winner div {
  margin-top: 15px;
}
</style>
