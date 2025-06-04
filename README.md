<div dir="ltr">

# Gmail-Project

This project is part of an Advanced Programming course at Bar-Ilan University, developed by a team of three students.

The goal of the project is to design and implement a full-stack Gmail-like email system, focusing on backend architecture, API development, secure authentication, and scalable deployment using modern software engineering principles.

## This Part: Advanced Mail Service API with Blacklist Integration
---

## Project Overview

This project implements a RESTful web API server for a mail system with user authentication, mail sending/receiving, label management, and blacklist URL filtering.

The backend TCP server (from EX-2) handles Bloom Filter blacklist checking and runs concurrently to support multiple clients.

The API server is built with Node.js and Express, following MVC architecture with loose coupling and SOLID principles. Data is stored in-memory for simplicity, except blacklist URLs which persist in backend files.

---

## Architecture Overview

- **TCP Backend Server** (C++): Bloom Filter based blacklist service, listening on port 5555.  
- **Node.js API Server**: Exposes RESTful endpoints for user management, mails, labels, and blacklist. Communicates with TCP server via sockets.  
- **Middleware**: Authentication middleware injects authenticated `userId` for protected routes.  
- **In-Memory Storage**: Users, mails, and labels are stored in memory.  
- **Blacklist Persistence**: Malicious URLs added to blacklist are persisted in `backend/data` as text files.

---

## Running the Project

1. **Start the TCP backend server and the API server together using Docker Compose:**  
   ```bash
   docker compose up --build

This command builds and starts both servers:
- TCP server listens on port 5555
- API server listens on port 3000

## Manual Testing Instructions

Open a second terminal window to run the following example curl commands to interact with the API.

---


# Example curl commands and expected responses


## 1. Register a new user

```bash
curl -i -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-d '{"username":"user1","password":"pass1234","name":"User One","avatarUrl":"https://example.com/avatar1.png"}'
```
**Expected response:**
```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "id": 1,
  "username": "user1",
  "name": "User One",
  "avatarUrl": "https://example.com/avatar1.png"
}
```

## 2. Login user

```bash
curl -i -X POST http://localhost:3000/api/tokens \
-H "Content-Type: application/json" \
-d '{"username":"user1","password":"pass1234"}'
```
**Expected response:**
```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"userId":1}
```

## 3. Create a new mail (must include x-user-id header)
**Register a new user (receiver):**

```bash
curl -i -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-d '{"username":"user2","password":"pass1234","name":"User Two","avatarUrl":"https://example.com/avatar1.png"}'
```
**Expected response:**
```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "id": 2,
  "username": "user2",
  "name": "User Two",
  "avatarUrl": "https://example.com/avatar1.png"
}
```

**Create a new mail from 'user1' to 'user2':**
```bash
curl -i -X POST http://localhost:3000/api/mails \
-H "Content-Type: application/json" \
-H "x-user-id: 1" \
-d '{"toUserId":"2","subject":"Hello","body":"This is a safe mail."}'
```
**Expected response:**
```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "id": 1,
  "fromUserId": 1,
  "toUserId": 2,
  "subject": "Hello",
  "body": "This is a safe mail.",
  "timestamp": "2025-05-30T12:15:00.000Z"
}
```

## 4. Create mail with blacklisted URL (should fail)

**Add URL to blacklist:**
```bash
curl -i -X POST http://localhost:3000/api/blacklist \
-H "Content-Type: application/json" \
-H "x-user-id: 1" \
-d '{"url": "http://malicious-site.com"}'
```
**Expected response:**
```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
{
  "message": "url 'http://malicious-site.com' added to blacklist.",
  "id": 1
}
```

**Create a new mail with the URL:**
```bash
curl -i -X POST http://localhost:3000/api/mails \
-H "Content-Type: application/json" \
-H "x-user-id: 1" \
-d '{"toUserId":"2","subject":"Malicious","body":"Visit http://malicious-site.com"}'
```
**Expected response:**
```
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{"error":"Blacklisted URL detected"}
```

## 5. Get inbox mails (last 50 mails)

```bash
curl -i -H "x-user-id: 1" http://localhost:3000/api/mails
```
**Expected response:**
```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[
  {
    "id": 1,
    "fromUserId": 1,
    "toUserId": 2,
    "subject": "Hello",
    "body": "This is a safe mail.",
    "timestamp": "2025-05-30T12:00:00.000Z"
  }
]
```

## 6. Get mail by ID
```bash
curl -i -H "x-user-id: 1" http://localhost:3000/api/mails/1
```
**Expected response:**
```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "id": 1,
  "fromUserId": 1,
  "toUserId": 2,
  "subject": "Hello",
  "body": "This is a safe mail.",
  "timestamp": "2025-05-30T12:00:00.000Z"
}
```

## 7. Update mail (PATCH)
```bash
curl -i -X PATCH http://localhost:3000/api/mails/1 \
-H "Content-Type: application/json" \
-H "x-user-id: 1" \
-d '{"subject":"Updated subject"}'
```
**Expected response:**
```
HTTP/1.1 204 No Content
```

## 8. Search mails by query
```bash
curl -i -H "x-user-id: 1" http://localhost:3000/api/mails/search/Updated
```
**Expected response:**
```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[
  {
  "id": 1,
  "fromUserId": 1,
  "toUserId": 2,
  "subject": "Updated subject",
  "body": "This is a safe mail.",
  "timestamp": "2025-05-30T12:00:00.000Z"
  }
]

```
## 9. Delete mail (DELETE)
```bash
curl -i -X DELETE http://localhost:3000/api/mails/1 \
-H "x-user-id: 1"
```
**Expected response:**
```
HTTP/1.1 204 No Content
```

## 10. Create a new label
```bash
curl -i -X POST http://localhost:3000/api/labels \
-H "Content-Type: application/json" \
-H "x-user-id: 1" \
-d '{"name":"Urgent","description":"Urgent mails"}'

```
**Expected response:**
```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":1,"name":"Urgent","description":"Urgent mails"}
```

## 11. Get all labels for user
```bash
curl -i -H "x-user-id: 1" http://localhost:3000/api/labels
```
**Expected response:**
```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[
 {"id":1,"name":"Urgent","description":"Urgent mails"}
]
```

## 12. Get label by ID
```bash
curl -i -H "x-user-id: 1" http://localhost:3000/api/labels/1
```
**Expected response:**
```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"name":"Urgent","description":"Urgent mails"}

```

## 13. Update label (PATCH)
```bash
curl -i -X PATCH http://localhost:3000/api/labels/1 \
-H "Content-Type: application/json" \
-H "x-user-id: 1" \
-d '{"description":"Updated description"}'
```
**Expected response:**
```
HTTP/1.1 204 No Content

```
## 14. Delete label (DELETE)
```bash
curl -i -X DELETE http://localhost:3000/api/labels/1 \
-H "x-user-id: 1"

```
**Expected response:**
```
HTTP/1.1 204 No Content
```

## 15. Delete URL from blacklist 
```bash
curl -i -X DELETE http://localhost:3000/api/blacklist/1 \
-H "x-user-id: 1"

```
**Expected response:**
```
HTTP/1.1 204 No Content
```
