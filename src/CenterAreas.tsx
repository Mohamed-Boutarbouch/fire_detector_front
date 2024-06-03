import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { LatLngTuple } from "leaflet";

import { Area } from "./types";

interface CenterAreasProps {
  areas: Area[];
  zoom: number;
}

export function CenterAreas({ areas, zoom }: CenterAreasProps) {
  const [centerMap, setCenterMap] = useState<LatLngTuple | null>(null);
  const map = useMap();

  useEffect(() => {
    if (centerMap) {
      map.setView(centerMap, zoom);
    }
  }, [centerMap, map, zoom]);

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        display: "flex",
        gap: "10px",
      }}
    >
      {areas.map((area) => (
        <button
          key={area.id}
          onClick={() =>
            setCenterMap([
              parseFloat(area.center_latitude),
              parseFloat(area.center_longitude),
            ] as LatLngTuple)
          }
        >
          {area.name}
        </button>
      ))}
    </div>
  );
}
