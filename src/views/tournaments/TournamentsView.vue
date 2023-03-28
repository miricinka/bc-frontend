<script setup lang="ts">
import type { ITournament } from "@/shared/interface";
import axios from "axios";
import { onMounted, reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const loggedRole = ref(localStorage.getItem("role"));
const loggedUsername = ref(localStorage.getItem("username"));
const token = ref(localStorage.getItem("token"));

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
    await axios({
      method: "post",
      url: "http://127.0.0.1:8000/api/tournament",
      data: data,
      headers: { Authorization: `Bearer ${token.value}` },
    });

    await getTournaments();
    closeModal();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Turnament",
      detail: "Turnament se nepodařilo vyvořit",
      life: 3000,
    });
    return;
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
  try {
    await axios({
      method: "delete",
      url: "http://127.0.0.1:8000/api/tournament/" + tournament.id,
      headers: { Authorization: `Bearer ${token.value}` },
    });
    toast.add({
      severity: "success",
      summary: "Zápas smazán",
      life: 3000,
    });
    await getTournaments();
  } catch {
    toast.add({
      severity: "error",
      summary: "Turnaj",
      detail: "Turnaj se nepodařilo smazat",
      life: 3000,
    });
  }
}

async function signUser(tournamentId: number) {
  try {
    await axios({
      method: "post",
      url:
        "http://127.0.0.1:8000/api/tournament/" +
        String(tournamentId) +
        "/user",
      data: { username: loggedUsername.value },
      headers: { Authorization: `Bearer ${token.value}` },
    });
    toast.add({
      severity: "success",
      summary: "Přihlášen",
      life: 3000,
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "Přihlášení",
      detail: "Nepodařilo se přihlásit",
      life: 3000,
    });
    return;
  }
  await getTournaments();
}

async function unsignUser(tournamentId: number) {
  try {
    await axios({
      method: "delete",
      url:
        "http://127.0.0.1:8000/api/tournament/" +
        String(tournamentId) +
        "/user",
      data: { username: loggedUsername.value },
      headers: { Authorization: `Bearer ${token.value}` },
    });
    toast.add({
      severity: "success",
      summary: "Odlášen",
      life: 3000,
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "Přihlášení",
      detail: "Nepodařilo se odhlásit",
      life: 3000,
    });
    return;
  }
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
            v-if="loggedRole === 'admin'"
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
                  :role="loggedRole"
                  :showButtons="
                    new Date(tournament.date) >= new Date() && loggedUsername
                  "
                  :isSigned="
                    tournament.users?.some(
                      (user) => user.username === loggedUsername
                    )
                  "
                  @sign="signUser(tournament.id)"
                  @unsign="unsignUser(tournament.id)"
                  @delete="deleteTournament(tournament)"
                  @detail="$router.push('/tournaments/' + tournament.id)"
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
                  :role="loggedRole"
                  :showButtons="true"
                  :isSigned="
                    tournament.users?.some(
                      (user) => user.username === loggedUsername
                    )
                  "
                  @delete="deleteTournament(tournament)"
                  @sign="signUser(tournament.id)"
                  @unsign="unsignUser(tournament.id)"
                  @detail="$router.push('/tournaments/' + tournament.id)"
                >
                </Tournament>
              </template>
            </TabPanel>
            <TabPanel header="Minulé">
              <template v-for="tournament in tournaments">
                <Tournament
                  v-if="new Date(tournament.date) < new Date()"
                  :showButtons="false"
                  :id="tournament.id"
                  :title="tournament.title"
                  :date="tournament.date"
                  :usersCount="tournament.users_count"
                  :role="loggedRole"
                  :isSigned="
                    tournament.users?.some(
                      (user) => user.username === loggedUsername
                    )
                  "
                  @sign="signUser(tournament.id)"
                  @unsign="unsignUser(tournament.id)"
                  @delete="deleteTournament(tournament)"
                  @detail="$router.push('/tournaments/' + tournament.id)"
                >
                </Tournament>
              </template>
            </TabPanel>
          </TabView>
        </template>
        <template v-else>
          <CardLoading></CardLoading>
          <CardLoading></CardLoading>
        </template>
      </template>
    </Card>
    <Dialog
      header="Nový turnaj"
      v-model:visible="displayModal"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '50vw' }"
      :modal="true"
    >
      <form @submit.prevent="submit(form)">
        <div>
          <div class="m-4">
            <h5 id="text-area-text">Název</h5>
            <InputText type="text" v-model="form.title" />
          </div>
          <div class="m-4">
            <h5 id="text-area-text">Datum</h5>
            <Calendar
              showIcon
              inputId="basic"
              v-model="form.date"
              autocomplete="off"
              dateFormat="dd. mm. yy"
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
