import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getApiUrl } from '@/lib/api/client';

/**
 * Creates a STOMP client connected to the backend WebSocket endpoint.
 *
 * @author Matthias
 */
export function createStompClient() {
  return new Client({
    webSocketFactory: () => new SockJS(`${getApiUrl()}/ws`),
    reconnectDelay: 5000,
  });
}
