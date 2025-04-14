import { closePosition, getPositionList, openPosition } from "../api/api.js";

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

export async function openLongBTCWithMarket(keypair, quantity, token) {
    try {
        
        const clientOrderId = generateClientOrderId();
        const amount = quantity * 100000

        const originMsg = JSON.stringify({
            quantity: quantity,
            address: keypair.toSuiAddress(),
            expireTime: Date.now() + 60000, // 1分钟后过期
            contractPairId: 2,
            isClose: false,
            amount: amount
        });
        const signResult = await keypair.signPersonalMessage(Buffer.from(originMsg))

        const body = {
            amount: amount, // 金额 = 数量 * 杠杆
            clientOrderId: clientOrderId, // 客户端订单ID
            contractPairId: 2, // 合约对ID，根据实际情况设置
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
            console.log(`成功开仓${quantity}个btc`);
        } else {
            console.error('开仓失败:', result);
        }
        return result;
    } catch (error) {
        console.error('开仓失败:', error);
        throw error;
    }
}

export async function closeLongBTCWithMarket(keypair, token) {
    const positionResult = await queryPositions(keypair, token)
    const btcPositionInfo = positionResult.filter(it => it.contractPairId === 2)[0]
    const quantity = btcPositionInfo.quantity
    try {
        const clientOrderId = generateClientOrderId();
        const amount = quantity * 100000;

        const originMsg = JSON.stringify({
            quantity: quantity,
            address: keypair.toSuiAddress(),
            expireTime: Date.now() + 60000, // 1分钟后过期
            contractPairId: 2,
            isClose: true,
            amount: amount
        });
        const signResult = await keypair.signPersonalMessage(Buffer.from(originMsg));

        const body = {
            amount: amount, // 金额 = 数量 * 杠杆
            clientOrderId: clientOrderId, // 客户端订单ID
            contractPairId: 2, // 合约对ID，根据实际情况设置
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
            console.log(`成功平仓${quantity}个btc, 收益为: ${btcPositionInfo.unrealizedPnl}`);
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

