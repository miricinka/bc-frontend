<script setup lang="ts">
import type {
  IAttendanceDay,
  IAttendanceUserTable,
  IUser,
} from "@/shared/interface";
import axios from "axios";
import { onMounted, ref } from "vue";

onMounted(() => {
  getAttendance();
});

const displayModal = ref(false);
const dates = ref<Date[]>([]);

const table = ref<IAttendanceUserTable>();

function openModal() {
  displayModal.value = true;
}

function closeModal() {
  dates.value = [];
  displayModal.value = false;
}

const getAttendance = async () => {
  const response = await axios.get<IAttendanceUserTable>(
    "http://127.0.0.1:8000/api/attendanceUsersTable"
  );
  table.value = response.data;
};

async function submit() {
  try {
    await axios.post(
      "http://127.0.0.1:8000/api/attendanceDay",
      dates.value.map((entry) => {
        return {
          date: new Date(entry.getTime() - entry.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),
        };
      })
    );
    getAttendance();
    closeModal();
  } catch (error) {}
  console.log(dates.value);
  closeModal();
}

async function checkboxChange(day: IAttendanceDay, student: IUser) {
  if (table.value) {
    if (
      table.value.attendance.find(
        (entry) =>
          entry.attendance_day_id === day.id &&
          entry.username === student.username
      )
    ) {
      await axios.delete("http://127.0.0.1:8000/api/attendance", {
        data: {
          username: student.username,
          attendance_day_id: day.id,
        },
      });
    } else {
      await axios.post("http://127.0.0.1:8000/api/attendance", {
        username: student.username,
        attendance_day_id: day.id,
      });
    }
  }
}

async function deleteDay(date: IAttendanceDay) {
  if (!window.confirm("Opravdu tento den smazat?")) {
    return;
  }
  await axios.delete("http://127.0.0.1:8000/api/attendance/" + date.id);
  await getAttendance();
}
</script>

<template>
  <div class="container mt-5">
    <Card class="attendance">
      <template #title>
        <div class="d-flex justify-content-between container my-3">
          Docházka
          <Button
            label="Přidat den/dny"
            icon="pi pi-plus"
            class="p-button-raised p-button-success"
            @click="openModal()"
          />
        </div>
      </template>
      <template #content>
        <table v-if="table" class="table table-hover">
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col" v-for="date in table.attendanceDays">
                <div class="d-flex flex-column">
                  <span>
                    {{ new Date(date.date).toLocaleDateString() }}
                    <Button
                      icon="pi pi-trash"
                      class="p-button-danger p-button-sm"
                      @click="deleteDay(date)"
                    />
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in table.users">
              <th scope="row">{{ student.name }}</th>
              <td v-for="date in table.attendanceDays">
                <Checkbox
                  :value="{
                    attendance_day_id: date.id,
                    username: student.username,
                  }"
                  name="category"
                  v-model="table.attendance"
                  @click="checkboxChange(date, student)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </Card>
    <Dialog
      header="Nový den/dny docházky"
      v-model:visible="displayModal"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '60vw' }"
      :modal="true"
    >
      <div class="my-6 d-flex flex-row">
        <div class="calendar m-2">
          <Calendar
            v-model="dates"
            selectionMode="multiple"
            :manualInput="false"
            :inline="true"
          />
        </div>
        <div class="m-2">
          Data k přidání:
          <template v-for="date in dates">
            <div>
              <span>
                {{ date.toLocaleDateString() }}
              </span>
            </div>
          </template>
        </div>
      </div>
      <div>
        <Button
          label="Zpět"
          icon="pi pi-times"
          @click="closeModal()"
          class="p-button-text"
        />
        <Button label="Přidat" icon="pi pi-check" @click="submit()" />
      </div>
    </Dialog>
  </div>
</template>