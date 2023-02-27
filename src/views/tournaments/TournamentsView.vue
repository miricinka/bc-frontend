<script setup lang="ts">
import type { ITournament } from "@/shared/interface";
import axios from "axios";
import { onMounted, reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";

const toast = useToast();

onMounted(() => {
  getTournaments();
});

const tournaments = ref<ITournament[]>();
const displayModal = ref(false);

const form = reactive({
  title: "",
  date: new Date(),
  description: "",
});

function openModal() {
  displayModal.value = true;
}

function closeModal() {
  displayModal.value = false;
}

async function getTournaments() {
  const response = await axios.get<ITournament[]>(
    "http://127.0.0.1:8000/api/tournament"
  );
  tournaments.value = response.data;
}

async function submit(data: { title: string; date: any; description: string }) {
  data.date = new Date(
    data.date.getTime() - data.date.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  try {
    await axios.post("http://127.0.0.1:8000/api/tournament", data);

    await getTournaments();
    closeModal();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Turnament",
      detail: "Turnament se nepodařilo vyvořit",
      life: 3000,
    });
  }
  toast.add({
    severity: "success",
    summary: "Turnament",
    detail: "Turnament vytvořen",
    life: 3000,
  });
}

async function deleteTournament(tournament: ITournament) {
  if (!window.confirm("Opravdu chcete turnaj smazat?")) {
    return;
  }
  await axios.delete("http://127.0.0.1:8000/api/tournament/" + tournament.id);
  await getTournaments();
}
</script>
<template>
  <div class="container mt-5">
    <Card class="tournament">
      <template #title>
        <div class="d-flex justify-content-between container my-3">
          Turnaje
          <Button
            label="Založit turnaj"
            icon="pi pi-plus"
            class="p-button-raised p-button-success"
            @click="openModal()"
          />
        </div>
      </template>
      <template #content>
        <template v-if="tournaments">
          <TabView>
            <TabPanel header="Vše">
              <template v-for="tournament in tournaments">
                <Tournament
                  :id="tournament.id"
                  :title="tournament.title"
                  :date="tournament.date"
                  :usersCount="tournament.users_count"
                  @delete="deleteTournament(tournament)"
                  @click="$router.push('/tournaments/' + tournament.id)"
                >
                </Tournament>
              </template>
            </TabPanel>
            <TabPanel header="Nadcházející">
              <template v-for="tournament in tournaments">
                <Tournament
                  v-if="new Date(tournament.date) >= new Date()"
                  :id="tournament.id"
                  :title="tournament.title"
                  :date="tournament.date"
                  :usersCount="tournament.users_count"
                  @delete="deleteTournament(tournament)"
                  @click="$router.push('/tournaments/' + tournament.id)"
                >
                </Tournament>
              </template>
            </TabPanel>
            <TabPanel header="Minulé">
              <template v-for="tournament in tournaments">
                <Tournament
                  v-if="new Date(tournament.date) < new Date()"
                  :id="tournament.id"
                  :title="tournament.title"
                  :date="tournament.date"
                  :usersCount="tournament.users_count"
                  @delete="deleteTournament(tournament)"
                  @click="$router.push('/tournaments/' + tournament.id)"
                >
                </Tournament>
              </template>
            </TabPanel>
          </TabView>
        </template>
        <template v-else>
          <ProgressSpinner></ProgressSpinner>
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
      <form @submit.prevent="submit(form)">
        <div class="my-6">
          <h5 id="text-area-text">Název</h5>
          <InputText type="text" v-model="form.title" />
          <div class="field col-12 md:col-3">
            <h5 id="text-area-text">Datum</h5>
            <Calendar
              inputId="basic"
              v-model="form.date"
              autocomplete="off"
              dateFormat="dd. mm. yy"
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
          <Button label="Založit turnaj" icon="pi pi-check" type="submit" />
        </div>
      </form>
    </Dialog>
  </div>
</template>
