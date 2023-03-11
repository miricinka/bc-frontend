<script setup lang="ts">
import type { IActivity, IUser, IUserActivityTable } from "@/shared/interface";
import axios, { AxiosError } from "axios";
import { onMounted, reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";

const toast = useToast();

onMounted(() => {
  getActivitiesUsers();
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

const getActivitiesUsers = async () => {
  const response = await axios.get<IUserActivityTable>(
    "http://127.0.0.1:8000/api/userActivitiesTable/"
  );
  table.value = response.data;
};

function countPoints(student: IUser): number {
  let sum: number = 2;
  console.log("im here");
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
      await axios.delete("http://127.0.0.1:8000/api/activityUnDone", {
        data: {
          username: student.username,
          activity: activity.name,
        },
      });
    } else {
      await axios.post("http://127.0.0.1:8000/api/activityDone", {
        username: student.username,
        activity: activity.name,
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
    await axios.post("http://127.0.0.1:8000/api/activity", data);
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
    await axios.delete("http://127.0.0.1:8000/api/activity/" + activity.name);
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
  }
  await getActivitiesUsers();
}
</script>

<template>
  <div class="container mt-5">
    <Card class="activities">
      <template #title>
        <div class="d-flex justify-content-between container my-3">
          Aktivity
          <Button
            label="Přidat aktualitu"
            icon="pi pi-plus"
            class="p-button-raised p-button-success"
            @click="openModal()"
          />
        </div>
      </template>
      <template #content>
        <template v-if="table">
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
                  <th scope="row">{{ student.name }}</th>
                  <td v-for="activity in table.activities">
                    <Checkbox
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
        <div class="my-6">
          <h5 id="text-area-text">Název</h5>
          <InputText type="text" v-model="form.name" />
          <div class="field col-12 md:col-3">
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
          <h5 id="text-area-text">Popis</h5>
          <Textarea
            v-model="form.description"
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
            @click="closeModal()"
            class="p-button-text"
          />
          <Button label="Přidat Aktualitu" icon="pi pi-check" type="submit" />
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
</style>
