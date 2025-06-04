#include "Server.h"                // Include the Server class definition
#include "ConnectionHandler.h"     // For handling individual client connections
#include "Bloom/BloomFilter.h"

#include <iostream>                // For std::cout and std::cerr
#include <stdexcept>               // For throwing runtime errors
#include <cstring>                 // For std::memset
#include <sys/socket.h>            // For socket(), bind(), listen(), accept()
#include <netinet/in.h>            // For sockaddr_in
#include <unistd.h>                // For close()
#include <thread>
#include <mutex>

#define MAX_CLIENTS 100            // Define the maximum number of clients to handle at once
static std::mutex bloom_mutex;

// Modified constructor: no IP argument
Server::Server(int port, const std::string& configLine, BloomFilter* bloom, ThreadManager* manager)
    : port(port), serverSocket(-1), configLine(configLine), bloom(bloom), threadManager(manager) {}

// Sets up the server socket, binds it to all available interfaces, and starts listening
void Server::setupSocket() {
    // Create a TCP socket (IPv4)
    serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket < 0) {  // Check if socket creation failed
        perror("Error creating socket");
        throw std::runtime_error("Socket creation failed");
    }

    // Allow reuse of the address/port
    int opt = 1;
    if (setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        perror("setsockopt failed");
        exit(EXIT_FAILURE);  // If setting socket options failed, exit
    }

    // Initialize sockaddr_in structure to specify server address details
    sockaddr_in serverAddr{};  // Zero-initialize the structure
    std::memset(&serverAddr, 0, sizeof(serverAddr));  // Explicitly set all fields to zero
    serverAddr.sin_family = AF_INET;  // IPv4
    serverAddr.sin_addr.s_addr = INADDR_ANY;  // Bind to all network interfaces (0.0.0.0)
    serverAddr.sin_port = htons(port);  // Convert port to network byte order

    // Bind the socket to the server address and port
    if (bind(serverSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
        close(serverSocket);  // Close socket if bind fails
        throw std::runtime_error("");  // Fail silently without error message
    }

    // Start listening for incoming connections
    if (listen(serverSocket, MAX_CLIENTS) < 0) {
        perror("Error listening");  // If listening fails, print error
        close(serverSocket);  // Close the socket
        throw std::runtime_error("Listen failed");
    }

    std::cout << "Server is listening on port " << port << std::endl;  // Inform that the server is ready to accept connections
}

// Handles an individual client socket connection
void Server::handleClient(int clientSocket) {
    // Create a ConnectionHandler object to manage this client's connection
    ConnectionHandler handler(clientSocket, bloom, &bloom_mutex);
    handler.handle();  // Handle the communication with the client
}

// Starts the server and waits for connections
void Server::run() {
    setupSocket();  // Set up the server socket, bind it, and start listening

    sockaddr_in clientAddr{};  // Client's address information
    socklen_t clientLen = sizeof(clientAddr);  // Length of client address structure

    while (true) {
        // Accept incoming client connections
        int clientSocket = accept(serverSocket, (struct sockaddr*)&clientAddr, &clientLen);
        if (clientSocket < 0) {  // Check if accepting a connection failed
            perror("Error accepting connection");
            continue;  // If accepting failed, continue to accept next connections
        }
        threadManager->run([this, clientSocket]() {
            this->handleClient(clientSocket);
            close(clientSocket);
        });

    }

    close(serverSocket);  // Unreachable unless the loop is broken (graceful shutdown)
}
