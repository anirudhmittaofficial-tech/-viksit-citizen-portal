import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Camera, CheckCircle2, ArrowRight } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { uploadFileApi } from '../../services/complaintService';
import LocationPicker from '../../components/common/LocationPicker';
import SpeechInput from '../../components/voice/SpeechInput';
import ImageCaptureInput from '../../components/common/ImageCaptureInput';

const CATEGORIES = [
  '🕳 Pothole',
  '💡 Street Light',
  '🚰 Water / Drainage',
  '🗑 Garbage',
  '🚦 Traffic / Signal',
  '🛣 Road Damage',
  '🌳 Public Space',
  'Other'
];

export default function ReportIssue() {
  const { addComplaint } = useComplaints();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    severity: 'Medium',
    description: '',
    imageUrl: '',
    imageVerification: null
  });

  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    coordinates: '',
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
    formattedAddress: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState(null);

  const handleImageSelected = async (file, previewUrl) => {
    if (!file) return;

    setImageFile(file);
    setImagePreview(previewUrl);
    setImageUploadError(null);

    try {
      setUploadingImage(true);
      const data = await uploadFileApi(file);
      if (data && data.url) {
        setFormData(prev => ({ 
          ...prev, 
          imageUrl: data.url,
          imageVerification: data.imageVerification || null 
        }));
      }
    } catch (err) {
      const errorData = err.response?.data;
      setImageUploadError(errorData?.message || 'Image verification is temporarily unavailable. Please try again.');
      setFormData(prev => ({ ...prev, imageUrl: '', imageVerification: null }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUploadError(null);
    setFormData(prev => ({ ...prev, imageUrl: '', imageVerification: null }));
  };

  const handleLocationSelect = (loc) => {
    setLocationData(loc);
  };

  const handleAutoProcessedSpeech = (processed) => {
    if (processed.category) {
      setFormData(prev => ({ ...prev, category: processed.category }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.title.trim()) {
      alert('Please provide a title for the complaint.');
      return;
    }

    if (!formData.category) {
      alert('Please select a valid complaint category.');
      return;
    }

    if (!formData.description || !formData.description.trim()) {
      alert('Please provide a description of the issue.');
      return;
    }

    if (imageUploadError) {
      alert('Cannot submit complaint. The uploaded image was rejected by our verification system.');
      return;
    }

    if (
      locationData.latitude === null ||
      locationData.longitude === null ||
      isNaN(Number(locationData.latitude)) ||
      isNaN(Number(locationData.longitude))
    ) {
      alert('Please detect your current location or select a location on the map.');
      return;
    }

    if (!locationData.formattedAddress || !locationData.formattedAddress.trim()) {
      alert('Address information is incomplete. Please select a valid location on the map.');
      return;
    }

    setSubmitting(true);
    try {
      const finalImageUrl = formData.imageUrl || imagePreview || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80';
      const latNum = Number(locationData.latitude);
      const lngNum = Number(locationData.longitude);
      const coordsStr = locationData.coordinates || `${latNum.toFixed(5)}° N, ${lngNum.toFixed(5)}° E`;

      const submissionPayload = {
        title: formData.title.trim(),
        category: formData.category,
        severity: formData.severity || 'Medium',
        description: formData.description.trim(),
        location: locationData.formattedAddress,
        formattedAddress: locationData.formattedAddress,
        coordinates: coordsStr,
        latitude: latNum,
        longitude: lngNum,
        houseNumber: locationData.houseNumber || '',
        residency: locationData.residency || '',
        street: locationData.street || '',
        area: locationData.area || '',
        locality: locationData.locality || '',
        city: locationData.city || '',
        district: locationData.district || '',
        state: locationData.state || '',
        pincode: locationData.pincode || '',
        country: locationData.country || '',
        landmark: locationData.landmark || '',
        imageUrl: finalImageUrl,
        imageVerification: formData.imageVerification
      };

      const created = await addComplaint(submissionPayload, user);
      setSubmittedIssue(created);
    } catch (err) {
      alert('Failed to register complaint: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedIssue) {
    const displayAddress = submittedIssue.formattedAddress || (typeof submittedIssue.location === 'object' && submittedIssue.location !== null
      ? submittedIssue.location.address
      : (submittedIssue.location || submittedIssue.address));

    return (
      <div style={{ maxWidth: '700px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem', borderTop: '6px solid #2E8B57' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}
          >
            <CheckCircle2 size={40} />
          </div>

          <span className="portal-badge-citizen" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
            Submission Successful
          </span>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0.75rem 0 0.25rem' }}>
            Complaint Registered!
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Your ticket ID is <strong style={{ color: '#0F4C81', fontSize: '1.1rem' }}>#{submittedIssue.complaintId || submittedIssue.id}</strong>
          </p>

          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', margin: '1.75rem 0', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', fontSize: '0.9rem', color: '#334155' }}>
              <div><strong>Category:</strong> {submittedIssue.category}</div>
              <div><strong>Department:</strong> {submittedIssue.department}</div>
              <div><strong>Full Address:</strong> {displayAddress}</div>
              {submittedIssue.houseNumber && <div><strong>House / Flat:</strong> {submittedIssue.houseNumber}</div>}
              {submittedIssue.residency && <div><strong>Residency:</strong> {submittedIssue.residency}</div>}
              {submittedIssue.coordinates && <div><strong>GPS Coordinates:</strong> {submittedIssue.coordinates}</div>}
              <div><strong>Status:</strong> {submittedIssue.status || 'Submitted'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/citizen/my-complaints')} className="btn btn-primary-citizen">
              View My Complaints <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                setSubmittedIssue(null);
                setFormData({
                  title: '',
                  category: '',
                  severity: 'Medium',
                  description: '',
                  imageUrl: ''
                });
                setImagePreview(null);
                setImageUploadError(null);
              }}
              className="btn btn-outline"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#e0f2fe', color: '#0F4C81', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <Sparkles size={14} color="#0F4C81" /> 🎙️ Smart Voice-to-Text & High-Precision GPS Engine
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
          Report a Civic Issue
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Describe the complaint and auto-detect your exact location using Google Maps Geocoding & High-Accuracy GPS.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Title Input with Voice Symbol */}
        <SpeechInput
          label="Issue Title"
          required
          placeholder="e.g. Deep Pothole on M.G. Road (or click 🎙️ to speak)"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          onAutoProcessed={handleAutoProcessedSpeech}
        />

        {/* Category Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            Category <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            style={{ width: '100%', padding: '0.8rem 1rem', border: '1.5px solid #cbd5e1', borderRadius: '0.6rem', fontSize: '0.95rem', outline: 'none', backgroundColor: '#ffffff' }}
          >
            <option value="" disabled>Select Complaint Category</option>
            {CATEGORIES.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Description Textarea with Voice Symbol */}
        <SpeechInput
          label="Detailed Complaint Description"
          required
          rows={5}
          placeholder="Describe the issue in detail or click 🎙️ Voice to Text to speak in Hindi or English..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          onAutoProcessed={handleAutoProcessedSpeech}
        />

        {/* Image / Photo Attachment */}
        <ImageCaptureInput
          label="Upload Evidence (Image, PDF, Word) or Take Photo"
          imagePreview={imagePreview}
          uploading={uploadingImage}
          imageVerification={formData.imageVerification}
          uploadError={imageUploadError}
          onImageSelected={handleImageSelected}
          onClearImage={handleClearImage}
        />

        {/* Location & GPS Map Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Exact GPS Location & Detailed Address Confirmation <span style={{ color: '#ef4444' }}>*</span>
          </label>

          <LocationPicker
            defaultLat={locationData.latitude}
            defaultLng={locationData.longitude}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || uploadingImage || !!imageUploadError}
          className="btn btn-primary-citizen"
          style={{ 
            width: '100%', 
            padding: '1rem', 
            fontSize: '1.05rem', 
            fontWeight: 800, 
            marginTop: '0.5rem',
            backgroundColor: (submitting || uploadingImage || !!imageUploadError) ? '#cbd5e1' : undefined,
            cursor: (submitting || uploadingImage || !!imageUploadError) ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? 'Registering Ticket...' : uploadingImage ? 'Verifying image...' : imageUploadError ? '❌ Verification Failed (Fix Image)' : '🟢 Submit Complaint Ticket'}
        </button>

      </form>
    </div>
  );
}


