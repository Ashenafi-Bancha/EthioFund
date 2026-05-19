# 🌍 EthioFund-Crowdfunding Platform for Ethiopia

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

#

---



---

## 👨‍💼 Team & Contribution



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



