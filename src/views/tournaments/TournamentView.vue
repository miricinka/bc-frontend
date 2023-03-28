<script setup lang="ts">
import axios from "axios";
import { onMounted, reactive, ref } from "vue";
import type { ITournament, IUser } from "@/shared/interface";
import router from "@/router";
import { Chess } from "chess.js";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const loggedRole = ref(localStorage.getItem("role"));
const token = ref(localStorage.getItem("token"));

interface Props {
  id: string;
}
const props = defineProps<Props>();
const displayModal = ref<boolean>(false);
const showSkeleton = ref<boolean>(false);

interface GameResult {
  black: string;
  white: string;
  winner: string | null;
}

const form = reactive({
  black: "",
  white: "",
  pgn: "",
});

onMounted(() => {
  getTournament();
});

const tournament = ref<ITournament>();
const results = ref<GameResult[]>([]);
const PGNError = ref<boolean>(false);

/*
  gets tournament from the server
  loads it to internal variable
*/
async function getTournament() {
  const response = await axios<ITournament>({
    method: "get",
    url: "http://127.0.0.1:8000/api/tournament/" + props.id,
    headers: { Authorization: `Bearer ${token.value}` },
  });
  tournament.value = response.data;
  //map api games to gameResult structure (omit ids and pgn)
  results.value = tournament.value.games.map((game) => {
    return { black: game.black, white: game.white, winner: game.winner };
  });
}

/*
  reacts to change in checkbox, 
  sends the changed value to server
  triggers success/error notification
*/
async function checkboxChange(
  black: string,
  white: string,
  winner: string | null
) {
  showSkeleton.value = true;
  try {
    await axios({
      method: "put",
      url: "http://127.0.0.1:8000/api/game",
      data: {
        black: black,
        white: white,
        winner: winner,
        tournament_id: tournament.value?.id,
      },
      headers: { Authorization: `Bearer ${token.value}` },
    });
  } catch {
    toast.add({
      severity: "error",
      detail: "Změnu se nepodařilo uložit",
      life: 3000,
    });
    //remove new change in case of error
    results.value = results.value.filter(
      (entry) =>
        !(
          entry.black === black &&
          entry.white === white &&
          entry.winner === winner
        )
    );
    return;
  }
  //remove old value from frontend
  results.value = results.value.filter(
    (entry) => !(entry.black == black && entry.white == white)
  );
  //add new value
  results.value.push({ black: black, white: white, winner: winner });
  showSkeleton.value = false;
}

function getUser(username: string): IUser | null {
  if (tournament.value?.users) {
    return (
      tournament.value.users.find((user) => user.username === username) || null
    );
  }
  return null;
}

/*
  opens modal
*/
function openPGNModal(result: GameResult) {
  form.black = result.black;
  form.white = result.white;
  displayModal.value = true;
}

/*
  closes modal, resets form
 */
function closeModal() {
  displayModal.value = false;
  PGNError.value = false;
  form.pgn = "";
}

/*
  checks if this game has some pgn in order to show play button
*/
function hasPGN(result: GameResult): boolean {
  if (tournament.value) {
    if (
      tournament.value.games.find(
        (entry) =>
          entry.black == result.black &&
          entry.white == result.white &&
          entry.pgn
      )
    ) {
      return true;
    }
  }
  return false;
}

/*
  redirects to Chess screen and gives the game id as input param,
  so the screen can first init the game with this pgn
*/
function playPGN(result: GameResult) {
  let entry;
  if (tournament.value) {
    entry = tournament.value.games.find(
      (entry) =>
        entry.black == result.black && entry.white == result.white && entry.pgn
    );
  }
  router.push({ name: "chess", params: { id: entry?.id } });
}

/*
  uploads pgn, but first it checks if its valid pgn
*/
async function uploadPGN(black: string, white: string, pgn: string) {
  PGNError.value = false;
  if (!pgn || pgn === "") {
    PGNError.value = true;
    toast.add({
      severity: "error",
      summary: "PGN",
      detail: "PGN nezadáno",
      life: 3000,
    });
    return;
  }
  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "PGN",
      detail: "Nevalidní PGN",
      life: 3000,
    });
    PGNError.value = true;
    return;
  }

  try {
    await axios({
      method: "put",
      url: "http://127.0.0.1:8000/api/game",
      data: {
        black: black,
        white: white,
        pgn: pgn,
        tournament_id: tournament.value?.id,
      },
      headers: { Authorization: `Bearer ${token.value}` },
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "PGN",
      detail: "PGN se nepodařilo nahrát",
      life: 3000,
    });
    return;
  }
  toast.add({
    severity: "success",
    summary: "PGN",
    detail: "PGN nahráno!",
    life: 3000,
  });
  getTournament();
  closeModal();
}

/*
  Calculates gained points for user 
*/
function calculatePoints(user: IUser): number {
  const games = results.value;

  if (!games) return 0;

  const wonGames = games.filter((g) => g.winner === user.username).length;
  const tieGames = games.filter(
    (g) => g.winner === null && [g.black, g.white].includes(user.username)
  ).length;

  return wonGames + tieGames / 2;
}

/*
  Calculates rank for user by his gained points
*/
function calculateRank(user: IUser) {
  const users = tournament.value?.users;
  if (!users) return;

  const sortedUsers = users
    .map((u) => ({ user: u.username, points: calculatePoints(u) }))
    .sort((a, b) => b.points - a.points);

  return sortedUsers.findIndex((u) => u.user === user.username) + 1;
}
</script>

<template>
  <div class="container mt-5">
    <Card class="tournament">
      <template #title>
        <template v-if="tournament">
          <div class="d-flex justify-content-between container my-3">
            {{ tournament.title }}
            <span class="mx-2" v-if="tournament.users">
              {{ tournament.users.length }}
              <i class="pi pi-user" style="font-size: 1.2rem"></i>
            </span>
          </div>
          <Divider align="left">
            <div class="inline-flex align-items-center">
              <b>{{ `${new Date(tournament.date).toLocaleDateString()}` }}</b>
            </div>
          </Divider>
        </template>
      </template>
      <template #content>
        <template v-if="tournament">
          <div class="container tournament-table">
            <p>{{ tournament.description }}</p>
            <div v-if="tournament.users">
              <table
                v-if="tournament.users.length > 0"
                class="table table-hover"
              >
                <thead>
                  <tr>
                    <th scope="col"></th>
                    <th scope="col" v-for="user in tournament.users">
                      <div class="d-flex flex-column">
                        <span>
                          <RouterLink
                            :to="{
                              name: 'user',
                              params: { username: user.username },
                            }"
                            ><h2>{{ user.username }}</h2></RouterLink
                          >
                        </span>
                      </div>
                    </th>
                    <th scope="col">Body</th>
                    <th scope="col">Pořadí</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(user, iRow) in tournament.users">
                    <th scope="row">
                      <span>
                        <RouterLink
                          :to="{
                            name: 'user',
                            params: { username: user.username },
                          }"
                          ><h2>{{ user.username }}</h2></RouterLink
                        >
                      </span>
                    </th>
                    <td
                      v-for="(userColumn, iCol) in tournament.users"
                      :class="{
                        'table-secondary':
                          user.username === userColumn.username,
                        'table-primary':
                          (iCol < iRow && (iCol + iRow) % 2 === 1) ||
                          (iCol > iRow && (iCol + iRow + 1) % 2 === 1),
                      }"
                    >
                      <template v-if="user.username !== userColumn.username">
                        <template
                          v-if="
                            (iCol < iRow && (iCol + iRow) % 2 === 1) ||
                            (iCol > iRow && (iCol + iRow + 1) % 2 === 1)
                          "
                        >
                          <label for="tie">1</label>
                          <Checkbox
                            :disabled="loggedRole !== 'admin'"
                            :value="{
                              black: user.username,
                              white: userColumn.username,
                              winner: user.username,
                            }"
                            name="category"
                            v-model="results"
                            @change="
                              checkboxChange(
                                user.username,
                                userColumn.username,
                                user.username
                              )
                            "
                          />
                          <label for="tie">0</label>
                          <Checkbox
                            :disabled="loggedRole !== 'admin'"
                            :value="{
                              black: user.username,
                              white: userColumn.username,
                              winner: userColumn.username,
                            }"
                            name="category"
                            v-model="results"
                            @change="
                              checkboxChange(
                                user.username,
                                userColumn.username,
                                userColumn.username
                              )
                            "
                          />
                          <label for="tie">1/2</label>
                          <Checkbox
                            :disabled="loggedRole !== 'admin'"
                            :value="{
                              black: user.username,
                              white: userColumn.username,
                              winner: null,
                            }"
                            name="category"
                            v-model="results"
                            @change="
                              checkboxChange(
                                user.username,
                                userColumn.username,
                                null
                              )
                            "
                          />
                        </template>
                        <template v-else>
                          <label for="tie">1</label>
                          <Checkbox
                            :disabled="loggedRole !== 'admin'"
                            :value="{
                              black: userColumn.username,
                              white: user.username,
                              winner: user.username,
                            }"
                            name="category"
                            v-model="results"
                            @change="
                              checkboxChange(
                                userColumn.username,
                                user.username,
                                user.username
                              )
                            "
                          />
                          <label for="tie">0</label>
                          <Checkbox
                            :disabled="loggedRole !== 'admin'"
                            :value="{
                              black: userColumn.username,
                              white: user.username,
                              winner: userColumn.username,
                            }"
                            name="category"
                            v-model="results"
                            @change="
                              checkboxChange(
                                userColumn.username,
                                user.username,
                                userColumn.username
                              )
                            "
                          />
                          <label for="tie">1/2</label>
                          <Checkbox
                            :disabled="loggedRole !== 'admin'"
                            :value="{
                              black: userColumn.username,
                              white: user.username,
                              winner: null,
                            }"
                            name="category"
                            v-model="results"
                            @change="
                              checkboxChange(
                                userColumn.username,
                                user.username,
                                null
                              )
                            "
                          />
                        </template>
                      </template>
                    </td>
                    <td>{{ calculatePoints(user) }}</td>
                    <td>
                      {{ calculateRank(user) }}.<i
                        class="pi pi-star"
                        v-if="calculateRank(user) === 1"
                      ></i>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="games mt-5" v-if="tournament.games.length > 0">
              <h4>Jednotlivé partie</h4>
              <div class="skeleton" v-if="showSkeleton">
                <Skeleton width="40rem" class="mb-3"></Skeleton>
                <Skeleton width="38rem" class="mb-3"></Skeleton>
                <Skeleton width="40rem" class="mb-3"></Skeleton>
                <Skeleton width="38rem" class="mb-3"></Skeleton>
              </div>
              <div v-else class="results-table">
                <div class="container">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">
                          <i class="pi pi-circle-fill"></i> Černý
                        </th>
                        <th scope="col"><i class="pi pi-circle"></i> Bílý</th>
                        <th scope="col"><i class="pi pi-star"></i> Vítěz</th>
                        <th scope="col"><i class="pi pi-file"></i>Partie</th>
                        <th scope="col" v-if="loggedRole === 'admin'">
                          <i class="pi pi-star"></i>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(result, index) in results">
                        <th scope="row">{{ index }}</th>
                        <td>
                          <RouterLink
                            :to="{
                              name: 'user',
                              params: { username: result.black },
                            }"
                            ><h2>{{ result.black }}</h2></RouterLink
                          >
                        </td>
                        <td>
                          <RouterLink
                            :to="{
                              name: 'user',
                              params: { username: result.white },
                            }"
                            ><h2>{{ result.white }}</h2></RouterLink
                          >
                        </td>
                        <td>
                          <template v-if="result.winner">
                            <RouterLink
                              :to="{
                                name: 'user',
                                params: { username: result.winner },
                              }"
                              ><h2>{{ result.winner }}</h2></RouterLink
                            >
                          </template>
                          <template v-else> Remíza </template>
                        </td>
                        <td>
                          <template v-if="hasPGN(result)">
                            <Button
                              label="Přehrát partii"
                              icon="pi pi-play"
                              class="p-button-raised"
                              @click="playPGN(result)"
                            ></Button>
                          </template>
                        </td>
                        <td v-if="loggedRole === 'admin'">
                          <Button
                            label="Nahrát partii"
                            icon="pi pi-plus"
                            size="small"
                            class="p-button-raised p-button-success"
                            @click="openPGNModal(result)"
                          ></Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <ProgressSpinner></ProgressSpinner>
        </template>
      </template>
    </Card>
    <Dialog
      header="Přidat partii"
      v-model:visible="displayModal"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '50vw' }"
      :modal="true"
    >
      <form @submit.prevent="uploadPGN(form.black, form.white, form.pgn)">
        <div class="my-6">
          <h5 id="text-area-text">Černý hráč</h5>
          <InputText type="text" v-model="form.black" disabled="true" />
          <h5 id="text-area-text">Bílý hráč</h5>
          <InputText type="text" v-model="form.white" disabled="true" />
          <h5 id="text-area-text">PGN</h5>
          <Textarea
            v-model="form.pgn"
            :autoResize="true"
            rows="5"
            cols="50"
            aria-labelledby="text-area-text"
            :class="`${PGNError ? 'p-invalid' : ''}`"
          />
          <div v-if="PGNError">
            <small id="pgn-error" class="p-error">Invalid PGN file.</small>
          </div>
        </div>
        <div>
          <Button
            label="Zpět"
            icon="pi pi-times"
            @click="closeModal()"
            class="p-button-text"
          />
          <Button label="Nahrát" icon="pi pi-check" type="submit" />
        </div>
      </form>
    </Dialog>
  </div>
</template>
<style>
div.tournament-table table {
  table-layout: fixed;
  word-wrap: break-word;
}

div.tournament-table table th,
div.tournament-table table td {
  overflow: hidden;
}

div.games h4 {
  font-size: 1.3rem;
  font-weight: 700;
}
</style>
