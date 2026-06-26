<script setup lang="ts">
const { has } = defineProps<{
  "has"?: boolean;
}>();
</script>

<template>
  <span :class="[
    'text-brand badge',
    has ? 'badge-green' : 'badge-red',
  ]">
    {{ has ? "Yes" : "No" }}
  </span>
</template>