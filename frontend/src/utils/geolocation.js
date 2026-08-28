// Utility for high-accuracy GPS Geolocation & Reverse Geocoding via Google Maps Geocoding API + Fallback

export const getCurrentGPSLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const err = new Error('❌ Unable to fetch GPS location. Check your device location services.');
      err.isGpsUnavailable = true;
      return reject(err);
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0
    };

    let resolved = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (resolved) return;
        resolved = true;
        const { latitude, longitude, accuracy } = position.coords;
        resolve({
          latitude,
          longitude,
          accuracy: accuracy ? Math.round(accuracy) : 10,
          coordinates: `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E`,
          timestamp: new Date()
        });
      },
      (error) => {
        if (resolved) return;
        resolved = true;
        let err;
        if (error.code === error.PERMISSION_DENIED || error.code === 1) {
          err = new Error('Location permission was denied. Please allow location access in your browser settings.');
          err.isPermissionDenied = true;
        } else if (error.code === error.TIMEOUT || error.code === 3) {
          err = new Error('GPS detection timed out. Please try again.');
          err.isTimeout = true;
        } else {
          err = new Error('Your current location could not be determined. Please try again or select the location manually.');
          err.isGpsUnavailable = true;
        }
        reject(err);
      },
      options
    );
  });
};

export const reverseGeocode = async (latitude, longitude) => {
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // 1. Try Google Maps Geocoding API if key is present
  if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY') {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const firstResult = data.results[0];
          const components = firstResult.address_components || [];

          const getComponent = (types) => {
            const comp = components.find(c => types.some(t => c.types.includes(t)));
            return comp ? comp.long_name : '';
          };

          const streetNumber = getComponent(['street_number']);
          const subpremise = getComponent(['subpremise']);
          const premise = getComponent(['premise', 'building']);
          const route = getComponent(['route']);
          const neighborhood = getComponent(['neighborhood']);
          const sublocality = getComponent(['sublocality_level_1', 'sublocality_level_2', 'sublocality']);
          const locality = getComponent(['locality']);
          const admin2 = getComponent(['administrative_area_level_2']);
          const admin1 = getComponent(['administrative_area_level_1']);
          const postalCode = getComponent(['postal_code']);
          const country = getComponent(['country']);
          const landmark = getComponent(['landmark', 'point_of_interest', 'establishment']);

          const houseNumber = subpremise || streetNumber || premise || '';
          const residency = premise || subpremise || landmark || '';
          const street = route || streetNumber || '';
          const area = sublocality || neighborhood || '';
          const cityLocality = locality || admin2 || '';
          const district = admin2 || locality || '';
          const state = admin1 || '';
          const pincode = postalCode || '';

          const parts = [
            houseNumber && `Flat/House ${houseNumber}`,
            residency,
            street,
            area,
            cityLocality,
            district !== cityLocality ? district : '',
            state,
            pincode,
            country
          ].filter(Boolean);

          const constructedFormatted = parts.length > 0 ? parts.join(', ') : firstResult.formatted_address;
          const formattedAddress = firstResult.formatted_address || constructedFormatted;

          return {
            houseNumber,
            residency,
            street,
            area,
            locality: cityLocality,
            city: cityLocality,
            district,
            state,
            pincode,
            country,
            landmark,
            formattedAddress,
            address: formattedAddress,
            formatted_address: formattedAddress,
            fullData: firstResult
          };
        } else if (data.status === 'REQUEST_DENIED' || data.status === 'OVER_QUERY_LIMIT' || data.status === 'INVALID_REQUEST') {
          console.warn('Google Maps Geocoding API warning:', data.error_message || data.status);
        }
      }
    } catch (err) {
      console.warn('Google Maps Reverse Geocoding network attempt failed, using fallback:', err.message);
    }
  }

  // 2. Fallback: OpenStreetMap Nominatim API
  try {
    const fallbackUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    const res = await fetch(fallbackUrl, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const houseNumber = addr.house_number || addr.building || '';
      const residency = addr.building || addr.amenity || addr.leisure || '';
      const street = addr.road || addr.street || addr.pedestrian || '';
      const area = addr.suburb || addr.neighbourhood || addr.residential || '';
      const locality = addr.suburb || addr.village || addr.town || addr.city || '';
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const district = addr.state_district || addr.county || '';
      const state = addr.state || '';
      const country = addr.country || '';
      const pincode = addr.postcode || '';
      const landmark = addr.amenity || addr.shop || '';

      const parts = [houseNumber, residency, street, area, city, district, state, pincode, country].filter(Boolean);
      const formattedAddress = data.display_name || parts.join(', ') || `Location (${latitude.toFixed(5)}°, ${longitude.toFixed(5)}°)`;

      return {
        houseNumber,
        residency,
        street,
        area,
        locality,
        city,
        district,
        state,
        pincode,
        country,
        landmark,
        formattedAddress,
        address: formattedAddress,
        formatted_address: formattedAddress,
        fullData: data
      };
    }
  } catch (fallbackErr) {
    console.warn('Nominatim fallback geocoding error:', fallbackErr.message);
  }

  // 3. Ultimate Fallback: Formatted Coordinate String
  const fallbackCoordsAddress = `Street Location (${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E)`;
  return {
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
    formattedAddress: fallbackCoordsAddress,
    address: fallbackCoordsAddress,
    formatted_address: fallbackCoordsAddress,
    fullData: null
  };
};



