/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

declare module 'nprogress'

declare module 'crypto-js'

declare module 'vue-img-cutter'

declare module 'file-saver'

// Element Plus 全局组件类型声明
declare global {
  const ElMessage: (typeof import('element-plus'))['ElMessage']
  const ElMessageBox: (typeof import('element-plus'))['ElMessageBox']
  const ElNotification: (typeof import('element-plus'))['ElNotification']
  const ElLoading: (typeof import('element-plus'))['ElLoading']
  const ElTag: (typeof import('element-plus/es'))['ElTag']
}

declare module 'qrcode.vue' {
  export type Level = 'L' | 'M' | 'Q' | 'H'
  export type RenderAs = 'canvas' | 'svg'
  export type GradientType = 'linear' | 'radial'
  export interface ImageSettings {
    src: string
    height: number
    width: number
    excavate: boolean
  }
  export interface QRCodeProps {
    value: string
    size?: number
    level?: Level
    background?: string
    foreground?: string
    renderAs?: RenderAs
  }
  const QrcodeVue: any
  export default QrcodeVue
}

// 全局变量声明
declare const __APP_VERSION__: string // 版本号

// 环境变量提示
// interface ImportMetaEnv {
//   VITE_BASE_API_URL: string
// }

// 导入 vue-i18n 的类型定义
// import 'vue-i18n';

// declare module 'vue' {
//   interface ComponentCustomProperties {
//     $t: typeof import('vue-i18n').t;
//   }
// }
