import { SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography";
import fs from 'fs';
import path from 'path';
import chalk from "chalk";
import { fileURLToPath } from "node:url";
import { isValidToken, printAuthorInfo } from "./utils/util.js";
import { login } from "./services/UserService.js";
import { writeFileSync } from "node:fs";
import { CoinType } from "./enum/CoinType.js";
import { claimFaucet } from "./services/FaucetService.js";
import { deposit } from "./services/DepositService.js";
import {
    closePositionWithMarket,
    openPositionWithMarket,
    printPositionsInfo,
    queryPositions
} from "./services/PositionService.js";
import inquirer from 'inquirer';
import { queryCoinBalance } from "./utils/TransactionUtil.js";
import { getDepositedUsdcBalance } from "./api/api.js";
import { getPerpTypeFromSymbol } from "./enum/PerpType.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, 'data', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const client = new SuiClient({url: 'https://fullnode.mainnet.sui.io:443'});

printAuthorInfo()

async function main() {
    const target = parseInt(process.argv[2], 10)
    const account = config[target]
    const suiPrivateKey = account.suiPrivateKey;
    const {schema, secretKey} = decodeSuiPrivateKey(suiPrivateKey);
    const keypair = Ed25519Keypair.fromSecretKey(secretKey);

    console.log(chalk.gray('----------------------------------------'));
    console.log(chalk.magenta(`👤 正在处理地址(${account.nickname}):`), chalk.white(keypair.toSuiAddress()));

    if (!isValidToken(account.bearerToken)) {
        const bearerToken = await login(keypair)
        if (bearerToken == null) {
            console.error(`Failed to login to get bearer token for address: ${keypair.toSuiAddress()}`)
            process.exit(1)
        }
        account.bearerToken = bearerToken
        writeFileSync(configPath, JSON.stringify(config, null, 2));
    }

    const depositedUsdc = await getDepositedUsdcBalance(account.bearerToken, account.proxy)
    if (depositedUsdc === "0") {
        const testCoinBalance = await queryCoinBalance(client, keypair, CoinType.USDC_TEST)
        if (testCoinBalance === 0n) {
            await claimFaucet(client, keypair)
        }
        await deposit(client, keypair)
    }

    const positions = await queryPositions(keypair, account.bearerToken, account.proxy);
    await printPositionsInfo(positions)
    const {operateType} = await inquirer.prompt([
        {
            type: 'list',
            name: 'operateType',
            message: '选择操作类型',
            choices: ['开仓', '平仓']
        }
    ]);
    if (operateType === '平仓') {
        let { positionIndex } = await inquirer.prompt([
            {
                type: 'input',
                name: 'positionIndex',
                message: '请输入仓位序号:',
                validate: input => {
                    if (input === '') return true; // 空表示默认执行全部
                    return isNaN(input) ? '必须是数字' : true;
                }
            }
        ]);
        await closePositionWithMarket(positions[positionIndex - 1], keypair, account.bearerToken, account.proxy)
    }
    if (operateType === '开仓') {
        const {contractType} = await inquirer.prompt([
            {
                type: 'list',
                name: 'contractType',
                message: '选择开仓币种',
                choices: ['ETH-USD', 'BTC-USD', 'SUI-USD']
            }
        ]);
        let { positionQuantity } = await inquirer.prompt([
            {
                type: 'input',
                name: 'positionQuantity',
                message: '请输入开仓数量:',
                validate: input => {
                    if (input === '') return true; // 空表示默认执行全部
                    return isNaN(input) ? '必须是数字' : true;
                }
            }
        ]);

        const {direction} = await inquirer.prompt([
            {
                type: 'list',
                name: 'isLong',
                message: '选择开仓方向',
                choices: ['做多', '做空']
            }
        ]);
        const isLong = direction === '做多'

        await openPositionWithMarket(getPerpTypeFromSymbol(contractType), keypair, positionQuantity, isLong, account.bearerToken, account.proxy);
    }
    const continueTrading = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: '继续操作还是退出？',
            choices: ['继续操作', '退出']
        }
    ]);

    if (continueTrading.action === '退出') {
        console.log(chalk.blue('感谢使用，再见！'));
        process.exit(0);
    } else {
        // 重新开始选择账户和交易
        await main();
    }
}

main()