import { decode } from "jsonwebtoken";
import chalk from "chalk";
import boxen from "boxen"

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

export function printAuthorInfo() {
    const message = `${chalk.green('🧙 作者:')} ${chalk.bold('0xFantasy')}\n` +
        `${chalk.gray('更多脚本:')} ${chalk.underline.blue('https://x.com/0Xiaofan22921')}`;

    const box = boxen(message, {
        padding: 1,
        borderColor: 'green',
        borderStyle: 'round',
        align: 'center'
    });

    console.log(box);
}