export interface Camera {
  id: number;
  latitude: string;
  longitude: string;
  area_id: number;
  created_at: string;
}

export interface Area {
  id: number;
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
  latitude: number;
  longitude: number;
}
