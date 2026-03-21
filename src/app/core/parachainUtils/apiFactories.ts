import { ApiPromise, WsProvider } from "@polkadot/api";


export class ParachainApiFactory {

    public static newMoonbeamApi(): Promise<ApiPromise> {
        return _createApi('wss://moonbeam-rpc.dwellir.com');
    }

    public static newHydraApi(): Promise<ApiPromise> {
        return _createApi('wss://hydration-rpc.n.dwellir.com');
    }

}

async function _createApi(provider: string): Promise<ApiPromise> {
    const wsProvider = new WsProvider(provider);

    const api = await ApiPromise.create({ provider: wsProvider });
    await api.isReadyOrError;

    return api;
}

