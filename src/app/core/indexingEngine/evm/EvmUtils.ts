import { BigDecimal } from "@subsquid/big-decimal";
import { Log } from "@subsquid/evm-processor";


export class EvmUtils {

    static calculatePriorityInclusionFee(log: Log): bigint {
        const tx = log.transaction as any;
        const block = log.block as any;

        const baseFee = BigInt(block?.baseFeePerGas ?? 0);
        const gasPrice = BigInt(tx?.gasPrice ?? 0);

        let priorityFee = BigInt(0);

        if (tx?.type === 2 && tx?.maxPriorityFeePerGas !== undefined) {
            // EIP-1559
            priorityFee = BigInt(tx.maxPriorityFeePerGas);

        } else if (tx?.type === 2 && baseFee > BigInt(0)) {
            // fallback EIP-1559 calcolato
            priorityFee = gasPrice > baseFee ? gasPrice - baseFee : BigInt(0);

        } else {
            // legacy
            priorityFee = gasPrice;
        }

        return baseFee + priorityFee;
    }


}