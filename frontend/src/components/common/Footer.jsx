import React from 'react';
import { Building2, ShieldCheck, HeartHandshake, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', paddingTop: '4rem', paddingBottom: '2rem', borderTop: '1px solid #1e293b' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#ffffff', marginBottom: '1rem' }}>
              <div style={{ background: '#0284c7', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <Building2 size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>CivicPulse.gov</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Empowering citizens to report municipal issues, track resolutions in real-time, and collaborate with municipal authorities for better communities.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span className="portal-badge-citizen">Public Access</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Citizen Portal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              <li><Link to="/citizen/login" style={{ color: '#cbd5e1' }}>Citizen Login</Link></li>
              <li><Link to="/citizen/register" style={{ color: '#cbd5e1' }}>New Registration</Link></li>
              <li><a href="/#track" style={{ color: '#cbd5e1' }}>Track Complaint Status</a></li>
              <li><a href="/#how-it-works" style={{ color: '#cbd5e1' }}>Public Resolution Workflow</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Municipal Partners</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              <li><span style={{ color: '#cbd5e1' }}>Public Works Department</span></li>
              <li><span style={{ color: '#cbd5e1' }}>Electricity & Lighting Board</span></li>
              <li><span style={{ color: '#cbd5e1' }}>Municipal Sanitation Corp</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Contact Support</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="#0284c7" /> 1800-CIVIC-PULSE (Toll Free)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="#0284c7" /> support@civicpulse.gov.in
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#0284c7" /> City Municipal HQ, Civic Center, Ward 1
              </li>
            </ul>
          </div>

        </div>

        <div className="mobile-col mobile-text-center" style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
          <div>© 2026 Smart Civic Resolution Platform. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#accessibility">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
