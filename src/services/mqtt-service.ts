type MessageCallback = (topic: string, message: string) => void;
type StatusCallback = (connected: boolean) => void;

type BridgeMessage =
  | { type: "subscribe"; topic: string }
  | { type: "unsubscribe"; topic: string }
  | { type: "publish"; topic: string; message: string };

class MqttService {
  private ws: WebSocket | null = null;
  private url: string;
  private subscriptions = new Map<string, Set<MessageCallback>>();
  private statusListeners = new Set<StatusCallback>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000;
  private baseReconnectDelay = 1000;
  private intentionalClose = false;
  private mqttConnected = false;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.intentionalClose = false;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.subscriptions.forEach((_, topic) => {
          this.sendRaw({ type: "subscribe", topic });
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);

          if (
            data.type === "message" &&
            data.topic &&
            data.message !== undefined
          ) {
            const callbacks = this.subscriptions.get(data.topic);
            if (callbacks) {
              callbacks.forEach((cb) => cb(data.topic, data.message as string));
            }
          } else if (data.type === "mqtt_connected") {
            this.mqttConnected = true;
            this.notifyStatus(true);
          } else if (data.type === "mqtt_disconnected") {
            this.mqttConnected = false;
            this.notifyStatus(false);
          }
        } catch {
          // ignore parse errors
        }
      };

      this.ws.onclose = () => {
        this.notifyStatus(false);
        if (!this.intentionalClose) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        // onclose will fire after this
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.clearReconnectTimer();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.mqttConnected = false;
    this.notifyStatus(false);
  }

  subscribe(topic: string, callback: MessageCallback): () => void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
      this.sendRaw({ type: "subscribe", topic });
    }

    this.subscriptions.get(topic)!.add(callback);

    return () => {
      const callbacks = this.subscriptions.get(topic);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(topic);
          this.sendRaw({ type: "unsubscribe", topic });
        }
      }
    };
  }

  publish(topic: string, message: string): void {
    this.sendRaw({ type: "publish", topic, message });
  }

  onStatusChange(callback: StatusCallback): () => void {
    this.statusListeners.add(callback);
    callback(this.ws?.readyState === WebSocket.OPEN && this.mqttConnected);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.mqttConnected;
  }

  private sendRaw(data: BridgeMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private notifyStatus(connected: boolean): void {
    this.statusListeners.forEach((cb) => cb(connected));
  }

  private scheduleReconnect(): void {
    if (this.intentionalClose) return;
    this.clearReconnectTimer();

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay,
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

let instance: MqttService | null = null;

export function getMqttService(url: string): MqttService {
  if (!instance) {
    instance = new MqttService(url);
  }
  return instance;
}

export type { MqttService };
