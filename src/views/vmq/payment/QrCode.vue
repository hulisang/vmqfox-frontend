<template>
  <div class="qrcode-container">
    <img :src="qrcodeUrl" alt="支付二维码" class="qrcode-img" />
    <div class="qrcode-overlay" v-if="showOverlay">
      <img :src="overlayIcon" alt="使用说明" class="overlay-icon" @click="hideOverlay" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PaymentService } from '@/api/paymentApi'
import use1Icon from '@/assets/img/payment/use_1.png'
import use2Icon from '@/assets/img/payment/use_2.png'

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  payType: {
    type: Number,
    required: true
  }
})

const showOverlay = ref(true)
const qrcodeUrl = computed(() => PaymentService.getQrCodeUrl(props.url))

const overlayIcon = computed(() => {
  return props.payType === 1 
    ? use1Icon
    : use2Icon
})

const hideOverlay = () => {
  showOverlay.value = false
}

onMounted(() => {
  // 3秒后自动隐藏提示
  setTimeout(() => {
    showOverlay.value = false
  }, 3000)
})
</script>

<style scoped>
.qrcode-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.qrcode-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qrcode-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.overlay-icon {
  width: 64px;
  height: 64px;
  cursor: pointer;
}
</style> 