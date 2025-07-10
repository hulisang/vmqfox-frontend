<template>
  <div class="countdown-container">
    <div class="countdown-time">
      <span class="time-block">{{ formattedHours }} 时</span>
      <span class="time-block">{{ formattedMinutes }} 分</span>
      <span class="time-block">{{ formattedSeconds }} 秒</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  timeout: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Number,
    default: 0 // 这个参数现在只是为了兼容性保留，实际不再使用
  }
})

const emit = defineEmits(['timeout'])

const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
let timer: number | null = null

// 格式化时间，保证两位数显示
const formattedHours = computed(() => hours.value.toString())
const formattedMinutes = computed(() => minutes.value < 10 ? '0' + minutes.value : minutes.value.toString())
const formattedSeconds = computed(() => seconds.value < 10 ? '0' + seconds.value : seconds.value.toString())

// 初始化倒计时
const initCountdown = () => {
  try {
    // 检查参数有效性
    if (!props.timeout || isNaN(props.timeout) || props.timeout <= 0) {
      console.error('无效的超时时间:', props.timeout)
      emit('timeout')
      return
    }
    
    // 直接使用传入的剩余秒数
    let remaining = Math.max(0, props.timeout)
    console.log('倒计时初始化，剩余秒数:', remaining)
    
    if (remaining <= 0) {
      console.log('订单已过期，触发timeout事件')
      emit('timeout')
      return
    }
    
    updateCountdown(remaining)
    
    // 启动倒计时
    timer = window.setInterval(() => {
      remaining -= 1
      
      if (remaining <= 0) {
        console.log('倒计时结束，触发timeout事件')
        clearInterval(timer!)
        emit('timeout')
        return
      }
      
      updateCountdown(remaining)
    }, 1000)
  } catch (error) {
    console.error('倒计时初始化错误:', error)
    emit('timeout')
  }
}

// 更新倒计时显示
const updateCountdown = (remaining: number) => {
  hours.value = Math.floor(remaining / 3600)
  minutes.value = Math.floor((remaining % 3600) / 60)
  seconds.value = remaining % 60
}

onMounted(() => {
  initCountdown()
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.countdown-container {
  margin: 16px 0;
  text-align: center;
}

.countdown-time {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.time-block {
  font-size: 16px;
  font-weight: bold;
}
</style> 