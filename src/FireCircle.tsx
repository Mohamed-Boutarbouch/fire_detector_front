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
      pathOptions={{ fillColor: "red", color: "red" }}
      radius={90}
    />
  );
}
