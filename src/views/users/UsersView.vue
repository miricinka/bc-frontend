<script setup lang="ts">
import type { IUser } from "@/shared/interface";
import axios from "axios";
import { onMounted, ref } from "vue";

const token = ref(localStorage.getItem("token"));

const users = ref<IUser[]>();

onMounted(() => {
  getUsers();
});

async function getUsers() {
  const response = await axios<IUser[]>({
    method: "get",
    url: "http://127.0.0.1:8000/api/users/",
    headers: { Authorization: `Bearer ${token.value}` },
  });
  users.value = response.data;
}
</script>
<template>
  <div class="container mt-5">
    <Card class="user">
      <template #title> Uživatelé </template>
      <template #content>
        <template v-if="users">
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">Jméno</th>
                <th scope="col">Příjmení</th>
                <th scope="col">email</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users">
                <th scope="row">{{ user.username }}</th>
                <td>{{ user.name }}</td>
                <td>{{ user.surname }}</td>
                <td>{{ user.email }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-else>
          <TableLoading></TableLoading>
        </template>
      </template>
    </Card>
  </div>
</template>
