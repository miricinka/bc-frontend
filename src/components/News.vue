<script setup lang="ts">
const emit = defineEmits(["delete"]);
interface Props {
  id: number;
  title: string;
  text: string;
  dateCreated: string;
  commentCount: number;
}
const props = defineProps<Props>();
</script>

<template>
  <div class="container my-3">
    <Card class="news-card">
      <template #title>
        {{ title }}
        <Divider align="right">
          <div class="inline-flex align-items-center">
            <b>{{ `${new Date(dateCreated).toLocaleDateString()}` }}</b>
          </div>
        </Divider>
      </template>
      <template #content>
        <div v-if="text.length < 300">{{ text }}</div>
        <div v-else>{{ text.substring(0, 300) + "..." }}</div>
      </template>
      <template #footer>
        <div class="d-flex justify-content-between">
          <div>
            <Button
              :label="`${commentCount}`"
              icon="pi pi-comment"
              iconPos="right"
              class="p-button-outlined p-button-secondary"
              @click="$router.push({ path: `/news/${id}` })"
            />
          </div>
          <div>
            <Button
              label="Editovat"
              class="p-button-raised mx-1"
              icon="pi pi-file-edit"
              @click="$router.push({ path: `/news/${id}/edit` })"
            />
            <Button
              label="Smazat"
              class="p-button-raised p-button-danger mx-1"
              icon="pi pi-trash"
              @click="$emit('delete', id)"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style>
.news-card {
  border-radius: 25px;
}
</style>
