<template>
  <div class="login-left-view">
    <div class="logo">
      <ArtLogo class="icon" />
      <h1 class="title">{{ AppConfig.systemInfo.name }}</h1>
    </div>
    <img class="left-bg" src="@imgs/login/new_bg.jpeg" />

    <div class="text-wrap">
      <h1> {{ $t('login.leftView.title') }} </h1>
      <p> {{ $t('login.leftView.subTitle') }} </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
</script>

<style lang="scss" scoped>
  .login-left-view {
    position: relative;
    box-sizing: border-box;
    width: 50vw;
    height: 100%;
    padding: 20px;
    overflow: hidden;
    background: #f3f4fb;
    background-size: cover;

    .logo {
      position: relative;
      z-index: 100;
      display: flex;
      align-items: center;

      .title {
        margin: 3px 0 0 10px;
        font-size: 22px;
        font-weight: 600;
        color: #1a1a1a;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
    }

    .left-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .text-wrap {
      position: absolute;
      bottom: 80px;
      width: 100%;
      text-align: center;

      h1 {
        font-size: 28px;
        font-weight: 700;
        color: #1a1a1a;
        text-shadow: 0 2px 4px rgba(255, 255, 255, 0.9);
        margin-bottom: 8px;
      }

      p {
        margin-top: 12px;
        font-size: 16px;
        font-weight: 500;
        color: #2d2d2d;
        text-shadow: 0 1px 3px rgba(255, 255, 255, 0.8);
        line-height: 1.4;
      }
    }

    @media only screen and (max-width: $device-notebook) {
      .text-wrap {
        bottom: 40px;
      }
    }

    @media only screen and (max-width: $device-ipad-pro) {
      display: none;
    }
  }
</style>
