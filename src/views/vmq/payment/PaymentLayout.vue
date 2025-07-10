<template>
  <div class="payment-layout">
    <div class="payment-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PaymentLayout' })
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.payment-layout {
  width: 100%;
  min-height: 100vh;
  background: var(--art-bg-color);
  padding: 20px;
  box-sizing: border-box;
}

.payment-content {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

@media only screen and (max-width: $device-ipad) {
  .payment-layout {
    padding: 15px;
  }
}

@media only screen and (max-width: $device-phone) {
  .payment-layout {
    padding: 10px;
  }

  .payment-content {
    max-width: 100%;
  }
}
</style>