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

import io from "socket.io-client";

interface Camera {
  id: number;
  latitude: string;
  longitude: string;
  area_id: number;
  created_at: string;
}

interface Area {
  id: number;
  direction: string;
  center_latitude: string;
  center_longitude: string;
  created_at: string;
}

interface Direction {
  id: number;
  direction: string;
  latitude: string;
  longitude: string;
  camera_id: number;
  created_at: string;
}

export function App() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);

  const [frame, setFrame] = useState("");
  const [socket, setSocket] = useState(null);
  const [cameraServer, setCameraServer] = useState(null);

  useEffect(() => {
    getAreas();
    getCameras();
    getDirections();
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
    const { data, error } = await supabase.from("areas").select();

    if (error) {
      console.error("Error fetching areas:", error);
    } else {
      setAreas((data as Area[]) ?? []);
    }
  }

  async function getCameras() {
    const { data, error } = await supabase.from("cameras").select();

    if (error) {
      console.error("Error fetching cameras:", error);
    } else {
      setCameras((data as Camera[]) ?? []);
    }
  }

  async function getDirections() {
    const { data, error } = await supabase.from("directions").select();

    if (error) {
      console.error("Error fetching directions:", error);
    } else {
      setDirections((data as Direction[]) ?? []);
    }
  }

  const cameraIcon = new Icon({
    iconUrl: cameraImage,
    iconSize: [30, 30],
  });

  // socket.io code from here
  useEffect(() => {
    if (cameraServer) {
      // Close previous socket connection
      if (socket) {
        socket.close();
      }

      const newSocket = io(`${cameraServer}`);
      setSocket(newSocket);

      newSocket.on("connect", () => {
        newSocket.emit("start_stream");
      });
      let totalSizeOfstream = 0
      newSocket.on("video_frame", ({ data }) => {
        // Calculate the size of the received data in bytes
        const stringLength = data.length;
        // Each base64 character represents 6 bits, so we need to convert it to bytes
        const bytes = Math.ceil((stringLength * 3) / 4);

        // Convert bytes to kilobytes
        const kilobytes = bytes / 1024;
        totalSizeOfstream = totalSizeOfstream + kilobytes;
        console.log(`Size of received data: ${kilobytes.toFixed(2)} KB`);
        console.log(`Total Size of received data: ${totalSizeOfstream.toFixed(2) / 1024} MB`);
        // Decode base64 and set as image source
        setFrame(`data:image/jpeg;base64,${data}`);
      });

      // Cleanup function
      return () => {
        newSocket.close();
        setFrame("");
      };
    } else {
      // If cameraServer is null, reset frame
      setFrame("");
    }
  }, [cameraServer]);

  const toggle_stream = ()=>{
    socket?.emit("toggle_stream")
  }
  const start_server = ()=>{
    socket?.emit("start_server")
  }


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
              eventHandlers={{
                click: () => {
                  setFrame(null)
                  setCameraServer("http://192.168.100.4:5000");
                },
              }}
            >
              <Popup>
                {camera.id}
                <button onClick={start_server} style={{display: "absolute", right: "2px", top:"2px", backgroundColor: "red"}}>start</button>
                <button onClick={()=>{toggle_stream(); setFrame(null)}} style={{display: "absolute", right: "2px", top:"2px", backgroundColor: "blue"}}>stream</button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
      {frame && <div className="legend">
        
        <img src={frame} alt="Video Frame" className="w-full h-full" />
      </div>}
    </div>
  );
}
