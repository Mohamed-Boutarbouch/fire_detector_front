import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

export function App() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [
    endPoint,
    // setEndpoint
  ] = useState(null);
  const [
    imageUrl,
    // setImageUrl
  ] = useState(null);


    async function getAreas() {
      const { data: areas } = await supabase.from("areas").select();
      console.log(areas);
    }

  useEffect(() => {
    const getCameras = async () => {
      const { data, error } = await supabase.from("cameras").select("*");

      if (error) {
        console.error("Error fetching cameras:", error);
      } else {
        setCameras((data as Camera[]) ?? []);
        console.log("Cameras:", data);
      }
    };

    getAreas();
    getCameras();
  }, []);

  const cameraIcon = new Icon({
    iconUrl: cameraImage,
    iconSize: [30, 30],
  });

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={endPoint || [33.98460250512071, -5.019231838515444]}
        zoom={15}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {cameras.map((camera) => {
          return (
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
          );
        })}
      </MapContainer>
    </div>
  );
}
