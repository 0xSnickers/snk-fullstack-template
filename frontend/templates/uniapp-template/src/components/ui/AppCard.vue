<template>
  <view class="app-card"><slot /></view>
</template>

<style scoped>
.app-card {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--card);
}
</style>
