import React, { useState } from 'react';
import { Search, Download, Filter, Eye, Plus, ArrowUpDown, FileText } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintDetail from './ComplaintDetail';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';

export default function MyComplaints() {
  const { complaints, loading, addComment } = useComplaints();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Filter complaints
  const filteredComplaints = complaints.filter(item => {
    const matchesSearch =
      (item.complaintId || item.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt || Date.now());
    const dateB = new Date(b.createdAt || Date.now());
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Download CSV report feature
  const handleDownloadReport = () => {
    const headers = ['Complaint ID,Title,Category,Department,Status,Location,Date'];
    const rows = filteredComplaints.map(c =>
      `"${c.complaintId || c.id}","${c.title}","${c.category}","${c.department}","${c.status}","${c.location}","${c.createdAt || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Civic_Complaints_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            My Complaints History
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Track live resolution audit trails, officer assignments, and department updates for your registered issues.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleDownloadReport} className="btn btn-outline" style={{ gap: '0.4rem' }}>
            <Download size={16} /> Export CSV Report
          </button>
          <Link to="/citizen/report-issue" className="btn btn-primary-citizen">
            <Plus size={16} /> Report New Issue
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by Complaint ID, title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 1rem 0.7rem 2.6rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.7rem 1rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', backgroundColor: '#ffffff' }}
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Verified">Verified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '0.7rem 1rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', backgroundColor: '#ffffff' }}
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

          {/* Sort button */}
          <button
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="btn btn-outline"
            style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
          >
            <ArrowUpDown size={14} /> Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>

        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <SkeletonLoader count={5} type="table" />
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          title="No Complaints Found"
          message="No issue tickets match your filter criteria or search query."
          actionButton={
            <Link to="/citizen/report-issue" className="btn btn-primary-citizen">
              <Plus size={16} /> File New Complaint
            </Link>
          }
        />
      ) : (
        <div className="admin-table-container card" style={{ padding: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Issue Title</th>
                <th>Category</th>
                <th>Department</th>
                <th>Location</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((item) => (
                <tr key={item.id || item.complaintId}>
                  <td style={{ fontWeight: 800, color: '#0F4C81' }}>
                    #{item.complaintId || item.id}
                  </td>
                  <td style={{ fontWeight: 700, color: '#0f172a', maxWidth: '240px' }}>
                    {item.title}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', fontWeight: 600 }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                    {item.department}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📍 {item.location}
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedComplaint(item)}
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem', color: '#0F4C81', borderColor: '#0F4C81' }}
                    >
                      <Eye size={14} /> View Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Complaint Detail Modal Drawer */}
      {selectedComplaint && (
        <ComplaintDetail
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onAddComment={addComment}
        />
      )}
    </div>
  );
}
