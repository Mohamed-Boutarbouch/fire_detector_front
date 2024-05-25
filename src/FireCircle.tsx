import { Circle } from "react-leaflet";

import { Fire } from "./types";

interface FireCircleProps {
  fire: Fire;
}

export function FireCircle({ fire }: FireCircleProps) {
  return (
    <Circle
      key={fire.id}
      center={[fire.latitude, fire.longitude]}
      pathOptions={{ fillColor: fire.type=="fire"? "red":"yellow", color: fire.type=="fire"? "red":"yellow" }}
      radius={90}
    />
  );
}
