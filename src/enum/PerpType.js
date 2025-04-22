export const PrepType = {
    BTC_USD: {
        name: "BTC",
        contractPairId: 2,
        price: 100000
    },
    ETH_USD: {
        name: "ETH",
        contractPairId: 1,
        price: 2000
    },
    SUI_USD: {
        name: "SUI",
        contractPairId: 18,
        price: 3
    }
};

export function getPerpTypeFromSymbol(symbol) {
    switch (symbol) {
        case "ETH-USD":
            return PrepType.ETH_USD
        case "BTC-USD":
            return PrepType.BTC_USD
        default:
            return PrepType.SUI_USD
    }
}