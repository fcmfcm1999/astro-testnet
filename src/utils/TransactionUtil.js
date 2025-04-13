export async function getCoinObjects(client, keypair, coinAddress) {
    const objects = await client.getCoins({
        owner: keypair.toSuiAddress(),
        coinType: coinAddress
    });

    return objects.data
}

export async function queryCoinBalance(client, keypair, coinAddress) {
    const coinObjects = await getCoinObjects(client, keypair, coinAddress)
    return coinObjects.reduce((acc, it) => acc + BigInt(it.balance), 0n)
}

export async function waitForTransactionConfirmation(client, txDigest) {
    console.log('等待交易确认...');

    while (true) {
        // 获取交易状态
        const txStatus = await client.getTransactionBlock({ digest: txDigest });

        if (txStatus.status && txStatus.status === 'Executed') {
            break;
        } else if (txStatus.status && txStatus.status === 'Failed') {
            break;
        }

        await new Promise(resolve => setTimeout(resolve, 5000));  // 每 5 秒查询一次
    }
}