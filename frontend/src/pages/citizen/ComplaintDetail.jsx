import React, { useState } from 'react';
import { MapPin, Clock, User, Building2, Send, CheckCircle2, ShieldCheck, FileText, ArrowLeft, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintTimeline from '../../components/common/ComplaintTimeline';
import MapView from '../../components/common/MapView';

export default function ComplaintDetail({ complaint, onClose, onAddComment }) {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!complaint) return null;

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    if (onAddComment) {
      await onAddComment(complaint.complaintId || complaint.id, commentText.trim());
    }
    setCommentText('');
    setSubmitting(false);
  };



  const formattedDateStr = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      return new Date(dateVal).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (e) {
      return String(dateVal);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '0',
          borderRadius: '1rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Header Bar */}
        <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Government Complaint Ticket Details
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0' }}>
              #{complaint.complaintId || complaint.id} - {complaint.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              padding: '0.45rem 0.9rem',
              borderRadius: '0.4rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Modal Body Grid */}
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* SECTION 1 — ISSUE */}
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F4C81', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              SECTION 1 — ISSUE DETAILS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 700, display: 'block' }}>COMPLAINT ID</span>
                <strong style={{ fontSize: '1rem', color: '#0F4C81' }}>#{complaint.complaintId || complaint.id}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 700, display: 'block' }}>CATEGORY</span>
                <strong style={{ fontSize: '0.95rem', color: '#334155' }}>{complaint.category}</strong>
              </div>

            </div>
            <div>
              <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>DESCRIPTION</span>
              <p style={{ color: '#334155', fontSize: '0.925rem', lineHeight: 1.6, margin: 0, backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
                {complaint.description}
              </p>
            </div>
          </div>

          {/* SECTION 2 — LOCATION */}
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F4C81', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              SECTION 2 — LOCATION & MAP
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#334155' }}>
              <div><strong>📍 Exact Address:</strong> {complaint.formattedAddress || complaint.location || complaint.address || 'Address provided'}</div>
              {complaint.houseNumber && <div><strong>House / Flat:</strong> {complaint.houseNumber}</div>}
              {complaint.residency && <div><strong>Residency / Building:</strong> {complaint.residency}</div>}
              {complaint.street && <div><strong>Street:</strong> {complaint.street}</div>}
              {complaint.area && <div><strong>Area / Locality:</strong> {complaint.area}</div>}
              {complaint.city && <div><strong>City / District:</strong> {complaint.city}</div>}
              {complaint.landmark && <div><strong>Landmark:</strong> {complaint.landmark}</div>}
              <div><strong>Latitude:</strong> {complaint.latitude ? Number(complaint.latitude).toFixed(5) : '17.3850'}</div>
              <div><strong>Longitude:</strong> {complaint.longitude ? Number(complaint.longitude).toFixed(5) : '78.4867'}</div>
            </div>
            <MapView complaints={[complaint]} height="250px" />
          </div>

          {/* SECTION 3 — CITIZEN DETAILS */}
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F4C81', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              SECTION 3 — CITIZEN INFORMATION
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.9rem', color: '#334155' }}>
              <div><strong>Citizen Name:</strong> {complaint.citizenName || 'Verified Resident'}</div>
              <div><strong>Contact Email:</strong> {complaint.citizenEmail || 'citizen@civic.gov.in'}</div>
              <div><strong>Verification Status:</strong> <span style={{ color: '#166534', fontWeight: 700 }}>Registered Public Account</span></div>
            </div>
          </div>

          {/* SECTION 4 — EVIDENCE */}
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F4C81', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              SECTION 4 — EVIDENCE & SITE IMAGES
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <ImageIcon size={16} color="#0F4C81" /> Reported Site Evidence
                </span>
                <img
                  src={complaint.imageUrl}
                  alt="Reported Issue Site"
                  style={{ width: '100%', height: '210px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                />
                
                {complaint.imageVerification && complaint.imageVerification.checked && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: complaint.imageVerification.result === 'verified' ? '#dcfce7' : '#fee2e2',
                    border: `1px solid ${complaint.imageVerification.result === 'verified' ? '#bbf7d0' : '#fecaca'}`
                  }}>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 700, 
                      color: complaint.imageVerification.result === 'verified' ? '#15803d' : '#b91c1c',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginBottom: '0.35rem'
                    }}>
                      {complaint.imageVerification.result === 'verified' ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
                      AI Scan: {complaint.imageVerification.result === 'verified' ? 'Image verified' : 'Image verification failed'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>
                      {complaint.imageVerification.result === 'verified' 
                        ? `Authenticity check passed successfully (AI Score: ${complaint.imageVerification.aiGeneratedScore?.toFixed(3)}, Deepfake Score: ${complaint.imageVerification.deepfakeScore?.toFixed(3)}).`
                        : `Image flagged as ${complaint.imageVerification.result} (AI Score: ${complaint.imageVerification.aiGeneratedScore?.toFixed(3)}, Deepfake Score: ${complaint.imageVerification.deepfakeScore?.toFixed(3)}).`
                      }
                    </div>
                  </div>
                )}
              </div>

              {complaint.resolutionImageUrl && (
                <div>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <CheckCircle2 size={16} color="#166534" /> Official Resolution Proof
                  </span>
                  <img
                    src={complaint.resolutionImageUrl}
                    alt="Resolution Proof"
                    style={{ width: '100%', height: '210px', objectFit: 'cover', borderRadius: '0.5rem', border: '2px solid #86efac' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5 — STATUS */}
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F4C81', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              SECTION 5 — STATUS & RESPONSIBLE DEPARTMENT
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 700, display: 'block' }}>CURRENT STATUS</span>
                <div style={{ marginTop: '0.25rem' }}><StatusBadge status={complaint.status} /></div>
              </div>
              <div>
                <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 700, display: 'block' }}>SUBMITTED DATE</span>
                <strong style={{ fontSize: '0.9rem', color: '#334155' }}>{formattedDateStr(complaint.createdAt)}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 700, display: 'block' }}>DEPARTMENT</span>
                <strong style={{ fontSize: '0.9rem', color: '#0F4C81' }}>{complaint.department}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 700, display: 'block' }}>ASSIGNED OFFICER</span>
                <strong style={{ fontSize: '0.9rem', color: '#334155' }}>{complaint.assignedOfficer || 'Unassigned'}</strong>
              </div>
            </div>
          </div>

          {/* SECTION 6 — TIMELINE & ACTIONS */}
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F4C81', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              SECTION 6 — TIMELINE & OFFICER ACTIONS
            </div>
            
            <ComplaintTimeline timeline={complaint.timeline} />


            {/* Comments Form */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                Add Official Progress Remark / Comment:
              </div>
              <form onSubmit={handleSubmitComment} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Type official remarks or updates..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary-citizen"
                  style={{ padding: '0.65rem 1.1rem', fontSize: '0.85rem', gap: '0.35rem' }}
                >
                  <Send size={15} /> Send
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

