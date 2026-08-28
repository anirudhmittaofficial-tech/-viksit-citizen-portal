import React, { useState } from 'react';
import { MapPin, Copy, Check, ExternalLink, ShieldCheck, Compass } from 'lucide-react';

export default function LocationEmbedCard({
  embedUrl,
  title = "Location Map Embed",
  latitude,
  longitude,
  address,
  accuracy,
  height = "450px",
  showDetails = true,
  onRefreshLocation
}) {
  const [copied, setCopied] = useState(false);

  const googleMapsWebUrl = latitude && longitude
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps`;

  const handleCopyCoords = () => {
    if (latitude && longitude) {
      const textToCopy = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Card Header */}
      <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/90 flex items-center justify-center text-white shadow-md">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-slate-100 leading-tight">{title}</h3>
            {accuracy && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> High Accuracy (±{accuracy}m)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshLocation && (
            <button
              onClick={onRefreshLocation}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Compass className="w-3.5 h-3.5" /> Locate Me
            </button>
          )}

          <a
            href={googleMapsWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded Map Iframe */}
      <div className="relative w-full bg-slate-100" style={{ height }}>
        {embedUrl ? (
          <iframe
            title={title}
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
            <MapPin className="w-12 h-12 text-slate-400 mb-2 animate-bounce" />
            <p className="font-medium text-slate-700">No Location Selected</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Click "Locate Me" or search an address to generate an accurate Google Maps Embed.
            </p>
          </div>
        )}
      </div>

      {/* Location Details Footer */}
      {showDetails && (latitude || address) && (
        <div className="p-4 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="flex-1 min-w-0">
            {address && (
              <p className="text-slate-800 font-medium truncate" title={address}>
                📍 {address}
              </p>
            )}
            {latitude && longitude && (
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Lat: {latitude.toFixed(6)}° | Lng: {longitude.toFixed(6)}°
              </p>
            )}
          </div>

          {latitude && longitude && (
            <button
              onClick={handleCopyCoords}
              className="self-start sm:self-center px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              {copied ? 'Copied!' : 'Copy Coords'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
