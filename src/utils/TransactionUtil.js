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
