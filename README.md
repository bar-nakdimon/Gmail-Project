# Full-Stack Gmail Project
---

This project is part of an Advanced Programming course at Bar-Ilan University, developed by a team of three students.

## This Part: Full-Stack Gmail Web Application

## Project Overview
This project builds upon the previous backend and API work by integrating a full React-based frontend, resulting in a complete Gmail-style mail system. It combines three key components:

- A C++ backend TCP server (from EX-2) that manages a Bloom Filter-based blacklist.
- A Node.js API server (from EX-3) that handles all business logic and persists data in memory or files.
- A React web interface that allows users to interact with the system via a browser instead of curl or Postman.

This part (EX-4) replaces the previous curl-based manual tests from EX-2 and EX-3. All API interaction is now done via the React interface.

---

## Architecture Overview

- **TCP Backend Server (C++)**  
  Handles Bloom Filter blacklist logic and persists blacklisted URLs to file. Runs concurrently to support multiple API connections over TCP sockets.

- **Node.js API Server**  
  Implements RESTful API routes for user registration/login, mail management, label handling, and spam detection. Follows MVC architecture with SOLID principles and in-memory data storage.

- **React Frontend**  
  Users can register, login, view inbox/sent mails, compose messages, manage labels, and edit drafts through a user-friendly interface. The frontend interacts only with the API server.

---

## Features

### Authentication
- User registration and login via the React app.
- JWT-based session handling.
- Users upload a profile picture during registration.

### Mail System
- Compose and send new mail to other users.
- Save drafts and later update/send them.
- View inbox, sent items, and full mail content.
- Delete mails (soft-delete using the “Trash” label).
- Search mails by keyword.

### Label Management
- Create new labels.
- Apply/remove multiple labels per mail.
- Edit/delete custom labels.
- System labels include: Inbox, Sent, Read, Unread, Drafts, Spam, Trash, Star.

### Spam & Blacklist Integration
- If a mail contains a URL from the blacklist, it’s marked as spam for the recipient.
- Marking a mail as spam will add its URLs to the blacklist (via TCP).
- Removing the spam label will remove the associated URLs from the blacklist.
- Blacklist communication is done via TCP to the C++ server using Bloom Filter.

---

## File Structure

```
EX-4/
│
├── backend/                 # C++ TCP server (Bloom Filter blacklist)
│   ├── src/
│   ├── Dockerfile.tcpserver
│   └── CMakeLists.txt
│
├── api/                     # Node.js + Express API server
│   ├── src/
│   ├── Dockerfile.api
│   ├── server.js
│   └── ...
│
├── frontend/                # React application
│   ├── src/
│   ├── Dockerfile.react
│   └── ...
│
└── docker-compose.yml       # Orchestrates all services
```

---

## Running the Project

Run in the terminal:

```bash
docker compose up --build
```

This will:
- Build and start the C++ TCP server (port 5555)
- Build and start the Node.js API server (port 3000)
- Build and start the React frontend (port 3001)

Access the application at: [http://localhost:3001](http://localhost:3001)

---

## Screenshots
### Register
![Register](https://github.com/user-attachments/assets/fe7bf564-53cd-4826-903b-027ae8cd16d9)
### Login
![Login](https://github.com/user-attachments/assets/f0b99fd5-8e60-4e79-8a45-207b914e8a73)
### Inbox Page
![InboxPage](https://github.com/user-attachments/assets/bb7d8728-8d0e-439b-9254-3bed44f3911d)
### View Mail
![ViewMail](https://github.com/user-attachments/assets/30d5bfd9-6225-4ba5-abcf-319181b16bfb)
### Compose Mail
![ComposeMail](https://github.com/user-attachments/assets/25347366-dadc-4f8b-9b4e-d7b29752748b)
