/**
 * Minimal STOMP 1.2 client over a native WebSocket. Supports connecting and
 * subscribing, which is all the game needs from the server. Reconnects by
 * itself when the connection drops, so subscribe inside onConnect: it runs
 * again on every new connection.
 *
 * @author Elias, Nicoleta
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
// Spring's SockJS endpoint also accepts raw websockets on /ws/websocket.
const SOCKET_URL = `${API_URL.replace(/^http/, 'ws')}/ws/websocket`;
// The wait before reconnecting doubles after each failed try, up to the max.
const RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 10000;

type Handler = (body: unknown) => void;

export type StompConnection = {
  subscribe: (destination: string, handler: Handler) => void;
  close: () => void;
};

export function connectStomp(onConnect: (connection: StompConnection) => void): StompConnection {
  const handlers = new Map<string, Handler>();
  const pending: string[] = [];
  let socket: WebSocket;
  let connected = false;
  let closedByUs = false;
  let retryDelay = RETRY_DELAY_MS;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let nextId = 0;

  function send(command: string, headers: Record<string, string>) {
    const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
    const frame = [command, ...headerLines, '', ''].join('\n') + '\0';
    if (connected) {
      socket.send(frame);
    } else {
      pending.push(frame);
    }
  }

  const connection: StompConnection = {
    subscribe(destination, handler) {
      const id = `sub-${nextId++}`;
      handlers.set(id, handler);
      send('SUBSCRIBE', { id, destination });
    },
    close() {
      closedByUs = true;
      clearTimeout(retryTimer);
      socket.close();
    },
  };

  function open() {
    socket = new WebSocket(SOCKET_URL);

    socket.onopen = () => {
      socket.send('CONNECT\naccept-version:1.2\nheart-beat:0,0\n\n\0');
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      for (const raw of event.data.split('\0')) {
        const frame = raw.replace(/^\n+/, '');
        if (!frame) {
          continue;
        }

        const headerEnd = frame.indexOf('\n\n');
        const head = headerEnd === -1 ? frame : frame.slice(0, headerEnd);
        const body = headerEnd === -1 ? '' : frame.slice(headerEnd + 2);
        const [command, ...headerLines] = head.split('\n');
        const headers = Object.fromEntries(
          headerLines.map((line) => {
            const separator = line.indexOf(':');
            return [line.slice(0, separator), line.slice(separator + 1)];
          }),
        );

        if (command === 'CONNECTED') {
          connected = true;
          retryDelay = RETRY_DELAY_MS;
          pending.splice(0).forEach((queued) => socket.send(queued));
          onConnect(connection);
        } else if (command === 'MESSAGE') {
          handlers.get(headers.subscription)?.(body ? JSON.parse(body) : null);
        } else if (command === 'ERROR') {
          console.error('STOMP error:', headers.message ?? body);
        }
      }
    };

    // The server forgets a closed connection's subscriptions, so drop ours too;
    // onConnect subscribes again once the new connection is up.
    socket.onclose = () => {
      connected = false;
      pending.length = 0;
      handlers.clear();
      if (closedByUs) {
        return;
      }
      retryTimer = setTimeout(open, retryDelay);
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY_MS);
    };
  }

  open();
  return connection;
}
