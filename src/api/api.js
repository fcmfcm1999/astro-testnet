import axios from 'axios';

let headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US',
    'authorization': '',
    'brand-exchange': 'sui',
    'content-type': 'application/json',
    'invite-code': 'AYXOT2',
    'origin': 'https://beta.astros.ag',
    'platform-exchange': 'navi',
    'priority': 'u=1, i',
    'referer': 'https://beta.astros.ag/',
    'sec-ch-ua': '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'source-client': 'Web',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0'
}

// 交易列表请求的headers
let transactionHeaders = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9,zh;q=0.8,zh-HK;q=0.7,zh-CN;q=0.6,zh-TW;q=0.5',
  'dnt': '1',
  'origin': 'https://beta.astros.ag',
  'priority': 'u=1, i',
  'referer': 'https://beta.astros.ag/',
  'sec-ch-ua': '"Chromium";v="135", "Not-A.Brand";v="8"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
}

// 生成nonce请求的headers
let nonceHeaders = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-US',
  'authorization': '',
  'brand-exchange': 'sui',
  'content-type': 'application/json',
  'dnt': '1',
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

export const requestLoginApi = async (data) => {

    const response = await axios.post('https://dasprkkzjjkl7.cloudfront.net/api/auth/auth/token',
        data,
        {headers}
    );

    console.log(response.data)
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
        const response = await axios.get(
            `https://aggregator-api.naviprotocol.io/bridge-swap/transactions/list?address=${address}&page=${page}&limit=${limit}`,
            { headers: transactionHeaders }
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
export const generateNonce = async (address) => {
    try {
        const response = await axios.post(
            'https://dasprkkzjjkl7.cloudfront.net/api/auth/auth/generateNonce',
            { address },
            { headers: nonceHeaders }
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


