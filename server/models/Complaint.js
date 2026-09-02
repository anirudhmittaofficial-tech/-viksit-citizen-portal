import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    date: {
      type: String,
      default: () => new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
    },
    note: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true
    },
    authorRole: {
      type: String,
      enum: ['citizen', 'admin'],
      default: 'citizen'
    },
    text: {
      type: String,
      required: true
    },
    date: {
      type: String,
      default: () => new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
    }
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please add a complaint title'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select a complaint category'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description of the issue']
    },
    location: {
      type: String,
      required: [true, 'Please specify the location']
    },
    coordinates: {
      type: String,
      default: ''
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Pending', 'Rejected'],
      default: 'Submitted'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    resolutionImageUrl: {
      type: String,
      default: ''
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    citizenName: {
      type: String,
      default: 'Anonymous Citizen'
    },
    citizenEmail: {
      type: String,
      default: 'citizen@civic.org'
    },
    department: {
      type: String,
      required: true
    },
    assignedOfficer: {
      type: String,
      default: 'Unassigned'
    },
    expectedResolution: {
      type: String,
      default: 'Within 48 Hours'
    },
    timeline: [timelineSchema],
    comments: [commentSchema],
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
