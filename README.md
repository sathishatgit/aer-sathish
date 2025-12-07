# Aerchain - AI-Powered RFP Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 📋 Table of Contents

- [For Non-Technical Users](#-for-non-technical-users)
  - [What is Aerchain?](#what-is-aerchain)
  - [Key Features](#key-features)
  - [Who Can Benefit?](#who-can-benefit)
  - [How It Works](#how-it-works)
  - [User Journey](#user-journey)
- [For Technical Users](#-for-technical-users)
  - [Technology Stack](#technology-stack)
  - [System Architecture](#system-architecture)
  - [Project Structure](#project-structure)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
  - [Database Management](#database-management)
  - [API Documentation](#api-documentation)
  - [Development Workflow](#development-workflow)
  - [Testing](#testing)
  - [Deployment](#deployment)

---

## 👥 For Non-Technical Users

### What is Aerchain?

Aerchain is an intelligent Request for Proposal (RFP) management platform that revolutionizes how organizations handle their procurement process. Instead of manually creating RFPs, sending emails, collecting vendor proposals, and comparing them side-by-side, Aerchain automates these tasks using artificial intelligence.

Think of it as your smart procurement assistant that:
- Understands your requirements in plain English
- Automatically creates professional RFP documents
- Sends RFPs to multiple vendors simultaneously
- Collects and organizes vendor proposals from emails
- Analyzes and compares proposals intelligently
- Recommends the best vendor based on your criteria

### Key Features

#### 🤖 AI-Powered RFP Creation
Simply describe what you need in natural language (e.g., "I need 50 laptops for my office with 16GB RAM and Windows 11"), and the system automatically creates a structured, professional RFP document.

#### 📧 Automated Email Management
- Send RFPs to multiple vendors with one click
- Automatically receive and process vendor proposals from email
- Track which vendors have received your RFP and when

#### 📊 Smart Proposal Analysis
The AI analyzes each vendor proposal to extract:
- Pricing information
- Delivery timelines
- Warranty terms
- Payment conditions
- Technical specifications

#### 🔍 Intelligent Comparison
Compare multiple vendor proposals side-by-side with:
- Automatic scoring based on your requirements
- Visual comparison tables
- AI-generated recommendations
- Highlighting of key differences

#### 👥 Vendor Management
Maintain a database of trusted vendors with contact information, making it easy to send RFPs to the right suppliers.

#### 📈 Dashboard & Analytics
View real-time status of all your RFPs:
- Total RFPs created
- Active proposals
- Vendor responses
- Pending evaluations

### Who Can Benefit?

- **Procurement Teams**: Streamline RFP creation and vendor comparison
- **Small Businesses**: Professional procurement without dedicated staff
- **Project Managers**: Quickly source suppliers for projects
- **Finance Teams**: Compare costs and payment terms easily
- **Operations Teams**: Track procurement timelines and deliveries

### How It Works

1. **Create an RFP**
   - Log into the dashboard
   - Click "Create New RFP"
   - Describe what you need in plain English OR fill out a structured form
   - Review the AI-generated RFP

2. **Send to Vendors**
   - Select vendors from your database
   - Choose which vendors should receive the RFP
   - Send with one click - emails are automatically sent

3. **Receive Proposals**
   - Vendors reply via email with their proposals
   - The system automatically processes incoming emails
   - Proposals are parsed and structured by AI

4. **Compare & Decide**
   - View all proposals in a comparison table
   - See AI scores and recommendations
   - Review detailed analysis of each proposal
   - Select the winning vendor

5. **Track Everything**
   - Monitor RFP status from draft to completion
   - Track email communications
   - Maintain historical records

### User Journey

```
📝 Write Requirements → 🤖 AI Creates RFP → 📧 Send to Vendors
                                                      ↓
💼 Award Contract ← 🏆 Select Winner ← 📊 Compare Proposals ← ✉️ Receive Proposals
```

---

## 💻 For Technical Users

### Technology Stack

#### Backend
- **Framework**: NestJS 10.x (Node.js TypeScript framework)
- **Database**: PostgreSQL with Prisma ORM
- **AI/ML**: Sarvam AI for natural language processing and content generation
- **Email**: Nodemailer (SMTP) + IMAP for email processing
- **Validation**: class-validator, class-transformer
- **Scheduling**: @nestjs/schedule for cron jobs
- **API Documentation**: Swagger/OpenAPI

#### Frontend
- **Framework**: React 18.x with TypeScript
- **Build Tool**: Vite 5.x
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Notifications**: React Toastify
- **Data Grid**: MUI X Data Grid

#### Development Tools
- **Language**: TypeScript 5.x
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest
- **API Testing**: REST Client / Postman

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │  RFP UI  │  │ Vendors  │  │Proposals │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (Axios)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend (NestJS)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Controllers Layer                       │   │
│  │  RFP │ Vendor │ Proposal │ Prompt │ Email          │   │
│  └────────────────────┬─────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Services Layer                          │   │
│  │  • RFP Service     • Proposal Service               │   │
│  │  • Vendor Service  • Email Service                  │   │
│  │  • AI Service      • Prompt Service                 │   │
│  └────────────────────┬─────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Data Access Layer (Prisma)                │   │
│  └────────────────────┬─────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────┘
                        ↓
           ┌────────────────────────┐
           │   PostgreSQL Database   │
           │  • Vendors   • RFPs     │
           │  • Proposals • Prompts  │
           │  • Email Logs           │
           └────────────────────────┘

External Services:
├── Sarvam AI API (Natural Language Processing)
├── SMTP Server (Outbound Email)
└── IMAP Server (Inbound Email Polling)
```

### Project Structure

```
aerchain/
├── backend/                      # NestJS backend application
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema definition
│   │   ├── seed.ts              # Database seeding script
│   │   └── prisma.config.ts     # Prisma configuration
│   ├── src/
│   │   ├── main.ts              # Application entry point
│   │   ├── app.module.ts        # Root module
│   │   ├── ai/                  # AI service (Sarvam integration)
│   │   │   ├── ai.module.ts
│   │   │   └── ai.service.ts
│   │   ├── email/               # Email services
│   │   │   ├── email.module.ts
│   │   │   ├── email.service.ts # SMTP email sending
│   │   │   ├── email-polling.service.ts  # IMAP polling
│   │   │   └── email.controller.ts
│   │   ├── rfp/                 # RFP management
│   │   │   ├── rfp.module.ts
│   │   │   ├── rfp.service.ts
│   │   │   ├── rfp.controller.ts
│   │   │   └── dto/
│   │   ├── vendor/              # Vendor management
│   │   │   ├── vendor.module.ts
│   │   │   ├── vendor.service.ts
│   │   │   └── vendor.controller.ts
│   │   ├── proposal/            # Proposal management
│   │   │   ├── proposal.module.ts
│   │   │   ├── proposal.service.ts
│   │   │   └── proposal.controller.ts
│   │   ├── prompt/              # AI prompt templates
│   │   │   ├── prompt.module.ts
│   │   │   ├── prompt.service.ts
│   │   │   └── prompt.controller.ts
│   │   ├── prisma/              # Prisma service
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   └── startup/             # Startup initialization
│   │       ├── startup.module.ts
│   │       └── startup.service.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── frontend/                     # React frontend application
│   ├── src/
│   │   ├── main.tsx             # Application entry point
│   │   ├── App.tsx              # Root component with routing
│   │   ├── components/
│   │   │   └── Layout.tsx       # App layout with navigation
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx    # Main dashboard
│   │   │   ├── RFPList.tsx      # RFP listing page
│   │   │   ├── RFPCreate.tsx    # RFP creation form
│   │   │   ├── RFPDetails.tsx   # RFP detail view
│   │   │   ├── VendorList.tsx   # Vendor management
│   │   │   ├── ProposalCompare.tsx # Proposal comparison
│   │   │   └── PromptManagement.tsx # AI prompt management
│   │   └── services/
│   │       └── api.ts           # API client (Axios)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── package.json                  # Root package.json
```

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **npm**: v9.x or higher (comes with Node.js)
- **PostgreSQL**: v14.x or higher ([Download](https://www.postgresql.org/download/))
- **Git**: For version control ([Download](https://git-scm.com/))

#### Additional Requirements

- **Sarvam AI API Key**: Register at [Sarvam AI](https://www.sarvam.ai/)
- **Email Account**: SMTP and IMAP credentials (Gmail, Outlook, or custom mail server)
- **Code Editor**: VS Code recommended

### Installation

#### 1. Clone the Repository

```powershell
git clone <repository-url>
cd "d:\Applications\Aerchain"
```

#### 2. Install Dependencies

**Install root dependencies:**
```powershell
npm install
```

**Install backend dependencies:**
```powershell
cd backend
npm install
```

**Install frontend dependencies:**
```powershell
cd ../frontend
npm install
cd ..
```

### Configuration

#### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE aerchain_db;
CREATE USER aerchain_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE aerchain_db TO aerchain_user;
```

#### 2. Backend Environment Variables

Create `backend/.env` file:

```env
# Database
DATABASE_URL="postgresql://aerchain_user:your_secure_password@localhost:5432/aerchain_db?schema=public"

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Sarvam AI
SARVAM_API_KEY=your_sarvam_ai_api_key

# Email Configuration (SMTP - Outbound)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_NAME=Aerchain RFP System
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_REJECT_UNAUTHORIZED=true

# Email Configuration (IMAP - Inbound)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password
IMAP_TLS=true
IMAP_MAILBOX=INBOX

# Email Polling
EMAIL_POLLING_ENABLED=true
EMAIL_POLLING_INTERVAL=300000
```

**Gmail Users**: Use App Password instead of regular password
1. Enable 2-Factor Authentication
2. Generate App Password: Google Account → Security → 2-Step Verification → App passwords
3. Use the generated 16-character password

#### 3. Frontend Environment Variables

Create `frontend/.env` (optional):

```env
VITE_API_URL=http://localhost:3000
```

### Running the Application

#### Option 1: Run Both Services Simultaneously (Recommended)

From the root directory:

```powershell
# Development mode
npm run dev
```

This starts both backend (port 3000) and frontend (port 5173).

#### Option 2: Run Services Separately

**Terminal 1 - Backend:**
```powershell
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

#### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api

### Database Management

#### Generate Prisma Client

After modifying `schema.prisma`:

```powershell
cd backend
npm run prisma:generate
```

#### Run Migrations

Create and apply database migrations:

```powershell
cd backend
npm run prisma:migrate
```

#### Seed Database

Populate database with initial data:

```powershell
cd backend
npm run prisma:seed
```

This creates:
- Default AI prompt templates for RFP creation, proposal parsing, and comparison
- Sample vendors (optional)

#### Open Prisma Studio

Visual database management tool:

```powershell
cd backend
npm run prisma:studio
```

Opens at http://localhost:5555

### API Documentation

#### Swagger/OpenAPI

Interactive API documentation is available at:
```
http://localhost:3000/api
```

#### Key API Endpoints

**RFP Management**
- `POST /rfp/natural-language` - Create RFP from natural language
- `POST /rfp/structured` - Create RFP with structured data
- `GET /rfp` - List all RFPs
- `GET /rfp/:id` - Get RFP details
- `PUT /rfp/:id` - Update RFP
- `DELETE /rfp/:id` - Delete RFP
- `POST /rfp/:id/send` - Send RFP to vendors

**Vendor Management**
- `POST /vendor` - Create vendor
- `GET /vendor` - List all vendors
- `GET /vendor/:id` - Get vendor details
- `PUT /vendor/:id` - Update vendor
- `DELETE /vendor/:id` - Delete vendor

**Proposal Management**
- `POST /proposal` - Create proposal
- `GET /proposal` - List all proposals
- `GET /proposal/rfp/:rfpId` - Get proposals for specific RFP
- `GET /proposal/:id` - Get proposal details
- `POST /proposal/compare` - Compare multiple proposals

**Prompt Management**
- `GET /prompt` - List all prompts
- `GET /prompt/:id` - Get prompt details
- `PUT /prompt/:id` - Update prompt
- `POST /prompt` - Create prompt

**Email**
- `POST /email/send-rfp` - Send RFP email
- `POST /email/poll` - Manually trigger email polling

### Development Workflow

#### Code Structure Guidelines

**Backend (NestJS)**
- Follow NestJS module-based architecture
- Use dependency injection
- Implement DTOs for validation
- Keep services testable and modular
- Use Prisma for database operations

**Frontend (React)**
- Use functional components with hooks
- Keep components small and focused
- Implement proper error handling
- Use MUI components consistently
- Centralize API calls in `services/api.ts`

#### Adding a New Feature

1. **Backend**:
   - Create/update Prisma schema
   - Run migration
   - Create module, service, controller
   - Add DTOs for validation
   - Update Swagger documentation

2. **Frontend**:
   - Create page component in `pages/`
   - Add route in `App.tsx`
   - Add navigation in `Layout.tsx`
   - Implement API calls in `services/api.ts`

#### Code Quality

**Linting:**
```powershell
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

**Formatting:**
```powershell
cd backend
npm run format
```

### Testing

#### Backend Tests

```powershell
cd backend

# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

#### Frontend Tests

```powershell
cd frontend
npm run test
```

### Deployment

#### Production Build

**Backend:**
```powershell
cd backend
npm run build
# Output in dist/
```

**Frontend:**
```powershell
cd frontend
npm run build
# Output in dist/
```

#### Environment Variables for Production

Update `.env` files with production values:
- Use production database
- Set `NODE_ENV=production`
- Use production API URLs
- Enable proper security settings

#### Deployment Options

1. **Traditional Server**
   - Deploy backend on Node.js server
   - Serve frontend from Nginx/Apache
   - Use PM2 for process management

2. **Docker**
   - Create Dockerfile for backend and frontend
   - Use docker-compose for orchestration

3. **Cloud Platforms**
   - Backend: Heroku, AWS Elastic Beanstalk, Google Cloud Run
   - Frontend: Vercel, Netlify, AWS S3 + CloudFront
   - Database: AWS RDS, Google Cloud SQL, Heroku Postgres

#### Running in Production

**Backend:**
```powershell
cd backend
npm run start:prod
```

**Frontend:**
Serve the `dist/` folder using a web server like Nginx or Apache.

### Security Considerations

- **Environment Variables**: Never commit `.env` files
- **API Keys**: Rotate keys regularly
- **Database**: Use strong passwords, enable SSL
- **CORS**: Configure appropriate origins for production
- **Input Validation**: All user inputs are validated using class-validator
- **SQL Injection**: Protected by Prisma ORM
- **Rate Limiting**: Implement for production APIs

### Performance Optimization

- **Database**: Add indexes on frequently queried columns
- **Caching**: Implement Redis for API responses
- **Frontend**: Lazy load routes and components
- **API**: Implement pagination for large datasets
- **Email**: Process emails asynchronously with job queues

### Troubleshooting

#### Common Issues

**Database Connection Failed**
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure database user has proper permissions

**Email Not Sending**
- Verify SMTP credentials
- Check firewall/antivirus blocking port 587
- For Gmail, ensure App Password is used

**AI Service Error**
- Verify SARVAM_API_KEY is valid
- Check API quota/rate limits
- Review error logs for specific messages

**Frontend Not Connecting to Backend**
- Verify backend is running on port 3000
- Check CORS configuration
- Ensure FRONTEND_URL in backend `.env`

#### Logs

**Backend Logs:**
Check console output for detailed error messages with context.

**Database Logs:**
Use Prisma Studio or check PostgreSQL logs.

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### License

This project is licensed under the MIT License.

### Support

For issues and questions:
- Create an issue in the repository
- Contact: sathishbabudeveloper@gmail.com
- Documentation: backendUrl/api

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Material-UI Documentation](https://mui.com/)
- [Sarvam AI Documentation](https://docs.sarvam.ai/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Made with ❤️ by the Sathishbabu**
