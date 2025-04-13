import { generateNonce, getTransactionList, requestLoginApi } from "../api/api.js";

export async function login(keypair) {
    const nonce = await generateNonce(keypair.toSuiAddress())
    const message = Buffer.from(nonce);
    const signature = await keypair.signPersonalMessage(message);
    const data = {
        address: keypair.toSuiAddress(),
        signature: signature.signature,
        message
    };
    return await requestLoginApi(data);
}