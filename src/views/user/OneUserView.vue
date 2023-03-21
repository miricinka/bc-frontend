<script setup lang="ts">
import type { IUser } from "@/shared/interface";
import axios from "axios";
import { onMounted, ref } from "vue";

interface Props {
  username: string;
}
const props = defineProps<Props>();

const loggedRole = ref(localStorage.getItem("role"));
const token = ref(localStorage.getItem("token"));

const user = ref<IUser>();

onMounted(() => {
  getUser();
});

async function getUser() {
  const response = await axios<IUser>({
    method: "get",
    url: "http://127.0.0.1:8000/api/users/" + props.username,
    headers: { Authorization: `Bearer ${token.value}` },
  });
  user.value = response.data;
}
</script>
<template>
  <div class="container mt-5">
    <Card class="user">
      <template #title> Uživatel {{ username }}</template>
      <template #content>
        <div v-if="user">
          <h5>{{ user.name }}</h5>
          <h5>{{ user.surname }}</h5>
          <h5>{{ user.email }}</h5>
          <TabView>
            <TabPanel header="Aktivity"> </TabPanel>
            <TabPanel header="Docházka"> </TabPanel>
            <TabPanel header="Turnaje"> </TabPanel>
          </TabView>
        </div>
      </template>
    </Card>
  </div>
</template>
