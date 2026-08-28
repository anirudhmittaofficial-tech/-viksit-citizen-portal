# Smart Civic Resolution Platform
## Comprehensive UI, UX & System Layout Design Specification

---

## 1. Executive Summary & Vision

The **Smart Civic Resolution Platform** is a modern, enterprise-grade public administration software suite engineered to bridge the gap between citizens and municipal government authorities. 

The platform provides a dual-portal architecture:
1. **Citizen Resolution Portal**: A clean, accessible web application empowering citizens to file location-aware civic grievances (e.g., water leakages, garbage overflows, street light outages, road potholes), attach site photo evidence, and track real-time resolution progress.
2. **Government / Admin Administration Portal**: A streamlined, professional, and trustworthy administration interface for municipal officials, department leads, and field inspectors to monitor resolution queues, assign field officers, update statuses, verify photo proof, and analyze municipal operations.

---

## 2. Global Design System & Visual Guidelines

### 2.1 Color Palette
The platform adheres to a modern, calm, and official government color system. Large, overwhelming, or aggressive red/orange/yellow backgrounds are intentionally avoided in favor of subtle pastel indicators and dark navy accents.

| Palette Role | Hex Code | Usage Context |
| :--- | :--- | :--- |
| **Primary Navy** | `#123B5D` | Top sticky navbar, primary buttons, major headings, branding |
| **Secondary Accent** | `#2563EB` | Interactive highlights, links, active indicators |
| **Background Surface** | `#F8FAFC` | Main application backdrop, slate container fill |
| **Card / Container Fill** | `#FFFFFF` | Content cards, data tables, modal dialog windows |
| **Primary Text** | `#172033` | Page titles, table headers, key content strings |
| **Secondary Text** | `#64748B` | Metadata, subtitles, timestamps, field labels |
| **Borders & Dividers** | `#E2E8F0` | Card borders, table gridlines, input outlines |

### 2.2 Status Color Mapping (Subtle Pastels)
| Status | Background | Text Color | Border Color | Concept / Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Submitted** | `#F1F5F9` | `#475569` | `#CBD5E1` | Newly logged by citizen |
| **Verified** | `#E0F2FE` | `#0369A1` | `#BAE6FD` | Reviewed by admin queue |
| **Assigned** | `#F0F5FF` | `#1D4ED8` | `#C7D2FE` | Assigned to department officer |
| **In Progress** | `#FFFBE6` | `#B45309` | `#FEF08A` | On-site resolution underway |
| **Resolved** | `#F0FDF4` | `#166534` | `#BBF7D0` | Issue resolved with photo proof |
| **Closed** | `#F8FAFC` | `#64748B` | `#E2E8F0` | Officially verified & archived |
| **Rejected** | `#FEF2F2` | `#991b1b` | `#FECACA` | Invalid or duplicate submission |

### 2.3 Typography Scale & Font Hierarchy
- **Font Family**: `Inter`, `Plus Jakarta Sans`, system-ui, sans-serif
- **Page Titles**: `24px – 28px` (Font Weight: `800`, Line Height: `1.2`)
- **Section Headers**: `18px – 20px` (Font Weight: `700`, Line Height: `1.3`)
- **Body & Table Text**: `14px – 15px` (Font Weight: `500/600`, Line Height: `1.5`)
- **Metadata & Subtitles**: `12px – 13px` (Font Weight: `500`, Line Height: `1.4`)

---

## 3. Government / Admin Portal Architecture

### 3.1 Top Navigation Bar Layout
The Government / Admin dashboard utilizes a fixed, sticky horizontal top navigation bar, eliminating bulky vertical sidebars to maximize vertical screen real estate for data tables and maps.

```
+-----------------------------------------------------------------------------------------------------------------------+
| 🏛 Smart Civic Resolution        Dashboard   Complaints   Departments   Officers   Notifications       🔔   👤 Admin  Logout |
|   Government Administration Portal                                                                                    |
+-----------------------------------------------------------------------------------------------------------------------+
```

- **Left Section**: Civic emblem (`🏛`), application name ("Smart Civic Resolution"), and subtitle ("Government Administration Portal").
- **Center Section**: Navigation items (`Dashboard`, `Complaints`, `Departments`, `Officers`, `Notifications`). Active routes feature a subtle `#123B5D` bottom border and `#F1F5F9` background highlight.
- **Right Section**: Real-time notification bell with unread badge counter, official profile trigger, and logout action button.
- **Responsiveness**: Automatically converts into a sleek hamburger menu on mobile/tablet viewports (< 860px).

---

### 3.2 Dashboard Main Page Wireframe & Sections

```
+-----------------------------------------------------------------------------------------------------------------------+
| Government Dashboard                                                                               [ 🔄 Refresh Data ] |
| Monitor and manage citizen complaints across municipal departments                                                    |
+-----------------------------------------------------------------------------------------------------------------------+
|                                                                                                                       |
|  +--------------------+   +--------------------+   +--------------------+   +--------------------+                        |
|  | TOTAL COMPLAINTS   |   | NEW                |   | IN PROGRESS        |   | RESOLVED           |                        |
|  | 4                  |   | 1                  |   | 1                  |   | 1                  |                        |
|  +--------------------+   +--------------------+   +--------------------+   +--------------------+                        |
|                                                                                                                       |
+-----------------------------------------------------------------------------------------------------------------------+
| Recent Complaints                                                    [ 🔍 Search... ] [ Category ▼ ] [ Status ▼ ]     |
| +-------------------------------------------------------------------------------------------------------------------+ |
| | Complaint ID   | Issue Title                 | Category      | Location          | Status      | Submitted | Action| |
| |----------------|-----------------------------|---------------|-------------------|-------------|-----------|-------| |
| | CMP-2026-00148 | Main Pipeline Water Leakage | Water Leakage | Aundh Ravet Road  | Verified    | 30 Jul    | View  | |
| | CMP-2026-00147 | Garbage Dump Overflow       | Garbage       | Central Market    | Resolved    | 30 Jul    | View  | |
| | CMP-2026-00146 | Street Light Fault          | Street Light  | Green Park Road   | Submitted   | 30 Jul    | View  | |
| +-------------------------------------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------------------------------+
| Needs Attention                                                                                                       |
| +-------------------------------------------------------------------------------------------------------------------+ |
| | [New Complaint] #CMP-2026-00148 - Main Pipeline Water Leakage | Aundh Ravet Road      [ View ] [ Assign Officer ] | |
| +-------------------------------------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Key Interactive Workflows & Modals

### 4.1 Complaint Details Modal (Two-Column View)
When an administrator clicks **View** on any complaint row, a comprehensive inspection dialog opens:
- **Left Column**:
  - Issue ID, Title, Category, and Description.
  - Reported Location, Exact Address, Coordinates, and Embedded Leaflet Map (`MapView`).
  - Citizen Verification info (Registered Resident Account, Contact Email).
- **Right Column**:
  - Site Evidence Images (Before & After Resolution Proof).
  - Status Progress Timeline (`ComplaintTimeline`).
  - Official Remarks & Comment Log (`onAddComment`).

### 4.2 Field Officer Assignment Workflow
- **Trigger**: Click **Assign Officer** on any unassigned ticket.
- **Form Fields**:
  1. **Department Select**: Roads, Electricity, Sanitation, Water & Drainage, Traffic, Parks.
  2. **Officer Name Select**: Dropdown list of verified field inspectors (e.g., Rajesh Kumar, Vikram Singh).
- **Feedback**: Instant inline success toast and real-time state synchronization via `assignOfficer()`.

### 4.3 Resolution Proof & Status Update Workflow
- **Trigger**: Click **Update Status**.
- **Form Fields**:
  1. **New Status Selection**: Submitted, Verified, Assigned, In Progress, Resolved, Closed, Rejected.
  2. **Update Remarks**: Text area for official resolution comments.
  3. **Resolution Proof Upload**: Image capture & file input powered by `ImageCaptureInput` and `uploadImageApi()`.

---

## 5. Summary of Frontend Engineering Standards

1. **Zero Breaking Backend Changes**: Maintains 100% compatibility with existing REST API endpoints, JWT authentication tokens, MongoDB models, and context hooks (`useAuth`, `useComplaints`).
2. **Dynamic Data Calculations**: Statistics cards dynamically compute values directly from actual state datasets.
3. **Accessibility & Usability**: Clean contrast ratios, legible typography, compact button targets, touch-friendly mobile layouts, and clear visual hierarchy.
