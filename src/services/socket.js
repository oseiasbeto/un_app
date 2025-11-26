import { io } from 'socket.io-client';

const node_env = process.env.NODE_ENV === 'production' ? 'prod' : 'lan'

const SOCKET_URL = node_env == 'dev' ?
    'http://localhost:5050' : node_env == 'prod' ?
        'https://api.1kole.com' :
        'http://192.168.1.130:5050'

let socket;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 2000;
let reconnectTimeoutId = null;
let isManualDisconnect = false;
let authToken = null;

// Configuração simples de background - 5 MINUTOS
let backgroundStartTime = null;
const BACKGROUND_RELOAD_TIME = 2 * 60 * 1000; // 5 minutos

// Configuração de detectores de visibilidade para WebView
const setupVisibilityHandlers = () => {
    if (typeof document !== 'undefined') {
        // Evento padrão do navegador - funciona em WebView
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }
};

const cleanupVisibilityHandlers = () => {
    if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
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
    const backgroundTime = backgroundStartTime ? Date.now() - backgroundStartTime : 0;
    console.log(`App voltou ao foreground - Tempo em background: ${Math.round(backgroundTime/1000)}s`);
    
    backgroundStartTime = null;
    
    // Se ficou mais de 5min em background, recarrega a página
    if (backgroundTime > BACKGROUND_RELOAD_TIME) {
        console.log(`Ficou mais de 5min em background - Recarregando página...`);
        window.location.reload();
        return;
    }
};

const handleAppBackground = () => {
    console.log('App em background - monitorando...');
    backgroundStartTime = Date.now();
};

/**
 * Conecta ao WebSocket do servidor
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

    console.log('Tentando conectar ao WebSocket');

    // Limpa tentativas anteriores de reconexão
    if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        reconnection: false,
    });

    socket.on('connect', () => {
        console.log('Conectado ao WebSocket:', socket.id);
        reconnectAttempts = 0;
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
    const delay = RECONNECT_INTERVAL * Math.pow(2, reconnectAttempts - 1);

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
        backgroundStartTime = null;
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