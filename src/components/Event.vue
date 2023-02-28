<script setup lang="ts">
const emit = defineEmits(["delete", "edit"]);
interface Props {
  name: number;
  description: string;
  date: string;
}
const props = defineProps<Props>();
</script>
<template>
  <div class="card mb-3" style="max-width: 540px">
    <div class="row g-0">
      <div class="col-md-1 card-left-color"></div>
      <div class="col-md-11">
        <div class="card-body">
          <h5 class="card-title">{{ name }}</h5>
          <p class="card-text">
            <small class="text-muted">{{
              `${new Date(date).toLocaleDateString()}`
            }}</small>
          </p>
          <p class="card-text">
            {{ description }}
          </p>
          <div class="d-flex justify-content-end">
            <Button
              class="p-button-raised mx-1 p-button-rounded"
              icon="pi pi-file-edit"
            />
            <Button
              class="p-button-raised p-button-danger mx-1 p-button-rounded"
              icon="pi pi-trash"
              @click="$emit('delete')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.card-left-color {
  background-color: #ffc107;
}
</style>
