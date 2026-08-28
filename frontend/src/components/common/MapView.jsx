import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, AlertCircle, Clock, CheckCircle2, Navigation } from 'lucide-react';
import StatusBadge from './StatusBadge';

// Fix Leaflet icon default path issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

// Custom colored pin factory
const createCustomPin = (status) => {
  let color = '#0F4C81'; // Government Blue
  if (status === 'Submitted') color = '#0284c7';
  if (status === 'Verified') color = '#d97706';
  if (status === 'Assigned') color = '#9333ea';
  if (status === 'In Progress') color = '#2563eb';
  if (status === 'Resolved') color = '#16a34a';
  if (status === 'Closed') color = '#475569';

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" stroke="#ffffff" stroke-width="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: svgIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center);
  return null;
}

export default function MapView({ complaints = [], height = '450px', onSelectComplaint }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filteredComplaints = complaints.filter(c => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
    return true;
  });

  const validComplaintWithLocation = filteredComplaints.find(c => c.latitude != null && c.longitude != null && !isNaN(Number(c.latitude)) && !isNaN(Number(c.longitude)));
  const defaultCenter = validComplaintWithLocation ? [Number(validComplaintWithLocation.latitude), Number(validComplaintWithLocation.longitude)] : [20.5937, 78.9629];

  return (
    <div className="card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
      {/* Map Header & Quick Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Navigation size={20} color="#0F4C81" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Live City Civic Issue Map
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
            {filteredComplaints.length} Pins
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
          >
            <option value="All">All Categories</option>
            <option value="Road Damage">Road Damage</option>
            <option value="Street Light">Street Light</option>
            <option value="Garbage">Garbage</option>
            <option value="Drainage Leakage">Drainage Leakage</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Traffic Signal">Traffic Signal</option>
            <option value="Illegal Dumping">Illegal Dumping</option>
            <option value="Public Park">Public Park</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Verified">Verified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div style={{ height, width: '100%', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredComplaints.map((c, idx) => {
            const lat = Number(c.latitude);
            const lng = Number(c.longitude);
            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker
                key={c.id || c.complaintId || idx}
                position={[lat, lng]}
                icon={createCustomPin(c.status)}
              >
                <Popup>
                  <div style={{ minWidth: '220px', padding: '0.2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F4C81' }}>
                      #{c.complaintId || c.id}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', margin: '0.2rem 0' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      📍 {c.location}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <StatusBadge status={c.status} />
                      {onSelectComplaint && (
                        <button
                          onClick={() => onSelectComplaint(c)}
                          style={{
                            backgroundColor: '#0F4C81',
                            color: '#ffffff',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '0.3rem',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          View Ticket
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
