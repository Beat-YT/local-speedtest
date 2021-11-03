interface Configs {
    latencyProtocol: string;
    downloadProtocol: string;
    uploadProtocol: string;
    host: string;
    port: string;
    serverVersion: string;
    serverBuild: string;
}

interface Local {
    combined: string;
    average: string;
    mst_66_20: string;
    mst_66_30: string;
    mst_75_30: string;
    superspeed: string;
}

interface UploadSpeeds {
    local: Local;
}

interface Local2 {
    combined: string;
    average: string;
    mst_66_20: string;
    mst_66_30: string;
    mst_75_30: string;
    superspeed: string;
}

interface DownloadSpeeds {
    local: Local2;
}

export interface ReportBody {
    serverid: string;
    testmethod: string;
    hash: string;
    source: string;
    configs: Configs;
    ping: string;
    jitter: string;
    upload: string;
    uploadSpeeds: UploadSpeeds;
    download: string;
    downloadSpeeds: DownloadSpeeds;
    guid: string;
    closestPingDetails: string;
    serverSelectionMethod: string;
    clientip: string;
}

export interface TestResult {
    ispName: string;
    serverSponsor: string;
    serverName: string;
    serverId: number;
    jitter: number;
    latency: number;
    upload: number;
    download: number;
    guid: string;
    resultDate: Date;
}
