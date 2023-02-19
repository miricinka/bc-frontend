<script setup lang="ts">
import axios from "axios";
import { onMounted, ref } from "vue";
import type { ITournament, IUser } from "@/shared/interface";

interface Props {
  id: string;
}
const props = defineProps<Props>();

interface GameResult {
  black: string;
  white: string;
  winner: string | null;
}

onMounted(() => {
  getTournament();
});

const tournament = ref<ITournament>();
const results = ref<GameResult[]>([]);
results.value = [{ black: "user_2", white: "user_1", winner: "user_2" }];

async function getTournament() {
  const response = await axios.get<ITournament>(
    "http://127.0.0.1:8000/api/tournament/" + props.id
  );
  tournament.value = response.data;
  //map api games to gameResult structure (omit ids and pgn)
  results.value = tournament.value.games.map((game) => {
    return { black: game.black, white: game.white, winner: game.winner };
  });
}

async function checkboxChange(
  black: string,
  white: string,
  winner: string | null
) {
  await axios.put("http://127.0.0.1:8000/api/game", {
    black: black,
    white: white,
    winner: winner,
    tournament_id: tournament.value?.id,
  });

  //remove old value from frontend
  results.value = results.value.filter(
    (entry) => !(entry.black == black && entry.white == white)
  );
  //add new value
  results.value.push({ black: black, white: white, winner: winner });
}

function getUser(username: string): IUser | null {
  if (tournament.value?.users) {
    return (
      tournament.value.users.find((user) => user.username === username) || null
    );
  }
  return null;
}
</script>

<template>
  <div class="container mt-5">
    <Card class="tournament" v-if="tournament">
      <template #title>
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
      <template #content>
        <div class="container">
          <p>{{ tournament.description }}</p>
          <div v-if="tournament.users">
            <table v-if="tournament.users.length > 0" class="table table-hover">
              <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col" v-for="user in tournament.users">
                    <div class="d-flex flex-column">
                      <span>
                        {{ user.name + " " + user.surname }}
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
                      {{ user.name + " " + user.surname }}
                    </span>
                  </th>
                  <td
                    v-for="(userColumn, iCol) in tournament.users"
                    :class="{
                      'table-secondary': user.username === userColumn.username,
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
                </tr>
              </tbody>
            </table>
          </div>
          <Divider></Divider>
          <div class="games">
            <h3>Jednotlivé partie</h3>
            <template v-for="result in results">
              <div>
                <span> black: {{ result.black }}</span>
                <span> white: {{ result.white }}</span>
                <span> winner: {{ result.winner }}</span>
              </div>
            </template>
          </div>
        </div>
      </template>
    </Card>
    {{ results }}
  </div>
</template>
<style>
table {
  table-layout: fixed;
  word-wrap: break-word;
}

table th,
table td {
  overflow: hidden;
}
</style>
