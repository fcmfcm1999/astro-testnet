import { TransactionBlock } from "@mysten/sui.js/transactions";
import { CoinType } from "../enum/CoinType.js";
import { waitForTransactionConfirmation } from "../utils/TransactionUtil.js";

export async function claimFaucet(client, keypair) {
    try {
        const tx = new TransactionBlock();

        const packageId = "0xe8d53355b919c59b99b8e2aa7537bae9fff27e8f54e6eb961e0de2ffb58e97e4";
        const sharedObjectId = "0xbb51c397d339c5f697501a6686119b8331aa12e8d4480e2fc1d4e0e047ad7f74";

        tx.moveCall({
            target: `${packageId}::distributor::claim_vault`,
            typeArguments: [
                CoinType.USDC_TEST
            ],
            arguments: [
                tx.object(sharedObjectId)
            ]
        });

        const result = await client.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            signer: keypair,
            requestType: "WaitForLocalExecution",
            options: {
                showInput: true,
                showEffects: true,
                showEvents: true,
            },
        });


        if (result.effects?.status.status !== 'success') {
            throw new Error(`${result.effects?.status.error}`);
        }
        console.log("成功领取200USDC测试代币");
        return true;

    } catch (error) {
        console.error("领取USDC测试代币失败:", error);
        throw error;
    }
}
