// 通用类型定义
// 统一的基础类型和接口命名规范

/**
 * API响应基础类型
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiError;
  timestamp?: string;
}

/**
 * API错误信息
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

/**
 * 分页信息
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 排序参数
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: SortOrder;
}

/**
 * 排序方向枚举
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * 基础实体接口
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 可删除实体接口
 */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: string;
  isDeleted?: boolean;
}

/**
 * 状态枚举基础类型
 */
export enum BaseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * 地址信息
 */
export interface Address {
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode?: string;
}

/**
 * 联系信息
 */
export interface ContactInfo {
  phone: string;
  email?: string;
  wechat?: string;
}

/**
 * 图片信息
 */
export interface ImageInfo {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  size?: number;
  format?: string;
}

/**
 * 文件信息
 */
export interface FileInfo {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

/**
 * 统计信息基础接口
 */
export interface BaseStatistics {
  total: number;
  active: number;
  inactive: number;
}

/**
 * 搜索参数基础接口
 */
export interface BaseSearchParams extends PaginationParams, SortParams {
  keyword?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 批量操作请求
 */
export interface BatchOperationRequest {
  ids: string[];
  operation: BatchOperation;
}

/**
 * 批量操作类型枚举
 */
export enum BatchOperation {
  DELETE = 'delete',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  UPDATE = 'update',
}

/**
 * 批量操作响应
 */
export interface BatchOperationResponse {
  success: number;
  failed: number;
  errors: BatchOperationError[];
}

/**
 * 批量操作错误
 */
export interface BatchOperationError {
  id: string;
  error: string;
}

/**
 * 选项接口
 */
export interface Option<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * 树形节点接口
 */
export interface TreeNode<T = any> {
  id: string;
  label: string;
  children?: TreeNode<T>[];
  data?: T;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

/**
 * 表单验证规则
 */
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message: string;
}

/**
 * 表单字段配置
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: Option[];
  rules?: ValidationRule[];
}

/**
 * 表单字段类型枚举
 */
export enum FormFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  NUMBER = 'number',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATE = 'date',
  FILE = 'file',
  IMAGE = 'image',
}

/**
 * 通知类型枚举
 */
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * 通知消息
 */
export interface NotificationMessage {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  closable?: boolean;
  timestamp: string;
}

/**
 * 加载状态
 */
export interface LoadingState {
  loading: boolean;
  error?: string;
  lastUpdated?: string;
}

/**
 * 异步数据状态
 */
export interface AsyncDataState<T> extends LoadingState {
  data?: T;
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  fontSize: FontSize;
}

/**
 * 主题模式枚举
 */
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

/**
 * 字体大小枚举
 */
export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/**
 * 语言枚举
 */
export enum Language {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
}

/**
 * 设备类型枚举
 */
export enum DeviceType {
  DESKTOP = 'desktop',
  TABLET = 'tablet',
  MOBILE = 'mobile',
}

/**
 * 浏览器信息
 */
export interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  device: DeviceType;
}

/**
 * 位置信息
 */
export interface LocationInfo {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  province?: string;
}

/**
 * 时间范围
 */
export interface TimeRange {
  startTime: string;
  endTime: string;
}

/**
 * 数值范围
 */
export interface NumberRange {
  min: number;
  max: number;
}

/**
 * 颜色配置
 */
export interface ColorConfig {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

/**
 * 尺寸配置
 */
export interface SizeConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * 响应式断点
 */
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: CacheStrategy;
}

/**
 * 缓存策略枚举
 */
export enum CacheStrategy {
  LRU = 'lru',
  FIFO = 'fifo',
  TTL = 'ttl',
}

/**
 * 重试配置
 */
export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoff: boolean;
}

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * 日志条目
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: any;
}

/**
 * 环境配置
 */
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  API_BASE_URL: string;
  APP_VERSION: string;
  DEBUG: boolean;
}

/**
 * 功能标志
 */
export interface FeatureFlags {
  [key: string]: boolean;
}

/**
 * 权限枚举
 */
export enum Permission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
}

/**
 * 角色权限
 */
export interface RolePermissions {
  role: string;
  permissions: Permission[];
}

/**
 * 审计日志
 */
export interface AuditLog extends BaseEntity {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValue?: any;
  newValue?: any;
  ip?: string;
  userAgent?: string;
}

/**
 * 系统配置
 */
export interface SystemConfig {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
}

/**
 * 健康检查状态
 */
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: ServiceHealth[];
}

/**
 * 服务健康状态
 */
export interface ServiceHealth {
  name: string;
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

/**
 * 用户代理信息
 */
export interface UserAgent {
  browser: string;
  version: string;
  os: string;
  platform: string;
  mobile: boolean;
}

/**
 * 会话信息
 */
export interface SessionInfo {
  sessionId: string;
  userId?: string;
  ip: string;
  userAgent: UserAgent;
  startTime: string;
  lastActivity: string;
  isActive: boolean;
}

/**
 * 错误边界状态
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

/**
 * 组件属性基础接口
 */
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * 可控组件属性
 */
export interface ControlledComponentProps<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}

/**
 * 尺寸属性
 */
export interface SizeProps {
  size?: 'small' | 'medium' | 'large';
}

/**
 * 变体属性
 */
export interface VariantProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

/**
 * 禁用属性
 */
export interface DisabledProps {
  disabled?: boolean;
}

/**
 * 加载属性
 */
export interface LoadingProps {
  loading?: boolean;
}

/**
 * 工具提示属性
 */
export interface TooltipProps {
  tooltip?: string;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * 图标属性
 */
export interface IconProps {
  icon?: string;
  iconPosition?: 'left' | 'right';
}

/**
 * 确认对话框属性
 */
export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 模态框属性
 */
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: string | number;
  height?: string | number;
  closable?: boolean;
  maskClosable?: boolean;
}

/**
 * 抽屉属性
 */
export interface DrawerProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  width?: string | number;
  height?: string | number;
}

/**
 * 表格列配置
 */
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

/**
 * 表格属性
 */
export interface TableProps<T = any> extends BaseComponentProps {
  columns: TableColumn<T>[];
  dataSource: T[];
  loading?: boolean;
  pagination?: PaginationInfo | false;
  rowKey?: string | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
}

/**
 * 表单属性
 */
export interface FormProps extends BaseComponentProps {
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onValuesChange?: (
    changedValues: Record<string, any>,
    allValues: Record<string, any>
  ) => void;
  layout?: 'horizontal' | 'vertical' | 'inline';
  disabled?: boolean;
}

/**
 * 输入框属性
 */
export interface InputProps
  extends BaseComponentProps,
    ControlledComponentProps<string>,
    SizeProps,
    DisabledProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  placeholder?: string;
  maxLength?: number;
  readOnly?: boolean;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onEnter?: () => void;
}

/**
 * 按钮属性
 */
export interface ButtonProps
  extends BaseComponentProps,
    SizeProps,
    VariantProps,
    DisabledProps,
    LoadingProps,
    IconProps {
  type?: 'button' | 'submit' | 'reset';
  htmlType?: 'button' | 'submit' | 'reset';
  block?: boolean;
  ghost?: boolean;
  danger?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * 选择器属性
 */
export interface SelectProps<T = any>
  extends BaseComponentProps,
    ControlledComponentProps<T>,
    SizeProps,
    DisabledProps {
  options: Option<T>[];
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  onSearch?: (value: string) => void;
}

/**
 * 日期选择器属性
 */
export interface DatePickerProps
  extends BaseComponentProps,
    ControlledComponentProps<string>,
    SizeProps,
    DisabledProps {
  format?: string;
  placeholder?: string;
  showTime?: boolean;
  disabledDate?: (date: Date) => boolean;
}

/**
 * 上传组件属性
 */
export interface UploadProps extends BaseComponentProps, DisabledProps {
  action: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxCount?: number;
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  onSuccess?: (response: any, file: File) => void;
  onError?: (error: any, file: File) => void;
  onProgress?: (percent: number, file: File) => void;
}

/**
 * 分页组件属性
 */
export interface PaginationProps extends BaseComponentProps {
  current: number;
  total: number;
  pageSize: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  onChange: (page: number, pageSize: number) => void;
}

/**
 * 面包屑项目
 */
export interface BreadcrumbItem {
  title: string;
  href?: string;
  onClick?: () => void;
}

/**
 * 面包屑属性
 */
export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: string;
}

/**
 * 标签页项目
 */
export interface TabItem {
  key: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
}

/**
 * 标签页属性
 */
export interface TabsProps
  extends BaseComponentProps,
    ControlledComponentProps<string> {
  items: TabItem[];
  type?: 'line' | 'card';
  position?: 'top' | 'bottom' | 'left' | 'right';
  onTabClick?: (key: string) => void;
  onTabClose?: (key: string) => void;
}

/**
 * 步骤条项目
 */
export interface StepItem {
  title: string;
  description?: string;
  icon?: string;
  status?: 'wait' | 'process' | 'finish' | 'error';
}

/**
 * 步骤条属性
 */
export interface StepsProps extends BaseComponentProps {
  current: number;
  items: StepItem[];
  direction?: 'horizontal' | 'vertical';
  size?: 'small' | 'default';
}

/**
 * 进度条属性
 */
export interface ProgressProps extends BaseComponentProps {
  percent: number;
  type?: 'line' | 'circle';
  status?: 'normal' | 'success' | 'error';
  showInfo?: boolean;
  strokeWidth?: number;
}

/**
 * 评分属性
 */
export interface RatingProps
  extends BaseComponentProps,
    ControlledComponentProps<number>,
    DisabledProps {
  max?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  character?: React.ReactNode;
  tooltips?: string[];
}

/**
 * 滑块属性
 */
export interface SliderProps
  extends BaseComponentProps,
    ControlledComponentProps<number | number[]>,
    DisabledProps {
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
  marks?: Record<number, string>;
  tooltipVisible?: boolean;
}

/**
 * 开关属性
 */
export interface SwitchProps
  extends BaseComponentProps,
    ControlledComponentProps<boolean>,
    SizeProps,
    DisabledProps,
    LoadingProps {
  checkedChildren?: React.ReactNode;
  unCheckedChildren?: React.ReactNode;
}

/**
 * 复选框属性
 */
export interface CheckboxProps
  extends BaseComponentProps,
    ControlledComponentProps<boolean>,
    SizeProps,
    DisabledProps {
  indeterminate?: boolean;
  autoFocus?: boolean;
}

/**
 * 单选框属性
 */
export interface RadioProps
  extends BaseComponentProps,
    ControlledComponentProps<any>,
    SizeProps,
    DisabledProps {
  options: Option[];
  optionType?: 'default' | 'button';
}

/**
 * 级联选择器属性
 */
export interface CascaderProps
  extends BaseComponentProps,
    ControlledComponentProps<any[]>,
    SizeProps,
    DisabledProps {
  options: TreeNode[];
  placeholder?: string;
  expandTrigger?: 'click' | 'hover';
  changeOnSelect?: boolean;
  displayRender?: (labels: string[]) => React.ReactNode;
}

/**
 * 时间选择器属性
 */
export interface TimePickerProps
  extends BaseComponentProps,
    ControlledComponentProps<string>,
    SizeProps,
    DisabledProps {
  format?: string;
  placeholder?: string;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
}

/**
 * 颜色选择器属性
 */
export interface ColorPickerProps
  extends BaseComponentProps,
    ControlledComponentProps<string>,
    SizeProps,
    DisabledProps {
  format?: 'hex' | 'rgb' | 'hsl';
  showAlpha?: boolean;
  presetColors?: string[];
}

/**
 * 树形选择器属性
 */
export interface TreeSelectProps
  extends BaseComponentProps,
    ControlledComponentProps<any>,
    SizeProps,
    DisabledProps {
  treeData: TreeNode[];
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  checkable?: boolean;
  treeDefaultExpandAll?: boolean;
}

/**
 * 提及组件属性
 */
export interface MentionProps
  extends BaseComponentProps,
    ControlledComponentProps<string>,
    SizeProps,
    DisabledProps {
  suggestions: Option[];
  prefix?: string | string[];
  split?: string;
  onSearch?: (text: string, prefix: string) => void;
  onSelect?: (option: Option, prefix: string) => void;
}

/**
 * 自动完成属性
 */
export interface AutoCompleteProps
  extends BaseComponentProps,
    ControlledComponentProps<string>,
    SizeProps,
    DisabledProps {
  options: Option[];
  placeholder?: string;
  onSearch?: (value: string) => void;
  onSelect?: (value: string, option: Option) => void;
}

/**
 * 传输框属性
 */
export interface TransferProps extends BaseComponentProps {
  dataSource: Option[];
  targetKeys: string[];
  selectedKeys?: string[];
  titles?: [string, string];
  operations?: [string, string];
  searchable?: boolean;
  onChange: (
    targetKeys: string[],
    direction: 'left' | 'right',
    moveKeys: string[]
  ) => void;
  onSelectChange?: (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => void;
}

/**
 * 锚点链接项目
 */
export interface AnchorLinkItem {
  key: string;
  href: string;
  title: string;
  children?: AnchorLinkItem[];
}

/**
 * 锚点属性
 */
export interface AnchorProps extends BaseComponentProps {
  items: AnchorLinkItem[];
  offsetTop?: number;
  bounds?: number;
  getCurrentAnchor?: () => string;
  onClick?: (e: React.MouseEvent, link: AnchorLinkItem) => void;
}

/**
 * 回到顶部属性
 */
export interface BackTopProps extends BaseComponentProps {
  visibilityHeight?: number;
  target?: () => HTMLElement | Window;
  onClick?: () => void;
}

/**
 * 图片属性
 */
export interface ImageProps extends BaseComponentProps {
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  placeholder?: React.ReactNode;
  fallback?: string;
  preview?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * 头像属性
 */
export interface AvatarProps extends BaseComponentProps, SizeProps {
  src?: string;
  alt?: string;
  icon?: React.ReactNode;
  shape?: 'circle' | 'square';
  gap?: number;
}

/**
 * 徽章属性
 */
export interface BadgeProps extends BaseComponentProps {
  count?: number;
  dot?: boolean;
  showZero?: boolean;
  overflowCount?: number;
  offset?: [number, number];
  status?: 'success' | 'processing' | 'default' | 'error' | 'warning';
  text?: string;
  title?: string;
}

/**
 * 日历属性
 */
export interface CalendarProps
  extends BaseComponentProps,
    ControlledComponentProps<string> {
  mode?: 'month' | 'year';
  fullscreen?: boolean;
  dateCellRender?: (date: Date) => React.ReactNode;
  monthCellRender?: (date: Date) => React.ReactNode;
  onPanelChange?: (date: string, mode: 'month' | 'year') => void;
}

/**
 * 卡片属性
 */
export interface CardProps extends BaseComponentProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  cover?: React.ReactNode;
  actions?: React.ReactNode[];
  bordered?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  size?: 'default' | 'small';
}

/**
 * 折叠面板项目
 */
export interface CollapseItem {
  key: string;
  header: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  showArrow?: boolean;
  extra?: React.ReactNode;
}

/**
 * 折叠面板属性
 */
export interface CollapseProps
  extends BaseComponentProps,
    ControlledComponentProps<string | string[]> {
  items: CollapseItem[];
  accordion?: boolean;
  bordered?: boolean;
  expandIcon?: (panelProps: any) => React.ReactNode;
  ghost?: boolean;
}

/**
 * 轮播图属性
 */
export interface CarouselProps extends BaseComponentProps {
  autoplay?: boolean;
  dots?: boolean;
  arrows?: boolean;
  infinite?: boolean;
  speed?: number;
  slidesToShow?: number;
  slidesToScroll?: number;
  beforeChange?: (from: number, to: number) => void;
  afterChange?: (current: number) => void;
}

/**
 * 评论属性
 */
export interface CommentProps extends BaseComponentProps {
  author: React.ReactNode;
  avatar?: React.ReactNode;
  content: React.ReactNode;
  datetime?: React.ReactNode;
  actions?: React.ReactNode[];
  children?: React.ReactNode;
}

/**
 * 描述列表项目
 */
export interface DescriptionItem {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
  span?: number;
}

/**
 * 描述列表属性
 */
export interface DescriptionsProps extends BaseComponentProps {
  items: DescriptionItem[];
  title?: React.ReactNode;
  extra?: React.ReactNode;
  bordered?: boolean;
  column?: number;
  size?: 'default' | 'middle' | 'small';
  layout?: 'horizontal' | 'vertical';
  colon?: boolean;
}

/**
 * 空状态属性
 */
export interface EmptyProps extends BaseComponentProps {
  description?: React.ReactNode;
  image?: React.ReactNode;
  imageStyle?: React.CSSProperties;
}

/**
 * 列表项目
 */
export interface ListItem<T = any> {
  key: string;
  data: T;
  avatar?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  content?: React.ReactNode;
  actions?: React.ReactNode[];
  extra?: React.ReactNode;
}

/**
 * 列表属性
 */
export interface ListProps<T = any> extends BaseComponentProps {
  items: ListItem<T>[];
  loading?: boolean;
  bordered?: boolean;
  split?: boolean;
  size?: 'default' | 'large' | 'small';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  pagination?: PaginationInfo | false;
  grid?: {
    gutter?: number;
    column?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
}

/**
 * 弹出确认框属性
 */
export interface PopconfirmProps extends BaseComponentProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * 气泡卡片属性
 */
export interface PopoverProps extends BaseComponentProps {
  content: React.ReactNode;
  title?: React.ReactNode;
  trigger?: 'hover' | 'focus' | 'click' | 'contextMenu';
  placement?:
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
    | 'leftTop'
    | 'leftBottom'
    | 'rightTop'
    | 'rightBottom';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * 结果页属性
 */
export interface ResultProps extends BaseComponentProps {
  status?: 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
}

/**
 * 骨架屏属性
 */
export interface SkeletonProps extends BaseComponentProps {
  active?: boolean;
  avatar?:
    | boolean
    | {
        size?: 'large' | 'small' | 'default';
        shape?: 'circle' | 'square';
      };
  loading?: boolean;
  paragraph?:
    | boolean
    | {
        rows?: number;
        width?: string | number | Array<string | number>;
      };
  title?:
    | boolean
    | {
        width?: string | number;
      };
}

/**
 * 统计数值属性
 */
export interface StatisticProps extends BaseComponentProps {
  title?: React.ReactNode;
  value: string | number;
  precision?: number;
  decimalSeparator?: string;
  groupSeparator?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  formatter?: (value: any) => React.ReactNode;
  valueStyle?: React.CSSProperties;
}

/**
 * 标签属性
 */
export interface TagProps extends BaseComponentProps {
  color?: string;
  closable?: boolean;
  closeIcon?: React.ReactNode;
  icon?: React.ReactNode;
  bordered?: boolean;
  onClose?: (e: React.MouseEvent) => void;
}

/**
 * 时间轴项目
 */
export interface TimelineItem {
  key: string;
  dot?: React.ReactNode;
  color?: string;
  label?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 时间轴属性
 */
export interface TimelineProps extends BaseComponentProps {
  items: TimelineItem[];
  mode?: 'left' | 'alternate' | 'right';
  pending?: React.ReactNode;
  pendingDot?: React.ReactNode;
  reverse?: boolean;
}

/**
 * 文字提示属性
 */
export interface TooltipPropsExtended extends BaseComponentProps {
  title: React.ReactNode;
  placement?:
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
    | 'leftTop'
    | 'leftBottom'
    | 'rightTop'
    | 'rightBottom';
  trigger?: 'hover' | 'focus' | 'click' | 'contextMenu';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  arrow?: boolean;
  autoAdjustOverflow?: boolean;
  destroyTooltipOnHide?: boolean;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  overlayInnerStyle?: React.CSSProperties;
}

/**
 * 树形控件属性
 */
export interface TreeProps extends BaseComponentProps {
  treeData: TreeNode[];
  checkable?: boolean;
  selectable?: boolean;
  multiple?: boolean;
  defaultExpandAll?: boolean;
  defaultExpandedKeys?: string[];
  defaultSelectedKeys?: string[];
  defaultCheckedKeys?: string[];
  expandedKeys?: string[];
  selectedKeys?: string[];
  checkedKeys?: string[];
  onExpand?: (expandedKeys: string[], info: any) => void;
  onSelect?: (selectedKeys: string[], info: any) => void;
  onCheck?: (checkedKeys: string[], info: any) => void;
  showLine?: boolean;
  showIcon?: boolean;
  icon?: React.ReactNode;
  switcherIcon?: React.ReactNode;
}

/**
 * 版本信息
 */
export interface VersionInfo {
  version: string;
  buildTime: string;
  gitCommit?: string;
  environment: string;
}

/**
 * 应用信息
 */
export interface AppInfo {
  name: string;
  version: VersionInfo;
  description: string;
  author: string;
  license: string;
  repository?: string;
  homepage?: string;
}

// 文件结束，所有类型已通过interface和type关键字导出
