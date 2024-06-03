import { MapContainer, Marker, Popup, TileLayer, Polygon } from "react-leaflet";
import io, { Socket } from "socket.io-client";
import { useEffect, useState } from "react";

import { useSupabaseRealTime } from "./hooks/supabaseRealTime";
import { useSupabaseService } from "./hooks/supabaseService";
import { FireCircle } from "./FireCircle";
import { CenterAreas } from "./CenterAreas";
import { AlarmButton } from "./AlarmButton";

import "leaflet/dist/leaflet.css";
import "leaflet-rotatedmarker";

import { cameraIcon } from "./leafletIcon";
import live from "/live.png";
import redButton from "/circle.png";

export function App() {
  const [frame, setFrame] = useState<string | null>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [cameraServer, setCameraServer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const purpleOptions = { color: "blue", opacity: 0.3 };

  const { getAreas, getCameras, getDirections, areas, cameras, directions } =
    useSupabaseService();
  const { fires, enableSound, isSoundEnabled, isFireDetected } =
    useSupabaseRealTime(directions);

  const ZOOM = 15;

  useEffect(() => {
    getAreas();
    getCameras();
    getDirections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // socket.io code from here
  useEffect(() => {
    if (cameraServer) {
      // Close previous sockets connection
      if (socket) {
        socket.close();
      }

      const newSocket = io(`${cameraServer}`);
      setSocket(newSocket);
      console.log("");

      newSocket.on("connect", () => {
        newSocket.emit("start_stream");
      });

      // This is a listener to the frames coming from python
      newSocket.on("video_frame", ({ data }) => {
        if (loading) {
          setLoading(false);
        }
        // Decode base64
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraServer]);

  return (
    <section
      style={{ height: "100%", width: "100%" }}
      className={isFireDetected ? "flash-red" : ""}
    >
      {isFireDetected ? <span style={{ fontSize: "50px" , marginLeft : "40%" , color:"white"}}>FIRE DETECTED</span> : ""} 
      <AlarmButton enableSound={enableSound} isSoundEnabled={isSoundEnabled} />
      {areas.length > 0 && (
        <MapContainer
          style={{ height: "100%", width: "100%" }}
          center={[
            parseFloat(areas[0]?.center_latitude),
            parseFloat(areas[0]?.center_longitude),
          ]}
          zoom={ZOOM}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CenterAreas areas={areas} zoom={ZOOM} />

          {fires.map((fire) => (
            <FireCircle key={fire.id} fire={fire} />
          ))}
          {cameras.map((camera) => (
            <div key={camera.id}>
              <Marker
                key={camera.id}
                position={[
                  parseFloat(camera.latitude),
                  parseFloat(camera.longitude),
                ]}
                icon={cameraIcon}
                rotationAngle={camera.rotationAngle}
                eventHandlers={{
                  click: () => {
                    setFrame(null);
                    setCameraServer(camera.cameraServer);
                  },
                }}
              >
                <Popup>
                  {loading ? (
                    <div className="loading">Loading...</div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1px",
                      }}
                    >
                      <img
                        src={redButton}
                        style={{ width: "12px", height: "12px" }}
                      />
                      Live
                    </div>
                  )}
                </Popup>
              </Marker>
              <Polygon
                pathOptions={purpleOptions}
                positions={[
                  [
                    parseFloat(camera.p1latitude),
                    parseFloat(camera.p1longitude),
                  ],
                  [
                    parseFloat(camera.p2latitude),
                    parseFloat(camera.p2longitude),
                  ],
                  [
                    parseFloat(camera.p3latitude),
                    parseFloat(camera.p3longitude),
                  ],
                  [
                    parseFloat(camera.p4latitude),
                    parseFloat(camera.p4longitude),
                  ],
                ]}
              />
            </div>
          ))}
        </MapContainer>
      )}
      {frame && (
        <div className="legend">
          <img src={live} className="live" />
          <img src={frame} alt="Video Frame" />
        </div>
      )}
    </section>
  );
}
