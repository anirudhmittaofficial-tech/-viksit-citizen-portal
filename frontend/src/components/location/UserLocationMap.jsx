import React, { useState, useEffect, useCallback } from 'react';
import { Navigation, MapPin, Search, RefreshCw, CheckCircle2, AlertCircle, Building, Home, Compass, ExternalLink } from 'lucide-react';
import { getCurrentGPSLocation, reverseGeocode } from '../../utils/geolocation';
import LocationEmbedCard from './LocationEmbedCard';

// Preset iframe embed provided by user for Singapore Township, Pocharam
export const SINGAPORE_TOWNSHIP_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12914.95245721427!2d78.65133407653875!3d17.435085114365013!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9dfc4379f481%3A0x6643cf45d3e781fe!2sSINGAPORE%20TOWNSHIP%2C%20Block%20D2%2C%20SINGAPORE%20TOWNSHIP%2C%20Pocharam%2C%20Secunderabad%2C%20Telangana%20500088!5e0!3m2!1sen!2sin!4v1786256671546!5m2!1sen!2sin";

export default function UserLocationMap({
  onLocationSelect,
  initialEmbedUrl = null,
  autoFetchGPS = true
}) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Idle');
  const [statusType, setStatusType] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEmbedUrl, setActiveEmbedUrl] = useState(initialEmbedUrl || null);
  const [activePreset, setActivePreset] = useState(initialEmbedUrl ? 'custom' : 'gps');

  const [locationDetails, setLocationDetails] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    formattedAddress: '',
    houseNumber: '',
    street: '',
    area: '',
    locality: '',
    city: '',
    state: '',
    pincode: '',
    country: ''
  });

  // Construct dynamic Google Maps Embed URL from Lat / Lng or Search query
  const getEmbedUrlFromCoords = (lat, lng) => {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
  };

  const getEmbedUrlFromQuery = (query) => {
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
  };

  // High-accuracy live GPS location fetcher
  const handleFetchExactGPSLocation = useCallback(async () => {
    setLoading(true);
    setStatusType('loading');
    setStatusMessage('Fetching accurate GPS coordinates...');

    try {
      const gpsData = await getCurrentGPSLocation();
      const { latitude, longitude, accuracy } = gpsData;

      setStatusMessage(`GPS locked (±${accuracy || 10}m). Resolving address...`);

      const geoData = await reverseGeocode(latitude, longitude);

      const updatedLoc = {
        latitude,
        longitude,
        accuracy: accuracy || 10,
        formattedAddress: geoData.formattedAddress || geoData.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        houseNumber: geoData.houseNumber || '',
        street: geoData.street || '',
        area: geoData.area || '',
        locality: geoData.locality || '',
        city: geoData.city || '',
        state: geoData.state || '',
        pincode: geoData.pincode || '',
        country: geoData.country || ''
      };

      setLocationDetails(updatedLoc);
      const dynamicEmbed = getEmbedUrlFromCoords(latitude, longitude);
      setActiveEmbedUrl(dynamicEmbed);
      setActivePreset('gps');
      setStatusType('success');
      setStatusMessage(`Exact location fetched (±${accuracy || 10}m accuracy)`);

      if (onLocationSelect) {
        onLocationSelect(updatedLoc);
      }
    } catch (err) {
      console.warn('GPS Geolocation Error:', err.message);
      setStatusType('error');
      setStatusMessage(err.message || 'Unable to fetch exact GPS location.');

      // Fallback: If GPS fails, set default Singapore Township preset if no location loaded
      if (!locationDetails.latitude) {
        setActiveEmbedUrl(SINGAPORE_TOWNSHIP_EMBED_URL);
        setActivePreset('singapore_township');
      }
    } finally {
      setLoading(false);
    }
  }, [onLocationSelect, locationDetails.latitude]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setStatusType('loading');
    setStatusMessage(`Searching for "${searchQuery}"...`);

    const queryEmbed = getEmbedUrlFromQuery(searchQuery);
    setActiveEmbedUrl(queryEmbed);
    setActivePreset('search');

    const searchAddress = searchQuery.trim();
    const searchLoc = {
      ...locationDetails,
      formattedAddress: searchAddress,
      area: searchAddress
    };

    setLocationDetails(searchLoc);
    setStatusType('success');
    setStatusMessage(`Showing results for "${searchAddress}"`);
    setLoading(false);

    if (onLocationSelect) {
      onLocationSelect(searchLoc);
    }
  };

  // Load Preset Embed (e.g. Singapore Township)
  const handleLoadSingaporeTownshipPreset = () => {
    setActiveEmbedUrl(SINGAPORE_TOWNSHIP_EMBED_URL);
    setActivePreset('singapore_township');
    const presetLoc = {
      latitude: 17.4350851,
      longitude: 78.651334,
      accuracy: 15,
      formattedAddress: "Singapore Township, Block D2, Pocharam, Secunderabad, Telangana 500088",
      houseNumber: "Block D2",
      street: "Singapore Township Road",
      area: "Pocharam",
      locality: "Secunderabad",
      city: "Secunderabad",
      state: "Telangana",
      pincode: "500088",
      country: "India"
    };
    setLocationDetails(presetLoc);
    setStatusType('success');
    setStatusMessage('Loaded Singapore Township, Pocharam preset embed');

    if (onLocationSelect) {
      onLocationSelect(presetLoc);
    }
  };

  useEffect(() => {
    if (autoFetchGPS && !initialEmbedUrl) {
      handleFetchExactGPSLocation();
    }
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Address Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-auto flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address or area for exact location map..."
            className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        {/* Preset & GPS Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={handleFetchExactGPSLocation}
            disabled={loading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs ${
              activePreset === 'gps'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            Fetch My Live GPS
          </button>

          <button
            type="button"
            onClick={handleLoadSingaporeTownshipPreset}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all border ${
              activePreset === 'singapore_township'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" /> Singapore Township Embed
          </button>
        </div>
      </div>

      {/* GPS Status Indicator */}
      {statusMessage && statusMessage !== 'Idle' && (
        <div
          className={`px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 ${
            statusType === 'loading'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : statusType === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusType === 'error'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusType === 'loading' && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
            {statusType === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {statusType === 'error' && <AlertCircle className="w-4 h-4 text-amber-600" />}
            <span>{statusMessage}</span>
          </div>

          {locationDetails.accuracy && (
            <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 font-mono">
              Accuracy: ±{locationDetails.accuracy}m
            </span>
          )}
        </div>
      )}

      {/* Google Maps Embed Card */}
      <LocationEmbedCard
        embedUrl={activeEmbedUrl}
        title={
          activePreset === 'gps'
            ? 'User Exact GPS Location Map'
            : activePreset === 'singapore_township'
            ? 'Singapore Township, Pocharam Map'
            : 'Custom Location Map'
        }
        latitude={locationDetails.latitude}
        longitude={locationDetails.longitude}
        address={locationDetails.formattedAddress}
        accuracy={locationDetails.accuracy}
        onRefreshLocation={handleFetchExactGPSLocation}
        height="420px"
      />

      {/* Formatted Address Details Box */}
      {locationDetails.formattedAddress && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">Address Breakdown</span>
            <span className="text-slate-400">Google Maps Geocoded</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-slate-700">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Area / Street</span>
              <span className="font-medium truncate block">{locationDetails.area || locationDetails.street || 'N/A'}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">City / Locality</span>
              <span className="font-medium truncate block">{locationDetails.city || locationDetails.locality || 'N/A'}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">State</span>
              <span className="font-medium truncate block">{locationDetails.state || 'N/A'}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Pincode</span>
              <span className="font-medium font-mono block">{locationDetails.pincode || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
