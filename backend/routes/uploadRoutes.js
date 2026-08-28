import express from 'express';
import multer from 'multer';
import { upload } from '../middleware/upload.js';
import { verifyImageWithHive } from '../services/hiveService.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// @desc    Upload single file (image or doc) and run AI verification
// @route   POST /api/upload
// @access  Public / Private
router.post('/', (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum allowed limit of 5MB',
          error: err.message
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
        error: err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed',
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        error: 'Missing file payload'
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const filePath = req.file.path;

    try {
      // Run AI verification with Hive
      const hiveResult = await verifyImageWithHive(filePath);

      // Check threshold and reject if needed
      if (!hiveResult.accepted) {
        // Delete temporary file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        let message = 'This image could not be verified as an authentic photograph.';
        if (hiveResult.aiGenerated) {
          message = 'AI-generated images are not accepted. Please upload an original photograph.';
        }

        return res.status(422).json({
          success: false,
          message
        });
      }

      // Success flow
      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        url: fileUrl,
        filePath: `/uploads/${req.file.filename}`,
        imageVerification: {
          checked: true,
          aiGeneratedScore: hiveResult.aiGeneratedScore,
          deepfakeScore: hiveResult.deepfakeScore,
          result: hiveResult.aiGenerated ? 'ai_generated' : (hiveResult.deepfake ? 'deepfake' : 'verified'),
          checkedAt: new Date()
        },
        data: {
          url: fileUrl,
          filePath: `/uploads/${req.file.filename}`,
          imageVerification: {
            checked: true,
            aiGeneratedScore: hiveResult.aiGeneratedScore,
            deepfakeScore: hiveResult.deepfakeScore,
            result: hiveResult.aiGenerated ? 'ai_generated' : (hiveResult.deepfake ? 'deepfake' : 'verified'),
            checkedAt: new Date()
          }
        }
      });

    } catch (apiError) {
      // Delete temporary file on verification error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const status = apiError.status || 503;
      return res.status(status).json({
        success: false,
        message: apiError.message || 'Image verification is temporarily unavailable. Please try again.'
      });
    }
  });
});

export default router;
