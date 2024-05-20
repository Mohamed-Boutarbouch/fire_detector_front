import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Direction, Fire } from "../types";

export function useSupabaseRealTime(directions: Direction[]) {
  const [fires, setFires] = useState<Fire[]>([]);
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
          const direction = directions.find(
            (direction) => direction.id === payload.new.direction_id
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

  return { fires };
}
