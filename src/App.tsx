import { MapContainer, Marker, Popup, TileLayer, Polygon } from "react-leaflet";
import io, { Socket } from "socket.io-client";
import { useEffect, useState } from "react";

import { useSupabaseRealTime } from "./hooks/supabaseRealTime";
import { useSupabaseService } from "./hooks/supabaseService";
import { FireCircle } from "./FireCircle";

import "leaflet/dist/leaflet.css";
import "leaflet-rotatedmarker";

import { cameraIcon } from "./icons";
import live from "./assets/live.png";
import redButton from "./assets/circle.png";

export function App() {
  const [frame, setFrame] = useState<string | null>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [cameraServer, setCameraServer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const purpleOptions = { color: 'blue' , opacity: 0.3}

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

  // socket.io code from here
  useEffect(() => {
    if (cameraServer) {
      // Close previous socket connection
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

      // This is a listener to the frames coming from python
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
          `Total Size of received data: ${totalSizeStream.toFixed(2) / 1024} MB`
        );

        if (loading) {
          setLoading(false);
        }
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
  }, [cameraServer, loading, socket]);

  // const toggle_stream = () => {
  //   socket?.emit("toggle_stream");
  // };

  // const start_detection_functionality = () => {
  //   socket?.emit("start_detection_functionality");
  // };

  return (
    <>
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
                  setCameraServer("http://127.0.0.1:5002");
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
                {/* <button onClick={start_detection_functionality} style={{display: "absolute", right: "2px", top:"2px", backgroundColor: "red"}}>start</button>
                <button onClick={()=>{toggle_stream(); setFrame(null)}} style={{display: "absolute", right: "2px", top:"2px", backgroundColor: "blue"}}>stream</button> */}
              </Popup>
            </Marker>
            <Polygon pathOptions={purpleOptions} positions={
                [
                  [parseFloat(camera.p1latitude), parseFloat(camera.p1longitude)],
                  [parseFloat(camera.p2latitude), parseFloat(camera.p2longitude)],
                  [parseFloat(camera.p3latitude), parseFloat(camera.p3longitude)],
                  [parseFloat(camera.p4latitude), parseFloat(camera.p4longitude)],
                ]
            } />
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
    </>
  );
}
