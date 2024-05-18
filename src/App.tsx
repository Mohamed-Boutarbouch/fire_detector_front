import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  // Circle
} from "react-leaflet";
import { Icon } from "leaflet";

import "leaflet/dist/leaflet.css";
import cameraImage from "./assets/camera.png";
import { supabase } from "./supabaseClient";

interface Camera {
  id: number;
  latitude: string;
  longitude: string;
  area_id: number;
  created_at: string;
}

interface Area {
  id: number;
  name: string;
  center_latitude: string;
  center_longitude: string;
  created_at: string;
}

export function App() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    getAreas();
    getCameras();
  }, []);

  useEffect(() => {
    const channel = supabase.realtime.channel("detections");
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
        },
        (payload) => console.log(payload.new)
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function getAreas() {
    const { data, error } = await supabase.from("areas").select("*");

    if (error) {
      console.error("Error fetching areas:", error);
    } else {
      setAreas((data as Area[]) ?? []);
    }
  }

  async function getCameras() {
    const { data, error } = await supabase.from("cameras").select("*");

    if (error) {
      console.error("Error fetching cameras:", error);
    } else {
      setCameras((data as Camera[]) ?? []);
    }
  }

  const cameraIcon = new Icon({
    iconUrl: cameraImage,
    iconSize: [30, 30],
  });

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {areas.length > 0 && (
        <MapContainer
          style={{ height: "100%", width: "100%" }}
          center={[
            parseFloat(areas[0]?.center_latitude),
            parseFloat(areas[0]?.center_longitude),
          ]}
          zoom={15}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* {areas.map((area) => (
            <Circle
              key={area.id}
              center={[
                parseFloat(area.center_latitude),
                parseFloat(area.center_longitude),
              ]}
              pathOptions={{ fillColor: "blue", color: "blue" }}
              radius={area.radius}
            />
          ))} */}
          {cameras.map((camera) => (
            <Marker
              key={camera.id}
              position={[
                parseFloat(camera.latitude),
                parseFloat(camera.longitude),
              ]}
              icon={cameraIcon}
            >
              <Popup>{camera.area_id}</Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
