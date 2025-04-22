import { TransactionBlock } from "@mysten/sui.js/transactions";
import { CoinType } from "../enum/CoinType.js";
import { getCoinObjects } from "../utils/TransactionUtil.js";

export async function deposit(client, keypair) {
    const tx = new TransactionBlock();

    const amount = tx.pure(200000000);
    const input2 = tx.object('0xa62c016c4cba4ad8b593231416f76c94cc85411b60fcebb88648fa19582d0283');
    const input3 = tx.object('0x3f5a0744ee13cbb76050d1230235bcf122da4645ffc4c479d5ae4c78c435ba1e');
    const input4 = tx.object('0x430a930c44c21d33d5415f77b540b26f35286d6fe35e3ad755e9155e658f41c3');

    const coins = await getCoinObjects(client, keypair, CoinType.USDC_TEST)
    if (coins.length === 0) {
        console.log("该地址没有USDC测试币, 无法完成存入操作")
        return
    }
    const splitResult = tx.splitCoins(tx.object(coins[0].coinObjectId), [amount]);

    // MoveCall 操作
    tx.moveCall({
        target: '0xa4316a89f85fbdf6c0df30bd0486de0d93b024a530e1bd35c15ade821bce822a::user_entry::deposit',
        typeArguments: [CoinType.USDC_TEST],
        arguments: [input2, input3, input4, splitResult, amount],
    });

    const result = await client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: keypair,
        requestType: "WaitForLocalExecution",
        options: {
            showInput: true,
            showEffects: true,
            showEvents: true,
        }
    });

    if (result.effects?.status.status !== 'success') {
        console.log(`${result.effects?.status.error}`);
    }
    console.log("成功存入200USDC测试代币");
}