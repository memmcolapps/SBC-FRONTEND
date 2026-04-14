"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useMqtt } from "@/context/mqtt-context";
import type { Breaker } from "@/types/breakers";

type BreakerStatus = "ON" | "OFF" | "UNKNOWN";

interface MqttBreakerState {
  breakerStatuses: Record<string, Record<number, BreakerStatus>>;
  systemStatuses: Record<string, "ONLINE" | "OFFLINE" | "UNKNOWN">;
  controlBreaker: (
    sbcId: string,
    breakerNumber: number,
    command: "ON" | "OFF",
  ) => void;
  isConnected: boolean;
}

function getBreakerTopicField(
  num: number,
): keyof Pick<
  import("@/types/breakers").Topic,
  "sb1Topic" | "sb2Topic" | "sb3Topic" | "sb4Topic" | "sb5Topic" | "sb6Topic"
> {
  return `sb${num}Topic` as
    | "sb1Topic"
    | "sb2Topic"
    | "sb3Topic"
    | "sb4Topic"
    | "sb5Topic"
    | "sb6Topic";
}

export function useMqttBreakers(breakers: Breaker[]): MqttBreakerState {
  const { mqttService, isConnected } = useMqtt();
  const [breakerStatuses, setBreakerStatuses] = useState<
    Record<string, Record<number, BreakerStatus>>
  >({});
  const [systemStatuses, setSystemStatuses] = useState<
    Record<string, "ONLINE" | "OFFLINE" | "UNKNOWN">
  >({});

  const unsubscribersRef = useRef<(() => void)[]>([]);
  const prevBreakersRef = useRef<string>("");

  useEffect(() => {
    if (!mqttService || !isConnected) return;

    const breakerKey = breakers
      .map((b) => `${b.sbcId}:${b.breakerCount}`)
      .sort()
      .join(",");

    if (breakerKey === prevBreakersRef.current) return;
    prevBreakersRef.current = breakerKey;

    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];

    const newSystemStatuses: Record<string, "ONLINE" | "OFFLINE" | "UNKNOWN"> =
      {};
    const newBreakerStatuses: Record<
      string,
      Record<number, BreakerStatus>
    > = {};

    breakers.forEach((breaker) => {
      const sbcId = breaker.sbcId;
      newSystemStatuses[sbcId] = "UNKNOWN";
      newBreakerStatuses[sbcId] = {};

      if (breaker.subscribeTopic?.sbcTopic) {
        const fullSbcTopic = `${sbcId}/${breaker.subscribeTopic.sbcTopic}`;
        const unsub = mqttService.subscribe(
          fullSbcTopic,
          (topic, message) => {
            console.log(`[MQTT][${sbcId}] SBC system topic="${topic}" message="${message}"`);
            setSystemStatuses((prev) => ({
              ...prev,
              [sbcId]:
                message === "ONLINE"
                  ? "ONLINE"
                  : message === "OFFLINE"
                    ? "OFFLINE"
                    : "UNKNOWN",
            }));
          },
        );
        unsubscribersRef.current.push(unsub);
      }

      for (let i = 1; i <= breaker.breakerCount; i++) {
        const field = getBreakerTopicField(i);
        const rawTopic = breaker.subscribeTopic?.[field];

        if (rawTopic) {
          const topic = `${sbcId}/${rawTopic}`;
          newBreakerStatuses[sbcId][i] = "UNKNOWN";
          const breakerNum = i;
          const unsub = mqttService.subscribe(topic, (_, message) => {
            console.log(`[MQTT][${sbcId}] Breaker ${breakerNum} topic="${topic}" message="${message}"`);
            setBreakerStatuses((prev) => ({
              ...prev,
              [sbcId]: {
                ...prev[sbcId],
                [breakerNum]:
                  message === "ON"
                    ? "ON"
                    : message === "OFF"
                      ? "OFF"
                      : "UNKNOWN",
              },
            }));
          });
          unsubscribersRef.current.push(unsub);
        }
      }
    });

    setSystemStatuses(newSystemStatuses);
    setBreakerStatuses(newBreakerStatuses);

    return () => {
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
    };
  }, [mqttService, isConnected, breakers]);

  const controlBreaker = useCallback(
    (sbcId: string, breakerNumber: number, command: "ON" | "OFF") => {
      if (!mqttService) return;

      const breaker = breakers.find((b) => b.sbcId === sbcId);
      if (!breaker?.publishTopic) return;

      const field = getBreakerTopicField(breakerNumber);
      const rawTopic = breaker.publishTopic[field];
      if (!rawTopic) return;

      const topic = `${sbcId}/${rawTopic}`;

      setBreakerStatuses((prev) => ({
        ...prev,
        [sbcId]: {
          ...prev[sbcId],
          [breakerNumber]: command === "ON" ? "ON" : "OFF",
        },
      }));

      mqttService.publish(topic, command);
    },
    [mqttService, breakers],
  );

  return {
    breakerStatuses,
    systemStatuses,
    controlBreaker,
    isConnected,
  };
}
