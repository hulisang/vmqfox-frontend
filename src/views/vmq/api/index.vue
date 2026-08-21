<template>
  <div class="api-docs-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>API接口说明</span>
        </div>
      </template>

      <div class="api-description">
        <p>本文档提供V免签fox二开版支付系统的API接口说明，帮助开发者快速集成支付功能。</p>
      </div>
      <el-alert type="warning" :closable="false" style="margin-bottom: 16px">
        <code>publicToken</code> 是持有即可访问匿名收银台的公开凭据。公开 <code>get</code>、<code>check</code> 和
        <code>return-url</code> 路径只接受该值；旧 <code>orderId</code> 链接会被一致拒绝。
      </el-alert>

      <el-collapse accordion>
        <!-- 创建订单 -->
        <el-collapse-item name="1">
          <template #title>
            <div class="api-title">
              <el-tag type="success">POST</el-tag>
              <span>创建订单</span>
            </div>
          </template>
          <div class="api-content">
            <h4>请求地址</h4>
            <el-alert
              type="info"
              :closable="false">
              <code>/api/order/create</code>
            </el-alert>

            <h4>请求参数</h4>
            <el-table :data="createOrderParams" style="width: 100%">
              <el-table-column prop="param" label="参数" width="150" />
              <el-table-column prop="type" label="类型" width="150" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="scope">
                  <el-tag v-if="scope.row.required" type="danger" size="small">是</el-tag>
                  <el-tag v-else type="info" size="small">否</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" />
            </el-table>

            <h4>请求示例</h4>
            <pre class="code-block">
{
  "payId": "1547129707139",
  "type": 2,
  "price": 0.10,
  "sign": "&lt;hmac_sha256 结果，64 位小写 hex&gt;",
  "param": "vone666",
  "notifyUrl": "https://example.com/notify",
  "returnUrl": "https://example.com/return"
}</pre>

            <h4>签名算法（v2）</h4>
            <p>sign = hmac_sha256(通讯密钥, "payId=" + payId + "&amp;param=" + param + "&amp;type=" + type + "&amp;price=" + price + "&amp;notifyUrl=" + notifyUrl + "&amp;returnUrl=" + returnUrl)</p>
            <el-alert type="warning" :closable="false" style="margin-bottom: 12px">
              通讯密钥作为 HMAC 密钥参与运算，不再拼接进签名明文；结果取 64 位小写 hex。
              price 需定标为两位小数，且必须与请求中提交的 price 完全一致；notifyUrl / returnUrl
              未传时以空串参与签名。v1 的 MD5 签名已停止受理。
            </el-alert>

            <h4>响应示例</h4>
            <pre class="code-block">
{
  "code": 200,
  "msg": "成功",
  "data": {
    "payId": "1547129707139",
    "orderId": "202401102220147500",
    "publicToken": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "payType": 2,
    "price": "0.10",
    "reallyPrice": "0.10",
    "payUrl": "HTTPS://QR.ALIPAY.COM/FKX03500Z2ZYWA0ELYUB5D",
    "isAuto": 1,
    "redirectUrl": "https://pay.example.com/#/payment/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  }
}</pre>

            <h4>响应参数说明</h4>
            <el-table :data="createOrderResponse" style="width: 100%">
              <el-table-column prop="param" label="参数" width="150" />
              <el-table-column prop="type" label="类型" width="150" />
              <el-table-column prop="description" label="说明" />
            </el-table>
          </div>
        </el-collapse-item>

        <!-- 查询订单信息 -->
        <el-collapse-item name="2">
          <template #title>
            <div class="api-title">
              <el-tag type="primary">GET</el-tag>
              <span>查询订单信息</span>
            </div>
          </template>
          <div class="api-content">
            <h4>请求地址</h4>
            <el-alert
              type="info"
              :closable="false">
              <code>/api/order/get/:publicToken</code>
            </el-alert>

            <h4>请求参数</h4>
            <el-table :data="getOrderParams" style="width: 100%">
              <el-table-column prop="param" label="参数" width="150" />
              <el-table-column prop="type" label="类型" width="150" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="scope">
                  <el-tag v-if="scope.row.required" type="danger" size="small">是</el-tag>
                  <el-tag v-else type="info" size="small">否</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" />
            </el-table>

            <h4>响应示例</h4>
            <pre class="code-block">
{
  "code": 200,
  "msg": "成功",
  "data": {
    "payId": "1547129707139",
    "payType": 2,
    "price": 0.10,
    "reallyPrice": 0.10,
    "payUrl": "HTTPS://QR.ALIPAY.COM/FKX03500Z2ZYWA0ELYUB5D",
    "isAuto": 1,
    "state": 0,
    "stateText": "未支付",
    "timeOut": 5,
    "date": 1547130014,
    "remainingSeconds": 240
  }
}</pre>
          </div>
        </el-collapse-item>

        <!-- 查询订单状态 -->
        <el-collapse-item name="3">
          <template #title>
            <div class="api-title">
              <el-tag type="primary">GET</el-tag>
              <span>查询订单状态</span>
            </div>
          </template>
          <div class="api-content">
            <h4>请求地址</h4>
            <el-alert
              type="info"
              :closable="false">
              <code>/api/order/check/:publicToken</code>
            </el-alert>

            <h4>请求参数</h4>
            <el-table :data="checkOrderParams" style="width: 100%">
              <el-table-column prop="param" label="参数" width="150" />
              <el-table-column prop="type" label="类型" width="150" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="scope">
                  <el-tag v-if="scope.row.required" type="danger" size="small">是</el-tag>
                  <el-tag v-else type="info" size="small">否</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" />
            </el-table>

            <h4>响应示例</h4>
            <pre class="code-block">
{
  "code": 200,
  "msg": "成功",
  "data": {
    "state": 0,
    "remainingSeconds": 240
  }
}</pre>
            <el-alert type="info" :closable="false">
              支付成功后，收银台才会以同一个 <code>publicToken</code> 调用
              <code>/api/order/return-url/:publicToken</code> 获取服务端签名的回跳地址。公开状态查询不会返回
              <code>returnUrl</code>、<code>param</code> 或任何内部订单号。
            </el-alert>
          </div>
        </el-collapse-item>

        <!-- 关闭订单 -->
        <el-collapse-item name="4">
          <template #title>
            <div class="api-title">
              <el-tag type="warning">POST</el-tag>
              <span>关闭订单</span>
            </div>
          </template>
          <div class="api-content">
            <h4>请求地址</h4>
            <el-alert
              type="info"
              :closable="false">
              <code>/api/order/close/:id</code>
            </el-alert>

            <p>仅管理员可调用。请求头必须包含 <code>Authorization: &lt;accessToken&gt;</code>。</p>

            <h4>请求参数</h4>
            <el-table :data="closeOrderParams" style="width: 100%">
              <el-table-column prop="param" label="参数" width="150" />
              <el-table-column prop="type" label="类型" width="150" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="scope">
                  <el-tag v-if="scope.row.required" type="danger" size="small">是</el-tag>
                  <el-tag v-else type="info" size="small">否</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" />
            </el-table>

            <h4>鉴权</h4>
            <p>使用管理 Token（Authorization 请求头），无需商户签名。</p>

            <h4>响应示例</h4>
            <pre class="code-block">
{
  "code": 200,
  "msg": "成功",
  "data": null
}</pre>
          </div>
        </el-collapse-item>

        <!-- 查询服务端状态 -->
        <el-collapse-item name="5">
          <template #title>
            <div class="api-title">
              <el-tag type="primary">GET</el-tag>
              <span>查询服务端状态</span>
            </div>
          </template>
          <div class="api-content">
            <h4>请求地址</h4>
            <el-alert
              type="info"
              :closable="false">
              <code>/api/config/monitor</code>
            </el-alert>

            <p>仅管理员可调用。请求头必须包含 <code>Authorization: &lt;accessToken&gt;</code>，无需监控签名。</p>

            <h4>响应示例</h4>
            <pre class="code-block">
{
  "code": 200,
  "msg": "成功",
  "data": {
    "lastpay": "1547394640",
    "lastheart": "1547613873",
    "jkstate": "1"
  }
}</pre>
          </div>
        </el-collapse-item>

        <!-- 回调参数说明 -->
        <el-collapse-item name="6">
          <template #title>
            <div class="api-title">
              <el-tag type="info">说明</el-tag>
              <span>回调参数说明</span>
            </div>
          </template>
          <div class="api-content">
            <p>当系统收到用户收款后，将会向您设定的异步通知地址发送 POST 请求（<code>Content-Type: application/x-www-form-urlencoded</code>），通知您的服务端订单完成收款。</p>
            <p>若您使用的是前端页面跳转（同步通知），则在支付完成后会携带 Query 参数以 GET 形式重定向到您的同步跳转接口。</p>

            <h4>回调参数</h4>
            <el-table :data="callbackParams" style="width: 100%">
              <el-table-column prop="param" label="参数" width="150" />
              <el-table-column prop="type" label="类型" width="150" />
              <el-table-column prop="description" label="说明" />
            </el-table>

            <h4>签名算法（v2）</h4>
            <p>sign = hmac_sha256(通讯密钥, "payId=" + payId + "&amp;param=" + param + "&amp;type=" + type + "&amp;price=" + price + "&amp;reallyPrice=" + reallyPrice)</p>

            <h4>PHP回调示例代码</h4>
            <pre class="code-block">
&lt;?php

ini_set("error_reporting","E_ALL &amp; ~E_NOTICE");

$key = "83d551f0b3609781a22536ca2658473d";//通讯密钥

// 异步回调采用 POST 表单方式推送
$payId = $_POST['payId'];//商户订单号
$param = $_POST['param'];//创建订单的时候传入的自定义参数
$type = $_POST['type'];//支付方式 ：微信支付为1 支付宝支付为2
$price = $_POST['price'];//订单金额
$reallyPrice = $_POST['reallyPrice'];//实际支付金额
$sign = $_POST['sign'];//校验签名

//开始校验签名（v2：HMAC-SHA-256，密钥不拼入明文）
$canonical = "payId=" . $payId . "&amp;param=" . $param . "&amp;type=" . $type . "&amp;price=" . $price . "&amp;reallyPrice=" . $reallyPrice;
$_sign = hash_hmac("sha256", $canonical, $key);
if (!hash_equals($_sign, (string)$sign)) {
    echo "error_sign";//sign校验不通过
    exit();
}

// 处理业务逻辑（如给用户发货、充值等）

// 成功必须输出 success，否则系统将按照退避策略发起重试
echo "success";
?&gt;</pre>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 创建订单参数
const createOrderParams = [
  { param: 'payId', type: '字符串', required: true, description: '商户订单号，可以是时间戳，不可重复' },
  { param: 'type', type: '整数', required: true, description: '微信支付传入1 支付宝支付传入2' },
  { param: 'price', type: '小数', required: true, description: '订单金额' },
  { param: 'sign', type: '字符串', required: true, description: '签名，v2 为 HMAC-SHA-256（见接口签名说明），64 位小写 hex' },
  { param: 'param', type: '字符串', required: false, description: '商户透传参数，仅用于已支付后的异步通知和服务端签名回跳，不会出现在匿名公开订单响应中' },
  { param: 'notifyUrl', type: '字符串', required: false, description: '传入则设置该订单的异步通知接口为该参数，不传或传空则使用后台设置的接口' },
  { param: 'returnUrl', type: '字符串', required: false, description: '传入则设置该订单的同步跳转接口；仅支付完成后可通过 publicToken 请求服务端签名的回跳地址' }
]

// 创建订单响应
const createOrderResponse = [
  { param: 'payId', type: '字符串', description: '商户订单号，用于商户侧对账与回调识别' },
  { param: 'orderId', type: '字符串', description: '内部订单号，仅供商户或管理端展示；不能用于匿名公开查询' },
  { param: 'publicToken', type: '64 位小写 hex', description: '高熵公开支付凭据，用于支付链接和匿名查询；请勿写入日志或泄露给第三方' },
  { param: 'payType', type: '整数', description: '微信支付为 1，支付宝支付为 2' },
  { param: 'price', type: '字符串', description: '订单金额（两位小数文本）' },
  { param: 'reallyPrice', type: '字符串', description: '实际需付金额（两位小数文本）' },
  { param: 'payUrl', type: '字符串', description: '支付二维码内容' },
  { param: 'isAuto', type: '整数', description: '1 为手动输入金额，0 为扫码后自动输入金额' },
  { param: 'redirectUrl', type: '字符串', description: '携带 publicToken 的支付页地址' }
]

// 查询订单参数
const getOrderParams = [
  { param: 'publicToken', type: '字符串', required: true, description: '创建订单响应中的 64 位随机公开凭据，位于 URL 路径中；旧 orderId 不能用于公开查询' }
]

// 查询订单状态参数
const checkOrderParams = [
  { param: 'publicToken', type: '字符串', required: true, description: '创建订单响应中的 64 位随机公开凭据，位于 URL 路径中；旧 orderId 不能用于公开查询' }
]

// 关闭订单参数
const closeOrderParams = [
  { param: 'id', type: '整数', required: true, description: '数据库内部订单 ID，位于 URL 路径中' }
]

// 查询服务端状态参数
const getStateParams: Array<{ param: string; type: string; required: boolean; description: string }> = []

// 回调参数
const callbackParams = [
  { param: 'payId', type: '字符串', description: '商户订单号' },
  { param: 'param', type: '字符串', description: '创建订单的时候传入的参数' },
  { param: 'type', type: '整数', description: '支付方式 ：微信支付为1 支付宝支付为2' },
  { param: 'price', type: '小数', description: '订单金额' },
  { param: 'reallyPrice', type: '小数', description: '实际支付金额' },
  { param: 'sign', type: '字符串', description: 'v2 HMAC-SHA-256 签名，规则见上方说明' }
]
</script>

<style scoped>
.api-docs-container {
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.api-description {
  margin-bottom: 24px;
}

.api-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.api-content {
  padding: 16px 8px;
}

.api-content h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: 500;
}

.code-block {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 16px;
  margin: 12px 0;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-x: auto;
}

:deep(.el-collapse-item__header) {
  font-size: 16px;
}

:deep(.el-alert__content) {
  padding: 8px 0;
}
</style> 