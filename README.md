# 🚖 Ryde - Next Gen Ride-Sharing Platform

<p align="center">
  <strong>A modern, full-stack ride-sharing and carpooling application built with React & Express</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&logoColor=white" alt="Clerk">
  <img src="https://img.shields.io/badge/Google_Maps-Platform-4285F4?logo=google-maps&logoColor=white" alt="Google Maps">
  <img src="https://img.shields.io/badge/Razorpay-Payments-092540?logo=razorpay&logoColor=white" alt="Razorpay">
</p>

## Features

### **Interactive Ride Booking**

- Real-time trip search and creation
- Seamless Google Maps integration for route visualization
- Distance and fare calculation using `geolib` and `googlemaps/routing`

### **Role-Based Access**

- **Riders**: Book rides, view history, rate drivers
- **Drivers**: Register vehicles, manage availability, accept/reject requests
- **Admin**: Dashboard for platform oversight

### **Secure Payments**

- Integrated Razorpay payment gateway
- Secure transaction processing
- Payment history tracking

###  **Advanced Authentication**

- Powered by Clerk for secure and easy sign-in/sign-up
- Protected routes and persistent user sessions
- Driver verification workflow

### **Dashboard & Analytics**

- Comprehensive dashboards for both Users and Admins
- Vehicle management for drivers ("My Vehicles")
- Trip history and status tracking

### **Modern Experience**

- Built with React 19 and Vite for blazing fast performance
- styled with TailwindCSS v4 for a sleek, responsive design
- Smooth animations with Framer Motion

## Tech Stack

### **Frontend (Client)**

- **React 19** - Library for building user interfaces
- **Vite** - Next Generation Frontend Tooling
- **TailwindCSS v4** - Utility-first CSS framework
- **Framer Motion** - Production-ready animation library
- **Clerk React** - Authenticaton and User Management
- **React Router Dom v7** - Declarative routing
- **Lucide React** - Beautiful & consistent icons
- **Axios** - Promise based HTTP client

### **Backend (Server)**

- **Node.js & Express v5** - Robust server-side framework
- **MongoDB & Mongoose** - NoSQL database and Object Data Modeling
- **Google Maps API** - Routing and Location Services
- **Razorpay** - Payment Infrastructure
- **Nodemailer** - Email communication service
- **Node-Cron** - Task scheduling (e.g., trip reminders)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/ryde.git
   cd ryde
   ```

2. **Install dependencies**

   _Ryde uses a monorepo-like structure with separate `client` and `backend` directories._

   **Install Backend Dependencies:**

   ```bash
   cd backend
   npm install
   ```

   **Install Client Dependencies:**

   ```bash
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   **Backend (.env)**
   Create a `.env` file in the `backend` directory:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   CLERK_SECRET_KEY=your_clerk_secret_key
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_password
   ```

   **Client (.env)**
   Create a `.env` file in the `client` directory:

   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Run the application**

   You need to run both the backend and frontend servers.

   **Terminal 1 (Backend):**

   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 (Client):**

   ```bash
   cd client
   npm run dev
   ```

5. **Open your browser**
   Navigate to the URL shown in your client terminal (usually `http://localhost:5173`) to launch Ryde.

## Project Structure

```
ryde/
├── backend/                # Express Server & API
│   ├── config/             # Database connection & configs
│   ├── controllers/        # Route logic & Request handling
│   ├── models/             # Mongoose Schemas (User, Trip, etc.)
│   ├── routes/             # API Endpoints
│   ├── services/           # Business logic & integrations
│   └── server.js           # Entry point
│
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── routes/         # Page components (Home, Dashboard, etc.)
│   │   ├── utils/          # Helpers & Constants
│   │   ├── App.jsx         # Main App Component
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static assets
│   └── index.html          # HTML template
|
└── README.md
```

<p align="center">
  Made with ❤️ by Team bootWinXP
</p>
