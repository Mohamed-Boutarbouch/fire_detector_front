import { useEffect, useState } from "react";

import { supabase } from "../supabaseClient";
import { Direction, Fire } from "../types";

export function useSupabaseRealTime(directions: Direction[]) {
  const ONE_MINUTE = 60000;

  const [fires, setFires] = useState<Fire[]>([]);

  console.log(fires);

  const [uniqueIds, setUniqueIds] = useState<Set<number>>(new Set());

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
            const fireId = direction.id;
            if (!uniqueIds.has(fireId)) {
              setUniqueIds((prevIds) => new Set([...prevIds, fireId]));
              setFires((prevFires) => [
                ...prevFires,
                {
                  id: fireId,
                  latitude: parseFloat(direction.latitude),
                  longitude: parseFloat(direction.longitude),
                  type,
                },
              ]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [directions, uniqueIds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFires((prevCameras) => {
        if (prevCameras.length === 0) {
          clearInterval(interval);
          return prevCameras;
        }
        return prevCameras.slice(1);
      });
    }, ONE_MINUTE);

    return () => clearInterval(interval);
  }, [fires]);

  return { fires };
}
