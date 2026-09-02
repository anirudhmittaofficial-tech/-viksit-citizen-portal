import {
  createComplaint as dbCreateComplaint,
  getComplaintById as dbGetComplaintById,
  getComplaintsByCitizen,
  getAllComplaints,
  countDocuments,
  findOne,
  addComment as addComplaintComment,
  getComplaintWithRelations
} from '../models/Complaint.js';
import { createNotification } from '../models/Notification.js';

const getDepartmentForCategory = (category) => {
  switch (category) {
    case 'Road Damage':
    case 'Roads & Infrastructure':
      return 'Roads Department';
    case 'Street Light':
    case 'Electrical & Lighting':
      return 'Electricity Department';
    case 'Garbage':
    case 'Illegal Dumping':
    case 'Sanitation & Waste':
      return 'Sanitation Department';
    case 'Drainage Leakage':
      return 'Drainage Department';
    case 'Water Leakage':
    case 'Water Supply & Sewage':
      return 'Water Department';
    case 'Traffic Signal':
      return 'Traffic Department';
    case 'Public Park':
      return 'Sanitation Department';
    default:
      return 'Roads Department';
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Public / Private
export const createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      category,
      description,
      location,
      formattedAddress: inputFormattedAddress,
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
      coordinates,
      latitude,
      longitude,
      severity,
      imageUrl,
      aiVerification,
      department: inputDepartment
    } = req.body;

    let addressStr = inputFormattedAddress || '';
    let rawLat = latitude;
    let rawLng = longitude;
    let coordsStr = coordinates;

    if (typeof location === 'object' && location !== null) {
      if (!addressStr) addressStr = location.formattedAddress || location.address || location.formatted_address || location.location || '';
      if (rawLat === undefined || rawLat === null || rawLat === '') rawLat = location.latitude;
      if (rawLng === undefined || rawLng === null || rawLng === '') rawLng = location.longitude;
    } else if (typeof location === 'string' && !addressStr) {
      addressStr = location;
    }

    const parsedLat = Number(rawLat);
    const parsedLng = Number(rawLng);

    if (!coordsStr && !isNaN(parsedLat) && !isNaN(parsedLng)) {
      coordsStr = `${parsedLat.toFixed(5)}° N, ${parsedLng.toFixed(5)}° E`;
    }

    // Strict validation of required fields
    if (
      !title ||
      !category ||
      !description ||
      !imageUrl ||
      !String(imageUrl).trim() ||
      !addressStr ||
      rawLat === undefined ||
      rawLat === null ||
      rawLat === '' ||
      rawLng === undefined ||
      rawLng === null ||
      rawLng === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, category, description, evidence photo, location address, latitude, and longitude.',
        error: 'Missing required parameters'
      });
    }

    if (isNaN(parsedLat) || isNaN(parsedLng) || parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Valid numerical latitude (-90 to 90) and longitude (-180 to 180) are required.',
        error: 'Invalid coordinates format'
      });
    }

    const complaintCount = await countDocuments();
    const formattedNum = String(complaintCount + 145).padStart(6, '0');
    let complaintId = `CMP-2026-${formattedNum}`;
    
    // Ensure complaintId uniqueness
    const existingWithId = await findOne({ complaintId });
    if (existingWithId) {
      complaintId = `CMP-2026-${String(Date.now()).slice(-6)}`;
    }
    
    const department = inputDepartment || getDepartmentForCategory(category);
    const formattedDate = new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });

    const newComplaint = await dbCreateComplaint({
      complaintId,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      location: addressStr.trim(),
      formattedAddress: addressStr.trim(),
      houseNumber: houseNumber ? String(houseNumber).trim() : '',
      residency: residency ? String(residency).trim() : '',
      street: street ? String(street).trim() : '',
      area: area ? String(area).trim() : '',
      locality: locality ? String(locality).trim() : '',
      city: city ? String(city).trim() : '',
      district: district ? String(district).trim() : '',
      state: state ? String(state).trim() : '',
      pincode: pincode ? String(pincode).trim() : '',
      country: country ? String(country).trim() : '',
      landmark: landmark ? String(landmark).trim() : '',
      coordinates: String(coordsStr || `${parsedLat.toFixed(5)}° N, ${parsedLng.toFixed(5)}° E`).trim(),
      latitude: parsedLat,
      longitude: parsedLng,
      severity: severity || 'Medium',
      status: 'Submitted',
      imageUrl: imageUrl.trim(),
      aiVerification: aiVerification || null,
      citizen: req.user.id,
      citizenName: req.user.name,
      citizenEmail: req.user.email,
      department,
      timeline: [
        {
          status: 'Submitted',
          date: formattedDate,
          note: 'Complaint logged successfully by citizen.'
        }
      ]
    });

    // Generate Notification
    await createNotification({
      recipient: req.user ? req.user.id : null,
      recipientEmail: req.user ? req.user.email : 'citizen@civic.org',
      targetRole: 'citizen',
      title: 'Complaint Registered Successfully',
      message: `Your complaint #${complaintId} (${title}) has been received and routed to ${department}.`,
      type: 'registered',
      complaintId
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully!',
      data: { complaint: newComplaint },
      complaint: newComplaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints (with search, category, status, department filters)
// @route   GET /api/complaints
// @access  Public
export const getPublicComplaints = async (req, res, next) => {
  try {
    const { search, category, status, department } = req.query;
    const complaints = await getAllComplaints({ search, category, status, department });

    res.status(200).json({
      success: true,
      message: 'Public complaints fetched successfully',
      count: complaints.length,
      data: { complaints, count: complaints.length },
      complaints
    });
  } catch (error) {
    next(error);
  }
};

export const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await getComplaintsByCitizen(req.user.id, req.user.email);

    res.status(200).json({
      success: true,
      message: 'My complaints fetched successfully',
      count: complaints.length,
      data: { complaints, count: complaints.length },
      complaints
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await dbGetComplaintById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `No complaint record found matching '${id}'`,
        error: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint retrieved successfully',
      data: { complaint },
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
        error: 'Missing comment text'
      });
    }

    const complaint = await dbGetComplaintById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
        error: 'Resource not found'
      });
    }

    const newComment = {
      author: req.user.name,
      authorRole: req.user.role,
      text: text.trim(),
      date: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
    };

    await addComplaintComment(complaint.id, newComment);
    const updatedComplaint = await getComplaintWithRelations(complaint.id);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: newComment, complaint: updatedComplaint },
      comment: newComment,
      complaint: updatedComplaint
    });
  } catch (error) {
    next(error);
  }
};
