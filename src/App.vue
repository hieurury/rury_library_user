<script setup>
import { onMounted } from 'vue';
import { NConfigProvider, NMessageProvider, darkTheme } from 'naive-ui';
import { isDark } from './hooks/useDark';
</script>


<template>
  <NConfigProvider :theme="isDark ? darkTheme : null">
    <NMessageProvider>
      <router-view />
    </NMessageProvider>
  </NConfigProvider>
</template>

<style scoped>

</style>