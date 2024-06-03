export interface Camera {
  id: number;
  latitude: string;
  longitude: string;
  rotationAngle: number;
  area_id: number;
  created_at: string;
  p1latitude: string;
  p1longitude: string;
  p2latitude: string;
  p2longitude: string;
  p3latitude: string;
  p3longitude: string;
  p4latitude: string;
  p4longitude: string;
  cameraServer: string;
}

export interface Area {
  id: number;
  name: string;
  direction: string;
  center_latitude: string;
  center_longitude: string;
  created_at: string;
}

export interface Direction {
  id: number;
  direction: string;
  latitude: string;
  longitude: string;
  camera_id: number;
  created_at: string;
}

export interface Fire {
  id: number;
  type: "fire" | "smoke";
  latitude: number;
  longitude: number;
}
