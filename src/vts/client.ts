import { VTS_PLUGIN_INFO } from '../constants';
import { VTSMessage, VTSAuthTokenResponse, VTSAuthResponse, VTSState } from './types';

export class VTSClient {
    private ws: WebSocket | null = null;
    private readonly url: string;
    private onStateChange: (state: VTSState) => void;
    private token: string | null = null;

    constructor(port: number = 8001, onStateChange: (state: VTSState) => void) {
        this.url = `ws://localhost:${port}`;
        this.onStateChange = onStateChange;
        this.token = localStorage.getItem('kickbonk_vts_token');
    }

    public connect() {
        try {
            this.onStateChange('Connecting');
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                this.onStateChange('Connected');
                this.authenticate();
            };

            this.ws.onclose = () => {
                this.onStateChange('Disconnected');
                this.ws = null;
            };

            this.ws.onerror = (e) => {
                console.error("VTS WS Error", e);
                this.onStateChange('Error');
            };

            this.ws.onmessage = (event) => this.handleMessage(event);

        } catch (e) {
            console.error(e);
            this.onStateChange('Error');
        }
    }

    public disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    private send(messageType: string, data: any) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        
        const payload: VTSMessage = {
            apiName: "VTubeStudioPublicAPI",
            apiVersion: "1.0",
            requestID: "KickBonk-" + Date.now(),
            messageType,
            data
        };
        
        this.ws.send(JSON.stringify(payload));
    }

    private authenticate() {
        if (this.token) {
            this.onStateChange('Authenticating');
            this.send('AuthenticationRequest', {
                pluginName: VTS_PLUGIN_INFO.pluginName,
                pluginDeveloper: VTS_PLUGIN_INFO.pluginDeveloper,
                authenticationToken: this.token
            });
        } else {
            this.requestToken();
        }
    }

    private requestToken() {
        this.onStateChange('Authenticating'); // Waiting for user input in VTS
        this.send('AuthenticationTokenRequest', {
            pluginName: VTS_PLUGIN_INFO.pluginName,
            pluginDeveloper: VTS_PLUGIN_INFO.pluginDeveloper,
            pluginIcon: VTS_PLUGIN_INFO.pluginIcon
        });
    }

    private handleMessage(event: MessageEvent) {
        try {
            const msg = JSON.parse(event.data) as VTSMessage;
            
            switch (msg.messageType) {
                case 'AuthenticationTokenResponse': {
                    const data = msg.data as VTSAuthTokenResponse;
                    this.token = data.authenticationToken;
                    localStorage.setItem('kickbonk_vts_token', this.token);
                    this.authenticate(); // Now actually auth
                    break;
                }
                case 'AuthenticationResponse': {
                    const data = msg.data as VTSAuthResponse;
                    if (data.authenticated) {
                        this.onStateChange('Authenticated');
                    } else {
                        this.onStateChange('Error');
                        // If auth fails, maybe token is invalid
                        localStorage.removeItem('kickbonk_vts_token');
                        this.token = null;
                    }
                    break;
                }
                case 'APIError': {
                    console.error("VTS API Error", msg.data);
                    // Specific error handling could go here
                    if (msg.data.errorID === 50) { // Token missing or invalid usually
                         // handle retry?
                    }
                    break;
                }
            }
        } catch (e) {
            console.error("Error parsing VTS message", e);
        }
    }
}