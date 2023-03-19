<script setup lang="ts">
const emit = defineEmits(["delete"]);
interface Props {
  id: number;
  title: string;
  date: string;
  usersCount: number;
  role: string;
}
const props = defineProps<Props>();
</script>
<template>
  <div class="container my-3">
    <Card class="tournament-card">
      <template #content>
        <table class="table table-borderless">
          <tbody>
            <tr class="d-flex align-items-center">
              <th>{{ `${new Date(date).toLocaleDateString()}` }}</th>
              <td>{{ title }}</td>
              <td class="actions d-flex ml-auto align-items-center">
                <span class="mx-5"
                  >{{ usersCount }} <i class="pi pi-user"></i
                ></span>
                <Button
                  label="Přihlásit se"
                  icon="pi pi-plus"
                  class="p-button-raised p-button-success"
                ></Button>
                <Button
                  label="Odhlásit se"
                  icon="pi pi-minus"
                  class="p-button-raised p-button"
                ></Button>
                <Button
                  v-if="role === 'admin'"
                  label="Smazat"
                  icon="pi pi-trash"
                  class="p-button-raised p-button-danger"
                  @click="$emit('delete', id)"
                ></Button>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </Card>
  </div>
</template>

<style>
table {
  margin: 0 !important;
}

.actions Button {
  margin: 2px;
}

.tournament-card {
  cursor: pointer;
}
</style>
