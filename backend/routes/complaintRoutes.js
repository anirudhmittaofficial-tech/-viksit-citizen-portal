import express from 'express';
import {
  createComplaint,
  getPublicComplaints,
  getMyComplaints,
  getComplaintById,
  addComment
} from '../controllers/complaintController.js';
import { protect, optionalProtect, citizenOnly } from '../middleware/auth.js';

const router = express.Router();

// Public & Citizen Complaint Routes
router.route('/')
  .post(protect, citizenOnly, createComplaint)
  .get(getPublicComplaints);

router.get('/my', protect, getMyComplaints);
router.get('/:id', getComplaintById);
router.post('/:id/comments', protect, addComment);



export default router;
