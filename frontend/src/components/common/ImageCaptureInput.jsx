import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function ImageCaptureInput({
  imagePreview,
  uploading = false,
  imageVerification,
  uploadError,
  onImageSelected,
  onClearImage,
  label = 'Upload Photo / Evidence Image',
  required = false
}) {
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
  const [imageSource, setImageSource] = useState(null); // 'upload' or 'camera'

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Clean up camera stream on unmount or modal close
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = async (facing = facingMode) => {
    setCameraError(null);
    setCapturedDataUrl(null);
    stopCameraStream();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check camera permissions or try uploading a file.');
    }
  };

  const openCamera = () => {
    setShowCameraModal(true);
    startCamera('environment');
  };

  const closeCameraModal = () => {
    stopCameraStream();
    setCapturedDataUrl(null);
    setShowCameraModal(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedDataUrl(dataUrl);

    // Pause video feed display
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = false;
      });
    }
  };

  const retakePhoto = () => {
    setCapturedDataUrl(null);
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = true;
      });
    } else {
      startCamera(facingMode);
    }
  };

  const confirmPhoto = () => {
    if (!capturedDataUrl) return;

    // Convert data URL to Blob/File
    fetch(capturedDataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `captured_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setImageSource('camera');
        onImageSelected(file, capturedDataUrl);
        closeCameraModal();
      })
      .catch(err => {
        console.error('Failed to convert camera snapshot:', err);
        setCameraError('Failed to process snapshot photo.');
      });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageSource('upload');
    const previewUrl = URL.createObjectURL(file);
    onImageSelected(file, previewUrl);
  };

  const handleRemove = () => {
    setImageSource(null);
    if (onClearImage) {
      onClearImage();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.6rem' }}>
          {label} {required && !label.includes('*') && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      {/* Main Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        
        {/* Buttons Group: File Upload & Camera Snapshot */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          
          {/* Option 1: File Upload */}
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.2rem',
              backgroundColor: '#f8fafc',
              border: '1.5px dashed #0F4C81',
              borderRadius: '0.6rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#0F4C81',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <Upload size={18} />
            {uploading && imageSource === 'upload' ? 'Uploading File...' : 'Choose Image File'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>

          {/* Option 2: Direct Camera Click */}
          <button
            type="button"
            onClick={openCamera}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.2rem',
              backgroundColor: '#0F4C81',
              border: 'none',
              borderRadius: '0.6rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#ffffff',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(15,76,129,0.2)'
            }}
          >
            <Camera size={18} />
            {uploading && imageSource === 'camera' ? 'Processing Snapshot...' : 'Take Photo (Camera)'}
          </button>

        </div>

        {/* Selected Image Preview Box */}
        {imagePreview && (
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: '#f1f5f9',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              border: '1px solid #cbd5e1',
              maxWidth: '380px'
            }}
          >
            <img
              src={imagePreview}
              alt="Selected Evidence"
              style={{
                width: '90px',
                height: '70px',
                objectFit: 'cover',
                borderRadius: '0.5rem',
                border: '1px solid #94a3b8'
              }}
            />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: imageSource === 'camera' ? '#059669' : '#0F4C81',
                  backgroundColor: imageSource === 'camera' ? '#d1fae5' : '#e0f2fe',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.4rem',
                  width: 'fit-content'
                }}
              >
                {imageSource === 'camera' ? '📸 Camera Snapshot' : '📁 Uploaded File'}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                {uploading ? 'Verifying image...' : 'Ready for submission'}
              </span>
              
              {uploadError && (
                <div style={{
                  marginTop: '0.4rem',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '0.4rem',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca'
                }}>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 700, 
                    color: '#b91c1c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <AlertCircle size={14} /> Image verification failed
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#7f1d1d', marginTop: '0.2rem', lineHeight: '1.3' }}>
                    AI-generated or manipulated images are not accepted. Please upload an original photograph taken at the complaint location.
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#991b1b', marginTop: '0.2rem', fontStyle: 'italic' }}>
                    Error Detail: {uploadError}
                  </div>
                </div>
              )}

              {imageVerification && !uploadError && (
                <div style={{
                  marginTop: '0.4rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '0.4rem',
                  backgroundColor: '#dcfce7',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 700, 
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <Check size={14} /> Image verified
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.1rem' }}>
                    Authenticity check passed successfully.
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleRemove}
              title="Remove photo"
              style={{
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Hidden canvas for taking snapshot */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Live Camera Modal */}
      {showCameraModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '1.25rem',
              width: '100%',
              maxWidth: '540px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #334155'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #1e293b',
                color: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <Camera size={20} color="#38bdf8" />
                <span>Take Photo Evidence</span>
              </div>
              <button
                type="button"
                onClick={closeCameraModal}
                style={{
                  backgroundColor: '#1e293b',
                  color: '#94a3b8',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Camera Viewport / Preview */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '340px',
                backgroundColor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {cameraError ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
                  <AlertCircle size={40} style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{cameraError}</p>
                </div>
              ) : capturedDataUrl ? (
                /* Snapshot Preview Mode */
                <img
                  src={capturedDataUrl}
                  alt="Captured Snapshot"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                /* Live Camera Video Feed */
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Camera Viewfinder Crosshair Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '15%',
                      left: '15%',
                      right: '15%',
                      bottom: '15%',
                      border: '2px dashed rgba(255, 255, 255, 0.4)',
                      borderRadius: '1rem',
                      pointerEvents: 'none'
                    }}
                  />
                </>
              )}
            </div>

            {/* Modal Controls Bar */}
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: '#0f172a',
                borderTop: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              {capturedDataUrl ? (
                <>
                  <button
                    type="button"
                    onClick={retakePhoto}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.25rem',
                      backgroundColor: '#334155',
                      color: '#f8fafc',
                      border: 'none',
                      borderRadius: '0.6rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={16} /> Retake
                  </button>
                  <button
                    type="button"
                    onClick={confirmPhoto}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '0.6rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                    }}
                  >
                    <Check size={18} /> Use This Photo
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    title="Flip camera"
                    disabled={!!cameraError}
                    style={{
                      backgroundColor: '#1e293b',
                      color: '#cbd5e1',
                      border: '1px solid #334155',
                      borderRadius: '0.6rem',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: cameraError ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <RefreshCw size={16} /> Switch Camera
                  </button>

                  <button
                    type="button"
                    onClick={takeSnapshot}
                    disabled={!!cameraError || !stream}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: cameraError || !stream ? '#475569' : '#ef4444',
                      border: '4px solid #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: cameraError || !stream ? 'not-allowed' : 'pointer',
                      boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)',
                      transition: 'transform 0.1s active'
                    }}
                    title="Capture Photo"
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff'
                      }}
                    />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
