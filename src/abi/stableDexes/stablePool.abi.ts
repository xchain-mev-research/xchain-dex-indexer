export const ABI_JSON = [
    {
        "type": "event",
        "anonymous": false,
        "name": "AddLiquidity",
        "inputs": [
            {
                "type": "address",
                "name": "provider",
                "indexed": true
            },
            {
                "type": "uint256[]",
                "name": "tokenAmounts"
            },
            {
                "type": "uint256[]",
                "name": "fees"
            },
            {
                "type": "uint256",
                "name": "invariant",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "lpTokenSupply",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "FlashLoan",
        "inputs": [
            {
                "type": "address",
                "name": "receiver",
                "indexed": true
            },
            {
                "type": "uint8",
                "name": "tokenIndex",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "amount",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "amountFee",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "protocolFee",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "NewAdminFee",
        "inputs": [
            {
                "type": "uint256",
                "name": "newAdminFee",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "NewSwapFee",
        "inputs": [
            {
                "type": "uint256",
                "name": "newSwapFee",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "type": "address",
                "name": "previousOwner",
                "indexed": true
            },
            {
                "type": "address",
                "name": "newOwner",
                "indexed": true
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "Paused",
        "inputs": [
            {
                "type": "address",
                "name": "account",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "RampA",
        "inputs": [
            {
                "type": "uint256",
                "name": "oldA",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "newA",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "initialTime",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "futureTime",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "RemoveLiquidity",
        "inputs": [
            {
                "type": "address",
                "name": "provider",
                "indexed": true
            },
            {
                "type": "uint256[]",
                "name": "tokenAmounts"
            },
            {
                "type": "uint256",
                "name": "lpTokenSupply",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "RemoveLiquidityImbalance",
        "inputs": [
            {
                "type": "address",
                "name": "provider",
                "indexed": true
            },
            {
                "type": "uint256[]",
                "name": "tokenAmounts"
            },
            {
                "type": "uint256[]",
                "name": "fees"
            },
            {
                "type": "uint256",
                "name": "invariant",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "lpTokenSupply",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "RemoveLiquidityOne",
        "inputs": [
            {
                "type": "address",
                "name": "provider",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "lpTokenAmount",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "lpTokenSupply",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "boughtId",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "tokensBought",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "StopRampA",
        "inputs": [
            {
                "type": "uint256",
                "name": "currentA",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "time",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "TokenSwap",
        "inputs": [
            {
                "type": "address",
                "name": "buyer",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "tokensSold",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "tokensBought",
                "indexed": false
            },
            {
                "type": "uint128",
                "name": "soldId",
                "indexed": false
            },
            {
                "type": "uint128",
                "name": "boughtId",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "Unpaused",
        "inputs": [
            {
                "type": "address",
                "name": "account",
                "indexed": false
            }
        ]
    },
    {
        "type": "function",
        "name": "MAX_BPS",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "addLiquidity",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256[]",
                "name": "amounts"
            },
            {
                "type": "uint256",
                "name": "minToMint"
            },
            {
                "type": "uint256",
                "name": "deadline"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "calculateRemoveLiquidity",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "amount"
            }
        ],
        "outputs": [
            {
                "type": "uint256[]",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "calculateRemoveLiquidityOneToken",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "tokenAmount"
            },
            {
                "type": "uint8",
                "name": "tokenIndex"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": "availableTokenAmount"
            }
        ]
    },
    {
        "type": "function",
        "name": "calculateSwap",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint8",
                "name": "tokenIndexFrom"
            },
            {
                "type": "uint8",
                "name": "tokenIndexTo"
            },
            {
                "type": "uint256",
                "name": "dx"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "calculateTokenAmount",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256[]",
                "name": "amounts"
            },
            {
                "type": "bool",
                "name": "deposit"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "flashLoan",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "receiver"
            },
            {
                "type": "address",
                "name": "token"
            },
            {
                "type": "uint256",
                "name": "amount"
            },
            {
                "type": "bytes",
                "name": "params"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "flashLoanFeeBPS",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getA",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getAPrecise",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getAdminBalance",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "index"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getAdminBalances",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256[]",
                "name": "adminBalances"
            }
        ]
    },
    {
        "type": "function",
        "name": "getLpToken",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getNumberOfTokens",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getToken",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint8",
                "name": "index"
            }
        ],
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getTokenBalance",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint8",
                "name": "index"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getTokenBalances",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256[]",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getTokenIndex",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "tokenAddress"
            }
        ],
        "outputs": [
            {
                "type": "uint8",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getTokenPrecisionMultipliers",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256[]",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getTokens",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address[]",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getVirtualPrice",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "initialize",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address[]",
                "name": "_pooledTokens"
            },
            {
                "type": "uint8[]",
                "name": "decimals"
            },
            {
                "type": "string",
                "name": "lpTokenName"
            },
            {
                "type": "string",
                "name": "lpTokenSymbol"
            },
            {
                "type": "uint256",
                "name": "_a"
            },
            {
                "type": "uint256",
                "name": "_fee"
            },
            {
                "type": "uint256",
                "name": "_adminFee"
            },
            {
                "type": "address",
                "name": "lpTokenTargetAddress"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "owner",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "pause",
        "constant": false,
        "payable": false,
        "inputs": [],
        "outputs": []
    },
    {
        "type": "function",
        "name": "paused",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "bool",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "protocolFeeShareBPS",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "rampA",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "futureA"
            },
            {
                "type": "uint256",
                "name": "futureTime"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "removeLiquidity",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "amount"
            },
            {
                "type": "uint256[]",
                "name": "minAmounts"
            },
            {
                "type": "uint256",
                "name": "deadline"
            }
        ],
        "outputs": [
            {
                "type": "uint256[]",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "removeLiquidityImbalance",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256[]",
                "name": "amounts"
            },
            {
                "type": "uint256",
                "name": "maxBurnAmount"
            },
            {
                "type": "uint256",
                "name": "deadline"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "removeLiquidityOneToken",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "tokenAmount"
            },
            {
                "type": "uint8",
                "name": "tokenIndex"
            },
            {
                "type": "uint256",
                "name": "minAmount"
            },
            {
                "type": "uint256",
                "name": "deadline"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "constant": false,
        "payable": false,
        "inputs": [],
        "outputs": []
    },
    {
        "type": "function",
        "name": "setAdminFee",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "newAdminFee"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "setFlashLoanFees",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "newFlashLoanFeeBPS"
            },
            {
                "type": "uint256",
                "name": "newProtocolFeeShareBPS"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "setSwapFee",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "newSwapFee"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "stopRampA",
        "constant": false,
        "payable": false,
        "inputs": [],
        "outputs": []
    },
    {
        "type": "function",
        "name": "swap",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint8",
                "name": "tokenIndexFrom"
            },
            {
                "type": "uint8",
                "name": "tokenIndexTo"
            },
            {
                "type": "uint256",
                "name": "dx"
            },
            {
                "type": "uint256",
                "name": "minDy"
            },
            {
                "type": "uint256",
                "name": "deadline"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "swapStorage",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": "initialA"
            },
            {
                "type": "uint256",
                "name": "futureA"
            },
            {
                "type": "uint256",
                "name": "initialATime"
            },
            {
                "type": "uint256",
                "name": "futureATime"
            },
            {
                "type": "uint256",
                "name": "swapFee"
            },
            {
                "type": "uint256",
                "name": "adminFee"
            },
            {
                "type": "address",
                "name": "lpToken"
            }
        ]
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "newOwner"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "unpause",
        "constant": false,
        "payable": false,
        "inputs": [],
        "outputs": []
    },
    {
        "type": "function",
        "name": "withdrawAdminFees",
        "constant": false,
        "payable": false,
        "inputs": [],
        "outputs": []
    }
]
