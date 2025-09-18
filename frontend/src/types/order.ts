// 订单相关类型定义

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING = 'pending', // 待付款
  PAID = 'paid', // 已付款
  PROCESSING = 'processing', // 处理中
  SHIPPED = 'shipped', // 已发货
  DELIVERED = 'delivered', // 已送达
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
  REFUNDED = 'refunded', // 已退款
  RETURNED = 'returned', // 已退货
}

/**
 * 支付状态枚举
 */
export enum PaymentStatus {
  PENDING = 'pending', // 待支付
  PROCESSING = 'processing', // 支付中
  COMPLETED = 'completed', // 支付完成
  FAILED = 'failed', // 支付失败
  CANCELLED = 'cancelled', // 支付取消
  REFUNDED = 'refunded', // 已退款
}

/**
 * 配送状态枚举
 */
export enum ShippingStatus {
  PENDING = 'pending', // 待发货
  PREPARING = 'preparing', // 备货中
  SHIPPED = 'shipped', // 已发货
  IN_TRANSIT = 'in_transit', // 运输中
  OUT_FOR_DELIVERY = 'out_for_delivery', // 派送中
  DELIVERED = 'delivered', // 已送达
  FAILED = 'failed', // 配送失败
  RETURNED = 'returned', // 已退回
}

/**
 * 订单类型枚举
 */
export enum OrderType {
  NORMAL = 'normal', // 普通订单
  PRESALE = 'presale', // 预售订单
  GROUP_BUY = 'group_buy', // 团购订单
  FLASH_SALE = 'flash_sale', // 秒杀订单
  GIFT = 'gift', // 礼品订单
  EXCHANGE = 'exchange', // 兑换订单
}

/**
 * 退款类型枚举
 */
export enum RefundType {
  FULL = 'full', // 全额退款
  PARTIAL = 'partial', // 部分退款
  EXCHANGE = 'exchange', // 换货
}

/**
 * 退款原因枚举
 */
export enum RefundReason {
  QUALITY_ISSUE = 'quality_issue', // 质量问题
  NOT_AS_DESCRIBED = 'not_as_described', // 与描述不符
  DAMAGED_IN_SHIPPING = 'damaged_in_shipping', // 运输损坏
  WRONG_ITEM = 'wrong_item', // 发错商品
  SIZE_ISSUE = 'size_issue', // 尺寸问题
  CHANGE_OF_MIND = 'change_of_mind', // 不想要了
  DUPLICATE_ORDER = 'duplicate_order', // 重复下单
  OTHER = 'other', // 其他原因
}

/**
 * 地址信息接口
 */
export interface Address {
  id?: string;
  name: string; // 收货人姓名
  phone: string; // 联系电话
  province: string; // 省份
  city: string; // 城市
  district: string; // 区县
  street: string; // 街道地址
  postalCode?: string; // 邮政编码
  isDefault?: boolean; // 是否默认地址
  label?: string; // 地址标签（如：家、公司）
  coordinates?: {
    // GPS坐标
    latitude: number;
    longitude: number;
  };
}

/**
 * 订单商品项接口
 */
export interface OrderItem {
  id: string;
  productId: string; // 商品ID
  productName: string; // 商品名称
  productImage: string; // 商品图片
  sku: string; // 商品SKU
  specifications?: Record<string, any>; // 商品规格
  quantity: number; // 购买数量
  unitPrice: number; // 单价
  totalPrice: number; // 小计
  discountAmount?: number; // 优惠金额
  status: OrderStatus; // 商品状态
  refundStatus?: RefundType; // 退款状态
  refundAmount?: number; // 退款金额
  note?: string; // 备注
}

/**
 * 优惠券信息接口
 */
export interface CouponInfo {
  id: string;
  code: string; // 优惠券代码
  name: string; // 优惠券名称
  type: 'fixed' | 'percentage' | 'shipping'; // 优惠类型
  value: number; // 优惠值
  discountAmount: number; // 实际优惠金额
  minOrderAmount?: number; // 最低订单金额
  maxDiscountAmount?: number; // 最大优惠金额
}

/**
 * 配送信息接口
 */
export interface ShippingInfo {
  id?: string;
  method: string; // 配送方式
  company?: string; // 物流公司
  trackingNumber?: string; // 运单号
  cost: number; // 配送费用
  estimatedDays?: number; // 预计配送天数
  status: ShippingStatus; // 配送状态
  address: Address; // 配送地址
  timeline?: Array<{
    // 物流轨迹
    time: string;
    status: string;
    description: string;
    location?: string;
  }>;
}

/**
 * 支付信息接口
 */
export interface PaymentInfo {
  id?: string;
  method: string; // 支付方式
  provider?: string; // 支付提供商
  transactionId?: string; // 交易ID
  amount: number; // 支付金额
  currency: string; // 货币类型
  status: PaymentStatus; // 支付状态
  paidAt?: string; // 支付时间
  failureReason?: string; // 失败原因
  refundAmount?: number; // 退款金额
  refundAt?: string; // 退款时间
}

/**
 * 订单主体接口
 */
export interface Order {
  id: string;
  orderNumber: string; // 订单号
  type: OrderType; // 订单类型
  status: OrderStatus; // 订单状态
  userId: string; // 用户ID

  // 商品信息
  items: OrderItem[]; // 订单商品
  itemsCount: number; // 商品总数

  // 金额信息
  subtotal: number; // 商品小计
  shippingCost: number; // 配送费用
  taxAmount: number; // 税费
  discountAmount: number; // 优惠金额
  totalAmount: number; // 订单总额
  paidAmount: number; // 已付金额
  refundAmount: number; // 退款金额

  // 优惠信息
  coupons?: CouponInfo[]; // 使用的优惠券
  promotions?: Array<{
    // 促销活动
    id: string;
    name: string;
    discountAmount: number;
  }>;

  // 配送信息
  shipping: ShippingInfo; // 配送信息

  // 支付信息
  payment: PaymentInfo; // 支付信息

  // 时间信息
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
  paidAt?: string; // 支付时间
  shippedAt?: string; // 发货时间
  deliveredAt?: string; // 送达时间
  completedAt?: string; // 完成时间
  cancelledAt?: string; // 取消时间

  // 其他信息
  note?: string; // 订单备注
  customerNote?: string; // 客户备注
  internalNote?: string; // 内部备注
  source?: string; // 订单来源
  channel?: string; // 销售渠道

  // 售后信息
  refunds?: RefundRecord[]; // 退款记录
  returns?: ReturnRecord[]; // 退货记录

  // 评价信息
  reviewed?: boolean; // 是否已评价
  reviewId?: string; // 评价ID
}

/**
 * 退款记录接口
 */
export interface RefundRecord {
  id: string;
  orderId: string; // 订单ID
  orderItemIds?: string[]; // 退款商品ID列表
  type: RefundType; // 退款类型
  reason: RefundReason; // 退款原因
  reasonText?: string; // 退款原因描述
  amount: number; // 退款金额
  status: 'pending' | 'approved' | 'rejected' | 'completed'; // 退款状态

  // 申请信息
  applicantId: string; // 申请人ID
  appliedAt: string; // 申请时间
  description?: string; // 申请描述
  images?: string[]; // 申请图片

  // 处理信息
  handlerId?: string; // 处理人ID
  handledAt?: string; // 处理时间
  handlerNote?: string; // 处理备注

  // 完成信息
  completedAt?: string; // 完成时间
  transactionId?: string; // 退款交易ID

  createdAt: string;
  updatedAt: string;
}

/**
 * 退货记录接口
 */
export interface ReturnRecord {
  id: string;
  orderId: string; // 订单ID
  orderItemIds: string[]; // 退货商品ID列表
  reason: RefundReason; // 退货原因
  reasonText?: string; // 退货原因描述
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'shipped'
    | 'received'
    | 'completed'; // 退货状态

  // 申请信息
  applicantId: string; // 申请人ID
  appliedAt: string; // 申请时间
  description?: string; // 申请描述
  images?: string[]; // 申请图片

  // 退货物流信息
  shippingInfo?: {
    company: string; // 物流公司
    trackingNumber: string; // 运单号
    shippedAt?: string; // 发货时间
    receivedAt?: string; // 收货时间
  };

  // 处理信息
  handlerId?: string; // 处理人ID
  handledAt?: string; // 处理时间
  handlerNote?: string; // 处理备注

  // 完成信息
  completedAt?: string; // 完成时间
  refundAmount?: number; // 退款金额

  createdAt: string;
  updatedAt: string;
}

/**
 * 订单搜索参数接口
 */
export interface OrderSearchParams {
  // 基础搜索
  keyword?: string; // 关键词（订单号、商品名称等）
  status?: OrderStatus[]; // 订单状态
  type?: OrderType[]; // 订单类型

  // 时间范围
  dateFrom?: string; // 开始日期
  dateTo?: string; // 结束日期
  dateType?: 'created' | 'paid' | 'shipped' | 'delivered'; // 日期类型

  // 金额范围
  minAmount?: number; // 最小金额
  maxAmount?: number; // 最大金额

  // 用户信息
  userId?: string; // 用户ID
  userPhone?: string; // 用户手机号

  // 商品信息
  productId?: string; // 商品ID
  categoryId?: string; // 商品分类ID

  // 配送信息
  shippingMethod?: string; // 配送方式
  shippingStatus?: ShippingStatus[]; // 配送状态

  // 支付信息
  paymentMethod?: string; // 支付方式
  paymentStatus?: PaymentStatus[]; // 支付状态

  // 其他筛选
  source?: string; // 订单来源
  channel?: string; // 销售渠道
  hasRefund?: boolean; // 是否有退款
  hasReturn?: boolean; // 是否有退货
  reviewed?: boolean; // 是否已评价

  // 分页排序
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount' | 'paidAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 订单统计接口
 */
export interface OrderStatistics {
  // 基础统计
  totalOrders: number; // 总订单数
  totalAmount: number; // 总金额
  averageAmount: number; // 平均订单金额

  // 状态统计
  statusCounts: Record<OrderStatus, number>; // 各状态订单数

  // 时间统计
  dailyOrders: Array<{
    // 每日订单统计
    date: string;
    count: number;
    amount: number;
  }>;

  // 商品统计
  topProducts: Array<{
    // 热销商品
    productId: string;
    productName: string;
    quantity: number;
    amount: number;
  }>;

  // 用户统计
  topCustomers: Array<{
    // 优质客户
    userId: string;
    orderCount: number;
    totalAmount: number;
  }>;

  // 退款统计
  refundRate: number; // 退款率
  refundAmount: number; // 退款金额

  // 配送统计
  shippingMethods: Record<string, number>; // 配送方式统计
  averageDeliveryDays: number; // 平均配送天数
}

/**
 * 订单创建请求接口
 */
export interface CreateOrderRequest {
  items: Array<{
    // 订单商品
    productId: string;
    quantity: number;
    specifications?: Record<string, any>;
  }>;
  shippingAddress: Address; // 配送地址
  shippingMethod: string; // 配送方式
  paymentMethod: string; // 支付方式
  couponCodes?: string[]; // 优惠券代码
  note?: string; // 订单备注
  source?: string; // 订单来源
}

/**
 * 订单更新请求接口
 */
export interface UpdateOrderRequest {
  status?: OrderStatus; // 订单状态
  shippingInfo?: Partial<ShippingInfo>; // 配送信息
  paymentInfo?: Partial<PaymentInfo>; // 支付信息
  note?: string; // 备注
  internalNote?: string; // 内部备注
}

/**
 * 退款申请请求接口
 */
export interface RefundRequest {
  orderId: string; // 订单ID
  orderItemIds?: string[]; // 退款商品ID（部分退款时使用）
  type: RefundType; // 退款类型
  reason: RefundReason; // 退款原因
  reasonText?: string; // 退款原因描述
  amount?: number; // 退款金额（部分退款时使用）
  description?: string; // 申请描述
  images?: string[]; // 申请图片
}

/**
 * 退货申请请求接口
 */
export interface ReturnRequest {
  orderId: string; // 订单ID
  orderItemIds: string[]; // 退货商品ID
  reason: RefundReason; // 退货原因
  reasonText?: string; // 退货原因描述
  description?: string; // 申请描述
  images?: string[]; // 申请图片
}

/**
 * 订单导出请求接口
 */
export interface OrderExportRequest {
  searchParams: OrderSearchParams; // 搜索条件
  format: 'excel' | 'csv' | 'pdf'; // 导出格式
  fields?: string[]; // 导出字段
  includeItems?: boolean; // 是否包含商品明细
}

/**
 * 批量操作请求接口
 */
export interface BatchOrderRequest {
  orderIds: string[]; // 订单ID列表
  action: 'cancel' | 'ship' | 'complete' | 'export'; // 操作类型
  data?: any; // 操作数据
}

/**
 * 类型守卫函数
 */
export function isOrder(obj: any): obj is Order {
  return (
    obj && typeof obj.id === 'string' && typeof obj.orderNumber === 'string'
  );
}

export function isOrderItem(obj: any): obj is OrderItem {
  return (
    obj && typeof obj.productId === 'string' && typeof obj.quantity === 'number'
  );
}

export function isRefundRecord(obj: any): obj is RefundRecord {
  return obj && typeof obj.orderId === 'string' && obj.type in RefundType;
}

export function isReturnRecord(obj: any): obj is ReturnRecord {
  return (
    obj && typeof obj.orderId === 'string' && Array.isArray(obj.orderItemIds)
  );
}

/**
 * 工具函数
 */
export function getOrderStatusText(status: OrderStatus): string {
  const statusTexts: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: '待付款',
    [OrderStatus.PAID]: '已付款',
    [OrderStatus.PROCESSING]: '处理中',
    [OrderStatus.SHIPPED]: '已发货',
    [OrderStatus.DELIVERED]: '已送达',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDED]: '已退款',
    [OrderStatus.RETURNED]: '已退货',
  };
  return statusTexts[status] || status;
}

export function getPaymentStatusText(status: PaymentStatus): string {
  const statusTexts: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: '待支付',
    [PaymentStatus.PROCESSING]: '支付中',
    [PaymentStatus.COMPLETED]: '支付完成',
    [PaymentStatus.FAILED]: '支付失败',
    [PaymentStatus.CANCELLED]: '支付取消',
    [PaymentStatus.REFUNDED]: '已退款',
  };
  return statusTexts[status] || status;
}

export function getShippingStatusText(status: ShippingStatus): string {
  const statusTexts: Record<ShippingStatus, string> = {
    [ShippingStatus.PENDING]: '待发货',
    [ShippingStatus.PREPARING]: '备货中',
    [ShippingStatus.SHIPPED]: '已发货',
    [ShippingStatus.IN_TRANSIT]: '运输中',
    [ShippingStatus.OUT_FOR_DELIVERY]: '派送中',
    [ShippingStatus.DELIVERED]: '已送达',
    [ShippingStatus.FAILED]: '配送失败',
    [ShippingStatus.RETURNED]: '已退回',
  };
  return statusTexts[status] || status;
}

export function calculateOrderTotal(
  items: OrderItem[],
  shippingCost: number = 0,
  taxAmount: number = 0
): number {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  return subtotal + shippingCost + taxAmount;
}

export function canCancelOrder(order: Order): boolean {
  return [OrderStatus.PENDING, OrderStatus.PAID].includes(order.status);
}

export function canRefundOrder(order: Order): boolean {
  return [
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.COMPLETED,
  ].includes(order.status);
}

export function canReturnOrder(order: Order): boolean {
  return [OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(order.status);
}

/**
 * 默认值
 */
export const DEFAULT_ORDER_SEARCH_PARAMS: OrderSearchParams = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '#f59e0b',
  [OrderStatus.PAID]: '#3b82f6',
  [OrderStatus.PROCESSING]: '#8b5cf6',
  [OrderStatus.SHIPPED]: '#06b6d4',
  [OrderStatus.DELIVERED]: '#10b981',
  [OrderStatus.COMPLETED]: '#22c55e',
  [OrderStatus.CANCELLED]: '#ef4444',
  [OrderStatus.REFUNDED]: '#f97316',
  [OrderStatus.RETURNED]: '#84cc16',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: '#f59e0b',
  [PaymentStatus.PROCESSING]: '#8b5cf6',
  [PaymentStatus.COMPLETED]: '#22c55e',
  [PaymentStatus.FAILED]: '#ef4444',
  [PaymentStatus.CANCELLED]: '#6b7280',
  [PaymentStatus.REFUNDED]: '#f97316',
};
