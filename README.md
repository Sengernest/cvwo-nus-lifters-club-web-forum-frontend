# NUS Lifters
<img width="956" height="557" alt="image" src="https://github.com/user-attachments/assets/432accf0-5f04-4cdb-978e-8104c7da7c6b" />

A full-stack web forum application that allows users to register accounts, create fitness and gym-related topics, posts and comments as well as interact through likes. 

> **Tech Stack:** React + Vite • TypeScript • Material UI • Axios • Go • SQLite

**Frontend URL:** *https://nus-lifters.netlify.app/*

**Backend GitHub Repo:** *https://github.com/Sengernest/NUS-Lifters-Backend.git*

---

## Features
- User registration and login
- JWT-based authentication
- Topic creation, editing, and deletion
- Post creation, editing, deletion, and liking
- Comment creation, editing, deletion, and liking
- Search and sorting for topics and posts
- Responsive UI using Material UI

## Tech Stack
**Frontend**
- React
- TypeScript
- Material UI
- Axios

**Backend**
- Go
- SQLite database

**Deployment**
- Frontend: Netlify
- Backend: Render

---

## Running locally

### Backend Setup
### 1. Clone the backend repository:  

```bash
git clone https://github.com/Sengernest/NUS-Lifters-Backend.git
```

### 2. Go into the directoy which the repo was cloned into

### 3. Create .env file and include the environment variables

```env
JWT_KEY=your-seceret-key
FRONTEND_URL=http://localhost:3000
PORT=8080
```

### 4. Run the backend server

```bash
go run main.go
```

### Frontend Setup
### 1. Clone the repository

```bash
git clone https://github.com/Sengernest/NUS-Lifters-Frontend.git
```

### 2. Go into the directory where the repo was cloned into 

### 3. Install dependencies

 ```bash
 npm install
  ```

### 4. Create .env file and include the API url

```env
REACT_APP_API_URL=http://localhost:8080
```
    
### 5. Start the development server

```bash
npm run dev
```
---
