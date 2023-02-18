<script setup lang="ts">
import axios from "axios";
import { onMounted, ref } from "vue";
import type { ITournament } from "@/shared/interface";

interface Props {
  id: string;
}
const props = defineProps<Props>();

enum Winner {
  blackPlayer,
  whitePlayer,
  None,
}

interface Game {
  blackPlayer: string;
  whitePlayer: string;
  winner: Winner;
}

onMounted(() => {
  getTournament();
});

const tournament = ref<ITournament>();
const results = ref<Game[]>([]);

async function getTournament() {
  const response = await axios.get<ITournament>(
    "http://127.0.0.1:8000/api/tournament/" + props.id
  );
  tournament.value = response.data;
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
                      'table-danger':
                        (iCol < iRow && (iCol + iRow) % 2 === 1) ||
                        (iCol > iRow && (iCol + iRow + 1) % 2 === 1),
                    }"
                  >
                    <template v-if="user.username !== userColumn.username">
                      <RadioButton name="city" value="Win" />
                      <RadioButton name="city" value="Lose" v-model="results" />
                      <RadioButton name="city" value="Tie" v-model="results" />
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
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
