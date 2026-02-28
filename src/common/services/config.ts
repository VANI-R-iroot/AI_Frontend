interface APIConfig {
    BASE_URL: string;
    SOCKET_URL: string;
    TIMEOUT: number;
    RECONNECT_ATTEMPTS: number;
}

export const API_CONFIG: APIConfig = {
    BASE_URL: 'https://backend.amd.ai.in/v1',
    SOCKET_URL: 'https://backend.amd.ai.in',
    TIMEOUT: 10000,
    RECONNECT_ATTEMPTS: 5
};
