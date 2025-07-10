<template>
  <div class="payment-layout">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PaymentLayout' })
</script>

<style lang="scss" scoped>
.payment-layout {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
}
</style> 