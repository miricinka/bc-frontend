<template>
  <div class="grid formgrid">
    <div class="field col-12 md:col-6 md:pr-6 pr-0">
      <div class="custom-skeleton p-4">
        <div class="flex mb-3">
          <div>
            <Skeleton width="10rem" class="mb-2"></Skeleton>
            <Skeleton width="5rem" class="mb-2"></Skeleton>
            <Skeleton height=".5rem"></Skeleton>
          </div>
        </div>
        <Skeleton width="100%" height="150px"></Skeleton>
      </div>
    </div>
  </div>
</template>
