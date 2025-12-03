# 🎓 AAAS Admin Dashboard - Quick Start Guide

## What's New?

A complete admin dashboard system has been added to manage student and lecturer registrations with an approval workflow.

## 🚀 Quick Start

### 1. Update Database Schema

Run the migration script to add approval fields to the users table:

```bash
cd "c:\Users\alkat\OneDrive - ump.edu.my\Bachelor's Degree\AAAS-Backend-API"
python migrate_admin_fields.py
```

Type `yes` when prompted. This will:
- Add `is_approved`, `approved_by`, and `approved_at` columns
- Auto-approve all existing users (so they can still login)
- Set up the approval workflow for new registrations

### 2. Start Backend Server

```bash
cd "c:\Users\alkat\OneDrive - ump.edu.my\Bachelor's Degree\AAAS-Backend-API"
uvicorn main:app --reload
```

Backend will run at: `http://127.0.0.1:8000`

### 3. Start Frontend

```bash
cd "c:\Users\alkat\OneDrive - ump.edu.my\Bachelor's Degree\Front_end\frontend\my-app"
npm start
```

Frontend will run at: `http://localhost:3000`

## 📊 Admin Dashboard Features

### Access Points

| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Main dashboard with statistics and charts |
| `/admin/pending-users` | Manage pending user approvals |

### Dashboard Statistics Cards

1. **👨‍🎓 Total Students** - Count of approved students
2. **👨‍🏫 Total Lecturers** - Count of approved lecturers
3. **📚 Total Classes** - Total number of classes
4. **⏳ Pending Approvals** - Users awaiting approval

### Visual Components

- **Bar Chart**: Shows user distribution by role (student/lecturer/admin)
- **Recent Registrations Table**: Lists the 7 most recent pending users
- **Interactive Cards**: Hover effects and responsive design

## 🔐 User Flow

### New User Registration

1. User registers at `/register`
2. Selects role: Student or Lecturer
3. Account created with status = "pending"
4. User **cannot login** until approved

### Admin Approval Process

1. Admin navigates to `/admin/dashboard`
2. Clicks "Pending Approvals" button
3. Reviews user details
4. Clicks "✓ Approve" or "✗ Reject"
5. User can now login (if approved)

### Login Behavior

- **Pending Users**: See message "Your account is pending approval"
- **Approved Users**: Login normally
- **Admins**: Can always login (bypass approval check)

## 🛠️ API Endpoints

### Admin Endpoints (NEW)

```
GET  /admin/statistics        - Dashboard statistics
GET  /admin/pending-users     - List pending registrations
POST /admin/approve-user      - Approve/reject user
GET  /admin/all-users         - List all approved users
```

### Example: Approve User

```bash
POST http://127.0.0.1:8000/admin/approve-user?admin_id=1
Content-Type: application/json

{
  "user_id": 5,
  "approved": true
}
```

## 🗃️ Database Schema Changes

### Updated Users Table

```sql
users (
  user_id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('student', 'lecturer', 'admin'),
  joined_at DATETIME,
  status VARCHAR(20),
  is_approved INT DEFAULT 0,          -- NEW
  approved_by INT,                     -- NEW
  approved_at DATETIME                 -- NEW
)
```

## 📁 New Files Created

### Backend
- `endpoints/admin.py` - Admin API endpoints
- `migrate_admin_fields.py` - Database migration script
- `ADMIN_DASHBOARD_GUIDE.md` - Detailed documentation

### Frontend
- `src/My_FYP/AdminDashboard.jsx` - Main dashboard component
- `src/My_FYP/PendingUsers.jsx` - User approval management

### Updated Files
- `models_db.py` - Added approval fields to User model
- `main.py` - Added admin router
- `endpoints/auth.py` - Added approval checks
- `App.js` - Added admin routes

## 🎨 Design

### Color Scheme
- **Primary**: Purple gradient (#667eea → #764ba2)
- **Students**: Blue (#1976d2)
- **Lecturers**: Orange (#f57c00)
- **Admins**: Purple (#7b1fa2)

### UI Elements
- Clean white cards with shadows
- Smooth hover transitions
- Responsive grid layout
- Custom bar chart (no external library needed)
- Modern, professional design

## ⚠️ Important Notes

### For Development
- Existing users are auto-approved during migration
- Admin ID currently passed as query parameter
- No JWT validation in current version

### For Production (TODO)
- [ ] Implement JWT-based authentication
- [ ] Add role-based access control
- [ ] Extract admin ID from JWT token
- [ ] Add audit logging
- [ ] Email notifications for approvals
- [ ] Secure admin endpoints with middleware

## 🧪 Testing

### Test Scenario 1: New Registration
```
1. Navigate to /register
2. Create account (student/lecturer)
3. Try to login → Should see "pending approval" message
4. Admin approves at /admin/pending-users
5. Login again → Success!
```

### Test Scenario 2: Admin Dashboard
```
1. Login as admin
2. Navigate to /admin/dashboard
3. Verify statistics display correctly
4. Check chart shows role distribution
5. View recent registrations
```

### Test Scenario 3: Bulk Approvals
```
1. Register 5 test users
2. Go to /admin/pending-users
3. Approve all users one by one
4. Verify dashboard statistics update
5. Confirm all can login
```

## 🐛 Troubleshooting

### Problem: Migration fails
**Solution**: Check database connection in `utils/database.py`

### Problem: Statistics show zeros
**Solution**: Ensure users have `is_approved = 1` in database

### Problem: Approval doesn't work
**Solution**: Check browser console and backend logs for errors

### Problem: Chart not displaying
**Solution**: Verify backend returns `chart_data` with correct format

## 📞 Support

For detailed documentation, see:
- `ADMIN_DASHBOARD_GUIDE.md` - Complete feature documentation
- `REFACTORING_GUIDE.md` - Backend architecture guide

## 🎯 Next Steps

Consider implementing:
1. Email notifications when users are approved/rejected
2. Bulk approval functionality
3. User search and filtering on pending page
4. Export user lists to CSV
5. Advanced analytics dashboard
6. Activity logs for audit trail
7. User profile management
8. Password reset functionality

---

**Created**: December 2025  
**Version**: 1.0  
**Status**: ✅ Ready for Development Testing
