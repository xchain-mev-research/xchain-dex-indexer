
// --------------------- V2 QUERIES ---------------------

export const UNISWAP_V2_QUERY = `query ($blockNumber: Int!, $idList: [ID!]!) {

                        pairs(
                            where: { id_in: $idList }
                            orderBy: id
                            orderDirection: desc
                            block: { number: $blockNumber }
                        ) {
                            id
                            reserve0
                            reserve1
                            token0Price
                            token1Price
                            token0 {
                                id
                                symbol
                                name
                                decimals
                            }
                            token1 {
                                id
                                symbol
                                name
                                decimals
                            }
                        }
                }`;

export const LOCAL_V2_QUERY = `query ($blockNumber: Int!, $idList: [String!]!) {
                        v2PoolSnapshots(
                            where: {
                                blockNumber_eq: $blockNumber,
                                pool: {
                                    id_in: $idList ,
                                }
                                afterTxId_isNull: true

                            }
                            orderBy: id_DESC
                        ) {
                            id
                            pool {
                                id
                                token0 {
                                    id
                                    symbol
                                    name
                                    decimals
                                }
                                token1 {
                                    id
                                    symbol
                                    name
                                    decimals
                                }
                            }
                            blockNumber
                            reserve0
                            reserve1
                            token0Price
                            token1Price
                        }
                }`;


// --------------------- V3 QUERIES ---------------------
export const BEAMSWAP_V3_QUERY = `query ($blockNumber: Int!, $idList: [ID!]!) {
                                pools(
                                        where: { id_in: $idList }
                                        orderBy: id
                                        orderDirection: desc
                                        block: { number: $blockNumber }
                                    ) {
                                    id
                                    token0 {
                                        id
                                        symbol
                                        name
                                        decimals
                                    }
                                    token1 {
                                        id
                                        symbol
                                        name
                                        decimals
                                    }
                                    token0Price
                                    token1Price
                                    liquidity
                                    sqrtPrice
                                    fee: feeTier
                                    tick
                                    ticks{
                                        id
                                        liquidityNet
                                        liquidityGross
                                        tickIdx
                                    }

                                }
                            
                            }
`;
export const STELLASWAP_V3_QUERY = `query ($blockNumber: Int!, $idList: [ID!]!) {
                                pools(
                                        orderBy: id
                                        orderDirection: desc
                                        block: { number: $blockNumber }

                                        where: { id_in: $idList }
                                    ) {
                                    id
                                    token0 {
                                        id
                                        symbol
                                        name
                                        decimals
                                    }
                                    token1 {
                                        id
                                        symbol
                                        name
                                        decimals
                                    }
                                    token0Price
                                    token1Price
                                    liquidity
                                    sqrtPrice
                                    fee
                                    tick
                                    ticks{
                                        id
                                        liquidityNet
                                        liquidityGross
                                        tickIdx
                                    }

                                }
                            
                            }
`;

export const LOCAL_V3_QUERY = `query ($blockNumber: Int!, $idList: [String!]!) {
    v3PoolSnapshots(
        where: {
                blockNumber_eq: $blockNumber,
                pool: {
                    id_in: $idList ,
                }
                afterTxId_isNull: true

            }
            orderBy: id_DESC
    ) {
        id
        pool {
            id
            feeTier
            token0 {
                id
                symbol
                name
                decimals
            }
            token1 {
                id
                symbol
                name
                decimals
            }
        }
        fee
        liquidity
        sqrtPrice
        tick
        token0Price
        token1Price
        ticks {
            id
            tickIdx
            liquidityGross
            liquidityNet
        }
    }
}`;

export const LOCAL_V4_QUERY = LOCAL_V3_QUERY.replace("v3PoolSnapshots", "v4PoolSnapshots")