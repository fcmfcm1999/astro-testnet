import { closePosition, getPositionList, openPosition } from "../api/api.js";
import { PrepType } from "../enum/PerpType.js";
import { formatToBeijingTime } from "../utils/DateUtil.js";
import Table from 'cli-table3';

function generateClientOrderId(length = 21) {
    // 生成随机字节数组，每个元素是 0-255 之间的整数
    const randomBytes = crypto.getRandomValues(new Uint8Array(length));

    // 将每个字节转换为特定的字符
    return randomBytes.reduce((acc, byte) => {
        byte &= 63; // 保证数值在 0~63 范围内

        if (byte < 36) {
            // 0-9, a-z => 使用 toString(36) 表示
            return acc + byte.toString(36);
        } else if (byte < 62) {
            // 10-35 => A-Z
            return acc + (byte - 26).toString(36).toUpperCase();
        } else if (byte === 63) {
            // 特殊字符 "-"
            return acc + "-";
        } else {
            // byte === 62 => "_"
            return acc + "_";
        }
    }, "");
}

export async function openBtcWithMarket(keypair, quantity, token) {
    await openPositionWithMarket(PrepType.BTC_USD, keypair, quantity, token)
}

export async function openEthWithMarket(keypair, quantity, token) {
    await openPositionWithMarket(PrepType.ETH_USD, keypair, quantity, token)
}

export async function openPositionWithMarket(perpInfo, keypair, quantity, token) {
    try {
        
        const clientOrderId = generateClientOrderId();
        const amount = quantity * perpInfo.price

        const originMsg = JSON.stringify({
            quantity: quantity,
            address: keypair.toSuiAddress(),
            expireTime: Date.now() + 60000, // 1分钟后过期
            contractPairId: perpInfo.contractPairId,
            isClose: false,
            amount: amount
        });
        const signResult = await keypair.signPersonalMessage(Buffer.from(originMsg))

        const body = {
            amount: amount, // 金额 = 数量 * 杠杆
            clientOrderId: clientOrderId, // 客户端订单ID
            contractPairId: perpInfo.contractPairId, // 合约对ID，根据实际情况设置
            contractPositionId: 0, // 新开仓，ID为0
            isLong: true, // 做多
            isMarket: true, // 市价单
            lever: 10, // 杠杆倍数
            matchType: 1, // 匹配类型，根据实际情况设置
            originMsg: originMsg,
            positionType: 3, // 仓位类型，根据实际情况设置
            price: null, // 市价单，价格为null
            quantity: quantity, // 数量
            signHash: signResult.signature // 签名哈希，需要根据实际情况生成
        };

        // 4. 调用API开仓
        const result = await openPosition(body, token);
        if (result && result.msg === 'SUCCESS') {
            console.log(`成功开仓${quantity}个${perpInfo.name}`);
        } else {
            console.error('开仓失败:', result);
        }
        return result;
    } catch (error) {
        console.error('开仓失败:', error);
        throw error;
    }
}

export async function closePositionWithMarket(perpInfo, keypair, token) {
    const positionResult = await queryPositions(keypair, token)
    const btcPositionInfo = positionResult.filter(it => it.contractPairId === perpInfo.contractPairId)[0]
    const quantity = btcPositionInfo.quantity
    try {
        const clientOrderId = generateClientOrderId();
        const amount = quantity * perpInfo.price;

        const originMsg = JSON.stringify({
            quantity: quantity,
            address: keypair.toSuiAddress(),
            expireTime: Date.now() + 60000, // 1分钟后过期
            contractPairId: perpInfo.contractPairId,
            isClose: true,
            amount: amount
        });
        const signResult = await keypair.signPersonalMessage(Buffer.from(originMsg));

        const body = {
            amount: amount, // 金额 = 数量 * 杠杆
            clientOrderId: clientOrderId, // 客户端订单ID
            contractPairId: perpInfo.contractPairId, // 合约对ID，根据实际情况设置
            contractPositionId: btcPositionInfo.id, // 要平仓的仓位ID
            isLong: true, // 做多
            isMarket: true, // 市价单
            originMsg: originMsg,
            price: null, // 市价单，价格为null
            quantity: quantity, // 数量
            signHash: signResult.signature // 签名哈希，需要根据实际情况生成
        };

        // 调用API平仓
        const result = await closePosition(body, token);
        if (result && result.msg === 'SUCCESS') {
            console.log(`成功平仓${quantity}个${perpInfo.name}, 收益为: ${btcPositionInfo.unrealizedPnl}`);
        } else {
            console.error('平仓失败:', result);
        }
        return result;
    } catch (error) {
        console.error('平仓失败:', error);
        throw error;
    }
}

export const queryPositions = async (keypair, token, pageNo = 1, pageSize = 10) => {
    try {

        // 构建请求体
        const body = {
            pageNo,
            pageSize
        };

        // 调用API获取Position列表
        const result = await getPositionList(body, token);
        if (result && result.msg === "SUCCESS") {
            return result.data.records
        }
        console.log("获取仓位信息失败")
    } catch (error) {
        console.error('获取仓位信息失败:', error);
        throw error;
    }
};

export const printPositionsInfo = async (keypair, token) => {
    let positionInfo = [];
    const queryResult = await queryPositions(keypair, token);
    for (let i = 0; i < queryResult.length; i++) {
        const position = queryResult[i]
        positionInfo.push([
            i + 1,
            position.id,
            position.symbol,
            position.quantity,
            position.marginAmount,
            position.isLong ? "开多" : "开空",
            position.openingPrice,
            position.unrealizedPnl,
            formatToBeijingTime(position.createTimeStamp)
        ])
    }
    const table = new Table({
        head: ['序号', 'id', '合约名称', '持仓数量', '保证金', '方向', '开仓价格', '未实现盈亏', '开仓时间'],
        style: {
            head: ['cyan'],
            border: ['gray'],
        },
        colWidths: [8, 10, 10, 15, 15, 10, 15, 15, 25],
        chars: {
            top: '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
            bottom: '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
            left: '│', 'left-mid': '', mid: '', 'mid-mid': '',
            right: '│', 'right-mid': '', middle: '│',
        },
        wordWrap: true,
    });

    table.push(...positionInfo);
    console.log(table.toString());
}
