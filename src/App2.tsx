import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import fireIcon from "./assets/fire.png";
import { supabase } from "./supabaseClient";

// Component to handle map click event
function MapClickHandler({ setCoordinates }) {
  useMapEvent('click', (e) => {
    const coords = e.latlng;
    console.log("Coordinates: " + coords.lat + ", " + coords.lng);
    setCoordinates(coords);
  });
  return null;
}

export function App() {
  const [endPoint, setEndpoint] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  useEffect(() => {
    const realtime = supabase.realtime;
    const channel = realtime.channel("my-channel");
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
        <MapClickHandler setCoordinates={setCoordinates} />
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
      {coordinates && (
        <div>
          <p>Clicked Coordinates: {coordinates.lat}, {coordinates.lng}</p>
        </div>
      )}
    </div>
  );
}
