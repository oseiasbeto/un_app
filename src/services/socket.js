import { io } from 'socket.io-client';

const node_env = process.env.NODE_ENV === 'production' ? 'prod' : 'lan'

const SOCKET_URL = node_env == 'dev' ?
    'http://localhost:5050' : node_env == 'prod' ?
        'https://api.1kole.com' :
        'http://192.168.1.130:5050'

let socket;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 2000; // 2 segundos
let reconnectTimeoutId = null;
let isManualDisconnect = false;
let authToken = null;

// Configuração de detectores de visibilidade
const setupVisibilityHandlers = () => {
    if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Para ambiente mobile (cordova/capacitor)
    if (typeof window !== 'undefined') {
        window.addEventListener('focus', handleAppForeground);
        window.addEventListener('blur', handleAppBackground);

        // Para eventos de resume/pause em apps nativos
        document.addEventListener('resume', handleAppForeground);
        document.addEventListener('pause', handleAppBackground);
    }
};

const cleanupVisibilityHandlers = () => {
    if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('resume', handleAppForeground);
        document.removeEventListener('pause', handleAppBackground);
    }

    if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleAppForeground);
        window.removeEventListener('blur', handleAppBackground);
    }
};

const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
        handleAppForeground();
    } else {
        handleAppBackground();
    }
};

const handleAppForeground = () => {
    console.log('App em primeiro plano - verificando conexão WebSocket');
    if (!socket?.connected && authToken && !isManualDisconnect) {
        console.log('Reconectando WebSocket ao voltar ao foreground');
        connectSocket(authToken);
    } else {
        console.log('WebSocket já conectado:', socket.id);
    }
};

const handleAppBackground = () => {
    console.log('App em background - mantendo conexão WebSocket');
    // Não desconectamos automaticamente em background
    // Apenas monitoramos a conexão
};

/**
 * Conecta ao WebSocket do servidor com reconexão automática
 * @param {string} token - Token de autenticação do usuário.
 * @returns {Socket} - Instância do socket.
 */
export function connectSocket(token) {
    if (isManualDisconnect) {
        isManualDisconnect = false;
    }

    authToken = token;

    if (socket?.connected) {
        console.log('WebSocket já conectado:', socket.id);
        return socket;
    }

    console.log('Tentando conectar ao WebSocket com token:', token ? 'Token presente' : 'Token ausente');

    // Limpa tentativas anteriores de reconexão
    if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'], // Melhor compatibilidade
        timeout: 10000, // 10 segundos de timeout
        forceNew: true, // Força nova conexão
        reconnection: false, // Controlamos a reconexão manualmente
    });

    socket.on('connect', () => {
        console.log('Conectado ao WebSocket:', socket.id);
        reconnectAttempts = 0; // Reseta tentativas em conexão bem-sucedida
        setupVisibilityHandlers();
    });

    socket.on('connect_error', (error) => {
        console.error('Erro na conexão WebSocket:', error.message);
        scheduleReconnection();
    });

    socket.on('disconnect', (reason) => {
        console.log('Desconectado do WebSocket. Razão:', reason);

        // Se não foi uma desconexão manual, tenta reconectar
        if (!isManualDisconnect && reason !== 'io client disconnect') {
            scheduleReconnection();
        }
    });

    socket.on('reconnect_attempt', (attempt) => {
        console.log(`Tentativa de reconexão ${attempt}`);
    });

    socket.on('reconnect_error', (error) => {
        console.error('Erro na reconexão:', error.message);
    });

    socket.on('reconnect_failed', () => {
        console.error('Falha em todas as tentativas de reconexão');
    });

    // Heartbeat para manter conexão ativa
    setupHeartbeat();

    return socket;
}

/**
 * Agenda uma tentativa de reconexão
 */
function scheduleReconnection() {
    if (isManualDisconnect || !authToken) {
        return;
    }

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Número máximo de tentativas de reconexão atingido');
        return;
    }

    reconnectAttempts++;
    const delay = RECONNECT_INTERVAL * Math.pow(2, reconnectAttempts - 1); // Backoff exponencial

    console.log(`Tentativa de reconexão ${reconnectAttempts} em ${delay}ms`);

    reconnectTimeoutId = setTimeout(() => {
        if (!isManualDisconnect && authToken) {
            console.log('Executando reconexão...');
            connectSocket(authToken);
        }
    }, delay);
}

/**
 * Configura heartbeat para manter conexão ativa
 */
function setupHeartbeat() {
    if (!socket) return;

    // Envia ping a cada 30 segundos
    const heartbeatInterval = setInterval(() => {
        if (socket?.connected) {
            socket.emit('ping', { timestamp: Date.now() });
        }
    }, 30000);

    // Limpa intervalo quando socket desconecta
    socket.on('disconnect', () => {
        clearInterval(heartbeatInterval);
    });
}

/**
 * Retorna a instância atual do socket, se existir.
 * @returns {Socket|null} - Instância do socket ou null se não conectado.
 */
export function getSocket() {
    return socket;
}

/**
 * Verifica se o socket está conectado
 * @returns {boolean} - true se conectado
 */
export function isSocketConnected() {
    return socket?.connected || false;
}

/**
 * Desconecta do WebSocket.
 */
export function disconnectSocket() {
    if (socket) {
        console.log('Desconectando socket...');
        isManualDisconnect = true;

        // Limpa timeouts e handlers
        if (reconnectTimeoutId) {
            clearTimeout(reconnectTimeoutId);
            reconnectTimeoutId = null;
        }

        cleanupVisibilityHandlers();
        socket.disconnect();
        socket = null;
        authToken = null;
        reconnectAttempts = 0;
    }
}

/**
 * Força uma reconexão imediata
 */
export function forceReconnect() {
    if (authToken) {
        console.log('Forçando reconexão...');
        disconnectSocket();
        isManualDisconnect = false;
        setTimeout(() => connectSocket(authToken), 100);
    }
}

// Inicializa handlers de visibilidade quando o módulo é carregado
if (typeof document !== 'undefined') {
    setupVisibilityHandlers();
}