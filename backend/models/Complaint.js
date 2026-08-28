import { query } from '../config/db.js';

// Map DB snake_case columns to Mongoose camelCase field names to ensure zero frontend friction
export const mapComplaintFields = (c) => {
  if (!c) return null;
  return {
    id: c.id,
    _id: c.id,
    complaintId: c.complaint_id,
    title: c.title,
    category: c.category,
    description: c.description,
    location: c.location,
    formattedAddress: c.formatted_address,
    houseNumber: c.house_number,
    residency: c.residency,
    street: c.street,
    area: c.area,
    locality: c.locality,
    city: c.city,
    district: c.district,
    state: c.state,
    pincode: c.pincode,
    country: c.country,
    landmark: c.landmark,
    coordinates: c.coordinates,
    latitude: c.latitude,
    longitude: c.longitude,
    severity: c.severity,
    status: c.status,
    imageUrl: c.image_url,
    imageVerification: {
      checked: c.image_verification_checked,
      aiGeneratedScore: c.image_verification_ai_generated_score,
      deepfakeScore: c.image_verification_deepfake_score,
      result: c.image_verification_result,
      checkedAt: c.image_verification_checked_at
    },
    resolutionImageUrl: c.resolution_image_url,
    citizen: c.citizen_id,
    citizenName: c.citizen_name,
    citizenEmail: c.citizen_email,
    department: c.department,
    assignedOfficer: c.assigned_officer,
    expectedResolution: c.expected_resolution,
    resolvedAt: c.resolved_at,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    timeline: c.timeline || [],
    comments: c.comments || []
  };
};

// Add entry to complaint timeline
export const addTimelineEntry = async (complaintId, { status, date, note }) => {
  await query(
    'INSERT INTO complaint_timelines (complaint_id, status, date, note) VALUES ($1, $2, $3, $4)',
    [complaintId, status, date, note]
  );
};

// Add comment to complaint
export const addComment = async (complaintId, { author, authorRole = 'citizen', text, date }) => {
  const res = await query(
    `INSERT INTO complaint_comments (complaint_id, author, author_role, text, date)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [complaintId, author, authorRole, text, date]
  );
  return res.rows[0];
};

// Fetch complaint with joined timeline and comments relations
export const getComplaintWithRelations = async (id) => {
  let complaint;
  if (!isNaN(Number(id))) {
    const res = await query('SELECT * FROM complaints WHERE id = $1', [Number(id)]);
    complaint = res.rows[0];
  } else {
    const res = await query('SELECT * FROM complaints WHERE complaint_id = $1', [id]);
    complaint = res.rows[0];
  }

  if (!complaint) return null;

  // Fetch timeline entries
  const timelineRes = await query(
    'SELECT * FROM complaint_timelines WHERE complaint_id = $1 ORDER BY id ASC',
    [complaint.id]
  );
  complaint.timeline = timelineRes.rows;

  // Fetch comments
  const commentsRes = await query(
    'SELECT * FROM complaint_comments WHERE complaint_id = $1 ORDER BY id ASC',
    [complaint.id]
  );
  complaint.comments = commentsRes.rows.map(comm => ({
    ...comm,
    authorRole: comm.author_role // map snake_case to camelCase
  }));

  return mapComplaintFields(complaint);
};

// Create a new complaint record
export const createComplaint = async (data) => {
  const {
    complaintId, title, category, description, location, formattedAddress,
    houseNumber, residency, street, area, locality, city, district, state,
    pincode, country, landmark, coordinates, latitude, longitude, severity,
    status = 'Submitted', imageUrl, aiVerification, citizen, citizenName, citizenEmail,
    department
  } = data;

  const insertQuery = `
    INSERT INTO complaints (
      complaint_id, title, category, description, location, formatted_address,
      house_number, residency, street, area, locality, city, district, state,
      pincode, country, landmark, coordinates, latitude, longitude, severity,
      status, image_url, image_verification_checked, image_verification_ai_generated_score,
      image_verification_deepfake_score, image_verification_result, image_verification_checked_at,
      citizen_id, citizen_name, citizen_email, department, assigned_officer, expected_resolution,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
      $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
      'Unassigned', 'Within 48 Hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) RETURNING id`;

  const values = [
    complaintId, title, category, description, location, formattedAddress || location,
    houseNumber || '', residency || '', street || '', area || '', locality || '', city || '', district || '', state || '',
    pincode || '', country || '', landmark || '', coordinates, latitude, longitude, severity || 'Medium',
    status, imageUrl,
    aiVerification?.checked || false,
    aiVerification?.aiGeneratedScore || 0,
    aiVerification?.deepfakeScore || 0,
    aiVerification?.result || null,
    aiVerification?.checkedAt || null,
    citizen, citizenName, citizenEmail, department
  ];

  const res = await query(insertQuery, values);
  const newId = res.rows[0].id;

  // Insert initial timeline entry if provided
  if (data.timeline && Array.isArray(data.timeline)) {
    for (const t of data.timeline) {
      await addTimelineEntry(newId, t);
    }
  }

  return await getComplaintWithRelations(newId);
};

// Get single complaint by ID or custom ID
export const getComplaintById = async (id) => {
  return await getComplaintWithRelations(id);
};

// Get complaints for logged-in citizen
export const getComplaintsByCitizen = async (citizenId, email) => {
  const res = await query(
    'SELECT * FROM complaints WHERE citizen_id = $1 OR LOWER(citizen_email) = LOWER($2) ORDER BY created_at DESC',
    [citizenId, email]
  );

  const complaints = [];
  for (const row of res.rows) {
    const populated = await getComplaintWithRelations(row.id);
    if (populated) complaints.push(populated);
  }
  return complaints;
};

// Get all complaints with filters
export const getAllComplaints = async ({ search, category, status, department } = {}) => {
  let queryText = 'SELECT * FROM complaints WHERE 1=1';
  const params = [];
  let index = 1;

  if (search) {
    queryText += ` AND (
      complaint_id ILIKE $${index} OR 
      title ILIKE $${index} OR 
      description ILIKE $${index} OR 
      location ILIKE $${index}
    )`;
    params.push(`%${search}%`);
    index++;
  }

  if (category && category !== 'All') {
    queryText += ` AND category = $${index++}`;
    params.push(category);
  }

  if (status && status !== 'All') {
    queryText += ` AND status = $${index++}`;
    params.push(status);
  }

  if (department && department !== 'All') {
    queryText += ` AND department = $${index++}`;
    params.push(department);
  }

  queryText += ' ORDER BY created_at DESC';

  const res = await query(queryText, params);
  
  const complaints = [];
  for (const row of res.rows) {
    const populated = await getComplaintWithRelations(row.id);
    if (populated) complaints.push(populated);
  }
  return complaints;
};

// Count total complaints (for statistics/utility)
export const countDocuments = async () => {
  const res = await query('SELECT COUNT(*) FROM complaints');
  return parseInt(res.rows[0].count, 10);
};

// Find single complaint record without populating (simple check)
export const findOne = async (conditions) => {
  if (conditions.complaintId) {
    const res = await query('SELECT * FROM complaints WHERE complaint_id = $1', [conditions.complaintId]);
    return mapComplaintFields(res.rows[0]) || null;
  }
  return null;
};

