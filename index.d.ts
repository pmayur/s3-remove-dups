declare namespace NodeJS {
    export interface Global {
        metrics: Metrics;
    }
}

declare var metrics: Metrics;
