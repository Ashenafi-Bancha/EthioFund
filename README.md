# 🌍 EthioFund — Community Crowdfunding Platform

> A PERN Stack web-based crowdfunding platform enabling Ethiopians to raise funds for medical, educational, funeral, emergency, and community initiatives with secure Chapa payment gateway integration.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Project](#-running-the-project)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [Features](#-features)
- [Team & Contribution](#-team--contribution)

---

## 🎯 Project Overview

**EthioFund** is a full-stack crowdfunding platform designed for the Ethiopian community. The platform allows:

- **Donors** to browse campaigns, donate via Chapa payment gateway, and track donation history
- **Campaign Organizers** to create campaigns, post updates, request fund withdrawals
- **Admins** to manage campaigns, verify withdrawals, monitor platform activity, generate reports
- **Guests** to view campaigns and share them on social media

### Key Features

✅ User authentication with JWT (7-day expiry)  
✅ Role-based access control (donor, organizer, admin)  
✅ Campaign management (create, approve, reject, suspend)  
✅ Chapa payment gateway integration (test mode)  
✅ Gemini AI-powered comment moderation  
✅ Activity logging for audit trail  
✅ Real-time campaign updates  
✅ Withdrawal request management  
✅ Platform analytics & reporting  
✅ Cloudflare Tunnel for webhook testing  

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** React 
- **UI Library:** Shadcn/ui (Radix UI components)
- **Styling:** Tailwind CSS 4.1.12
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** React Router 

### **Backend**
- **Runtime:** Node.js 16+
- **Framework:** Express.js 5.2.1
- **Language:** TypeScript
- **Database Driver:** pg (PostgreSQL) 8.20.0
- **Authentication:** JWT (jsonwebtoken 9.0.3)
- **Password Hashing:** bcryptjs 3.0.3
- **Validation:** express-validator 7.3.2
- **File Uploads:** multer 2.1.1
- **Security:** Helmet 8.1.0
- **CORS:** cors 2.8.6
- **HTTP Requests:** axios 1.16.0
- **Logging:** morgan 1.10.1
- **Utilities:** uuid 14.0.0, dotenv 17.4.2

### **Database**
- **DBMS:** PostgreSQL 18
- **Connection Pool:** pg (node-postgres)
- **Tables:** 11 (users, campaigns, donations, payments, comments, withdrawals, etc.)
- **Features:** Foreign keys, constraints, indexes, cascading deletes

### **Payment Gateway**
- **Provider:** Chapa (Ethiopian payment provider)
- **Mode:** Test mode with test cards
- **Integration:** API-based with idempotent verification

### **DevOps & Tools**
- **Package Manager:** pnpm (frontend & backend)
- **Version Control:** Git
- **Tunneling:** Cloudflare Tunnel (for webhook testing)
- **Development Server:** Vite (frontend), tsx watch (backend)

---

## 📁 Project Structure

```
ethiofund/
├── 📂 backend/                           # Node.js Express API
│   ├── 📄 package.json                   # Backend dependencies
│   ├── 📄 tsconfig.json                  # TypeScript configuration
│   ├── 📄 eslint.config.mjs              # ESLint configuration
│   ├── 📄 .env                           # Environment variables 
│   ├── 📄 .env.example                   # Environment template
│   │
│   ├── 📂 src/
│   │   ├── 📄 server.ts                  # Express server entry point
│   │   ├── 📄 app.ts                     # Express app setup
│   │   │
│   │   ├── 📂 config/
│   │   │   ├── 📄 db.ts                  # PostgreSQL connection pool
│   │   │   └── 📄 env.ts                 # Environment variables
│   │   │
│   │   ├── 📂 middleware/
│   │   │   ├── 📄 auth.ts                # JWT verification
│   │   │   ├── 📄 authorize.ts           # Role-based access control
│   │   │   ├── 📄 errorHandler.ts        # Global error handler
│   │   │   └── 📄 activityLogger.ts      # Activity logging
│   │   │
│   │   ├── 📂 modules/                   # Feature modules 
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── campaigns/
│   │   │   │   ├── campaigns.routes.ts
│   │   │   │   ├── campaigns.controller.ts
│   │   │   │   └── campaigns.service.ts
│   │   │   ├── donations/
│   │   │   ├── payments/
│   │   │   ├── comments/
│   │   │   ├── withdrawals/
│   │   │   ├── admin/
│   │   │   ├── reports/
│   │   │   └── users/
│   │   │
│   │   ├── 📂 types/
│   │   │   └── 📄 express.d.ts           # Express type augmentation
│   │   │
│   │   └── 📂 utils/
│   │       └── 📄 validators.ts          # Shared validators
│   │
│   └── 📂 database/
│       ├── 📄 schema.sql                 # Database table definitions
│       └── 📄 seed.sql                   # Test data
│
├── 📂 frontend/                          # React + Vite application
│   ├── 📄 package.json                   # Frontend dependencies
│   ├── 📄 vite.config.ts                 # Vite configuration
│   ├── 📄 tailwind.config.ts             # Tailwind CSS config
│   ├── 📄 postcss.config.mjs             # PostCSS configuration
│   ├── 📄 index.html                     # HTML entry point
│   │
│   └── 📂 src/
│       ├── 📄 main.tsx                   # React app entry point
│       ├── 📂 app/
│       │   ├── 📄 App.tsx                # Main app component
│       │   ├── 📂 components/            # React components (40+)
│       │   │   ├── Home.tsx
│       │   │   ├── CampaignListing.tsx
│       │   │   ├── CampaignDetail.tsx
│       │   │   ├── AuthPage.tsx
│       │   │   ├── DonateModal.tsx
│       │   │   ├── EnhancedDonateModal.tsx
│       │   │   ├── PaymentSuccess.tsx    # Chapa callback
│       │   │   ├── PaymentFailed.tsx     # Chapa callback
│       │   │   ├── DonorDashboard.tsx
│       │   │   ├── OrganizerDashboard.tsx
│       │   │   ├── AdminDashboard.tsx
│       │   │   ├── CreateCampaign.tsx
│       │   │   ├── WithdrawalRequest.tsx
│       │   │   ├── Navigation.tsx
│       │   │   ├── Footer.tsx
│       │   │   └── ... (UI components)
│       │   │
│       │   ├── 📂 context/
│       │   │   └── 📄 AuthContext.tsx    # Authentication context & hooks
│       │   │
│       │   ├── 📂 hooks/
│       │   │   ├── 📄 useCampaigns.ts
│       │   │   ├── 📄 useDonations.ts
│       │   │   ├── 📄 useComments.ts
│       │   │   └── ... (custom hooks)
│       │   │
│       │   ├── 📂 lib/
│       │   │   └── 📄 api.ts            # Axios instance & API calls
│       │   │
│       │   ├── 📂 types/
│       │   │   └── 📄 auth.ts           # TypeScript types
│       │   │
│       │   └── 📂 styles/
│       │       ├── 📄 globals.css
│       │       ├── 📄 index.css
│       │       └── 📄 default_theme.css
```     │
        └──README.md

---

## ✅ Prerequisites

Before running the project, ensure you have installed:

### **System Requirements**
- **Node.js:** 16.x or higher
- **PostgreSQL:** 12.x or higher (version 18 recommended)
- **npm/pnpm:** Latest version (pnpm 8+)
- **Git:** For version control
- **Cloudflare Tunnel:** For webhook testing (optional but recommended)

### **Verify Installation**
```bash
# Check Node.js
node --version          # Should be v16.0.0 or higher

# Check PostgreSQL
psql --version          # Should be 12 or higher

# Check pnpm
pnpm --version          # Should be 8.0.0 or higher
```

---

## 🚀 Installation & Setup

### **Step 1: Clone or Download Project**

```bash
cd c:\Users\YourUsername\Desktop
# Project is already at: c:\Users\Degu\Desktop\ethiofund
```

### **Step 2: Backend Setup**

#### 2.1 Install Dependencies
```bash
cd c:\Users\Degu\Desktop\ethiofund\backend
pnpm install
```

#### 2.2 Create Environment File
Create `.env` file in `backend/` folder:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ethiofund_db
DB_USER=ethiofund_user
DB_PASSWORD=ethiofund_pass

# Authentication
JWT_SECRET=ethiofund_super_secret_key_change_in_production_12345
JWT_EXPIRES_IN=7d

# Chapa Payment Gateway (Test Mode)
CHAPA_SECRET_KEY=CHASECK_TEST-qmirV56Qyr2jdZKfOOoAkupIxkR2kNib
CHAPA_PUBLIC_KEY=CHAPUBK_TEST-YbysTtHQTXaHzIYD1D5rkUDswlpSJI3n
CHAPA_ENCRYPTION_KEY=ex2lRdsJKdPNZ4alJAiCt4BF
CHAPA_BASE_URL=https://api.chapa.co/v1

# Gemini AI (Optional - for comment moderation)
GEMINI_API_KEY=your_gemini_api_key_here

# URLs
CLIENT_URL=http://localhost:5173
SERVER_URL=https://your-cloudflare-tunnel-url.trycloudflare.com
```

**⚠️ Important Notes:**
- Change `JWT_SECRET` to a secure random string in production
- `SERVER_URL` should be your Cloudflare Tunnel URL when testing Chapa webhooks
- For local testing without Chapa, use `SERVER_URL=http://localhost:5000`

### **Step 3: Frontend Setup**

#### 3.1 Install Dependencies
```bash
cd c:\Users\Degu\Desktop\ethiofund\frontend
pnpm install
```

#### 3.2 Environment Configuration (if needed)
Frontend automatically uses `http://localhost:5000/api` for local development.

### **Step 4: Database Setup**

#### 4.1 Verify PostgreSQL is Running
```bash
# Check if PostgreSQL service is running
Get-Service PostgreSQL*

# Output should show: Status = Running
```

#### 4.2 Create Database and User (First Time Only)
```bash
# Open PostgreSQL command line
psql -U postgres

# Execute inside psql:
CREATE DATABASE ethiofund_db;
CREATE USER ethiofund_user WITH PASSWORD 'ethiofund_pass';
ALTER ROLE ethiofund_user SET client_encoding TO 'utf8';
ALTER ROLE ethiofund_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE ethiofund_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE ethiofund_db TO ethiofund_user;
\q
```

#### 4.3 Apply Database Schema
```bash
# From project root or backend folder
psql -U ethiofund_user -d ethiofund_db -f backend/database/schema.sql

# You will be prompted for password: ethiofund_pass
```

**Expected Output:**
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
... (multiple table creation notices)
```

#### 4.4 (Optional) Seed Test Data
```bash
psql -U ethiofund_user -d ethiofund_db -f backend/database/seed.sql
```

---

## 🏃 Running the Project

### **Option 1: Run All Services (Recommended for Testing)**

#### Terminal 1: Start PostgreSQL (if not running as service)
```bash
# Usually runs as Windows service, just verify:
Get-Service PostgreSQL*
```

#### Terminal 2: Start Backend Server
```bash
cd c:\Users\Degu\Desktop\ethiofund\backend
pnpm dev
```

**Expected Output:**
```
EthioFund backend running on port 5000
PostgreSQL connected successfully
```

#### Terminal 3: Start Frontend Server
```bash
cd c:\Users\Degu\Desktop\ethiofund\frontend
pnpm dev
```

**Expected Output:**
```
VITE v6.3.5 ready in 1023 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### Terminal 4: Start Cloudflare Tunnel (for Chapa webhook testing)
```bash
# Download from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
cloudflared tunnel --url http://localhost:5000
```

**Expected Output:**
```
Your quick tunnel has been created! Visit it at:
https://abc-tunnel-1234.trycloudflare.com
```

**Update .env with this URL:**
```env
SERVER_URL=https://abc-tunnel-1234.trycloudflare.com
```

Then restart the backend.

---

## 📊 Database Setup

### **Database Credentials**
| Setting | Value |
|---------|-------|
| Host | localhost |
| Port | 5432 |
| Database | ethiofund_db |
| User | ethiofund_user |
| Password | ethiofund_pass |

### **Tables Created**
| Table | Purpose |
|-------|---------|
| `users` | User accounts (donors, organizers, admins) |
| `admins` | Admin access levels |
| `campaigns` | Campaign listings |
| `campaign_media` | Campaign images/videos |
| `campaign_updates` | Campaign progress updates |
| `milestones` | Campaign fundraising milestones |
| `donations` | Donation records |
| `transactions` | Payment transactions (tx_ref from Chapa) |
| `payments` | Payment metadata |
| `comments` | Campaign comments with moderation |
| `withdrawals` | Organizer withdrawal requests |
| `reports` | Generated analytics reports |
| `activity_logs` | Audit trail of all actions |

### **Connect to Database**
```bash
psql -U ethiofund_user -d ethiofund_db

# View all tables
\dt

# View schema of a table
\d campaigns

# Exit
\q
```

---

## 🔌 API Documentation

### **Base URL**
- **Local Development:** `http://localhost:5000/api`
- **Production:** Use your deployed backend URL

### **API Endpoints**

#### **Authentication** (`/api/auth`)
```http
POST   /auth/register           Register new user
POST   /auth/login              Login with email/password
POST   /auth/logout             Logout (frontend deletes token)
```

#### **Campaigns** (`/api/campaigns`)
```http
GET    /campaigns               List all approved campaigns
GET    /campaigns/:id           Get campaign details
POST   /campaigns               Create new campaign (organizer only)
PUT    /campaigns/:id           Update campaign (owner only)
POST   /campaigns/:id/updates   Post campaign update
GET    /campaigns/:id/updates   Get campaign updates
PATCH  /campaigns/:id/approve   Approve campaign (admin only)
PATCH  /campaigns/:id/reject    Reject campaign (admin only)
```

#### **Donations** (`/api/donations`)
```http
GET    /donations/my            Get my donations (authenticated)
GET    /donations/campaign/:id  Get campaign donations
```

#### **Payments** (`/api/payments`)
```http
POST   /payments/initialize     Start payment process
GET    /payments/verify/:tx_ref Chapa callback redirect
POST   /payments/webhook        Chapa webhook handler
```

#### **Comments** (`/api/comments`)
```http
POST   /comments                Add comment to campaign
GET    /comments/campaign/:id   Get campaign comments
```

#### **Withdrawals** (`/api/withdrawals`)
```http
POST   /withdrawals             Request withdrawal (organizer)
GET    /withdrawals/my          Get my withdrawals (organizer)
GET    /withdrawals/pending     Get pending withdrawals (admin)
PATCH  /withdrawals/:id/approve Approve withdrawal (admin)
PATCH  /withdrawals/:id/reject  Reject withdrawal (admin)
```

#### **Admin** (`/api/admin`)
```http
GET    /admin/dashboard         Admin dashboard stats
GET    /admin/users             Get all users
PATCH  /admin/users/:id/suspend Suspend user
PATCH  /admin/users/:id/activate Activate user
GET    /admin/campaigns         Get all campaigns
```

#### **Reports** (`/api/reports`)
```http
GET    /reports?type=campaign   Campaign report
GET    /reports?type=donation   Donation report
GET    /reports?type=user       User report
GET    /reports?type=financial  Financial report
```

#### **Users** (`/api/users`)
```http
GET    /users/me                Get current user profile
PUT    /users/me                Update profile
```

---

## 🎨 Features

### **For Donors**
✅ Browse active campaigns by category  
✅ View detailed campaign information and progress  
✅ Donate securely via Chapa payment gateway  
✅ View donation history and receipt  
✅ Leave comments on campaigns  
✅ Share campaigns on social media  
✅ Track campaign updates  

### **For Campaign Organizers**
✅ Create campaigns with goal amount and category  
✅ Upload campaign images/videos  
✅ Post campaign updates to backers  
✅ View real-time donation progress  
✅ Request fund withdrawal  
✅ View withdrawal status  
✅ Respond to donor comments  

### **For Admins**
✅ View platform dashboard (stats overview)  
✅ Approve/reject pending campaigns  
✅ Suspend/reactivate campaigns  
✅ Manage user accounts (suspend/activate)  
✅ Review and approve/reject withdrawal requests  
✅ Generate campaign, donation, user, financial reports  
✅ View activity logs for audit trail  

### **AI-Powered Features**
✅ Gemini AI comment moderation  
✅ Automatic classification (approved/pending review/rejected)  
✅ Graceful fallback if API unavailable  

### **Payment Features**
✅ Chapa payment gateway integration  
✅ Test mode with test credit cards  
✅ Idempotent payment verification (no double-crediting)  
✅ Webhook handling for payment updates  
✅ Cloudflare Tunnel support for local testing  

---

## 👥 Testing the Platform

### **Test User Accounts**
After running `seed.sql`, you have:

| Email | Password | Role |
|-------|----------|------|
| admin@ethiofund.com | Admin@1234 | Admin |
| organizer1@email.com | Organizer@1234 | Organizer |
| donor1@email.com | Donor@1234 | Donor |

### **Test Chapa Payment**
1. Login as donor
2. Open a campaign
3. Click "Donate Now"
4. Fill donation form
5. Use test card: **5200828282828282**
6. Month/Year: Any future date
7. CVC: Any 3 digits
8. Click Pay
9. Should redirect to success or failure page

### **API Testing**
Use VS Code REST Client or Postman to test endpoints:

**Example: Register new user**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "full_name": "Test User",
  "email": "test@example.com",
  "phone_number": "0901234567",
  "password": "Password@1234",
  "role": "donor"
}
```

**Example: Create campaign (as organizer)**
```http
POST http://localhost:5000/api/campaigns
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "title": "Medical Campaign",
  "description": "Help Ahmed's surgery",
  "goal_amount": 50000,
  "category": "medical"
}
```

---

## 📚 Project Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| **README.md** | Root | Project overview (this file) |
| **ARCHITECTURE.md** | backend/ | Backend architecture details |
| **STRUCTURE_CLEANUP_SUMMARY.md** | backend/ | Module-based structure guide |
| **copilot-prompt.md** | Root | Complete project specification |
| **LOCAL_SETUP_GUIDE.md** | frontend/ | Frontend setup instructions |

---

## 🔐 Security Features

✅ **Password Security:** bcryptjs hashing (12 salt rounds)  
✅ **API Security:** JWT authentication with 7-day expiry  
✅ **Authorization:** Role-based access control (RBAC)  
✅ **Input Validation:** express-validator on all endpoints  
✅ **CORS:** Configured for frontend origin only  
✅ **Security Headers:** Helmet middleware enabled  
✅ **Database Security:** Foreign keys, constraints, cascading deletes  
✅ **Secrets:** Never hardcoded (all in .env)  
✅ **Activity Logging:** Audit trail for all actions  
✅ **Payment Security:** Idempotent verification to prevent fraud  

---

## 🐛 Troubleshooting

### **Backend Won't Start**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed (replace PID)
taskkill /PID 12345 /F

# Restart backend
pnpm dev
```

### **PostgreSQL Connection Error**
```bash
# Verify PostgreSQL is running
Get-Service PostgreSQL*

# Check credentials in .env
# Ensure database and user exist
psql -U ethiofund_user -d ethiofund_db
```

### **Frontend Can't Connect to Backend**
```bash
# Verify backend is running on port 5000
curl http://localhost:5000/api/health

# Check CORS in backend/src/app.ts
# Should allow http://localhost:5173
```

### **Chapa Payment Not Working**
```bash
# Verify Cloudflare Tunnel is running
cloudflared tunnel --url http://localhost:5000

# Update SERVER_URL in .env with tunnel URL
# Update Chapa dashboard webhook URL

# Restart backend
pnpm dev
```

### **Clear Build Artifacts**
```bash
# Frontend
cd frontend
rm -r dist node_modules
pnpm install

# Backend
cd backend
rm -r dist node_modules
pnpm install
```

---

## 📝 Git Workflow

### **Clone Repository**
```bash
git clone <repository-url>
cd ethiofund
```

### **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

### **Commit Changes**
```bash
git add .
git commit -m "Add your descriptive message"
```

### **Push to Remote**
```bash
git push origin feature/your-feature-name
```

### **Create Pull Request**
- Go to GitHub/GitLab repository
- Create PR from your branch
- Add description
- Request review

---

## 🎓 Learning Resources

- **React Documentation:** https://react.dev
- **Express.js Guide:** https://expressjs.com
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **JWT Tokens:** https://jwt.io
- **TypeScript:** https://www.typescriptlang.org/docs

---

## 👨‍💼 Team & Contribution

### **Project Roles**
- **Product Manager:** Define requirements and priorities
- **Frontend Developers:** Build React UI components
- **Backend Developers:** Build Express API and services
- **Database Administrator:** Manage PostgreSQL schema
- **QA Testers:** Test features and report bugs
- **DevOps Engineer:** Deploy and maintain infrastructure

### **How to Contribute**
1. Create a feature branch
2. Make your changes
3. Commit with clear messages
4. Push to remote
5. Create pull request with description
6. Wait for code review
7. Address feedback if any
8. Merge to main branch

### **Code Style**
- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write descriptive variable names
- Add comments for complex logic
- Keep functions small and focused

---

## 📞 Support

For questions or issues:
1. Check documentation files (ARCHITECTURE.md, README.md)
2. Review error messages carefully
3. Check browser console for frontend errors
4. Check terminal output for backend errors
5. Contact project maintainers
6. Create GitHub issue with details

---

## 📄 License

This project is confidential and intended for evaluation only.

---

## ✅ Checklist for Testers/Evaluators

Before testing, ensure:

- [ ] Node.js 16+ installed
- [ ] PostgreSQL 12+ installed
- [ ] Backend `.env` file created with Chapa keys
- [ ] Database created and schema applied
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Cloudflare Tunnel running (for Chapa testing)
- [ ] Test data seeded (optional)
- [ ] Chapa test mode enabled

### **Quick Start Command (Windows PowerShell)**
```powershell
# Terminal 1: Backend
cd "C:\Users\Degu\Desktop\ethiofund\backend"
pnpm dev

# Terminal 2: Frontend
cd "C:\Users\Degu\Desktop\ethiofund\frontend"
pnpm dev

# Terminal 3: Cloudflare Tunnel
cloudflared tunnel --url http://localhost:5000

# Then open: http://localhost:5173
```

---

## 🎉 You're Ready!

Visit **http://localhost:5173** and start testing EthioFund!

---

**Last Updated:** May 19, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
