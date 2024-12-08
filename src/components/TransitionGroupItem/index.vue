<template>
  <div :style="{ transition: 'all 0.3s ease' }">
    <slot />
  </div>
</template>

<script setup>
defineOptions({
  name: 'TransitionGroupItem',
});
</script>
