// DateUtil.js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// 启用插件
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 将时间戳（ms）格式化为北京时间的 yyyy-MM-dd HH:mm:ss 格式
 * @param {number} timestampMs - 毫秒级时间戳
 * @returns {string} 格式化后的北京时间字符串
 */
export function formatToBeijingTime(timestampMs) {
    return dayjs(timestampMs).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
}