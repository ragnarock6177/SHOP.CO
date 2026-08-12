# SHOP.CO - Full-Stack E-Commerce Platform

A modern, high-performance e-commerce platform built with Next.js 16, Tailwind CSS v4, Node.js, Express, Prisma ORM, and PostgreSQL.

## 📁 Repository Structure

This is a unified monorepo containing both the frontend user interface and backend REST API:

```
SHOP.CO/
├── frontend/               # Next.js 16 App Router, Tailwind CSS v4, Lucide Icons
│   ├── src/
│   │   ├── app/            # Storefront, Shop, Cart, Checkout, Profile, Auth & Support pages
│   │   ├── components/     # Reusable UI components & drawers
│   │   └── context/        # Cart & Order state management
│   └── package.json
└── backend/                # Node.js Express REST API, Prisma ORM, PostgreSQL
    ├── prisma/             # Schema definitions & database models
    ├── src/
    │   ├── config/         # Database connection pooling
    │   ├── controllers/    # Request handlers
    │   ├── repositories/   # Data access layer
    │   ├── services/       # Business logic layer
    │   └── routes/         # API endpoint routers
    └── package.json
```

## 🚀 Getting Started

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the web application.

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npm run dev
```
The REST API runs at [http://localhost:5000/api/v1](http://localhost:5000/api/v1).

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS v4, Vaul Drawers, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL
- **DevOps & Tooling**: Git Monorepo, ESLint, PostCSS
