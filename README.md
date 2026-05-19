# 🌍 EthioFund - Crowdfunding Platform for Ethiopia

> A PERN Stack web-based crowdfunding platform enabling Ethiopians to raise funds for medical, educational, funeral, emergency, and community initiatives with secure Chapa payment gateway integration.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Features](#-features)
- [Testing the Platform](#-testing-the-platform)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

**EthioFund** is a full-stack crowdfunding platform for the Ethiopian community with different user roles:

- **Donors:** Browse campaigns, donate securely via Chapa, track donation history
- **Organizers:** Create campaigns, post updates, request fund withdrawals
- **Admins:** Manage campaigns, verify withdrawals, monitor activity, generate reports
- **Guests:** View campaigns and share on social media

### Key Features

✅ JWT authentication (7-day expiry)  
✅ Role-based access control (donor, organizer, admin)  
✅ Campaign management (create, approve, reject, suspend)  
✅ Chapa payment gateway integration  
✅ AI-powered comment moderation (Gemini)  
✅ Activity logging & audit trail  
✅ Campaign updates & withdrawal requests  
✅ Platform analytics & reporting  

---

## 🛠️ Technology Stack

### **Frontend**
- React + TypeScript
- Vite (build tool)
- Tailwind CSS 4.1.12 (styling)
- Shadcn/ui + Radix UI (components)
- React Router (routing)
- Axios (HTTP client)
- React Context API (state management)

### **Backend**
- Node.js 16+ + Express.js 5.2.1
- TypeScript
- PostgreSQL 18 (database)
- JWT authentication
- bcryptjs (password hashing)
- express-validator (input validation)
- Helmet (security headers)
- morgan (logging)

### **Payment & Integrations**
- Chapa (Ethiopian payment provider)
- Gemini AI (comment moderation)
- Cloudflare Tunnel (webhook testing)

### **Package Manager**
- pnpm (for both frontend and backend)

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

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** 16+ 
- **PostgreSQL** 12+ (recommended: version 18)
- **pnpm** 8+ (or npm)
- **Git**
- **Cloudflare Tunnel** (optional, for Chapa webhook testing)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd ethiofund
```

2. **Setup Backend:**
```bash
cd backend
pnpm install
cp .env.example .env
# Update .env with your database credentials and Chapa API keys
```

3. **Setup Frontend:**
```bash
cd ../frontend
pnpm install
```

4. **Setup Database:**
```bash
# Create database and run schema
psql -U postgres
CREATE DATABASE ethiofund_db;
# Import schema and seed data
psql -U postgres -d ethiofund_db -f ../backend/database/schema.sql
psql -U postgres -d ethiofund_db -f ../backend/database/seed.sql
```

5. **Run the Application:**
```bash
# Terminal 1: Backend (from backend directory)
pnpm dev

# Terminal 2: Frontend (from frontend directory)
pnpm dev

# Terminal 3: Cloudflare Tunnel (for payment webhook testing)
cloudflared tunnel --url http://localhost:5000
```

Access the frontend at `http://localhost:5173`

---

## 🎨 Features

### **Donor Features**
- Browse and search campaigns
- Donate securely via Chapa
- View donation history & receipts
- Leave comments on campaigns
- Share campaigns on social media
- Receive real-time campaign updates

### **Organizer Features**
- Create and manage campaigns
- Upload campaign images/videos
- Post updates to donors
- Track donation progress
- Request fund withdrawals
- Respond to comments

### **Admin Features**
- View platform dashboard & statistics
- Approve/reject/suspend campaigns
- Manage user accounts
- Review and approve withdrawals
- Generate reports (campaigns, donations, users, finances)
- View activity logs

### **Additional Features**
- AI-powered comment moderation (Gemini)
- Secure payment processing with idempotent verification
- Comprehensive audit logging

---

## 🧪 Testing the Platform

### Default Test Users
After running the seed data, use these credentials:

| Email | Password | Role |
|-------|----------|------|
| admin@ethiofund.com | Admin@1234 | Admin |
| organizer1@email.com | Organizer@1234 | Organizer |
| donor1@email.com | Donor@1234 | Donor |

### Testing Chapa Payments
1. Login as a donor
2. Open any campaign
3. Click "Donate Now" button
4. Fill the donation form
5. Use test card: `5200828282828282`
6. Use any future expiry date
7. Use any 3-digit CVC
8. Complete the payment

### API Testing Example
Use REST Client or Postman to test endpoints:

```http
# Register new user
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

```http
# Create campaign (requires auth token)
POST http://localhost:5000/api/campaigns
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "title": "Medical Campaign",
  "description": "Help with surgery costs",
  "goal_amount": 50000,
  "category": "medical"
}
```

---

## 🔐 Security

- Password hashing with bcryptjs (12 salt rounds)
- JWT authentication with 7-day expiry
- Role-based access control (RBAC)
- Input validation on all endpoints
- Security headers with Helmet
- CORS configured for frontend only
- Database constraints and cascading deletes
- Secrets stored in environment variables
- Activity logging for audit trails
- Idempotent payment verification

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Verify Node.js and pnpm are installed
node --version
pnpm --version

# Reinstall dependencies
pnpm install

# Check if port 5000 is available
netstat -ano | findstr :5000
```

### PostgreSQL Connection Error
- Verify PostgreSQL is running
- Check database name and credentials in `.env`
- Ensure database user has correct permissions
- Confirm schema and seed data are imported

### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check CORS configuration in backend
- Clear browser cache and restart frontend dev server

### Chapa Payment Issues
- Verify Cloudflare Tunnel is running
- Update webhook URL in Chapa dashboard
- Check SERVER_URL in `.env` matches tunnel URL
- Ensure test mode is enabled in Chapa

### Clear Build Cache
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

1. Clone repository: `git clone <repository-url>`
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes and commit with clear messages
4. Push to remote: `git push origin feature/your-feature`
5. Create pull request with description
6. Address code review feedback
7. Merge after approval

## 💻 Development Guidelines

- Use TypeScript for type safety
- Follow ESLint configuration
- Write descriptive variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Test features before creating PR

---

## 📄 License

This project is confidential and intended for evaluation only.



