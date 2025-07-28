<template>
  <div class="api-docs-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>API接口说明</span>
        </div>
      </template>

      <div class="api-description">
        <p>本文档提供V免签fox二开版支付系统的Go版API接口说明，帮助开发者快速集成支付功能。</p>
        <p><strong>API版本：</strong>v2 | <strong>基础URL：</strong>/api/v2 | <strong>认证方式：</strong>JWT Token</p>
      </div>

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
              <code>POST /api/v2/orders</code>
            </el-alert>

            <h4>认证要求</h4>
            <p>需要在请求头中包含有效的JWT Token：</p>
            <pre class="code-block">Authorization: Bearer &lt;your_jwt_token&gt;</pre>

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
POST /api/v2/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "type": 2,
  "price": 0.1,
  "subject": "测试商品",
  "body": "这是一个测试订单",
  "notify_url": "https://example.com/notify",
  "return_url": "https://example.com/return"
}</pre>

            <h4>认证说明</h4>
            <p>Go版API使用JWT Token认证，无需签名算法。请先通过登录接口获取Token。</p>

            <h4>响应示例</h4>
            <pre class="code-block">
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 123,
    "order_id": "202401102220147500",
    "user_id": 1,
    "type": 2,
    "price": 0.1,
    "really_price": 0.1,
    "state": 0,
    "notify_url": "https://example.com/notify",
    "return_url": "https://example.com/return",
    "pay_id": "1547129707139",
    "pay_url": "HTTPS://QR.ALIPAY.COM/FKX03500Z2ZYWA0ELYUB5D",
    "param": "{\"subject\":\"测试商品\",\"body\":\"这是一个测试订单\"}",
    "is_auto": 1,
    "create_date": 1547130014,
    "close_date": 0
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
              <code>GET /api/v2/orders/:id</code>
            </el-alert>

            <h4>认证要求</h4>
            <p>需要在请求头中包含有效的JWT Token：</p>
            <pre class="code-block">Authorization: Bearer &lt;your_jwt_token&gt;</pre>

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
  "code": 1,
  "msg": "成功",
  "data": {
    "payId": "1547129707139",
    "orderId": "202401102220147500",
    "payType": 2,
    "price": 0.1,
    "reallyPrice": 0.1,
    "payUrl": "HTTPS://QR.ALIPAY.COM/FKX03500Z2ZYWA0ELYUB5D",
    "isAuto": 1,
    "state": 0,
    "timeOut": 5,
    "date": 1547130014
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
              <code>GET /api/v2/orders/:id/status</code>
            </el-alert>

            <h4>认证要求</h4>
            <p>需要在请求头中包含有效的JWT Token：</p>
            <pre class="code-block">Authorization: Bearer &lt;your_jwt_token&gt;</pre>

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

            <h4>请求示例</h4>
            <pre class="code-block">GET /api/v2/orders/123/status</pre>

            <h4>响应示例</h4>
            <pre class="code-block">
{
  "code": 200,
  "message": "success",
  "data": {
    "order_id": "202401102220147500",
    "state": 1,
    "is_expired": false,
    "pay_date": 1547130200,
    "return_url": "https://example.com/return?order_id=202401102220147500&state=1"
  }
}</pre>
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
              <code>/api/order/close</code>
            </el-alert>

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

            <h4>签名算法</h4>
            <p>sign = md5(orderId + 通讯密钥)</p>

            <h4>响应示例</h4>
            <pre class="code-block">
{
  "code": 1,
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
              <code>/api/monitor/state</code>
            </el-alert>

            <h4>请求参数</h4>
            <el-table :data="getStateParams" style="width: 100%">
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

            <h4>签名算法</h4>
            <p>sign = md5(t + 通讯密钥)</p>

            <h4>响应示例</h4>
            <pre class="code-block">
{
  "code": 1,
  "msg": "成功",
  "data": {
    "lastpay": "1547394640",
    "lastheart": "1547613873",
    "state": "1"
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
            <p>当系统收到用户收款后，将会向您设定的异步通知地址发送GET请求，通知您的服务端订单完成收款。</p>
            <p>若您使用的是前端页面跳转，则在支付完成后会携带参数跳转到您的同步通知接口。</p>

            <h4>回调参数</h4>
            <el-table :data="callbackParams" style="width: 100%">
              <el-table-column prop="param" label="参数" width="150" />
              <el-table-column prop="type" label="类型" width="150" />
              <el-table-column prop="description" label="说明" />
            </el-table>

            <h4>签名算法</h4>
            <p>sign = md5(payId + param + type + price + reallyPrice + 通讯密钥)</p>

            <h4>PHP回调示例代码</h4>
            <pre class="code-block">
&lt;?php

ini_set("error_reporting","E_ALL & ~E_NOTICE");

$key = "83d551f0b3609781a22536ca2658473d";//通讯密钥

$payId = $_GET['payId'];//商户订单号
$param = $_GET['param'];//创建订单的时候传入的参数
$type = $_GET['type'];//支付方式 ：微信支付为1 支付宝支付为2
$price = $_GET['price'];//订单金额
$reallyPrice = $_GET['reallyPrice'];//实际支付金额
$sign = $_GET['sign'];//校验签名，计算方式 = md5(payId + param + type + price + reallyPrice + 通讯密钥)

//开始校验签名
$_sign =  md5($payId . $param . $type . $price . $reallyPrice . $key);
if ($_sign != $sign) {
    echo "error_sign";//sign校验不通过
    exit();
}

echo "success";
//继续业务流程
?&gt;</pre>
          </div>
        </el-collapse-item>

        <!-- 支付页面公开API -->
        <el-collapse-item name="6">
          <template #title>
            <div class="api-title">
              <el-tag type="warning">PUBLIC</el-tag>
              <span>获取支付订单信息（公开API）</span>
            </div>
          </template>
          <div class="api-content">
            <h4>请求地址</h4>
            <el-alert
              type="info"
              :closable="false">
              <code>GET /api/public/orders/:order_id</code>
            </el-alert>

            <h4>认证要求</h4>
            <p>此接口为公开接口，无需认证，用于支付页面获取订单信息。</p>

            <h4>请求参数</h4>
            <el-table :data="publicOrderParams" style="width: 100%">
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
            <pre class="code-block">GET /api/public/orders/202401102220147500</pre>

            <h4>响应示例</h4>
            <pre class="code-block">
{
  "code": 200,
  "message": "success",
  "data": {
    "order_id": "202401102220147500",
    "type": 2,
    "price": 0.1,
    "really_price": 0.1,
    "state": 0,
    "pay_url": "HTTPS://QR.ALIPAY.COM/FKX03500Z2ZYWA0ELYUB5D",
    "is_auto": 1,
    "create_date": 1547130014,
    "expired_at": 1547130314
  }
}</pre>
          </div>
        </el-collapse-item>

        <!-- 检查支付状态 -->
        <el-collapse-item name="7">
          <template #title>
            <div class="api-title">
              <el-tag type="warning">PUBLIC</el-tag>
              <span>检查支付状态（公开API）</span>
            </div>
          </template>
          <div class="api-content">
            <h4>请求地址</h4>
            <el-alert
              type="info"
              :closable="false">
              <code>GET /api/public/orders/:order_id/status</code>
            </el-alert>

            <h4>认证要求</h4>
            <p>此接口为公开接口，无需认证，用于支付页面检查订单状态。</p>

            <h4>请求示例</h4>
            <pre class="code-block">GET /api/public/orders/202401102220147500/status</pre>

            <h4>响应示例</h4>
            <pre class="code-block">
{
  "code": 200,
  "message": "success",
  "data": {
    "order_id": "202401102220147500",
    "state": 1,
    "is_expired": false,
    "pay_date": 1547130200
  }
}</pre>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">

// 创建订单参数
const createOrderParams = [
  { param: 'type', type: '整数', required: true, description: '支付类型：1=微信支付，2=支付宝支付' },
  { param: 'price', type: '小数', required: true, description: '订单金额，必须大于0' },
  { param: 'subject', type: '字符串', required: false, description: '订单标题/商品名称' },
  { param: 'body', type: '字符串', required: false, description: '订单描述/商品描述' },
  { param: 'notify_url', type: '字符串', required: false, description: '异步通知地址，支付成功后回调' },
  { param: 'return_url', type: '字符串', required: false, description: '同步跳转地址，支付成功后跳转' }
]

// 创建订单响应
const createOrderResponse = [
  { param: 'id', type: '整数', description: '订单数据库ID' },
  { param: 'order_id', type: '字符串', description: '订单号，用于查询订单状态' },
  { param: 'user_id', type: '整数', description: '用户ID' },
  { param: 'type', type: '整数', description: '支付类型：1=微信支付，2=支付宝支付' },
  { param: 'price', type: '小数', description: '订单金额' },
  { param: 'really_price', type: '小数', description: '实际需付金额' },
  { param: 'state', type: '整数', description: '订单状态：0=待支付，1=已支付，2=已关闭' },
  { param: 'pay_id', type: '字符串', description: '商户订单号' },
  { param: 'pay_url', type: '字符串', description: '支付二维码内容' },
  { param: 'param', type: '字符串', description: 'JSON格式的订单参数（subject、body等）' },
  { param: 'is_auto', type: '整数', description: '是否自动订单：1=是，0=否' },
  { param: 'create_date', type: '长整数', description: '订单创建时间戳（10位）' },
  { param: 'close_date', type: '长整数', description: '订单关闭时间戳（10位），0表示未关闭' }
]

// 查询订单参数
const getOrderParams = [
  { param: 'id', type: '整数', required: true, description: '订单数据库ID，在URL路径中传递' }
]

// 查询订单状态参数
const checkOrderParams = [
  { param: 'id', type: '整数', required: true, description: '订单数据库ID，在URL路径中传递' }
]

// 公开API获取订单参数
const publicOrderParams = [
  { param: 'order_id', type: '字符串', required: true, description: '订单号，在URL路径中传递' }
]

// 关闭订单参数
const closeOrderParams = [
  { param: 'orderId', type: '字符串', required: true, description: '云端订单号，创建订单返回的' },
  { param: 'sign', type: '字符串', required: true, description: 'md5(云端订单号+通讯密钥)' }
]

// 查询服务端状态参数
const getStateParams = [
  { param: 't', type: '长整数', required: true, description: '现行时间戳' },
  { param: 'sign', type: '字符串', required: true, description: 'md5(现行时间戳+通讯密钥)' }
]

// 回调参数
const callbackParams = [
  { param: 'payId', type: '字符串', description: '商户订单号' },
  { param: 'param', type: '字符串', description: '创建订单的时候传入的参数' },
  { param: 'type', type: '整数', description: '支付方式 ：微信支付为1 支付宝支付为2' },
  { param: 'price', type: '小数', description: '订单金额' },
  { param: 'reallyPrice', type: '小数', description: '实际支付金额' },
  { param: 'sign', type: '字符串', description: '校验签名，计算方式 = md5(payId + param + type + price + reallyPrice + 通讯密钥)' }
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