/**
 * VMQ 协议签名（v2）
 *
 * v2 使用 HMAC-SHA-256：通讯密钥作为 HMAC 密钥参与运算，不再拼接进签名明文，
 * 后端以常量时间比较结果。canonical 串必须与后端
 * `internal/domain/payment/payment.go` 逐字节一致，字段顺序、分隔符和金额定标
 * 出现任何差异都会导致校验失败。
 */
import CryptoJS from 'crypto-js'

/** 挂机端协议时间戳统一为毫秒 epoch，后端按毫秒解析并校验新鲜度窗口 */
export const signTimestamp = (): string => Date.now().toString()

/** 金额定标为两位小数：签名串与请求参数必须复用同一份文本 */
export const amountText = (value: string | number): string => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount.toFixed(2) : ''
}

const hmacSha256Hex = (key: string, canonical: string): string =>
  CryptoJS.HmacSHA256(canonical, key).toString(CryptoJS.enc.Hex)

export interface CreateOrderSignFields {
  payId: string
  param: string
  type: string | number
  price: string
  notifyUrl: string
  returnUrl: string
}

export interface CallbackSignFields {
  payId: string
  param: string
  type: string | number
  price: string
  reallyPrice: string
}

export interface PushSignFields {
  type: string | number
  price: string
  t: string
}

/** 建单签名把 notifyUrl / returnUrl 纳入签名域，使回调与回跳地址无法在传输途中被改写 */
export const createOrderCanonical = (fields: CreateOrderSignFields): string =>
  `payId=${fields.payId}&param=${fields.param}&type=${fields.type}` +
  `&price=${fields.price}&notifyUrl=${fields.notifyUrl}&returnUrl=${fields.returnUrl}`

export const callbackCanonical = (fields: CallbackSignFields): string =>
  `payId=${fields.payId}&param=${fields.param}&type=${fields.type}` +
  `&price=${fields.price}&reallyPrice=${fields.reallyPrice}`

export const pushCanonical = (fields: PushSignFields): string =>
  `type=${fields.type}&price=${fields.price}&t=${fields.t}`

export const createOrderSign = (fields: CreateOrderSignFields, key: string): string =>
  hmacSha256Hex(key, createOrderCanonical(fields))

export const callbackSign = (fields: CallbackSignFields, key: string): string =>
  hmacSha256Hex(key, callbackCanonical(fields))

export const pushSign = (fields: PushSignFields, key: string): string =>
  hmacSha256Hex(key, pushCanonical(fields))

/**
 * 协议黄金向量：与后端 `internal/domain/payment/payment_test.go`、PHP 商户插件和安卓挂机端
 * 共用同一组期望值。任一端结果不一致即为协议破坏，联调页会直接把差异暴露在界面上。
 */
const VECTOR = {
  key: 'testkey123456',
  payId: 'TEST20260314001',
  type: '1',
  price: '1.00',
  reallyPrice: '0.99',
  notifyUrl: 'https://shop.example.com/notify',
  returnUrl: 'https://shop.example.com/return',
  timestamp: '1773500000000'
} as const

export interface SignVectorResult {
  name: string
  ok: boolean
  actual: string
  expected: string
}

export const verifySignVectors = (): SignVectorResult[] => {
  const cases: Array<[string, string, string]> = [
    [
      'create',
      createOrderSign(
        {
          payId: VECTOR.payId,
          param: '',
          type: VECTOR.type,
          price: VECTOR.price,
          notifyUrl: VECTOR.notifyUrl,
          returnUrl: VECTOR.returnUrl
        },
        VECTOR.key
      ),
      '729a6c529b4a2ffed215d124a7e4244ed5d4981ba1982d4cd6f9a53b28de9263'
    ],
    [
      'callback',
      callbackSign(
        {
          payId: VECTOR.payId,
          param: '',
          type: VECTOR.type,
          price: VECTOR.price,
          reallyPrice: VECTOR.reallyPrice
        },
        VECTOR.key
      ),
      '0f21b9366a12396a71437d336a21fd7c5fe20b292e9b56d25b6b612a144daa60'
    ],
    [
      'push',
      pushSign({ type: VECTOR.type, price: VECTOR.price, t: VECTOR.timestamp }, VECTOR.key),
      '61174e2503aec9c2ffe8430ba322d03b8e3c5f46c3d08f29e69ee35d0b34a51e'
    ]
  ]

  return cases.map(([name, actual, expected]) => ({ name, actual, expected, ok: actual === expected }))
}