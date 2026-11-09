# Setup Guide

This guide explains how to run the full system locally: the backend services with Docker, and the Android app with Android Studio.

## Table of Contents

- [Prerequisites](#prerequisites)
- [1. Clone the Repository](#1-clone-the-repository)
- [2. Create the Environment File](#2-create-the-environment-file)
- [3. Run with Docker Compose](#3-run-with-docker-compose)
- [4. Run the Android App](#4-run-the-android-app)

---

## Prerequisites

- [Docker](https://www.docker.com/) with Docker Compose
- [Android Studio](https://developer.android.com/studio) – only for the Android app

---

## 1. Clone the Repository

```bash
git clone https://github.com/bar-nakdimon/Gmail-Project.git
cd Gmail-Project
```

---

## 2. Create the Environment File

Create the config folder and file:

```bash
mkdir -p config
touch config/.env.local
```

Open `config/.env.local` and add:

```bash
# Node.js API server
API_PORT=3000
JWT_SECRET=your-secret-here

# React web client
FRONTEND_PORT=3001
REACT_APP_API_URL=http://localhost:3000

# C++ TCP blacklist server
TCP_PORT=5555

# MongoDB
MONGO_URI=mongodb://mongodb_service:27017
MONGO_DATA_PATH=/data/db
```

| Variable | Description |
|---|---|
| `API_PORT` | Host port for the Node.js API server. |
| `JWT_SECRET` | Secret used by the API server to sign and verify JWT tokens. Use a strong, unique value and keep it private. |
| `FRONTEND_PORT` | Host port for the React web app. |
| `REACT_APP_API_URL` | Address of the API server, in the form `http://localhost:{API_PORT}`. |
| `TCP_PORT` | Port on which the C++ Bloom-filter server listens. |
| `MONGO_URI` | MongoDB connection string used by the API server. |
| `MONGO_DATA_PATH` | Data path inside the MongoDB container, used as the Docker volume mount point. |

---

## 3. Run with Docker Compose

Build and start all services:

```bash
docker compose --env-file ./config/.env.local up --build
```

| Service | Description | Port |
|---|---|---|
| `tcpserver` | C++ TCP Bloom-filter server | `5555` |
| `apiserver` | Node.js + Express API | `3000` |
| `frontend` | React web client | `3001` |
| `mongodb` | MongoDB database | `27017` |

Open the web app at [http://localhost:3001](http://localhost:3001).

To stop and remove the containers:

```bash
docker compose down
```

---

## 4. Run the Android App

Make sure the Docker services from step 3 are running first.

### Open the project

1. Open **Android Studio** → **Open**.
2. Select the `android/` folder.

### Create `config.properties`

1. In `app/src/main/res/`, create a folder named `raw` (if it doesn't exist).
2. Inside `raw`, create a file named `config.properties`:

```properties
ip_address=10.0.2.2
port=3000
```

- **`ip_address`** – use `10.0.2.2` on the Android emulator (it points to your computer). On a physical device, use your computer's local IP address (`ipconfig` on Windows, `ifconfig` or `ip a` on macOS/Linux).
- **`port`** – the same value as `API_PORT` in `config/.env.local`.

### Allow local network traffic

In `app/src/main/res/xml/network_security_config.xml`, list the address you used above:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">10.0.2.2</domain>        <!-- Android emulator -->
    <domain includeSubdomains="true">192.168.1.242</domain>   <!-- Your local IP, for a physical device -->
  </domain-config>
</network-security-config>
```

### Run

1. Wait for Gradle to sync.
2. Start an emulator or connect a device via USB.
3. Click **Run** (or press `Shift + F10`).

The app connects to the API server at the configured address, and the API server handles all communication with the C++ blacklist service.
