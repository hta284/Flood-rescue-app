import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

const HCMC_CENTER: [number, number] = [10.762622, 106.660172];

function LocationMarker({ lat, lng, onLocationSelect }: MapPickerProps) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);

  return lat && lng ? (
    <Marker position={[lat, lng]} />
  ) : null;
}

export default function MapPicker({ lat, lng, onLocationSelect }: MapPickerProps) {
  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 shadow-inner">
      <MapContainer 
        center={lat && lng ? [lat, lng] : HCMC_CENTER} 
        zoom={15} 
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={lat} lng={lng} onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}
