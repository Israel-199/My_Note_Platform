# 📝 Full-Stack Note-Taking App with OTP 

A secure and responsive note-taking application built with **React.js + TypeScript**, **Express.js + TypeScript**, and **MongoDB**. This app supports OTP-based email authentication and allows users to create, view, and delete personal notes.





## ✨ Features

- 📧 **OTP-based Email Authentication**
- 🧾 **Create & Delete Notes**
- 📱 **Responsive UI** (mobile & desktop friendly)
- 💬 **Toast Notifications** for feedback
- 🛡️ **JWT Authentication & Authorization**


---

## 🚀 Tech Stack

| Technology    | Usage                      |
|---------------|----------------------------|
| ReactJS       | Frontend UI                |
| TypeScript    | Type Safety (frontend + backend) |
| ExpressJS     | Backend API                |
| MongoDB       | Database                   |
| Mongoose      | MongoDB ORM                |
| JWT           | Auth Token                 |
| Nodemailer    | OTP Email Sending          |
| Tailwind CSS  | Styling                    |


## 🖥️ Setup Instructions

### 1. **Clone the Repo**

```bash
git clone repo_url
cd note-taking-app
```
## install all packages for both server and frontend and start your app using 
```bash
npm install
npm run dev
```
## env setup (Backend)
```bash

PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongo_connection_uri
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CLIENT_URL=http://localhost:5173
```

## env setup (Frontend)
```bash
VITE_API_URL=http://localhost:5000/api

```
