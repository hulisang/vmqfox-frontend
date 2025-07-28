<template>
  <div class="console">
    <!-- 控制面板 -->
    <div class="control-panel">
      <!-- 数据视图切换（只有超级管理员可见） -->
      <div class="view-switch" v-if="isSuperAdmin">
        <el-radio-group v-model="viewMode" @change="onViewModeChange" size="small">
          <el-radio-button value="personal">个人数据</el-radio-button>
          <el-radio-button value="global">全局数据</el-radio-button>
        </el-radio-group>
        <span class="view-tip">{{ viewMode === 'personal' ? '显示您的个人订单数据' : '显示所有用户的汇总数据' }}</span>
      </div>

      <!-- 自动刷新控制 -->
      <div class="auto-refresh-control">
        <el-switch
          v-model="autoRefreshEnabled"
          @change="toggleAutoRefresh"
          active-text="自动刷新"
          inactive-text="手动刷新"
          :loading="loading"
          :active-value="true"
          :inactive-value="false"
        />
        <span class="refresh-tip" v-if="autoRefreshEnabled">每{{ autoRefreshInterval / 1000 }}秒自动刷新一次</span>
        <el-button
          type="primary"
          size="small"
          plain
          @click="refreshStats(true)"
          :loading="loading"
          class="refresh-btn"
        >
          <el-icon><Refresh /></el-icon>
          刷新订单数据
        </el-button>
      </div>
    </div>
    
    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="card-list">
      <el-col v-for="(item, index) in statCards" :key="index" :sm="12" :md="6" :lg="4">
        <div class="card art-custom-card">
          <div class="card-content">
            <span class="des subtitle">{{ item.title }}</span>
            <CountTo
              class="number box-title"
              :endVal="item.value"
              :duration="1000"
              :prefix="item.prefix || ''"
              separator=""
            ></CountTo>
            <div class="trend-box">
              <span class="trend-text">{{ item.trend || '本周' }}</span>
              <el-icon :color="item.trendColor || '#909399'" :size="14" class="trend-icon">
                <component :is="item.trendIcon || 'Histogram'" />
              </el-icon>
            </div>
          </div>
          <div class="icon-wrapper" :style="{ backgroundColor: item.iconBg || 'var(--el-color-primary-light-9)' }">
            <el-icon :color="item.iconColor || 'var(--el-color-primary)'" :size="24">
              <component :is="item.iconComponent" />
            </el-icon>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 系统信息 -->
    <div class="card art-custom-card system-info">
      <div class="card-header">
        <div class="title">
          <h4>系统信息</h4>
          <p>服务器环境与运行状态</p>
        </div>
        <div class="actions" @click="refreshData">
          <el-icon :size="18" color="var(--el-color-info)" :class="{ 'is-loading': loading }"><Refresh /></el-icon>
        </div>
      </div>
      <div class="card-body">
        <div class="system-icon-wrapper">
          <el-icon :size="24" color="#1890ff"><Monitor /></el-icon>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作系统">{{ config.phpOs }}</el-descriptions-item>
          <el-descriptions-item label="服务器引擎">{{ config.server }}</el-descriptions-item>
          <el-descriptions-item label="PHP版本">{{ config.phpVersion }}</el-descriptions-item>
          <el-descriptions-item label="MySQL版本">{{ config.mysqlVersion }}</el-descriptions-item>
          <el-descriptions-item label="Go版本">{{ config.thinkphpVersion }}</el-descriptions-item>
          <el-descriptions-item label="内存占用">{{ config.gdInfo }}</el-descriptions-item>
          <el-descriptions-item label="主程序版本">{{ config.appVersion }}</el-descriptions-item>
          <el-descriptions-item label="运行时间">{{ config.runTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { VmqGoService } from '@/api/vmqGoApi'
import { CountTo } from 'vue3-count-to'
import { useCommon } from '@/composables/useCommon'
import { useMenuStore } from '@/store/modules/menu'
import { useUserStore } from '@/store/modules/user'
import { 
  Tickets, 
  Select, 
  CircleCheck, 
  CircleClose, 
  Money, 
  WalletFilled, 
  Refresh,
  Histogram,
  Monitor
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'VmqDashboard' })

useCommon().scrollToTop()

const menuStore = useMenuStore()
const userStore = useUserStore()

// 检查是否为超级管理员
const isSuperAdmin = computed(() => {
  const userInfo = userStore.info
  console.log('用户信息:', userInfo)
  console.log('用户角色数组:', userInfo.roles)
  const userRole = userInfo.roles?.[0] || ''
  console.log('用户角色:', userRole)
  console.log('是否为超级管理员:', userRole === 'super_admin')
  return userRole === 'super_admin'
})

// 数据视图模式：personal（个人）或 global（全局）
const viewMode = ref<'personal' | 'global'>('personal')

const stats = ref({
  todayOrder: 0,
  todaySuccessOrder: 0,
  todayCloseOrder: 0,
  todayMoney: 0,
  countMoney: 0,
  countOrder: 0,
})

const config = ref({
  phpOs: '',        // 从 goOs 字段获取
  server: '',
  phpVersion: '',
  mysqlVersion: '',
  thinkphpVersion: '', // 从 goVersion 字段获取，显示为Go版本
  gdInfo: '',       // 从 memoryUsage 字段获取，显示为内存占用
  appVersion: '',
  runTime: '',
})

const loading = ref(false)
const autoRefreshEnabled = ref(true)
const autoRefreshInterval = ref(30000) // 30秒刷新一次
let autoRefreshTimer: number | null = null

// 刷新统计数据
const refreshStats = async (showMessage = false) => {
  try {
    let statusRes
    if (viewMode.value === 'global' && isSuperAdmin.value) {
      // 超级管理员查看全局数据
      statusRes = await VmqGoService.getGlobalSystemStatus()
    } else {
      // 个人数据或普通管理员
      statusRes = await VmqGoService.getSystemStatus()
    }
    stats.value = statusRes

    if (showMessage) {
      const modeText = viewMode.value === 'global' ? '全局' : '个人'
      ElMessage.success(`${modeText}订单数据刷新成功`)
    }
  } catch (error) {
    console.error("刷新订单数据失败:", error)
    if (showMessage) {
      ElMessage.error('刷新订单数据失败，请稍后重试')
    }
  }
}

// 视图模式切换处理
const onViewModeChange = (val: string | number | boolean | undefined) => {
  const newMode = val as 'personal' | 'global'
  console.log('切换视图模式:', newMode)
  refreshStats(true)
}

// 刷新所有数据
const refreshData = async () => {
  if (loading.value) return

  loading.value = true

  try {
    // 根据视图模式获取统计数据
    let statusRes
    if (viewMode.value === 'global' && isSuperAdmin.value) {
      statusRes = await VmqGoService.getGlobalSystemStatus()
    } else {
      statusRes = await VmqGoService.getSystemStatus()
    }

    const configRes = await VmqGoService.getSystemInfo()

    stats.value = statusRes

    // 适配Go API的字段名
    config.value = {
      phpOs: configRes.goOs || configRes.phpOs || '',           // 操作系统从goOs获取
      server: configRes.server || '',
      phpVersion: configRes.phpVersion || '',
      mysqlVersion: configRes.mysqlVersion || '',
      thinkphpVersion: configRes.goVersion || configRes.thinkphpVersion || '', // Go版本从goVersion获取
      gdInfo: configRes.memoryUsage || configRes.gdInfo || '',  // 内存占用从memoryUsage获取
      appVersion: configRes.appVersion || '',
      runTime: configRes.runTime || '',
    }

    const modeText = viewMode.value === 'global' ? '全局' : '个人'
    ElMessage.success(`${modeText}数据刷新成功`)
  } catch (error) {
    console.error("刷新数据失败:", error)
    ElMessage.error('刷新数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 开始自动刷新
const startAutoRefresh = () => {
  // 先清除可能存在的定时器
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
  
  // 只有在启用状态下才创建新的定时器
  if (autoRefreshEnabled.value) {
    autoRefreshTimer = window.setInterval(() => {
      refreshStats()
    }, autoRefreshInterval.value)
    console.log('自动刷新已启动，间隔：', autoRefreshInterval.value, 'ms')
  }
}

// 切换自动刷新状态
const toggleAutoRefresh = (value: string | number | boolean) => {
  // 确保autoRefreshEnabled与开关状态同步
  autoRefreshEnabled.value = Boolean(value)
  
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
    ElMessage.success('已开启自动刷新')
  } else {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer)
      autoRefreshTimer = null
    }
    ElMessage.info('已关闭自动刷新')
  }
}

// 统计卡片数据
const statCards = computed(() => [
  {
    title: '今日总订单',
    value: stats.value.todayOrder,
    trend: '实时统计',
    trendIcon: 'Histogram',
    trendColor: '#909399',
    iconComponent: Tickets,
    iconBg: '#e6f6ff',
    iconColor: '#1890ff'
  },
  {
    title: '今日成功订单',
    value: stats.value.todaySuccessOrder,
    trend: '实时统计',
    trendIcon: 'Histogram',
    trendColor: '#909399',
    iconComponent: CircleCheck,
    iconBg: '#f0f9eb',
    iconColor: '#67c23a'
  },
  {
    title: '今日失败订单',
    value: stats.value.todayCloseOrder,
    trend: '实时统计',
    trendIcon: 'Histogram',
    trendColor: '#909399',
    iconComponent: CircleClose,
    iconBg: '#fef0f0',
    iconColor: '#f56c6c'
  },
  {
    title: '今日收入',
    value: stats.value.todayMoney,
    prefix: '￥',
    trend: '实时统计',
    trendIcon: 'Histogram',
    trendColor: '#909399',
    iconComponent: Money,
    iconBg: '#f0f9eb',
    iconColor: '#67c23a'
  },
  {
    title: '累计总收入',
    value: stats.value.countMoney,
    prefix: '￥',
    trend: '历史累计',
    trendIcon: 'Histogram',
    trendColor: '#909399',
    iconComponent: WalletFilled,
    iconBg: '#fdf6ec',
    iconColor: '#e6a23c'
  },
  {
    title: '累计总订单',
    value: stats.value.countOrder,
    trend: '历史累计',
    trendIcon: 'Histogram',
    trendColor: '#909399',
    iconComponent: Select,
    iconBg: '#f4f4f5',
    iconColor: '#909399'
  }
])

// 侦听路由添加状态，确保在路由准备好之后再加载数据
watch(
  () => menuStore.isDynamicRouteAdded,
  (isAdded) => {
    if (isAdded) {
      refreshData()
      startAutoRefresh()
    }
  },
  { immediate: true } // immediate: true 确保在组件加载时如果状态已为true，也能立即执行
)

onUnmounted(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
})
</script>

<style lang="scss" scoped>
.console {
  --card-spacing: 20px;
  padding-bottom: 20px;

  // 控制面板
  .control-panel {
    margin-bottom: 20px;

    .view-switch {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      margin-bottom: 12px;
      background: var(--art-main-bg-color);
      border-radius: calc(var(--custom-radius) + 4px);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

      .view-tip {
        font-size: 12px;
        color: var(--art-gray-600);
        margin-left: 8px;
      }

      :deep(.el-radio-group) {
        .el-radio-button__inner {
          font-size: 13px;
          font-weight: 500;
          padding: 6px 12px;
        }
      }
    }

    .auto-refresh-control {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: var(--art-main-bg-color);
      border-radius: calc(var(--custom-radius) + 4px);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

      .refresh-tip {
        margin-left: 10px;
        font-size: 13px;
        color: var(--art-gray-600);
      }

      .refresh-btn {
        margin-left: auto;
      }
    }
  }

  // 卡片头部
  :deep(.card-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px 5px 20px;

    .title {
      h4 {
        font-size: 18px;
        font-weight: 500;
        color: var(--art-gray-900) !important;
        margin: 0;
      }

      p {
        margin-top: 3px;
        font-size: 13px;
        color: var(--art-gray-600) !important;
      }
    }
    
    .actions {
      cursor: pointer;
      padding: 6px;
      border-radius: 4px;
      transition: all 0.3s;
      
      &:hover {
        background-color: var(--el-fill-color-light);
      }
      
      .is-loading {
        animation: rotate 1s linear infinite;
      }
      
      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    }
  }

  // 设置卡片背景色、圆角、间隙
  .card-list .card,
  .card {
    margin-bottom: var(--card-spacing);
    background: var(--art-main-bg-color);
    border-radius: calc(var(--custom-radius) + 4px) !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
  }

  .card-list {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    background-color: transparent !important;

    .art-custom-card {
      position: relative;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      width: 100%;
      height: 120px;
      padding: 20px;
      list-style: none;
      overflow: hidden;

      .card-content {
        flex: 1;
        
        .des {
          display: block;
          height: 14px;
          font-size: 14px;
          line-height: 14px;
          color: var(--art-text-gray-600);
          white-space: nowrap;
        }

        .number {
          display: block;
          margin-top: 12px;
          font-size: 28px;
          font-weight: 500;
          color: var(--art-gray-900);
        }
        
        .trend-box {
          display: flex;
          align-items: center;
          margin-top: 12px;
          
          .trend-text {
            font-size: 12px;
            color: var(--art-text-gray-500);
            margin-right: 6px;
          }
          
          .trend-icon {
            margin-top: 1px;
          }
        }
      }

      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        margin-left: 16px;
        border-radius: 8px;
      }
    }
  }

  .system-info {
    .card-body {
      padding: 0 20px 20px;
      
      .system-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        margin-bottom: 15px;
        border-radius: 8px;
        background-color: #e6f6ff;
      }
      
      :deep(.el-descriptions) {
        --el-descriptions-item-bordered-label-background: var(--el-fill-color-light);
        
        .el-descriptions__body {
          background-color: var(--art-main-bg-color);
          border-radius: var(--custom-radius);
          overflow: hidden;
        }
        
        .el-descriptions__label {
          font-weight: 500;
          color: var(--art-gray-700);
        }
        
        .el-descriptions__content {
          color: var(--art-gray-900);
        }
        
        .el-descriptions-item__cell {
          padding: 12px 16px;
        }
      }
    }
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
    
    .card-header {
      padding-bottom: 15px;
    }
    
    transition: all 0.3s;
  }
}

// 暗黑模式适配
.dark {
  .console {
    .control-panel {
      .view-switch {
        background-color: var(--art-main-bg-color);
      }

      .auto-refresh-control {
        background-color: var(--art-main-bg-color);
      }
    }
    
    .card-list {
      .art-custom-card {
        .icon-wrapper {
          background-color: #232323 !important;
        }
      }
    }
    
    .system-info {
      :deep(.el-descriptions) {
        --el-descriptions-item-bordered-label-background: #232323;
        
        .el-descriptions__body {
          background-color: var(--art-main-bg-color);
          
          .el-descriptions-item__cell {
            border-color: #333;
          }
        }
      }
      
      .system-icon-wrapper {
        background-color: #232323 !important;
      }
    }
  }
}
</style>