<script setup lang="ts">
const emit = defineEmits(["delete", "edit", "sign", "unsign", "detail"]);
interface Props {
  id: number;
  title: string;
  date: string;
  usersCount: number;
  role: string;
  showButtons: boolean;
  isSigned: boolean;
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
              <div class="click p-3 flex" @click="$emit('detail')">
                <th class="mr-5">
                  {{ `${new Date(date).toLocaleDateString()}` }}
                </th>
                <td>{{ title }}</td>
              </div>
              <td class="actions d-flex ml-auto align-items-center">
                <span class="mx-5"
                  >{{ usersCount }} <i class="pi pi-user"></i
                ></span>
                <template v-if="showButtons">
                  <Button
                    v-if="isSigned"
                    label="Odhlásit se"
                    icon="pi pi-minus"
                    class="p-button-raised p-button"
                    @click="$emit('unsign')"
                  ></Button>
                  <Button
                    v-else
                    label="Přihlásit se"
                    icon="pi pi-plus"
                    class="p-button-raised p-button-success"
                    @click="$emit('sign')"
                  ></Button>
                </template>
                <Button
                  v-if="role === 'admin'"
                  label="Upravit"
                  icon="pi pi-file-edit"
                  class="p-button-raised"
                  @click="$emit('edit', id)"
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

.tournament-card div.click {
  cursor: pointer;
}
</style>
