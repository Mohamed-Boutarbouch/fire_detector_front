import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { Direction, Fire } from "../types";

export function useSupabaseRealTime(directions: Direction[]) {
  const TEN_SECONDS = 10000;

  const [fires, setFires] = useState<Fire[]>([]);
  const [isPlaybackDeferred, setIsPlaybackDeferred] = useState(false);

  const alarmSound = useMemo(() => new Audio("/alarm.mp3"), []);

  const attemptPlaySound = useCallback(() => {
    alarmSound.play().catch(() => {
      setIsPlaybackDeferred(true);
    });
  }, [alarmSound]);

  useEffect(() => {
    const channel = supabase.realtime.channel("detections");

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
        },
        (payload) => {
          const { direction_id, type } = payload.new;

          const direction = directions.find(
            (direction) => direction.id === direction_id
          );

          if (direction) {
            setFires((prevFires) => {
              if (!prevFires.some((fire) => fire.id === direction.id)) {
                attemptPlaySound();
                return [
                  ...prevFires,
                  {
                    id: direction.id,
                    latitude: parseFloat(direction.latitude),
                    longitude: parseFloat(direction.longitude),
                    type,
                  },
                ];
              }
              return prevFires;
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [directions, alarmSound, attemptPlaySound]);

  useEffect(() => {
    const handleUserInteraction = () => {
      if (isPlaybackDeferred) {
        alarmSound.play().catch((error) => {
          console.error("Error playing deferred alarm sound:", error);
        });
        setIsPlaybackDeferred(false);
      }
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, [isPlaybackDeferred, alarmSound]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFires((prevFires) => {
        if (prevFires.length === 0) {
          clearInterval(interval);
          return prevFires;
        }
        return prevFires.slice(1);
      });
    }, TEN_SECONDS);

    return () => clearInterval(interval);
  }, [fires]);

  return { fires };
}
