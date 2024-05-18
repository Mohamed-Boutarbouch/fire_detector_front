import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import fireIcon from "./assets/fire.png";
import { supabase } from "./supabaseClient";

interface Camera {
  id: number;
  latitude: string;
  longitude: string;
  area_id: number;
  created_at: string;
}

export function App() {
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
    async function getCameras() {
      const { data: cameras } = await supabase.from("cameras").select("*");

      console.log(cameras);

      // if (todos.length > 1) {
      //   setTodos(todos)
      // }
    }

    getAreas();
    getCameras();
  }, []);

  const customIcon = new Icon({
    iconUrl: fireIcon,
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
        {/* {cameras.map((camera) => (
          <Marker
            key={camera.id}
            position={[
              parseFloat(camera.latitude),
              parseFloat(camera.longitude),
            ]}
            icon={customIcon}
          >
            <Popup>{camera.area_id}</Popup>
          </Marker>
        ))} */}
      </MapContainer>
    </div>
  );
}
