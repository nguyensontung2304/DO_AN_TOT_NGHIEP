import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import "leaflet/dist/leaflet.css";

function Map() {
  const position = [16.0763405, 108.2075067];

  return (
    <MapContainer
      center={position}
      zoom={17}
      style={{
        width: "100%",
        height: "500px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position}>
        <Popup>K34/16 Bắc Đẩu, Hải Châu, Đà Nẵng</Popup>
      </Marker>
    </MapContainer>
  );
}

export default Map;
