<script setup lang="ts">
const { id } = defineProps<{ id: string | number }>();
</script>

<template>
  <sup>
    <a :href="`#reference-${id}`">[{{ id }}]</a>
  </sup>
</template>
