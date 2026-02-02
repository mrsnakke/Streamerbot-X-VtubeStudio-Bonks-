export interface VTSMessage<T = any> {
    apiName: "VTubeStudioPublicAPI";
    apiVersion: "1.0";
    requestID: string;
    messageType: string;
    data: T;
}

export interface VTSErrorData {
    errorID: number;
    message: string;
}

export interface VTSAuthTokenRequest {
    pluginName: string;
    pluginDeveloper: string;
    pluginIcon?: string | null;
}

export interface VTSAuthTokenResponse {
    authenticationToken: string;
}

export interface VTSAuthRequest {
    pluginName: string;
    pluginDeveloper: string;
    authenticationToken: string;
}

export interface VTSAuthResponse {
    authenticated: boolean;
    reason: string;
}

export type VTSState = 'Disconnected' | 'Connecting' | 'Connected' | 'Authenticating' | 'Authenticated' | 'Error';