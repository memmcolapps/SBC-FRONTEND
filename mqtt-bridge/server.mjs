import mqtt from "mqtt";
import { WebSocketServer } from "ws";

const MQTT_BROKER_URL =
  process.env.MQTT_BROKER_URL || "mqtt://iot.memmserve.com:1883";
const MQTT_WS_PORT = parseInt(process.env.MQTT_WS_PORT || "8080", 10);

const wss = new WebSocketServer({ port: MQTT_WS_PORT });

let mqttClient = null;
const activeSubscriptions = new Set();
const wssClients = new Set();

function connectMqtt() {
  mqttClient = mqtt.connect(MQTT_BROKER_URL, {
    reconnectPeriod: 5000,
    connectTimeout: 10000,
    clean: true,
  });

  mqttClient.on("connect", () => {
    console.log("[MQTT] Connected to broker:", MQTT_BROKER_URL);
    activeSubscriptions.forEach((topic) => {
      mqttClient.subscribe(topic, { qos: 0 }, (err) => {
        if (err) console.error("[MQTT] Re-subscribe error:", err.message);
      });
    });
    broadcastToWs({ type: "mqtt_connected" });
  });

  mqttClient.on("message", (topic, message) => {
    const payload = message.toString();
    broadcastToWs({ type: "message", topic, message: payload });
  });

  mqttClient.on("error", (err) => {
    console.error("[MQTT] Error:", err.message);
  });

  mqttClient.on("close", () => {
    console.log("[MQTT] Disconnected from broker");
    broadcastToWs({ type: "mqtt_disconnected" });
  });

  mqttClient.on("reconnect", () => {
    console.log("[MQTT] Reconnecting...");
  });
}

function broadcastToWs(data) {
  const json = JSON.stringify(data);
  wssClients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(json);
    }
  });
}

wss.on("connection", (ws) => {
  console.log("[WS] Client connected");
  wssClients.add(ws);

  if (mqttClient && mqttClient.connected) {
    ws.send(JSON.stringify({ type: "mqtt_connected" }));
  } else {
    ws.send(JSON.stringify({ type: "mqtt_disconnected" }));
  }

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      switch (data.type) {
        case "subscribe": {
          const topic = data.topic;
          if (!activeSubscriptions.has(topic)) {
            activeSubscriptions.add(topic);
            if (mqttClient && mqttClient.connected) {
              mqttClient.subscribe(topic, { qos: 0 }, (err) => {
                if (err) console.error("[MQTT] Subscribe error:", err.message);
                else console.log("[MQTT] Subscribed:", topic);
              });
            }
          }
          break;
        }

        case "unsubscribe": {
          const topic = data.topic;
          activeSubscriptions.delete(topic);
          if (mqttClient && mqttClient.connected) {
            mqttClient.unsubscribe(topic, (err) => {
              if (err) console.error("[MQTT] Unsubscribe error:", err.message);
              else console.log("[MQTT] Unsubscribed:", topic);
            });
          }
          break;
        }

        case "publish": {
          const { topic, message } = data;
          console.log("[WS] Publish request:", topic, message);
          if (mqttClient && mqttClient.connected) {
            mqttClient.publish(topic, message, { qos: 0 }, (err) => {
              if (err) console.error("[MQTT] Publish error:", err.message);
              else console.log("[MQTT] Published:", topic, message);
            });
          } else {
            console.warn("[MQTT] Cannot publish, not connected:", topic);
          }
          break;
        }

        default:
          console.warn("[WS] Unknown message type:", data.type);
      }
    } catch (err) {
      console.error("[WS] Invalid message:", err.message);
    }
  });

  ws.on("close", () => {
    console.log("[WS] Client disconnected");
    wssClients.delete(ws);
  });

  ws.on("error", (err) => {
    console.error("[WS] Client error:", err.message);
    wssClients.delete(ws);
  });
});

connectMqtt();

console.log(
  `[Bridge] WebSocket server listening on ws://localhost:${MQTT_WS_PORT}`,
);
console.log(`[Bridge] Forwarding to MQTT broker at ${MQTT_BROKER_URL}`);
