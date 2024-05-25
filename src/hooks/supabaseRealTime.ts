import { useEffect, useState } from "react";

import { supabase } from "../supabaseClient";
import { Direction, Fire } from "../types";

export function useSupabaseRealTime(directions: Direction[]) {
  const TEN_SECONDS = 10000;

  const [fires, setFires] = useState<Fire[]>([]);

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
  }, [directions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFires((prevCameras) => {
        if (prevCameras.length === 0) {
          clearInterval(interval);
          return prevCameras;
        }
        return prevCameras.slice(1);
      });
    }, TEN_SECONDS);

    return () => clearInterval(interval);
  }, [fires]);

  return { fires };
}
