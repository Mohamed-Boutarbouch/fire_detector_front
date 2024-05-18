import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import fireIcon from "./assets/fire.png";
import { supabase } from "./supabaseClient";
import { useMap } from "react-leaflet";

interface Camera {
  id: number;
  latitude: string;
  longitude: string;
  area_id: number;
  created_at: string;
}

export function App() {
  const map = useMap();

  map.on("click", function (e) {
    // Get the coordinates of the click event
    const coords = e.latlng;
    console.log("Coordinates: " + coords.lat + ", " + coords.lng);
  });

  const [
    endPoint,
    // setEndpoint
  ] = useState(null);
  const [
    imageUrl,
    // setImageUrl
  ] = useState(null);

  // useEffect(() => {
  //   socket.on("coordinates", (data) => {
  //     setEndpoint(data);
  //   });

  //   socket.on("image", (data) => {
  //     const blob = new Blob([data], { type: "image/jpeg" });
  //     const url = URL.createObjectURL(blob);
  //     setImageUrl(url);
  //   });
  // }, []);

  useEffect(() => {
    async function fetchCameras() {
      const { data, error } = await supabase.from("cameras").select("*");

      console.log(data);

      if (error) {
        console.error("Error fetching cameras:", error.message);
        return [];
      }
      return data;
    }

    fetchCameras();
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
        {cameras.map((camera) => (
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
        ))}
      </MapContainer>
    </div>
  );
}
