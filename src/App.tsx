import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";

import "leaflet/dist/leaflet.css";
import fireIcon from "./assets/fire.png";
import { supabase } from "./supabaseClient";

// const socket = io("http://localhost:5001");

export function App() {
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
    const realtime = supabase.realtime;

    // Subscribe to a channel
    const channel = realtime.channel("my-channel");

    // Listen for new messages
    // channel.on("INSERT", (payload) => {
    //   console.log("New message:", payload);
    // });

    // Unsubscribe when the component unmounts
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const customIcon = new Icon({
    iconUrl: fireIcon,
    iconSize: [30, 30],
  });

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={endPoint ? endPoint : [33.98460250512071, -5.019231838515444]}
        zoom={15}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {endPoint && (
          <Marker position={endPoint} icon={customIcon}>
            <Popup>
              {imageUrl ? (
                <img src={imageUrl} alt="Fire" style={{ width: "200px" }} />
              ) : (
                "Fire detected"
              )}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
