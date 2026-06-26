<script setup lang="ts">
import { computed } from "vue";

const { has, invert } = defineProps<{
  "has"?: boolean;
  "invert"?: boolean;
}>();

const color = computed((): string => {
  if (invert) {
    return has ? "badge-red" : "badge-green";
  }

  return has ? "badge-green" : "badge-red";
});
</script>

<template>
  <span :class="['text-brand badge', color]">
    {{ has ? "Yes" : "No" }}
  </span>
</template>