import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import io, { Socket } from "socket.io-client";

import { useSupabaseService } from "./hooks/supabaseService";
import { useSupabaseRealTime } from "./hooks/supabaseRealTime";
import { cameraIcon } from "./icons";

import "leaflet/dist/leaflet.css";

export function App() {
  const [frame, setFrame] = useState<string | null>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [cameraServer, setCameraServer] = useState<string | null>(null);

  const { getAreas, getCameras, getDirections, areas, cameras, directions } =
    useSupabaseService();
  const { fires } = useSupabaseRealTime(directions);

  useEffect(() => {
    getAreas();
    getCameras();
    getDirections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cameraServer) {
      if (socket) {
        socket.close();
      }

      const newSocket = io(`${cameraServer}`);
      setSocket(newSocket);
      console.log("");

      newSocket.on("connect", () => {
        newSocket.emit("start_stream");
      });
      let totalSizeStream = 0;
      newSocket.on("video_frame", ({ data }) => {
        // Calculate the size of the received data in bytes
        const stringLength = data.length;
        // Each base64 character represents 6 bits, so we need to convert it to bytes
        const bytes = Math.ceil((stringLength * 3) / 4);

        // Convert bytes to kilobytes
        const kilobytes = bytes / 1024;
        totalSizeStream = totalSizeStream + kilobytes;
        console.log(`Size of received data: ${kilobytes.toFixed(2)} KB`);
        console.log(
          `Total Size of received data: ${(totalSizeStream / 1024).toFixed(
            2
          )} MB`
        );
        setFrame(`data:image/jpeg;base64,${data}`);
      });

      return () => {
        newSocket.close();
        setFrame("");
      };
    } else {
      setFrame("");
    }
  }, [cameraServer, socket]);

  const toggle_stream = () => {
    socket?.emit("toggle_stream");
  };
  const start_server = () => {
    socket?.emit("start_server");
  };

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
          {fires.map((fire) => (
            <Circle
              key={fire.id}
              center={[fire.latitude, fire.longitude]}
              pathOptions={{ fillColor: "red", color: "red" }}
              radius={100}
            />
          ))}
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
                  setFrame(null);
                  setCameraServer("http://127.0.0.1:5002");
                },
              }}
            >
              <Popup>
                {camera.id}
                <button
                  onClick={start_server}
                  style={{
                    position: "absolute",
                    right: "2px",
                    top: "2px",
                    backgroundColor: "red",
                  }}
                >
                  start
                </button>
                <button
                  onClick={() => {
                    toggle_stream();
                    setFrame(null);
                  }}
                  style={{
                    position: "absolute",
                    right: "2px",
                    top: "2px",
                    backgroundColor: "blue",
                  }}
                >
                  stream
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
      {frame && (
        <div className="legend">
          <img src={frame} alt="Video Frame" />
        </div>
      )}
    </div>
  );
}
