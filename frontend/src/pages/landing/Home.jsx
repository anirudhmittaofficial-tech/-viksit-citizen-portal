import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  UserCheck, 
  CheckCircle2, 
  Search, 
  MapPin, 
  Clock, 
  Sparkles, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import StatusBadge from '../../components/common/StatusBadge';
import { useComplaints } from '../../context/ComplaintContext';

export default function Home() {
  const { complaints } = useComplaints();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedComplaint, setSearchedComplaint] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrackSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const term = searchQuery.trim().toLowerCase();
    const found = complaints.find(
      c => (c.complaintId && c.complaintId.toLowerCase().includes(term)) ||
           (c.id && c.id.toLowerCase().includes(term)) ||
           (c.title && c.title.toLowerCase().includes(term))
    );
    setSearchedComplaint(found || null);
    setHasSearched(true);
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section id="home" style={{
        background: 'linear-gradient(135deg, #0b192c 0%, #0F4C81 50%, #2E8B57 100%)',
        color: '#ffffff',
        padding: '5.5rem 0 6.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '450px', height: '450px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
            
            {/* Pill Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              padding: '0.45rem 1.25rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 800,
              marginBottom: '1.75rem',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Sparkles size={16} color="#FFC107" />
              <span>Connecting Citizens with Government for Faster Civic Issue Resolution</span>
            </div>

            <h1 className="mobile-text-3xl" style={{
              fontSize: '3.4rem',
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em'
            }}>
              Report Civic Issues. Track Every Resolution. Build Better Communities.
            </h1>

            <p className="mobile-text-base" style={{
              fontSize: '1.25rem',
              color: '#e2e8f0',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
              fontWeight: 400
            }}>
              Direct digital connection between citizens and municipal department heads. 
              Upload complaints with geolocation, track live officer dispatch, and hold civic services accountable.
            </p>

            {/* Hero Buttons */}
            <div className="mobile-col" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/citizen/register"
                className="btn"
                style={{
                  backgroundColor: '#2E8B57',
                  color: '#ffffff',
                  padding: '1rem 2.25rem',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  borderRadius: '0.65rem',
                  boxShadow: '0 8px 24px rgba(46, 139, 87, 0.4)'
                }}
              >
                🟢 Report an Issue
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Role Portal Selection Cards */}
      <section style={{ marginTop: '-3rem', position: 'relative', zIndex: 20, marginBottom: '4rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
          
          {/* Citizen Portal Card */}
          <div className="card glass-card" style={{
            padding: '2.25rem',
            borderTop: '5px solid #0F4C81',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            maxWidth: '560px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="portal-badge-citizen">Citizen Portal</span>
              <UserCheck size={28} color="#0F4C81" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Public Residents
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              "Help improve your community by reporting civic issues like potholes, streetlight outages, or garbage overflows."
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem', fontSize: '0.9rem', color: '#334155' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#2E8B57" /> 1-Click Geo-Tagged Issue Reporting
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#2E8B57" /> Real-time Dispatch & Resolution Alerts
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#2E8B57" /> Public Complaint History & Timeline
              </li>
            </ul>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/citizen/login" className="btn btn-primary-citizen" style={{ flex: 1 }}>
                Citizen Login <ArrowRight size={16} />
              </Link>
              <Link to="/citizen/register" className="btn btn-outline">
                Register
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ padding: '4.5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3.5rem' }}>
            <span style={{ color: '#0F4C81', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
              Transparent Workflow
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
              How Civic Issues Get Resolved
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', title: 'Report Issue', desc: 'Capture details, category, address & optional photo of the issue.' },
              { step: '02', title: 'Automated Routing', desc: 'Our platform automatically maps the issue to the relevant department (Roads, Water, Sanitation).' },
              { step: '03', title: 'Officer Dispatch', desc: 'Department Admin assigns a field officer to inspect and resolve on-site.' },
              { step: '04', title: 'Resolution Verified', desc: 'Work completed is logged, verified with photos, and citizen receives instant notification.' }
            ].map((s, idx) => (
              <div key={idx} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', position: 'relative' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: '#e2e8f0',
                  position: 'absolute',
                  top: '1rem',
                  right: '1.25rem'
                }}>
                  {s.step}
                </div>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#f0fdf4',
                  color: '#2E8B57',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontWeight: 800,
                  fontSize: '1.2rem'
                }}>
                  {idx + 1}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Track Complaint Search Section */}
      <section id="track" style={{ padding: '4.5rem 0', backgroundColor: '#f1f5f9' }}>
        <div className="container">
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                Track Your Complaint Resolution Status
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.35rem' }}>
                Enter your unique Complaint ID (e.g. <strong style={{ color: '#0F4C81' }}>CMP-2026-000145</strong>) to check live progress.
              </p>
            </div>

            <form onSubmit={handleTrackSearch} className="mobile-col" style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Enter Complaint ID or issue keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem 0.85rem 2.8rem',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '0.6rem',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary-citizen">
                Track Status
              </button>
            </form>

            {/* Results */}
            {hasSearched && (
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1.75rem' }}>
                {searchedComplaint ? (
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>#{searchedComplaint.complaintId || searchedComplaint.id}</span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{searchedComplaint.title}</h3>
                        <div style={{ fontSize: '0.85rem', color: '#0F4C81', fontWeight: 700, marginTop: '0.2rem' }}>
                          {searchedComplaint.department}
                        </div>
                      </div>
                      <StatusBadge status={searchedComplaint.status} />
                    </div>

                    <div className="mobile-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', color: '#475569', margin: '1rem 0' }}>
                      <div><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> {searchedComplaint.location}</div>
                      <div><Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Logged: {searchedComplaint.timeline?.[0]?.date || 'Recently'}</div>
                    </div>

                    {/* Timeline steps */}
                    <div style={{ marginTop: '1.25rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                        Live Audit Trail
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {searchedComplaint.timeline?.map((step, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0F4C81', marginTop: '6px' }} />
                            <div>
                              <strong style={{ color: '#0f172a' }}>{step.status}</strong> - <span style={{ color: '#64748b' }}>{step.date}</span>
                              <div style={{ color: '#475569', fontSize: '0.8rem' }}>{step.note}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#ef4444', fontWeight: 600 }}>
                    <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem' }} />
                    No complaint record found matching "{searchQuery}". Please verify the ID.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
