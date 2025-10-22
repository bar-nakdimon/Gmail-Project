#  Gmail-Project


## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Setup & Run Guide](#setup--run-guide)
- [Android Configuration](#android-configuration)
--- 

## Overview
This project is a full-stack Gmail-like email platform, developed as part of an Advanced Programming Systems course by a team of three computer science students following Agile Scrum methodology.
It delivers a fully functional email system available both as a web application and a native Android app, built from four main components:
1. **C++ TCP server** - Manages a Bloom Filter-based blacklist system for URLs. Operates concurrently to handle multiple API requests via TCP sockets and persists data to file. 
2. **Node.js API server** - Provides a robust RESTful API for user authentication, email operations, label management, and spam handling. Follows the MVC architecture with SOLID design principles and uses MongoDB for persistent storage.  
3. **React frontend** - A responsive, Gmail-style web interface built with React. Connects to the central API and TCP services to provide the full user experience via browser. 
4. **Android app** -  A native mobile client (MVVM + Retrofit + Room) that connects to the same backend servers. Mirrors the full mail functionality of the web app.
      


The system supports core Gmail-like functionality, including:

- User registration and login  
- Profile management  
- Email composition and sending
- Draft saving and editing
- Spam links via bloom filter
- Inbox, Sent, Drafts, Spam and Trash folders  
- Label creation, editing and assignment  
- Mail search and filtering  
- Soft and permanent deletion


  
#### For detailed explanations of features, components, and usage examples, please refer to the project's [**wiki**](https://github.com/razemanoel/EX-5/tree/main/wiki).
<br>


## Project Structure

```
Gmail-Project/
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
├── android/                 # Android Studio project for the mobile client
│   ├── app/
│   ├── build.gradle
│   └── ...
│
├── config/                  # Custom env-vars (must create manually)
│   └── .env.local           
│
├── wiki/                    # Project documentation (used in README and wiki section)
│   ├── web.md               
│   ├── android.md           
│   ├── webDoc/              
│   └── androidDoc/          
│
└── docker-compose.yml       # Orchestrates all services
```
<br>

##  Setup & Run Guide


### 1. Clone the Repository
   
Open terminal and run:

```bash
git clone https://github.com/bar-nakdimon/Gmail-Project.git
```

### 2. Create Environment Configuration

Create a new folder and file for environment variables:

```bash
mkdir -p config
touch config/.env.local
```

Open `config/.env.local` in your editor and paste:

```bash
#  Node.js API Server
API_PORT=3000              
JWT_SECRET="Vj4@7sF!9K#pLz^D2o7uN13X6A9Q5"

#  React Frontend 
FRONTEND_PORT=3001       
REACT_APP_API_URL=http://localhost:3000 

#  C++ TCP Blacklist Server 
TCP_PORT=5555               

# MongoDB 
MONGO_URI=mongodb://mongodb_service:27017 
MONGO_DATA_PATH=/data/db    
```

####  **Explanation of the variables:**

- **API_PORT**: Defines the port on your local machine (host) to access the Node.js server.This can be customized as needed during setup.  
- **FRONTEND_PORT**: Defines the porton your local machine (host) to access the React web app.This can be customized as needed during setup.  
- **TCP_PORT**: Defines the port where the C++ TCP Bloom-filter server listens for blacklist/spam checks. This can be customized as needed during setup.  
- **MONGO_URI**: The full connection string for the MongoDB instance, used by the API server to persist user, mail, and label data.  
- **MONGO_DATA_PATH**: Path inside the MongoDB container where the data will be stored. Used as a mount point for Docker volumes.  
- **JWT_SECRET**: A secret key used by the Node.js API server to sign and verify JWT tokens for authentication. This should be a strong, unique string and kept private.  
- **REACT_APP_API_URL**: Defines the way to get the api server(must be : `http://localhost:{API_PORT}` )  
  <br>
  
## Docker Setup

Once your `config/.env.local` file is ready, you can build and run all services using Docker Compose.

### 3. Build & Launch with Docker Compose

To build and launch all containers, run:

```bash
docker compose --env-file ./config/.env.local up --build
```

This will start the following services:

| Service           | Description                        | Port     |
|-------------------|------------------------------------|----------|
| **tcpserver**      | C++ TCP Bloom Filter server        | `5555`   |
| **apiserver**      | Node.js + Express API backend      | `3000`   |
| **frontend**       | React Gmail-style web interface    | `3001`   |
| **mongodb_service**| MongoDB for persistent storage     | `27017`  |


Docker Compose will:

1. Parse `docker-compose.yml` to identify which services to run  
2. Load all key-value pairs from `config/.env.local`  
3. Inject these variables into each container's environment  
4. Build and start the services in the correct order  


###  Stop and Clean Up

To stop and remove all running containers, run:

```bash
docker compose down
```

### Access the Web App

Once all services are running, open the Gmail web interface in your browser:
[http://localhost:3001](http://localhost:3001)

  <br>

##  Android Configuration

### Pre-requirements:
1. **Install Android Studio**:
 - Download and install Android Studio if you haven't already from [https://developer.android.com/studio](https://developer.android.com/studio)

2. **Ensure Backend Services are Running**:
Make sure you have completed the Docker Setup and all backend services are up and running:
- TCP server running at `Port 5555`  
- API server available at `Port 3000`  
- Web UI available at `http://localhost:3001`  
- MongoDB service running internally in Docker (`mongodb_service`)

### Configuration Steps:

#### 1. Open the Android Project:
- Open **Android Studio**
- Select **"Open an Existing Project"**
- Navigate to and select the `android/` folder from your project directory

#### 2. Create `config.properties` File:
- In Android Studio, navigate to: `app/src/main/res/`
- **Create a new directory** called `raw` (if it doesn't exist):
  - Right-click on `res` → New → Directory → name it `raw`
- **Create the configuration file**:
  - Right-click on the `raw` directory → New → File → name it `config.properties`

**Configure the following values based on your `config/.env.local` file:**

```properties
# Replace ${API_PORT} and ${JWT_SECRET} with actual values from config/.env.local
ip_address=10.0.2.2       # emulator → host machine; or your LAN IP on device
port=${API_PORT}          # Use the same value as API_PORT in config/.env.local (e.g. 3000)
jwt_secret=${JWT_SECRET}  # Use the same value as JWT_SECRET in config/.env.local
```

**ip_address**: Choose based on your setup:
- **Android Emulator**: Use `10.0.2.2` (this refers to your host machine from the emulator)
- **Physical Device**: Use your computer's local IP address

**To find your local IP address:**

 **Windows**:  
- Open Command Prompt (`Win + R`, type `cmd`, press Enter)  
- Run: `ipconfig`  
- Look for **"IPv4 Address"** under your network adapter (Wi-Fi or Ethernet)  
- Example output: `IPv4 Address. . . . . . . . . . . : 192.168.1.242`

 **macOS**:  
- Open Terminal  
- Run: `ifconfig`  
- Look for `inet` address under your network interface (typically `en0` for Wi-Fi)  
- Example output: `inet 192.168.1.242 netmask 0xffffff00 broadcast 192.168.1.255`

 **Linux**:  
- Open Terminal  
- Run: `ifconfig` (or `ip a` for newer systems)  
- Find `inet` address under your network interface (e.g., `wlan0` for Wi-Fi)  
- Example output: `inet 192.168.1.242 netmask 255.255.255.0 broadcast 192.168.1.255`

**port**: Use the same value as `API_PORT` in your `config/.env.local` file (default: 3000)

**jwt_secret**: Use the same value as `JWT_SECRET` in your `config/.env.local` file

**Example with actual values:**

```properties
ip_address=10.0.2.2
port=3000
jwt_secret=Vj4@7sF!9K#pLz^D2o7uN13X6A9Q5
```

#### 3. Update `network_security_config.xml`:
- Navigate to: `app/src/main/res/xml/`
- Open or create `network_security_config.xml`
- **Update the file** with the correct IP addresses for network security permissions:

**For Android Emulator:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">10.0.2.2</domain>
  </domain-config>
</network-security-config>
```

**For Physical Device (replace with your local IP):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">192.168.1.242</domain>  <!-- Replace with your actual local IP -->
  </domain-config>
</network-security-config>
```

**For Both Emulator and Physical Device:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">10.0.2.2</domain>          <!-- For Android Emulator -->
    <domain includeSubdomains="true">192.168.1.242</domain>     <!-- Replace with your local IP -->
  </domain-config>
</network-security-config>
```

### Running the Android Application:

#### 4. Build and Run:
1. **Ensure all Docker services are running** (from the Docker setup section)
2. **In Android Studio**:
- Wait for the project to sync and build
- Connect an Android device via USB **OR** start an Android Virtual Device (AVD)
- Click the **"Run"** button (green play icon) or press `Shift + F10`
- Select your target device (emulator or physical device)

#### 5. Verify Connection:
The Android app will connect to:
- **API server** at the configured IP and port (e.g., `10.0.2.2:3000`)
- **TCP service** at port 5555 for spam/blacklist functionality

**Note**: Make sure the values in `config.properties` match your `config/.env.local` file and that the IP addresses in `network_security_config.xml` correspond to your setup (emulator vs physical device).

Once the app launches successfully, you should be able to access all Gmail-like functionality.


---


