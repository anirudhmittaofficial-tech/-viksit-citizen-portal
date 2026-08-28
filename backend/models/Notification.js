import { query } from '../config/db.js';

export const mapNotificationFields = (n) => {
  if (!n) return null;
  return {
    id: n.id,
    _id: n.id,
    recipient: n.recipient_id,
    recipientEmail: n.recipient_email,
    targetRole: n.target_role,
    title: n.title,
    message: n.message,
    unread: n.unread,
    type: n.type,
    complaintId: n.complaint_id,
    createdAt: n.created_at,
    updatedAt: n.updated_at
  };
};

// Create a new notification
export const createNotification = async ({ recipient, recipientEmail = '', targetRole = 'all', title, message, type = 'system', complaintId = '' }) => {
  const res = await query(
    `INSERT INTO notifications (
      recipient_id, recipient_email, target_role, title, message, unread, type, complaint_id, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, TRUE, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING *`,
    [recipient || null, recipientEmail, targetRole, title, message, type, complaintId]
  );
  return mapNotificationFields(res.rows[0]);
};

// Get notifications for user
export const getNotificationsForUser = async ({ userId, email, role }) => {
  let res;
  if (userId) {
    res = await query(
      `SELECT * FROM notifications 
       WHERE recipient_id = $1 OR LOWER(recipient_email) = LOWER($2) OR target_role = $3 OR target_role = 'all'
       ORDER BY created_at DESC`,
      [userId, email, role]
    );
  } else {
    res = await query(
      `SELECT * FROM notifications 
       WHERE LOWER(recipient_email) = LOWER($1) OR target_role = 'citizen' OR target_role = 'all'
       ORDER BY created_at DESC`,
      [email]
    );
  }
  return res.rows.map(mapNotificationFields);
};

// Find single notification by ID
export const findById = async (id) => {
  const res = await query('SELECT * FROM notifications WHERE id = $1', [id]);
  return mapNotificationFields(res.rows[0]) || null;
};

// Mark single notification as read
export const markNotificationRead = async (id) => {
  const res = await query(
    'UPDATE notifications SET unread = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
    [id]
  );
  return mapNotificationFields(res.rows[0]) || null;
};

// Mark all notifications as read for a user
export const markAllNotificationsRead = async ({ userId, email, role }) => {
  if (userId) {
    await query(
      `UPDATE notifications SET unread = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE recipient_id = $1 OR LOWER(recipient_email) = LOWER($2) OR target_role = $3 OR target_role = 'all'`,
      [userId, email, role]
    );
  }
};
export default {
  createNotification,
  getNotificationsForUser,
  findById,
  markNotificationRead,
  markAllNotificationsRead
};
