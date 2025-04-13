import { decode } from "jsonwebtoken";

export function isValidToken(bearerToken) {
    if (bearerToken == null || bearerToken === '') {
        return false
    }
    const decoded = decode(bearerToken.split(" ")[1], {complete: true});
    // 获取当前时间的 Unix 时间戳
    const currentTime = Math.floor(Date.now() / 1000);

    // 判断是否过期
    return currentTime < decoded.payload.exp;
}