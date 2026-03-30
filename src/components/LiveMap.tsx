import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../services/api';
import { Map as MapIcon, Truck, AlertTriangle, Navigation, Filter, Layers, Maximize2 } from 'lucide-react';
import { MapData, URGENCY_LEVELS } from '../types/rescue.types';

// Custom icons
const createRequestIcon = (urgencyColor: string) => L.divIcon({
  html: `<div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold ${urgencyColor}">!</div>`,
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const teamIcon = L.divIcon({
  html: `<div class="w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center bg-blue-600 text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-2.18-2.58A1 1 0 0 0 18.82 10H15"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg></div>`,
  className: 'custom-div-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const HCMC_CENTER: [number, number] = [10.762622, 106.660172];

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13);
  }, [center, map]);
  return null;
}

export default function LiveMap() {
  const [showRequests, setShowRequests] = useState(true);
  const [showTeams, setShowTeams] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>(HCMC_CENTER);

  const { data, isLoading } = useQuery<MapData>({
    queryKey: ['map-data'],
    queryFn: async () => {
      const response = await axiosInstance.get('/dispatch/map-data');
      return response.data;
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const handleZoomToCurrent = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[600px]">
      {/* Map Header */}
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <MapIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">Bản đồ cứu hộ trực tuyến</h2>
            <p className="text-[10px] text-gray-400 font-medium flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1 animate-pulse" />
              Đang cập nhật thời gian thực (5s)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowRequests(!showRequests)}
            className={`p-2 rounded-lg border transition-all ${showRequests ? 'bg-orange-50 border-orange-200 text-[#FF6B35]' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
            title="Bật/Tắt yêu cầu"
          >
            <AlertTriangle className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setShowTeams(!showTeams)}
            className={`p-2 rounded-lg border transition-all ${showTeams ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
            title="Bật/Tắt đội cứu hộ"
          >
            <Truck className="h-4 w-4" />
          </button>
          <button 
            onClick={handleZoomToCurrent}
            className="p-2 rounded-lg border bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
            title="Vị trí của tôi"
          >
            <Navigation className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapContainer 
          center={HCMC_CENTER} 
          zoom={12} 
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={mapCenter} />

          {/* Requests Markers */}
          {showRequests && data?.requests.map((request) => {
            const urgency = URGENCY_LEVELS.find(l => l.value === request.urgencyLevel);
            return (
              <Marker 
                key={request.id} 
                position={[request.lat, request.lng]} 
                icon={createRequestIcon(urgency?.color || 'bg-gray-500')}
              >
                <Popup className="custom-popup">
                  <div className="p-2 space-y-2 min-w-[150px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">{request.id}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white uppercase ${urgency?.color}`}>
                        {urgency?.label.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 leading-tight">Yêu cầu cứu hộ</p>
                    <p className="text-[10px] text-gray-500">Trạng thái: {request.status}</p>
                    <button className="w-full py-1.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg hover:bg-gray-200 transition-colors">
                      Xem chi tiết
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Teams Markers */}
          {showTeams && data?.teams.map((team) => (
            <Marker 
              key={team.id} 
              position={[team.lat, team.lng]} 
              icon={teamIcon}
            >
              <Popup>
                <div className="p-2 space-y-2 min-w-[180px]">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 p-1.5 rounded-lg">
                      <Truck className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{team.teamName}</p>
                      <p className="text-[10px] text-gray-500">{team.memberCount} thành viên</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-50 p-2 rounded-lg">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold text-green-700 uppercase">{team.status}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-gray-100 shadow-lg space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Chú thích</p>
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 rounded-full bg-red-600" />
            <span className="text-[10px] font-medium text-gray-600">Khẩn cấp</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="text-[10px] font-medium text-gray-600">Cao</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 rounded-full bg-blue-600" />
            <span className="text-[10px] font-medium text-gray-600">Đội cứu hộ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
