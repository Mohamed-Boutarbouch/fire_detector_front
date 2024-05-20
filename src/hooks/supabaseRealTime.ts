import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Direction, Fire } from "../types";

export function useSupabaseRealTime(directions: Direction[]) {
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
          const direction = directions.find(
            (direction) => direction.id === payload.new.direction_id
          );

          if (direction) {
            setFires((prevFires) => [
              ...prevFires,
              {
                id: direction.id,
                latitude: parseFloat(direction.latitude),
                longitude: parseFloat(direction.longitude),
              },
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [directions]);

  return { fires };
}
