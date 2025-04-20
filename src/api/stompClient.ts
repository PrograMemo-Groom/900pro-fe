import { Client, Frame, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { store } from '@/store';

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

let stompClient: Client | null = null;
let connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
const subscriptions: Map<string, StompSubscription> = new Map();
const MAX_RECONNECT_ATTEMPTS = 5;
const CONNECTION_TIMEOUT = 10000;
let reconnectAttempts = 0;
let connectionTimeoutId: ReturnType<typeof setTimeout> | null = null;
// 연결이 끊겼을 때 메시지 큐잉을 위한 배열
const messageQueue: { destination: string; body: string; headers: any }[] = [];

const setConnectionStatus = (status: ConnectionStatus): void => {
  connectionStatus = status;
};

const clearConnectionTimeout = (): void => {
  if (connectionTimeoutId) {
    clearTimeout(connectionTimeoutId);
    connectionTimeoutId = null;
  }
};

const getConnectHeaders = (): Record<string, string> => {
  const token = store.getState().auth.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const sendQueuedMessages = (): void => {
  if (messageQueue.length > 0 && stompClient?.active) {
    while (messageQueue.length > 0) {
      const message = messageQueue.shift();
      if (message && stompClient) {
        stompClient.publish(message);
      }
    }
  }
};

const createSubscriptionId = (destination: string, subscriptionId?: string): string => {
  return subscriptionId || `sub-${destination.replace(/[^a-zA-Z0-9-]/g, '-')}`;
};

const handleSubscriptionError = (_action: string, _destination: string): void => {
};

// STOMP 클라이언트 시작
export const initStompClient = (): Client => {
  if (stompClient?.active) {
    stompClient.deactivate();
  }

  setConnectionStatus(ConnectionStatus.CONNECTING);
  reconnectAttempts = 0;

  stompClient = new Client({
    webSocketFactory: () => new SockJS('http://3.39.135.118:8080/ws-chat'),
    beforeConnect: () => {
      connectionTimeoutId = setTimeout(() => {
        if (connectionStatus === ConnectionStatus.CONNECTING) {
          setConnectionStatus(ConnectionStatus.ERROR);
          if (stompClient) {
            stompClient.deactivate();
          }
        }
      }, CONNECTION_TIMEOUT);

      if (stompClient) {
        stompClient.connectHeaders = getConnectHeaders();
      }
    },
    debug: (_str: string) => {
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: (_frame: Frame) => {
      setConnectionStatus(ConnectionStatus.CONNECTED);
      clearConnectionTimeout();
      sendQueuedMessages();
    },
    onStompError: (_frame: Frame) => {
      setConnectionStatus(ConnectionStatus.ERROR);
    },
    onWebSocketError: (_event: Event) => {
      setConnectionStatus(ConnectionStatus.ERROR);

      reconnectAttempts++;
      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        if (stompClient) {
          stompClient.deactivate();
        }
      } else {
        setConnectionStatus(ConnectionStatus.RECONNECTING);
      }
    },
    onDisconnect: (_frame: Frame) => {
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      clearConnectionTimeout();
      subscriptions.clear();
    },
  });

  stompClient.activate();
  return stompClient;
};

// 현재 연결 상태 확인
export const getConnectionStatus = (): ConnectionStatus => {
  return connectionStatus;
};

// STOMP 클라이언트 확인
export const getStompClient = (): Client => {
  if (!stompClient || !stompClient.active) {
    return initStompClient();
  }
  return stompClient;
};

// STOMP 연결 종료
export const closeStompConnection = (): void => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    clearConnectionTimeout();
  }
};

// 메시지 발행
export const publishMessage = (destination: string, body: string, headers: Record<string, string> = {}): Promise<boolean> => {
  return new Promise((resolve) => {
    const client = getStompClient();
    const messageObject = {
      destination,
      body,
      headers: { 'content-type': 'application/json', ...headers },
    };

    if (client && client.active && connectionStatus === ConnectionStatus.CONNECTED) {
      try {
        client.publish(messageObject);
        resolve(true);
      } catch (error) {
        messageQueue.push(messageObject);
        resolve(false);
      }
    } else {
      messageQueue.push(messageObject);
      resolve(false);
    }
  });
};

// 구독
export const subscribe = (
  destination: string,
  callback: (message: any) => void,
  subscriptionId?: string
): StompSubscription | null => {
  const client = getStompClient();

  if (subscriptions.has(destination)) {
    return subscriptions.get(destination) || null;
  }

  if (client && client.active && connectionStatus === ConnectionStatus.CONNECTED) {
    try {
      const subscription = client.subscribe(
        destination,
        (message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            callback(parsedMessage);
          } catch (error) {
            callback(message.body);
          }
        },
        { id: createSubscriptionId(destination, subscriptionId) }
      );
      subscriptions.set(destination, subscription);
      return subscription;
    } catch (error) {
      handleSubscriptionError('구독', destination);
      return null;
    }
  } else {
    return null;
  }
};

// 구독 해제
export const unsubscribe = (destination: string): void => {
  const subscription = subscriptions.get(destination);

  if (subscription) {
    try {
      subscription.unsubscribe();
      subscriptions.delete(destination);
    } catch (error) {
      handleSubscriptionError('구독 해제', destination);
    }
  }
};

// 모든 구독 해제
export const unsubscribeAll = (): void => {
  subscriptions.forEach((sub, destination) => {
    try {
      sub.unsubscribe();
    } catch (error) {
      handleSubscriptionError('구독 해제', destination);
    }
  });
  subscriptions.clear();
};
