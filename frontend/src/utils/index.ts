/**
 * 工具函数统一导出文件
 * 提供所有工具函数的统一入口
 */

// 错误处理
export {
  ErrorHandler,
  ErrorType,
  errorHandler,
  handleGlobalError,
  type AppError,
} from './errorHandler';

// 日志记录
export { Logger, LogLevel, logger, log, type LogEntry } from './logger';

// 通用工具函数
export {
  formatUtils,
  timeUtils,
  validationUtils,
  storageUtils,
  domUtils,
  arrayUtils,
  objectUtils,
  throttleUtils,
  randomUtils,
} from './helpers';

// 性能优化工具
export {
  performanceUtils,
  LazyLoader,
  CacheManager,
  ImageLazyLoader,
  ResourcePreloader,
  PerformanceMonitor,
  MemoryManager,
} from './performance';

// 常用的工具函数快捷方式
// 重新导出常用函数，避免解构赋值问题
import {
  formatUtils,
  timeUtils,
  validationUtils,
  storageUtils,
  domUtils,
  arrayUtils,
  objectUtils,
  throttleUtils,
  randomUtils,
} from './helpers';

export const formatPrice = formatUtils.formatPrice;
export const formatNumber = formatUtils.formatNumber;
export const formatFileSize = formatUtils.formatFileSize;
export const formatPhone = formatUtils.formatPhone;
export const truncateText = formatUtils.truncateText;

export const formatTime = timeUtils.formatTime;
export const getRelativeTime = timeUtils.getRelativeTime;
export const isToday = timeUtils.isToday;
export const getTimestamp = timeUtils.getTimestamp;

export const isValidEmail = validationUtils.isValidEmail;
export const isValidPhone = validationUtils.isValidPhone;
export const validatePassword = validationUtils.validatePassword;
export const isValidIdCard = validationUtils.isValidIdCard;
export const isValidUrl = validationUtils.isValidUrl;

export const setLocal = storageUtils.setLocal;
export const getLocal = storageUtils.getLocal;
export const removeLocal = storageUtils.removeLocal;
export const setSession = storageUtils.setSession;
export const getSession = storageUtils.getSession;
export const removeSession = storageUtils.removeSession;

export const scrollToTop = domUtils.scrollToTop;
export const scrollToElement = domUtils.scrollToElement;
export const copyToClipboard = domUtils.copyToClipboard;
export const getElementSize = domUtils.getElementSize;

export const unique = arrayUtils.unique;
export const groupBy = arrayUtils.groupBy;
export const sortBy = arrayUtils.sortBy;
export const paginate = arrayUtils.paginate;

export const deepClone = objectUtils.deepClone;
export const merge = objectUtils.merge;
export const get = objectUtils.get;
export const isEmpty = objectUtils.isEmpty;

export const debounce = throttleUtils.debounce;
export const throttle = throttleUtils.throttle;

export const generateId = randomUtils.generateId;
export const randomNumber = randomUtils.randomNumber;
export const randomChoice = randomUtils.randomChoice;
