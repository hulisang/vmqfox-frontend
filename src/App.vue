<template>
  <ElConfigProvider size="default" :locale="locales[language]" :z-index="3000">
    <RouterView></RouterView>
  </ElConfigProvider>
</template>

<script setup lang="ts">
  import { onBeforeMount, onMounted, ref } from 'vue'
  import { useUserStore } from './store/modules/user'
  import { storeToRefs } from 'pinia'
  import zh from 'element-plus/es/locale/lang/zh-cn'
  import en from 'element-plus/es/locale/lang/en'
  import { systemUpgrade } from './utils/sys'
  import { VmqGoService } from './api/vmqGoApi'
  import { setThemeTransitionClass } from './utils/theme/animation'
  import { checkStorageCompatibility } from './utils/storage'

  const userStore = useUserStore()
  const { language } = storeToRefs(userStore)
  const locale = ref(language.value)

  const locales: Record<string, any> = {
    zh: zh,
    en: en
  }

  onBeforeMount(() => {
    setThemeTransitionClass(true)
  })

  onMounted(() => {
    // 检查存储兼容性
    checkStorageCompatibility()
    // 提升暗黑主题下页面刷新视觉体验
    setThemeTransitionClass(false)
    // 系统升级
    systemUpgrade()
    // 获取用户信息
    getUserInfo()
  })

  // 获取用户信息
  const getUserInfo = async () => {
    if (userStore.isLogin) {
      // 对于V免签系统，用户信息已在登录时设置，无需重复获取
      // 检查是否已有用户信息
      if (userStore.getUserInfo.id && userStore.getUserInfo.roles?.length) {
        console.log('用户信息已存在，跳过获取用户信息接口调用')
        return
      }

      try {
        const data = await VmqGoService.getCurrentUser()
        // 将Go API返回的用户信息转换为前端期望的格式
        const userInfo = {
          ...data, // 保留Go API的原始字段
          userId: data.id,
          userName: data.username,
          avatar: '',
          roles: [data.role],
          buttons: []
        }
        userStore.setUserInfo(userInfo as any)
      } catch (error) {
        console.error('获取用户信息失败', error)
        // 如果获取用户信息失败，设置默认用户信息
        if (!userStore.getUserInfo.id) {
          console.log('设置默认V免签用户信息')
          const defaultUserInfo = {
            id: 1,
            username: 'admin',
            email: 'admin@vmqfox.com',
            role: 'admin',
            created_at: new Date().toISOString(),
            userId: 1,
            userName: 'admin',
            avatar: '',
            roles: ['admin'],
            buttons: []
          }
          userStore.setUserInfo(defaultUserInfo as any)
        }
      }
    }
  }
</script>