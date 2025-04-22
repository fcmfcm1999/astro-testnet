import { generateNonce, getTransactionList, requestLoginApi } from "../api/api.js";
import { isValidToken } from "../utils/util.js";
import { writeFileSync } from "node:fs";
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography";
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { queryPositions } from "./PositionService.js";
import Table from "cli-table3";

export async function login(keypair, proxy) {
    const nonce = await generateNonce(keypair.toSuiAddress(), proxy)
    const message = Buffer.from(nonce);
    const signature = await keypair.signPersonalMessage(message);
    const data = {
        address: keypair.toSuiAddress(),
        signature: signature.signature,
        message
    };
    return await requestLoginApi(data, proxy);
}

export async function printUserInfo(config) {
    let accountsInfo = []
    let index = 1;
    for (let account of config) {
        const suiPrivateKey = account.suiPrivateKey;
        const {schema, secretKey} = decodeSuiPrivateKey(suiPrivateKey);
        const keypair = Ed25519Keypair.fromSecretKey(secretKey);
        const bearerToken = await login(keypair, account.proxy)
        if (!isValidToken(account.bearerToken)) {
            if (bearerToken == null) {
                console.error(`Failed to login to get bearer token for address: ${keypair.toSuiAddress()}`)
                process.exit(1)
            }
            // update bearer token in this context
            // update json file
            account.bearerToken = bearerToken
        }

        const position = await queryPositions(keypair, account.bearerToken, account.proxy)

        accountsInfo.push([
            index++,
            account.nickname,
            keypair.toSuiAddress(),
            0,
            position
        ])
    }

    writeFileSync(configPath, JSON.stringify(config, null, 2));

    const table = new Table({
        head: ['序号', '备注', '地址', 'USDC_TEST余额', '仓位'],
        style: {
            head: ['cyan'],
            border: ['gray'],
        },
        colWidths: [8, 10, 68, 15, 100],
        chars: {
            top: '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
            bottom: '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
            left: '│', 'left-mid': '', mid: '', 'mid-mid': '',
            right: '│', 'right-mid': '', middle: '│',
        },
        wordWrap: true,
    });
    table.push(...accountsInfo);
    console.log(table.toString());
}