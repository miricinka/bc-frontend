<script setup lang="ts">
import type { ITournament } from "@/shared/interface";
import axios from "axios";
import { onMounted, reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";
import router from "@/router";

const toast = useToast();
const loggedRole = ref(localStorage.getItem("role"));
const loggedUsername = ref(localStorage.getItem("username"));
const token = ref(localStorage.getItem("token"));

/**
 * checks if user is logged in to view tournament
 * gets tournaments on component mount
 */
onMounted(() => {
  if (!token.value) {
    router.push("/notAuth");
  }
  getTournaments();
});

const tournaments = ref<ITournament[]>();
const displayModal = ref(false);
const displayEditModal = ref(false);
let editingTournamentId: number = 0;

const form = reactive({
  title: "",
  date: new Date(),
  description: "",
});

/**
 * resets tournament form
 */
function clearForm() {
  form.date = new Date();
  form.description = "";
  form.title = "";
}

/**
 * opens create modal
 */
function openModal() {
  clearForm();
  displayModal.value = true;
}

/**
 * closes create modal
 */
function closeModal() {
  displayModal.value = false;
}

/**
 * opens edit modal
 */
function openEditModal() {
  displayEditModal.value = true;
}

/**
 * closes edit modal
 */
function closeEditModal() {
  displayEditModal.value = false;
}

/**
 * gets tournaments from server
 * shows error notification if failed
 */
async function getTournaments() {
  try {
    const response = await axios<ITournament[]>({
      method: "get",
      url: "http://127.0.0.1:8000/api/tournament/",
      headers: { Authorization: `Bearer ${token.value}` },
    });
    tournaments.value = response.data;
  } catch {
    toast.add({
      severity: "error",
      summary: "Turnament",
      detail: "Turnaje se nepodařilo načíst",
      life: 3000,
    });
  }
}

/**
 * creates new tournament on server
 * shows notification
 * refreshes tournaments
 * @param data
 */
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
      detail: "Turnament se nepodařilo vytvořit",
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

/**
 * handles edit tournament event by tournament component
 * opens modal
 * prefils form
 * @param tournament
 */
async function editTournament(tournament: ITournament) {
  form.date = new Date(tournament.date);
  form.description = tournament.description;
  form.title = tournament.title;
  openEditModal();
  editingTournamentId = tournament.id;
}

/**
 * edits tournament on server
 * shows notification
 * reloads tournaments
 * @param data
 */
async function edit(data: { title: string; date: any; description: string }) {
  data.date = new Date(
    data.date.getTime() - data.date.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  try {
    await axios({
      method: "put",
      url: "http://127.0.0.1:8000/api/tournament/" + editingTournamentId,
      data: data,
      headers: { Authorization: `Bearer ${token.value}` },
    });

    await getTournaments();
    closeEditModal();
    editingTournamentId = 0;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Turnament",
      detail: "Turnament se nepodařilo upravit",
      life: 3000,
    });
    return;
  }
  toast.add({
    severity: "success",
    summary: "Turnament",
    detail: "Turnament upraven",
    life: 3000,
  });
}

/**
 * deletes tournament on server
 * shows notification
 * reloads tournaments
 * @param tournament
 */
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

/**
 * sends request to server to sign user to tournament
 * shows notif
 * reloads tournaments
 * @param tournamentId
 */
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

/**
 * sends request to server to unsign user to tournament
 * shows notif
 * reloads tournaments
 * @param tournamentId
 */
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
                  @edit="editTournament(tournament)"
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
                  @edit="editTournament(tournament)"
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
                  @edit="editTournament(tournament)"
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

    <Dialog
      header="Upravit turnaj"
      v-model:visible="displayEditModal"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '50vw' }"
      :modal="true"
    >
      <form @submit.prevent="edit(form)">
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
            @click="closeEditModal()"
            class="p-button-text"
          />
          <Button label="Upravit turnaj" icon="pi pi-check" type="submit" />
        </div>
      </form>
    </Dialog>
  </div>
</template>
