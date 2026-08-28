import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, AlertTriangle, RefreshCw, CheckCircle2, Home, Building, MapPin, Compass, Search } from 'lucide-react';
import { getCurrentGPSLocation, reverseGeocode } from '../../utils/geolocation';

const pinIcon = L.divIcon({
  className: 'custom-location-picker-pin',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0F4C81" width="42" height="42" stroke="#ffffff" stroke-width="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5-2.5z"/>
      </svg>
      <div style="position: absolute; bottom: -4px; width: 12px; height: 12px; background: rgba(15,76,129,0.3); border-radius: 50%; filter: blur(2px);"></div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42]
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] != null && center[1] != null && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

function LocationMarker({ position, handleLocationChange }) {
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          handleLocationChange(latLng.lat, latLng.lng);
        }
      }
    }),
    [handleLocationChange]
  );

  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      await handleLocationChange(lat, lng);
    }
  });

  return position && position[0] != null && position[1] != null ? (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={pinIcon}
    />
  ) : null;
}

export default function LocationPicker({ defaultLat, defaultLng, onLocationSelect }) {
  const initialLat = defaultLat && !isNaN(Number(defaultLat)) ? Number(defaultLat) : null;
  const initialLng = defaultLng && !isNaN(Number(defaultLng)) ? Number(defaultLng) : null;

  const [position, setPosition] = useState(initialLat && initialLng ? [initialLat, initialLng] : null);
  const [mapCenter, setMapCenter] = useState(initialLat && initialLng ? [initialLat, initialLng] : [20.5937, 78.9629]);
  const [zoomLevel, setZoomLevel] = useState(initialLat && initialLng ? 18 : 5);
  const [statusText, setStatusText] = useState('Idle');
  const [statusState, setStatusState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [locating, setLocating] = useState(false);
  const hasAutoFetched = useRef(false);
  const debounceTimer = useRef(null);

  const [locationData, setLocationData] = useState({
    latitude: initialLat,
    longitude: initialLng,
    accuracy: null,
    coordinates: initialLat && initialLng ? `${initialLat.toFixed(5)}° N, ${initialLng.toFixed(5)}° E` : '',
    houseNumber: '',
    residency: '',
    street: '',
    area: '',
    locality: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    country: '',
    landmark: '',
    formattedAddress: '',
    lastUpdated: null
  });

  // Construct auto-formatted string from parts & custom fields
  const constructFormattedAddress = (data) => {
    const mainParts = [
      data.houseNumber ? `House/Flat No. ${data.houseNumber}` : '',
      data.residency,
      data.landmark ? `Near ${data.landmark}` : '',
      data.street,
      data.area || data.locality,
      data.city,
      data.district && data.district !== data.city ? data.district : '',
      data.state,
      data.pincode || (data.latitude ? 'Pincode: Not available' : ''),
      data.country
    ].filter(Boolean);

    return mainParts.length > 0 ? mainParts.join(', ') : data.formattedAddress;
  };

  const notifyParent = useCallback((updatedData) => {
    if (onLocationSelect) {
      onLocationSelect(updatedData);
    }
  }, [onLocationSelect]);

  const updateLocationByCoords = useCallback(async (lat, lng, accuracy = null) => {
    setStatusState('detecting');
    setStatusText('🏠 Resolving Address...');
    setErrorMessage('');

    try {
      const geoResult = await reverseGeocode(lat, lng);

      const latNum = Number(lat);
      const lngNum = Number(lng);
      const coordsStr = `${latNum.toFixed(5)}° N, ${lngNum.toFixed(5)}° E`;

      const nextData = {
        latitude: latNum,
        longitude: lngNum,
        accuracy: accuracy !== null ? accuracy : (locationData.accuracy || 15),
        coordinates: coordsStr,
        houseNumber: geoResult.houseNumber || '',
        residency: geoResult.residency || '',
        street: geoResult.street || '',
        area: geoResult.area || '',
        locality: geoResult.locality || '',
        city: geoResult.city || '',
        district: geoResult.district || '',
        state: geoResult.state || '',
        pincode: geoResult.pincode || '',
        country: geoResult.country || 'India',
        landmark: geoResult.landmark || '',
        formattedAddress: geoResult.formattedAddress || geoResult.address || coordsStr,
        lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setPosition([latNum, lngNum]);
      setMapCenter([latNum, lngNum]);
      setZoomLevel(18);
      setLocationData(nextData);
      setStatusState('success');
      setStatusText('✅ Exact Location Found');
      notifyParent(nextData);
    } catch (err) {
      console.error('Geocoding error:', err);
      const latNum = Number(lat);
      const lngNum = Number(lng);
      const coordsStr = `${latNum.toFixed(5)}° N, ${lngNum.toFixed(5)}° E`;

      const fallbackData = {
        ...locationData,
        latitude: latNum,
        longitude: lngNum,
        coordinates: coordsStr,
        formattedAddress: `Location Pin (${coordsStr})`,
        lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setPosition([latNum, lngNum]);
      setMapCenter([latNum, lngNum]);
      setZoomLevel(18);
      setLocationData(fallbackData);
      setStatusState('geocode_failed');
      setStatusText('❌ Address Resolution Warning');
      setErrorMessage('❌ Unable to resolve address from Google Maps. Please fill details manually below.');
      notifyParent(fallbackData);
    }
  }, [locationData, notifyParent]);

  const handleMarkerDragOrClick = (lat, lng) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateLocationByCoords(lat, lng);
    }, 300);
  };

  const handleAutoDetectGPS = async () => {
    setLocating(true);
    setStatusState('detecting');
    setStatusText('📡 Detecting GPS...');
    setErrorMessage('');

    try {
      setStatusText('🛰 Fetching Coordinates...');
      const gps = await getCurrentGPSLocation();
      const lat = gps.latitude;
      const lng = gps.longitude;
      const accuracy = gps.accuracy;

      setStatusText('📍 GPS Locked');
      await updateLocationByCoords(lat, lng, accuracy);
    } catch (err) {
      console.warn('GPS detection failed:', err.message);
      if (err.isPermissionDenied) {
        setStatusState('permission_denied');
        setStatusText('Permission Denied');
        setErrorMessage('❌ Location permission denied. Please allow location access in your browser settings.');
      } else if (err.isTimeout) {
        setStatusState('timeout');
        setStatusText('Request Timed Out');
        setErrorMessage('❌ GPS request timed out. Please try again.');
      } else {
        setStatusState('gps_unavailable');
        setStatusText('GPS Unavailable');
        setErrorMessage('❌ Unable to fetch GPS location. Check your device location services.');
      }
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    if (!hasAutoFetched.current) {
      hasAutoFetched.current = true;
      handleAutoDetectGPS();
    }
  }, []);

  // Update specific address field manually by user
  const handleFieldChange = (field, value) => {
    const updated = { ...locationData, [field]: value };
    const newFormatted = constructFormattedAddress(updated);
    updated.formattedAddress = newFormatted;
    setLocationData(updated);
    notifyParent(updated);
  };

  return (
    <div style={{ marginTop: '0.5rem', fontFamily: 'inherit' }}>
      
      {/* Top Main Auto Detect Button & Live Status Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleAutoDetectGPS}
            disabled={locating}
            className="btn btn-primary-citizen"
            style={{
              padding: '0.75rem 1.4rem',
              fontSize: '0.95rem',
              fontWeight: 800,
              backgroundColor: '#0F4C81',
              color: '#ffffff',
              borderRadius: '0.6rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: locating ? 'not-allowed' : 'pointer',
              border: 'none',
              boxShadow: '0 4px 12px rgba(15, 76, 129, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {locating ? <RefreshCw size={18} className="animate-spin" /> : <Navigation size={18} />}
            📍 Auto Detect My Exact GPS Location
          </button>

          {/* Live Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {statusState === 'detecting' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '9999px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.85rem', fontWeight: 700 }}>
                <RefreshCw size={14} className="animate-spin" /> {statusText}
              </span>
            )}

            {statusState === 'success' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '9999px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.85rem', fontWeight: 800 }}>
                <CheckCircle2 size={16} /> {statusText}
              </span>
            )}

            {(statusState === 'permission_denied' || statusState === 'gps_unavailable' || statusState === 'timeout' || statusState === 'geocode_failed') && (
              <button
                type="button"
                onClick={handleAutoDetectGPS}
                disabled={locating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '0.4rem',
                  border: '1.5px solid #dc2626',
                  color: '#dc2626',
                  backgroundColor: '#fef2f2',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={13} /> Retry Location
              </button>
            )}
          </div>
        </div>

        {/* Error Banners */}
        {errorMessage && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.6rem',
              padding: '0.85rem 1.1rem',
              fontSize: '0.875rem',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={handleAutoDetectGPS}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Leaflet Interactive Map Canvas */}
      <div style={{ height: '320px', width: '100%', borderRadius: '0.75rem', overflow: 'hidden', border: '2px solid #cbd5e1', position: 'relative', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
        <MapContainer center={mapCenter} zoom={zoomLevel} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapController center={mapCenter} zoom={zoomLevel} />
          <LocationMarker
            position={position}
            handleLocationChange={handleMarkerDragOrClick}
          />
        </MapContainer>

        <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 400, backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '0.35rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', border: '1px solid #cbd5e1' }}>
          💡 Drag pin or click map to move location
        </div>
      </div>

      {/* Modern Address Confirmation Card & Edit Form */}
      <div
        style={{
          marginTop: '1.25rem',
          backgroundColor: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '0.85rem',
          padding: '1.5rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MapPin size={22} color="#0F4C81" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              📍 Auto-Detected Address & Confirmation
            </h3>
          </div>
          {locationData.accuracy && (
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1', backgroundColor: '#f0f9ff', padding: '0.25rem 0.65rem', borderRadius: '9999px', border: '1px solid #bae6fd' }}>
              🎯 GPS Accuracy: ±{locationData.accuracy}m
            </span>
          )}
        </div>

        {/* Display Summary Address Pill */}
        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.6rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
            Formatted Google Address Preview
          </span>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.5 }}>
            {locationData.formattedAddress || (locating ? 'Detecting your current location...' : 'Location not detected')}
          </p>
        </div>

        {/* Required Address Completion Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          
          {/* House / Flat Number */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              🏠 House / Flat No. <span style={{ color: '#64748b', fontWeight: 400 }}>(Required/Editable)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Flat 302, Block B"
              value={locationData.houseNumber}
              onChange={(e) => handleFieldChange('houseNumber', e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* Residency / Apartment Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              🏢 Residency / Apartment Name <span style={{ color: '#64748b', fontWeight: 400 }}>(Editable)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sai Residency / Orchid Heights"
              value={locationData.residency}
              onChange={(e) => handleFieldChange('residency', e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* Landmark */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              📌 Landmark <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Opposite Water Tank / Near Axis Bank"
              value={locationData.landmark}
              onChange={(e) => handleFieldChange('landmark', e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* Street Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              🛣 Street Name
            </label>
            <input
              type="text"
              placeholder="e.g. Street No. 5 / M.G. Road"
              value={locationData.street}
              onChange={(e) => handleFieldChange('street', e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* Area / Locality */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              📍 Area / Locality
            </label>
            <input
              type="text"
              placeholder="e.g. Madhapur / Sector 14"
              value={locationData.area || locationData.locality}
              onChange={(e) => handleFieldChange('area', e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* City */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              🌆 City
            </label>
            <input
              type="text"
              placeholder="e.g. Hyderabad / Pune"
              value={locationData.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* District */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              🏛 District
            </label>
            <input
              type="text"
              placeholder="e.g. Rangareddy"
              value={locationData.district}
              onChange={(e) => handleFieldChange('district', e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* State */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              🗺 State
            </label>
            <input
              type="text"
              placeholder="e.g. Telangana / Maharashtra"
              value={locationData.state}
              onChange={(e) => handleFieldChange('state', e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* Pincode */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              📮 Pincode
            </label>
            <input
              type="text"
              placeholder="e.g. 500081"
              value={locationData.pincode}
              onChange={(e) => handleFieldChange('pincode', e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* Country */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              🌍 Country
            </label>
            <input
              type="text"
              placeholder="e.g. India"
              value={locationData.country}
              onChange={(e) => handleFieldChange('country', e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

        </div>

        {/* Live GPS Metadata Footer Pill */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
          <div>
            <strong>GPS Coordinates:</strong> {locationData.latitude ? `${locationData.latitude.toFixed(5)}° N, ${locationData.longitude.toFixed(5)}° E` : 'Not pinned'}
          </div>
          {locationData.lastUpdated && (
            <div>
              <strong>Last Synced:</strong> {locationData.lastUpdated}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


