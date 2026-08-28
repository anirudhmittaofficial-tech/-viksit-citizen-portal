import './config/env.js';
import { query } from './config/db.js';
import { createUser } from './models/User.js';
import { createComplaint } from './models/Complaint.js';
import { createNotification } from './models/Notification.js';

const SEED_USERS = [
  {
    name: 'Aarav Sharma',
    email: 'citizen@civic.org',
    password: 'password123',
    role: 'citizen',
    phone: '+91 98765 00001',
    address: '452 Main Street, Ward 12'
  }
];

const INITIAL_COMPLAINTS = [
  {
    complaintId: 'CMP-2026-000145',
    title: 'Severe Deep Pothole on M.G. Road',
    category: 'Road Damage',
    description: 'Dangerous 2-foot wide pothole near Signal 4 causing heavy traffic slowdown and risk of motorcycle accidents during rainy hours.',
    location: 'Sector 14, M.G. Road Signal, Ward 12',
    coordinates: '18.5204° N, 73.8567° E',
    latitude: 18.5204,
    longitude: 73.8567,
    severity: 'High',
    status: 'In Progress',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    citizenName: 'Aarav Sharma',
    citizenEmail: 'citizen@civic.org',
    department: 'Roads Department',
    assignedOfficer: 'Rajesh Kumar (Senior Inspector)',
    expectedResolution: 'Within 24 Hours',
    timeline: [
      { status: 'Submitted', date: '2026-07-28 09:15 AM', note: 'Complaint logged successfully with GPS location.' },
      { status: 'Verified', date: '2026-07-28 10:00 AM', note: 'Ward Supervisor verified site photo and urgency.' },
      { status: 'Assigned', date: '2026-07-28 10:45 AM', note: 'Assigned to Roads Department Field Team.' },
      { status: 'In Progress', date: '2026-07-28 11:30 AM', note: 'Inspection team dispatched under Officer Rajesh Kumar.' }
    ],
    comments: [
      { author: 'Govt Department Officer', authorRole: 'government', text: 'Asphalt patching vehicle deployed to location.', date: '2026-07-28 11:35 AM' }
    ]
  },
  {
    complaintId: 'CMP-2026-000146',
    title: 'Street Light Transformer Fault & Total Blackout',
    category: 'Street Light',
    description: 'Five consecutive street poles are non-functional since Sunday night. Area is extremely dark creating safety issues for residents.',
    location: 'Green Park Housing Society Road, Ward 8',
    coordinates: '18.5312° N, 73.8441° E',
    latitude: 18.5312,
    longitude: 73.8441,
    severity: 'Critical',
    status: 'Submitted',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80',
    citizenName: 'Priya Nambiar',
    citizenEmail: 'priya.n@example.com',
    department: 'Electricity Department',
    assignedOfficer: 'Unassigned',
    expectedResolution: 'Within 48 Hours',
    timeline: [
      { status: 'Submitted', date: '2026-07-29 07:45 PM', note: 'Complaint auto-routed to Electricity Department.' }
    ]
  },
  {
    complaintId: 'CMP-2026-000147',
    title: 'Garbage Dump Overflow near Community Center',
    category: 'Garbage',
    description: 'Municipal trash bin overflowing onto the main sidewalk. Smells hazardous and blocking pedestrian pathway.',
    location: 'Central Market Square, Ward 15',
    coordinates: '18.5110° N, 73.8620° E',
    latitude: 18.5110,
    longitude: 73.8620,
    severity: 'Medium',
    status: 'Resolved',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    resolutionImageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb777b09?auto=format&fit=crop&w=600&q=80',
    citizenName: 'Karan Patel',
    citizenEmail: 'karan@example.com',
    department: 'Sanitation Department',
    assignedOfficer: 'Suresh Patil (Sanitation Lead)',
    expectedResolution: 'Resolved',
    resolvedAt: new Date('2026-07-27T16:00:00Z'),
    timeline: [
      { status: 'Submitted', date: '2026-07-26 08:00 AM', note: 'Complaint logged.' },
      { status: 'Verified', date: '2026-07-26 09:00 AM', note: 'Sanitation supervisor acknowledged ticket.' },
      { status: 'Assigned', date: '2026-07-26 09:30 AM', note: 'Assigned to Ward 15 Waste Management Crew.' },
      { status: 'In Progress', date: '2026-07-26 10:15 AM', note: 'Sanitation Truck #44 dispatched for cleanup.' },
      { status: 'Resolved', date: '2026-07-27 04:00 PM', note: 'Waste completely cleared and area disinfected.' }
    ]
  },
  {
    complaintId: 'CMP-2026-000148',
    title: 'Main Pipeline Burst & Water Leakage',
    category: 'Water Leakage',
    description: 'Pressurized water gushing from underground pipeline joint causing road erosion and clean water wastage.',
    location: 'Aundh Ravet Road, Ward 4',
    coordinates: '18.5601° N, 73.8031° E',
    latitude: 18.5601,
    longitude: 73.8031,
    severity: 'High',
    status: 'Verified',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
    citizenName: 'Aarav Sharma',
    citizenEmail: 'citizen@civic.org',
    department: 'Water Department',
    assignedOfficer: 'Vikram Singh (Hydraulics Tech)',
    expectedResolution: 'Within 24 Hours',
    timeline: [
      { status: 'Submitted', date: '2026-07-29 11:20 AM', note: 'Complaint logged.' },
      { status: 'Verified', date: '2026-07-29 12:05 PM', note: 'Water Department inspector confirmed valve replacement required.' }
    ]
  }
];

const NOTIFICATIONS_SEED = [
  {
    targetRole: 'citizen',
    recipientEmail: 'citizen@civic.org',
    title: 'Field Officer Assigned',
    message: 'Officer Rajesh Kumar has been assigned to your complaint #CMP-2026-000145.',
    type: 'assigned',
    complaintId: 'CMP-2026-000145'
  },
  {
    targetRole: 'citizen',
    recipientEmail: 'karan@example.com',
    title: 'Status Changed to Resolved',
    message: 'Complaint #CMP-2026-000147 has been updated to "Resolved".',
    type: 'resolved',
    complaintId: 'CMP-2026-000147'
  }
];

const seedData = async () => {
  try {
    console.log('🧹 Clearing existing database records from Supabase...');
    await query('TRUNCATE TABLE complaint_comments CASCADE');
    await query('TRUNCATE TABLE complaint_timelines CASCADE');
    await query('TRUNCATE TABLE notifications CASCADE');
    await query('TRUNCATE TABLE complaints CASCADE');
    await query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

    console.log('👤 Seeding default users (Citizen)...');
    const createdUsers = [];
    for (const u of SEED_USERS) {
      const user = await createUser(u);
      createdUsers.push(user);
    }

    const citizenUser = createdUsers.find(u => u.role === 'citizen');

    console.log('📋 Seeding complaints...');
    const complaintMapping = new Map();
    for (const c of INITIAL_COMPLAINTS) {
      const citizenId = c.citizenEmail === 'citizen@civic.org' && citizenUser ? citizenUser.id : null;
      
      const newComp = await createComplaint({
        ...c,
        citizen: citizenId
      });

      // Insert comments if they exist
      if (c.comments && Array.isArray(c.comments)) {
        for (const comm of c.comments) {
          await query(
            `INSERT INTO complaint_comments (complaint_id, author, author_role, text, date)
             VALUES ($1, $2, $3, $4, $5)`,
            [newComp.id, comm.author, comm.authorRole || 'citizen', comm.text, comm.date]
          );
        }
      }
      
      complaintMapping.set(c.complaintId, newComp.id);
    }

    console.log('🔔 Seeding notifications...');
    for (const n of NOTIFICATIONS_SEED) {
      const recipientId = n.recipientEmail === 'citizen@civic.org' && citizenUser ? citizenUser.id : null;
      await createNotification({
        ...n,
        recipient: recipientId
      });
    }

    console.log('✨ Database Seeded Successfully in Supabase!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
