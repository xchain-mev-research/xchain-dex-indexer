

export class AssetUtils {

    /**
       * Estrae un identificatore locale custom da uno XcmLocation
       * da usare come campo `substrate` (stringa).
       */
    public static getSubstrateIdFromXcmLocation(xcm: any): string | undefined {
        if (!xcm || !xcm.interior)
            return undefined;

        const keys = Object.keys(xcm.interior);
        const path = (xcm.interior as any)[keys[0]]; // es. X2, X1, ecc.

        if (!Array.isArray(path) || path.length === 0)
            return undefined;

        const lastJunction = path[path.length - 1];

        if ('generalKey' in lastJunction) {
            const gk = lastJunction.generalKey;
            if (typeof gk === 'string') {
                return gk;
            } else if (gk?.data) {
                return gk.data;
            }
        }
        if ('generalIndex' in lastJunction) {
            return lastJunction.generalIndex.toString();
        }
        if ('accountId32' in lastJunction) {
            return lastJunction.accountId32.id;
        }

        return undefined;
    }

}