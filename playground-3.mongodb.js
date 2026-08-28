// MongoDB Playground - Smart Civic Resolution Platform
// Database: smart_civic_db
// Collection: complaints

use('smart_civic_db');

// Safe test query: Find up to 10 complaints
db.complaints.find().limit(10);

// Count total complaint documents
db.complaints.countDocuments();
