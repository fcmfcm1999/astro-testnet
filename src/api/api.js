import axios from 'axios';
import { SocksProxyAgent } from "socks-proxy-agent";
import dotenv from 'dotenv';
dotenv.config();

// 公共headers
const commonHeaders = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-US',
  'authorization': '',
  'brand-exchange': 'sui',
  'content-type': 'application/json',
  'origin': 'https://beta.astros.ag',
  'platform-exchange': 'navi',
  'priority': 'u=1, i',
  'referer': 'https://beta.astros.ag/',
  'sec-ch-ua': '"Chromium";v="135", "Not-A.Brand";v="8"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'source-client': 'Web',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
}

export const requestLoginApi = async (data, proxy) => {
    let httpsAgent
    if (proxy != null && proxy !== "") {
        httpsAgent = new SocksProxyAgent(`socks://${proxy}`)
    }
    // 登录特有的headers
    const headers = {
        ...commonHeaders,
        'invite-code': process.env.INVITE_CODE,
    };

    const response = await axios.post('https://dasprkkzjjkl7.cloudfront.net/api/auth/auth/token',
        data,
        {headers, httpsAgent}
    );

    if (response.status === 200 && response.data.msg === 'SUCCESS') {
        return response.data.data
    }
    return null

};

/**
 * 获取交易列表
 * @param {string} address - 地址
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise<Object>} - 返回交易列表数据
 */
export const getTransactionList = async (address, page = 1, limit = 10) => {
    try {
        // 交易列表特有的headers
        const headers = {
            ...commonHeaders,
            'accept-language': 'en-US,en;q=0.9,zh;q=0.8,zh-HK;q=0.7,zh-CN;q=0.6,zh-TW;q=0.5',
            'dnt': '1'
        };

        const response = await axios.get(
            `https://aggregator-api.naviprotocol.io/bridge-swap/transactions/list?address=${address}&page=${page}&limit=${limit}`,
            { headers }
        );

        console.log(response.data);
        if (response.status === 200) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('获取交易列表失败:', error);
        return null;
    }
};

/**
 * 生成nonce
 * @param {string} address - 地址
 * @returns {Promise<Object>} - 返回nonce数据
 */
export const generateNonce = async (address, proxy) => {
    let httpsAgent
    if (proxy != null && proxy !== "") {
        httpsAgent = new SocksProxyAgent(`socks://${proxy}`)
    }
    try {
        // nonce特有的headers
        const headers = {
            ...commonHeaders,
            'dnt': '1'
        };

        const response = await axios.post(
            'https://dasprkkzjjkl7.cloudfront.net/api/auth/auth/generateNonce',
            { address },
            { headers, httpsAgent }
        );

        if (response.status === 200) {
            return response.data.data.nonce;
        }
        return null;
    } catch (error) {
        console.error('生成nonce失败:', error);
        return null;
    }
};

export const openPosition = async (body, token, proxy) => {
    let httpsAgent
    if (proxy != null && proxy !== "") {
        httpsAgent = new SocksProxyAgent(`socks://${proxy}`)
    }
    try {
        // 开仓特有的headers
        const headers = {
            ...commonHeaders,
            'dnt': '1',
            'origin': 'https://perp-front-git-dev-navi-fd9a1df6.vercel.app',
            'referer': 'https://perp-front-git-dev-navi-fd9a1df6.vercel.app/'
        };
        
        // 设置认证令牌
        if (token) {
            headers.authorization = `Bearer ${token}`;
        }

        const response = await axios.post(
            'https://dasprkkzjjkl7.cloudfront.net/api/contract-provider/contract/order/openPosition',
            body,
            { headers, httpsAgent }
        );

        if (response.status === 200) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('开仓失败:', error);
        return null;
    }
};

export const closePosition = async (body, token, proxy) => {
    let httpsAgent
    if (proxy != null && proxy !== "") {
        httpsAgent = new SocksProxyAgent(`socks://${proxy}`)
    }

    try {
        // 平仓特有的headers
        const headers = {
            ...commonHeaders,
            'dnt': '1',
            'origin': 'https://perp-front-git-dev-navi-fd9a1df6.vercel.app',
            'referer': 'https://perp-front-git-dev-navi-fd9a1df6.vercel.app/'
        };
        
        // 设置认证令牌
        if (token) {
            headers.authorization = `Bearer ${token}`;
        }

        const response = await axios.post(
            'https://dasprkkzjjkl7.cloudfront.net/api/contract-provider/contract/order/closePosition',
            body,
            { headers, httpsAgent }
        );

        if (response.status === 200) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('平仓失败:', error);
        return null;
    }
};

/**
 * 查询Position列表
 * @param {Object} body - 查询参数
 * @param {number} body.pageNo - 页码
 * @param {number} body.pageSize - 每页数量
 * @param {string} token - 认证令牌
 * @returns {Promise<Object>} - 返回Position列表数据
 */
export const getPositionList = async (body, token, proxy) => {
    let httpsAgent
    if (proxy != null && proxy !== "") {
        httpsAgent = new SocksProxyAgent(`socks://${proxy}`)
    }
    try {
        // 查询Position特有的headers
        const headers = {
            ...commonHeaders,
            'dnt': '1',
            'origin': 'https://perp-front-git-dev-navi-fd9a1df6.vercel.app',
            'referer': 'https://perp-front-git-dev-navi-fd9a1df6.vercel.app/'
        };
        
        // 设置认证令牌
        if (token) {
            headers.authorization = `Bearer ${token}`;
        }

        const response = await axios.post(
            'https://dasprkkzjjkl7.cloudfront.net/api/contract-provider/contract/selectContractPositionList',
            body,
            { headers,httpsAgent }
        );

        if (response.status === 200) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('查询Position列表失败:', error);
        return null;
    }
};

export async function getDepositedUsdcBalance(bearer, proxy) {
    let httpsAgent
    if (proxy != null && proxy !== "") {
        httpsAgent = new SocksProxyAgent(`socks://${proxy}`)
    }
    const response = await axios.post(
        'https://dasprkkzjjkl7.cloudfront.net/api/contract-provider/contract-account/overview/4',
        null, // POST body为空
        {
            headers: {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'en-US',
                'authorization': `Bearer ${bearer}`,
                'brand-exchange': 'sui',
                'content-length': '0',
                'dnt': '1',
                'origin': 'https://perp-front-git-dev-navi-fd9a1df6.vercel.app',
                'platform-exchange': 'navi',
                'priority': 'u=1, i',
                'referer': 'https://perp-front-git-dev-navi-fd9a1df6.vercel.app/',
                'sec-ch-ua': '"Chromium";v="135", "Not-A.Brand";v="8"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'source-client': 'Web',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
            },
            httpsAgent
        }
    )
    return response.data.data.availableAmount
}


