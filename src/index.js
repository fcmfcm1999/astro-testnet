import { SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography";
import fs from 'fs';
import path from 'path';
import chalk from "chalk";
import { fileURLToPath } from "node:url";
import { isValidToken } from "./utils/util.js";
import { login } from "./services/UserService.js";
import { writeFileSync } from "node:fs";
import { queryCoinBalance, waitForTransactionConfirmation } from "./utils/TransactionUtil.js";
import { CoinType } from "./enum/CoinType.js";
import { claimFaucet } from "./services/FaucetService.js";
import { deposit } from "./services/DepositService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, 'data', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const client = new SuiClient({url: 'https://fullnode.mainnet.sui.io:443'});

async function main() {
    const target = parseInt(process.argv[2], 10)
    const account = config[target]
    const suiPrivateKey = account.suiPrivateKey;
    const {schema, secretKey} = decodeSuiPrivateKey(suiPrivateKey);
    const keypair = Ed25519Keypair.fromSecretKey(secretKey);

    console.log(chalk.gray('----------------------------------------'));
    console.log(chalk.magenta('👤 正在处理地址:'), chalk.white(keypair.toSuiAddress()));

    if (isValidToken(account.bearerToken)) {
        console.log(`token is valid`)
    } else {
        console.log('token is invalid')
        const bearerToken = await login(keypair)
        if (bearerToken == null) {
            console.error(`Failed to login to get bearer token for address: ${keypair.toSuiAddress()}`)
            process.exit(1)
        }
        // update bearer token in this context
        // update json file
        account.bearer = bearerToken
        writeFileSync(configPath, JSON.stringify(config, null, 2));
    }

    const testCoinBalance = await queryCoinBalance(client, keypair, CoinType.USDC_TEST)
    if (testCoinBalance === 0n) {
        await claimFaucet(client, keypair)
    }
    await deposit(client, keypair)
}

main()