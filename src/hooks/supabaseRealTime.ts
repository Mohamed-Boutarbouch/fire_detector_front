import { useEffect, useState, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { Direction, Fire } from "../types";

export function useSupabaseRealTime(directions: Direction[]) {
  const TWENTY_SECONDS = 20000;

  const [fires, setFires] = useState<Fire[]>([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isFireDetected, setIsFireDetected] = useState(false);

  const alarmSound = useMemo(() => new Audio("/alarm.mp3"), []);

  const enableSound = () => {
    alarmSound
      .play()
      .then(() => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        setIsSoundEnabled(true);
      })
      .catch((error) => {
        console.error("Error enabling alarm sound:", error);
      });
  };

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
            setIsFireDetected(true);
            setFires((prevFires) => {
              if (!prevFires.some((fire) => fire.id === direction.id)) {
                if (isSoundEnabled) {
                  alarmSound.play().catch((error) => {
                    console.error("Error playing alarm sound:", error);
                  });
                }
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
  }, [directions, isSoundEnabled, alarmSound]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFires((prevFires) => {
        if (prevFires.length === 0) {
          clearInterval(interval);
          return prevFires;
        }
        return prevFires.slice(1);
      });
      setIsFireDetected(false);
    }, TWENTY_SECONDS);

    return () => clearInterval(interval);
  }, [fires]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFireDetected(false);
    }, 60000);

    return () => clearInterval(interval);
  }, [fires]);

  return { fires, enableSound, isSoundEnabled, isFireDetected };
}
