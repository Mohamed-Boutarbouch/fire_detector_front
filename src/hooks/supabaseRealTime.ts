import { useEffect, useState } from "react";

import { supabase } from "../supabaseClient";
import { Direction, Fire } from "../types";

export function useSupabaseRealTime(directions: Direction[]) {
  const ONE_MINUTE = 60000;

  const [fires, setFires] = useState<Fire[]>([]);
  const [uniqueIds, setUniqueIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const channel = supabase.realtime.channel("detections");
    const timeouts: ReturnType<typeof setTimeout>[] = [];

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
          // direction?.type=payload.new.type;

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
                  type: payload.new.type
                },
              ]);

              const timeout = setTimeout(() => {
                setFires((prevFires) => prevFires.slice(1));
              }, ONE_MINUTE);

              timeouts.push(timeout);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [directions, uniqueIds]);

  return { fires };
}
