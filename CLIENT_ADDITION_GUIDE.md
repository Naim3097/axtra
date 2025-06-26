# Client Addition Guide for Axtra System

## Overview
This guide provides step-by-step instructions for adding new clients to the Axtra content management system. Follow this guide to ensure new clients have the same functionality as existing clients.

---

## Prerequisites

- [ ] Client name and display name
- [ ] Client email address
- [ ] Client domain (if different from email domain)
- [ ] Desired content deliverables structure
- [ ] Optional: Google Sheets URL for client planning

---

## Step 1: Update Primary Client Configuration

### File: `components/AxtraClientLogics.js`

#### A. Add to CLIENT_CONFIG object (around line 25-120)

```javascript
export const CLIENT_CONFIG = {
  // ...existing clients...
  'clientdomain.com': {
    name: 'Client Display Name',
    deliverables: [
      // Option 1: Simple static content (like Enfrasys)
      ...Array.from({ length: 12 }, (_, i) => ({
        id: `C${i + 1}`,
        title: `Content Piece ${i + 1}`,
        deadline: `2025-07-${String(2 + i * 2).padStart(2, '0')}`,
        directionDeadline: `2025-07-01`,
      })),
      
      // Option 2: Mixed content types (like AceTeam Networks)
      // ...Array.from({ length: 4 }, (_, i) => ({
      //   id: `C${i + 1}`,
      //   title: `Static Visual ${i + 1}`,
      //   deadline: `2025-07-${String(2 + i * 2).padStart(2, '0')}`,
      //   directionDeadline: `2025-07-01`,
      // })),
      // ...Array.from({ length: 2 }, (_, i) => ({
      //   id: `V${i + 1}`,
      //   title: `Video Reel ${i + 1}`,
      //   deadline: `2025-07-${String(14 + i * 3).padStart(2, '0')}`,
      //   directionDeadline: `2025-07-01`,
      // })),
    ],
  },
};
```

#### B. Add to EMAIL_TO_DOMAIN_MAP (around line 255)

```javascript
export const EMAIL_TO_DOMAIN_MAP = {
  // ...existing mappings...
  'contact@clientdomain.com': 'clientdomain.com',
  // OR for Gmail accounts:
  // 'clientname@gmail.com': 'clientdomain.com',
};
```

---

## Step 2: Update Upload Report Client Options

### File: `app/upload-report/page.js` (around line 11-18)

```javascript
const clientOptions = [
  // ...existing clients...
  { label: 'Client Display Name', email: 'contact@clientdomain.com' },
];
```

---

## Step 3: Update Agency Content Planner

### File: `app/agency-content-planner/page.js` (around line 25-75)

```javascript
const CLIENTS = [
  // ...existing clients...
  {
    name: 'Client Display Name',
    email: 'contact@clientdomain.com',
    sheet: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID', // Optional
    deliverables: [
      // Copy same deliverables structure from CLIENT_CONFIG
      ...Array.from({ length: 12 }, (_, i) => ({
        id: `C${i + 1}`,
        title: `Content Piece ${i + 1}`,
        deadline: `2025-07-${String(2 + i * 2).padStart(2, '0')}`,
      })),
    ],
  },
];
```

---

## Step 4: Update Client Planner Configuration

### File: `app/planner/page.js` (around line 18-50)

```javascript
const CLIENT_CONFIG = {
  // ...existing clients...
  'clientdomain.com': {
    sheet: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID', // Optional
    deliverables: [
      // Copy same deliverables as above
      ...Array.from({ length: 12 }, (_, i) => ({
        id: `C${i + 1}`,
        title: `Content Piece ${i + 1}`,
        deadline: `2025-07-${String(2 + i * 2).padStart(2, '0')}`,
      })),
    ],
  },
};
```

---

## Step 5: Update Agency Workspace (Optional)

### File: `app/axtraspace/page.js` (around line 64-68)

**For Google Sheets integration:**

```javascript
const sheetLinks = {
  // ...existing links...
  'clientdomain.com': 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID',
};
```

### File: `app/axtraspace/page.js` (around line 50-60)

**For fallback email mapping:**

```javascript
// Fall back to the hardcoded mapping if not found (for backward compatibility)
if (!clientEmail) {
  if (domain === 'enfrasys.com') {
    clientEmail = 'marketing@enfrasys.com';
  } else if (domain === 'tropicorfoods.com') {
    clientEmail = 'firas.hammour@tropicorfoods.com';
  // ...existing mappings...
  } else if (domain === 'clientdomain.com') {
    clientEmail = 'contact@clientdomain.com';
  }
}
```

---

## Step 6: Content Type Reference

### Available Content Types:

- **Static Visuals**: `C1`, `C2`, etc. - `Static Visual Post 1`, `Static Visual Post 2`
- **Video Reels**: `V1`, `V2`, etc. - `Video Reel 1`, `Video Reel 2`
- **Social Media Posts**: `P1`, `P2`, etc. - `Social Media Post 1`, `Social Media Post 2`
- **Blog Posts**: `B1`, `B2`, etc. - `Blog Post 1`, `Blog Post 2`
- **Google Ads**: `G1`, `G2`, etc. - `Google Ad 1`, `Google Ad 2`

### Deadline Format:
- Use format: `YYYY-MM-DD` (e.g., `2025-07-15`)
- Space deadlines appropriately (every 2-3 days recommended)
- Set direction deadline before first content deadline

---

## Step 7: Firebase Account Creation

### After code configuration, create the client's Firebase account:

#### Option A: Using Signup Page (Recommended)
1. Visit `/signup`
2. Enter client email and password
3. Account created automatically

#### Option B: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select "nexova-firebase" project
3. Go to Authentication → Users
4. Click "Add user"
5. Enter email and password

---

## Step 8: Verification Checklist

After implementation, verify the following:

### Client Access:
- [ ] Client can login successfully
- [ ] Client redirects to `/axtrapost` (client workspace)
- [ ] Client sees all configured deliverables
- [ ] Content workflow functions (directions, drafts, feedback)

### Agency Access:
- [ ] Client appears in agency dropdown at `/axtraspace`
- [ ] Agency can manage client's content
- [ ] Client appears in upload report tool
- [ ] Client appears in agency content planner

### Firebase Integration:
- [ ] Client documents create in `contentSubmissions`
- [ ] Client documents create in `contentDirections`
- [ ] Client documents create in `revisions`
- [ ] File uploads work for client
- [ ] Billing/reports work for client

---

## Common Patterns by Client Type

### Simple Content Client (Like Enfrasys)
```javascript
deliverables: Array.from({ length: 15 }, (_, i) => ({
  id: `C${i + 1}`,
  title: `Static Visual Post ${i + 1}`,
  deadline: `2025-07-${String(2 + i * 2).padStart(2, '0')}`,
  directionDeadline: `2025-07-01`,
}))
```

### Mixed Content Client (Like AceTeam Networks)
```javascript
deliverables: [
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `C${i + 1}`,
    title: `Static Visual ${i + 1}`,
    deadline: `2025-07-${String(2 + i * 2).padStart(2, '0')}`,
    directionDeadline: `2025-07-01`,
  })),
  ...Array.from({ length: 2 }, (_, i) => ({
    id: `V${i + 1}`,
    title: `Video Reel ${i + 1}`,
    deadline: `2025-07-${String(14 + i * 3).padStart(2, '0')}`,
    directionDeadline: `2025-07-01`,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `B${i + 1}`,
    title: `Blog Post ${i + 1}`,
    deadline: `2025-07-${String(20 + i * 2).padStart(2, '0')}`,
    directionDeadline: `2025-07-01`,
  })),
]
```

---

## Troubleshooting

### Issue: Client can't see deliverables
- **Check**: CLIENT_CONFIG domain matches email domain
- **Check**: EMAIL_TO_DOMAIN_MAP includes client email

### Issue: Agency can't see client
- **Check**: Client added to all dropdown arrays
- **Check**: Client email format matches between files

### Issue: Firebase permission errors
- **Check**: Client email is lowercase in all documents
- **Check**: Document ID format: `clientemail_contentid`

### Issue: File upload failures
- **Check**: Firebase Storage rules allow authenticated users
- **Check**: Client has proper Firebase account

---

## Quick Reference Template

```javascript
// Template for new client addition:

// 1. CLIENT_CONFIG
'newclient.com': {
  name: 'New Client Name',
  deliverables: Array.from({ length: 10 }, (_, i) => ({
    id: `C${i + 1}`,
    title: `Content ${i + 1}`,
    deadline: `2025-07-${String(2 + i * 2).padStart(2, '0')}`,
    directionDeadline: `2025-07-01`,
  })),
},

// 2. EMAIL_TO_DOMAIN_MAP
'admin@newclient.com': 'newclient.com',

// 3. clientOptions (upload-report)
{ label: 'New Client Name', email: 'admin@newclient.com' },

// 4. CLIENTS array (agency-content-planner)
{
  name: 'New Client Name',
  email: 'admin@newclient.com',
  sheet: '',
  deliverables: [...] // Same as CLIENT_CONFIG
},

// 5. CLIENT_CONFIG (planner)
'newclient.com': {
  sheet: '',
  deliverables: [...] // Same as above
},
```

---

## Notes

- **Order matters**: Always configure code BEFORE creating Firebase account
- **Consistency**: Keep deliverables structure identical across all files
- **Testing**: Test both client and agency access after implementation
- **Backup**: Commit changes to version control before testing
- **Documentation**: Update this guide if new patterns emerge

---

**Last Updated**: June 26, 2025
**Version**: 1.1
**Next Review**: When adding 10th client or system changes

---

## Implementation Log

### BYKI Client - June 26, 2025 ✅ COMPLETED
- **Client**: BYKI
- **Email**: admin@byki.com
- **Domain**: byki.com
- **Content**: 12 Static Visual Posts (C1-C12)
- **Deadlines**: July 2-24, 2025 (every 2 days)
- **Direction Deadline**: July 1, 2025
- **Status**: ✅ Code implemented, Firebase account created
- **Implementation Time**: ~10 minutes
- **Issues**: None

**Files Modified:**
- ✅ `components/AxtraClientLogics.js` - CLIENT_CONFIG + EMAIL_TO_DOMAIN_MAP
- ✅ `app/upload-report/page.js` - clientOptions array
- ✅ `app/agency-content-planner/page.js` - CLIENTS array
- ✅ `app/planner/page.js` - CLIENT_CONFIG
- ✅ `app/axtraspace/page.js` - fallback email mapping

**Next Steps for BYKI:**
- [ ] Test client login and deliverables view
- [ ] Test agency access to BYKI content
- [ ] Optional: Add Google Sheets integration
- [ ] Conduct full workflow testing
