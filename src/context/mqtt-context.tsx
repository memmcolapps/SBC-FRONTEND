"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { getMqttService, type MqttService } from "@/services/mqtt-service";
import { env } from "@/env";

interface MqttContextValue {
  mqttService: MqttService | null;
  isConnected: boolean;
}

const MqttContext = createContext<MqttContextValue>({
  mqttService: null,
  isConnected: false,
});

export function MqttProvider({ children }: { children: ReactNode }) {
  const [mqttService, setMqttService] = useState<MqttService | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const service = getMqttService(env.NEXT_PUBLIC_MQTT_WS_URL);
    service.connect();
    setMqttService(service);

    const unsub = service.onStatusChange((connected) => {
      setIsConnected(connected);
    });

    return () => {
      unsub();
      service.disconnect();
    };
  }, []);

  const value = useMemo(
    () => ({ mqttService, isConnected }),
    [mqttService, isConnected],
  );

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>;
}

export function useMqtt(): MqttContextValue {
  return useContext(MqttContext);
}
