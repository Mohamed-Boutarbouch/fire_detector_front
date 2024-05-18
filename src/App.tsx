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

  const [endPoint, 
    // setEndpoint
  ] = useState(null);

  // const [
  //   imageUrl,
  //   // setImageUrl
  // ] = useState(null);

  async function getAreas() {
    const { data,error } = await supabase.from("areas").select();
    if (error) {
        console.error("Error fetching areas:", error);
      } else {
        setAreas((data as Area[]) ?? []);
        console.log("Areas:", data);
      }
      
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
        center={endPoint || [ parseFloat(areas[0].center_latitude), parseFloat(areas[0].center_longitude)]}
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
