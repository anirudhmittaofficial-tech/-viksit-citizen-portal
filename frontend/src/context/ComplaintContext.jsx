import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchPublicComplaintsApi,
  createComplaintApi,
  addCommentApi
} from '../services/complaintService';
import {
  fetchNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi
} from '../services/notificationService';
import { INITIAL_COMPLAINTS, FIELD_OFFICERS, DEPARTMENTS, NOTIFICATIONS_SEED } from '../services/mockData';
import { useAuth } from './AuthContext';

const ComplaintContext = createContext();

const COMPLAINTS_KEY = 'civic_complaints_db';
const NOTIFS_KEY = 'civic_notifications_db';

export function ComplaintProvider({ children }) {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [officers] = useState(FIELD_OFFICERS);
  const [departments] = useState(DEPARTMENTS);
  const [loading, setLoading] = useState(true);

  // Load complaints & notifications from API or fallback
  const refreshComplaints = useCallback(async () => {
    try {
      const data = await fetchPublicComplaintsApi();
      if (data && data.complaints) {
        setComplaints(data.complaints);
        localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(data.complaints));
      }
    } catch (err) {
      console.warn('API error fetching complaints, using local state:', err.message);
      const saved = localStorage.getItem(COMPLAINTS_KEY);
      if (saved) {
        setComplaints(JSON.parse(saved));
      } else {
        setComplaints(INITIAL_COMPLAINTS);
      }
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await fetchNotificationsApi(user?.email);
      if (data && data.notifications) {
        setNotifications(data.notifications);
        localStorage.setItem(NOTIFS_KEY, JSON.stringify(data.notifications));
      }
    } catch (err) {
      console.warn('API error fetching notifications, using local state:', err.message);
      const saved = localStorage.getItem(NOTIFS_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        setNotifications(NOTIFICATIONS_SEED);
      }
    }
  }, [user]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([refreshComplaints(), refreshNotifications()]);
      setLoading(false);
    }
    init();
  }, [refreshComplaints, refreshNotifications]);

  // Helper local state savers
  const saveComplaintsLocal = (updated) => {
    setComplaints(updated);
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(updated));
  };

  const saveNotifsLocal = (updated) => {
    setNotifications(updated);
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(updated));
  };

  // Add new complaint (Citizen action)
  const addComplaint = async (newIssueData, citizenUser) => {
    try {
      const res = await createComplaintApi(newIssueData);
      if (res && res.complaint) {
        await refreshComplaints();
        await refreshNotifications();
        return res.complaint;
      }
    } catch (err) {
      console.warn('API complaint creation failed, writing to local state:', err.message);
    }

    // Local fallback
    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
    const complaintNum = String(complaints.length + 145).padStart(6, '0');

    const addressStr = newIssueData.formattedAddress || (typeof newIssueData.location === 'object' && newIssueData.location !== null
      ? newIssueData.location.address
      : (newIssueData.location || newIssueData.address || ''));

    const latVal = newIssueData.latitude !== undefined && newIssueData.latitude !== null
      ? Number(newIssueData.latitude)
      : (typeof newIssueData.location === 'object' && newIssueData.location !== null ? Number(newIssueData.location.latitude) : 0);

    const lngVal = newIssueData.longitude !== undefined && newIssueData.longitude !== null
      ? Number(newIssueData.longitude)
      : (typeof newIssueData.location === 'object' && newIssueData.location !== null ? Number(newIssueData.location.longitude) : 0);

    const coordsStr = newIssueData.coordinates || `${latVal.toFixed(5)}° N, ${lngVal.toFixed(5)}° E`;

    const newIssue = {
      id: `CMP-2026-${complaintNum}`,
      complaintId: `CMP-2026-${complaintNum}`,
      title: newIssueData.title,
      category: newIssueData.category,
      description: newIssueData.description,
      location: addressStr,
      formattedAddress: addressStr,
      address: addressStr,
      coordinates: coordsStr,
      latitude: latVal,
      longitude: lngVal,
      houseNumber: newIssueData.houseNumber || '',
      residency: newIssueData.residency || '',
      street: newIssueData.street || '',
      area: newIssueData.area || '',
      locality: newIssueData.locality || '',
      city: newIssueData.city || '',
      district: newIssueData.district || '',
      state: newIssueData.state || '',
      pincode: newIssueData.pincode || '',
      country: newIssueData.country || '',
      landmark: newIssueData.landmark || '',
      severity: newIssueData.severity || 'Medium',
      status: 'Submitted',
      createdAt: timestamp,
      citizenName: citizenUser?.name || 'Anonymous Citizen',
      citizenEmail: citizenUser?.email || 'citizen@civic.org',
      assignedOfficer: 'Unassigned',
      department: getDepartmentForCategory(newIssueData.category),
      expectedResolution: 'Within 48 Hours',
      timeline: [
        { status: 'Submitted', date: formattedDate, note: 'Complaint logged successfully by citizen.' }
      ],
      comments: [],
      imageUrl: newIssueData.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80'
    };

    const updatedList = [newIssue, ...complaints];
    saveComplaintsLocal(updatedList);

    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title: 'Complaint Registered Successfully',
      message: `Your complaint #${newIssue.complaintId} (${newIssue.title}) has been received and routed to ${newIssue.department}.`,
      date: timestamp,
      unread: true,
      type: 'registered'
    };
    saveNotifsLocal([newNotif, ...notifications]);

    return newIssue;
  };


  // Add Comment
  const addComment = async (complaintId, commentText) => {
    try {
      const target = complaints.find(c => c.id === complaintId || c.complaintId === complaintId);
      const targetId = target?._id || complaintId;
      await addCommentApi(targetId, {
        text: commentText,
        author: user?.name || 'Anonymous User',
        authorRole: user?.role || 'citizen'
      });
      await refreshComplaints();
      return;
    } catch (err) {
      console.warn('API add comment failed, updating local state:', err.message);
    }

    // Local fallback
    const formattedDate = new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
    const newComment = {
      author: user?.name || 'Anonymous User',
      authorRole: user?.role || 'citizen',
      text: commentText,
      date: formattedDate
    };

    const updated = complaints.map(c => {
      if (c.id === complaintId || c.complaintId === complaintId) {
        return {
          ...c,
          comments: [...(c.comments || []), newComment]
        };
      }
      return c;
    });
    saveComplaintsLocal(updated);
  };

  const markNotificationRead = async (notifId) => {
    try {
      await markNotificationReadApi(notifId);
      await refreshNotifications();
      return;
    } catch (e) {
      // Fallback
    }
    const updated = notifications.map(n => n.id === notifId || n._id === notifId ? { ...n, unread: false } : n);
    saveNotifsLocal(updated);
  };

  const markAllNotificationsRead = async () => {
    // Optimistically and synchronously mark all notifications as read in state & localStorage
    setNotifications(prev => prev.map(n => ({ ...n, unread: false, isRead: true, read: true })));
    try {
      const saved = localStorage.getItem(NOTIFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved).map(n => ({ ...n, unread: false, isRead: true, read: true }));
        localStorage.setItem(NOTIFS_KEY, JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }
    try {
      await markAllNotificationsReadApi();
    } catch (e) {
      console.warn('API mark all read fallback:', e.message);
    }
  };

  const getDepartmentForCategory = (category) => {
    const cleanCat = (category || '').replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
    switch (cleanCat) {
      case 'Pothole':
      case 'Road Damage':
        return 'Roads Department';
      case 'Street Light':
        return 'Electricity Department';
      case 'Garbage':
      case 'Illegal Dumping':
        return 'Sanitation Department';
      case 'Drainage Leakage':
      case 'Water / Drainage':
      case 'Water Leakage':
        return 'Water & Drainage Department';
      case 'Traffic Signal':
      case 'Traffic / Signal':
        return 'Traffic Department';
      case 'Public Park':
      case 'Public Space':
        return 'Parks & Public Spaces Department';
      default:
        return 'Civic Maintenance Department';
    }
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        notifications,
        officers,
        departments,
        loading,
        refreshComplaints,
        addComplaint,
        addComment,
        markNotificationRead,
        markAllNotificationsRead
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
}
