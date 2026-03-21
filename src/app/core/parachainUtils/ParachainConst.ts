

export type ParachainInfo = {
    id: number;
    name: string;
};

export type ParachainConst = {
    AssetHub: ParachainInfo;
    Acala: ParachainInfo;
    Moonbeam: ParachainInfo;
    Astar: ParachainInfo;
    Bifrost: ParachainInfo;
    Centrifuge: ParachainInfo;
    Interlay: ParachainInfo;
    Hydration: ParachainInfo;
    Phala: ParachainInfo;
    NeuroWeb: ParachainInfo;
    Pendulum: ParachainInfo;
    Subsocial: ParachainInfo;
    Manta: ParachainInfo;
};

export const Parachain: ParachainConst = {
    AssetHub: { id: 1000, name: 'assetHub' },
    Acala: { id: 2000, name: 'acala' },
    Moonbeam: { id: 2004, name: 'moonbeam' },
    Astar: { id: 2006, name: 'astar' },
    Bifrost: { id: 2030, name: 'bifrost' },
    Centrifuge: { id: 2031, name: 'centrifuge' },
    Interlay: { id: 2032, name: 'interlay' },
    Hydration: { id: 2034, name: 'hydration' },
    Phala: { id: 2035, name: 'phala' },
    NeuroWeb: { id: 2043, name: 'neuroWeb' },
    Pendulum: { id: 2094, name: 'pendulum' },
    Subsocial: { id: 2101, name: 'subsocial' },
    Manta: { id: 2104, name: 'manta' },
};

