#include "ConnectionHandler.h"         // Header for ConnectionHandler class
#include "Bloom/BloomFilter.h"         // Bloom filter logic
#include "Bloom/InputValidator.h"      // Input validation utilities (e.g., parseInitialConfig)
#include "CommandParser.h"             // Parses client command strings into ParsedCommand
#include "Commands/CommandFactory.h"   // Factory to create ICommand objects based on command type

#include <unistd.h>                    // For close()
#include <sstream>                     // For string stream manipulation
#include <iostream>                    // For debugging/logging (optional)
#include <memory>                      // For std::unique_ptr
#include <sys/socket.h>                // For socket communication functions
#include <thread>
#include <mutex>

// Constructor initializes the ConnectionHandler with a client socket and configuration string
ConnectionHandler::ConnectionHandler(int socket, BloomFilter* bloom, std::mutex* mutex)
    : clientSocket(socket), bloom(bloom), bloom_mutex(mutex) {}

// Handles incoming client requests on the connected socket
void ConnectionHandler::handle() {
    char buffer[4096];                        // Buffer to read data from the socket
    std::string leftover;                     // Stores any partial or extra input between reads
    size_t size;                              // Bloom filter size
    std::vector<int> config;                  // Hash function depths
    //std::unique_ptr<BloomFilter> bloom;       // Bloom filter instance (managed with smart pointer)
    
    /*
    // Parse the configuration passed to the handler (not from client input)
    if (!parseInitialConfig(configLine, size, config)) {
        std::string response = "400 Bad Request\n";
        send(clientSocket, response.c_str(), response.size(), 0);
        close(clientSocket);                  // Close connection on invalid config
        return;
    }

    // Create BloomFilter with parsed parameters and data file for persistent state
    bloom = std::make_unique<BloomFilter>(size, config, "data/filter_data.txt");*/

    // Enter main communication loop with the client
    while (true) {
        // Receive data from client into buffer (up to 4095 bytes)
        ssize_t bytesReceived = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
        if (bytesReceived <= 0) break;        // Exit if client disconnected or error occurred

        buffer[bytesReceived] = '\0';         // Null-terminate the received string
        leftover += buffer;                   // Append new data to any leftover from previous reads

        // Process full lines (commands are separated by '\n')
        size_t pos;
        while ((pos = leftover.find('\n')) != std::string::npos) {
            std::string line = leftover.substr(0, pos);  // Extract full line
            leftover.erase(0, pos + 1);                  // Remove the line from leftover buffer

            // Trim leading whitespace
            line.erase(0, line.find_first_not_of(" \t\r\n"));

            // Trim trailing whitespace
            size_t end = line.find_last_not_of(" \t\r\n");
            if (end != std::string::npos) {
                line.erase(end + 1);
            } else {
                line.clear();  // If line is all whitespace, just clear it
            }

            // Reject empty lines
            if (line.empty()) {
                std::string response = "400 Bad Request\n";
                send(clientSocket, response.c_str(), response.size(), 0);
                shutdown(clientSocket, SHUT_WR);
                continue;
            }

            // Parse the command string using the CommandParser
            ParsedCommand parsed = CommandParser::parseCommand(line);
            if (parsed.type == CommandType::INVALID) {
                std::string response = "400 Bad Request\n";
                send(clientSocket, response.c_str(), response.size(), 0);
                shutdown(clientSocket, SHUT_WR);
                continue;
            }

            // Create the appropriate command object based on the command type
            std::unique_ptr<ICommand> cmd = CommandFactory::create(parsed.type, parsed.url);
            if (!cmd) {
                std::string response = "400 Bad Request\n";
                send(clientSocket, response.c_str(), response.size(), 0);
                shutdown(clientSocket, SHUT_WR);
                continue;
            }

            // Execute the command on the BloomFilter and send the response back to the client
            std::string response;
            {
                std::lock_guard<std::mutex> lock(*bloom_mutex);
                response = cmd->execute(*bloom) + "\n";
            }
            send(clientSocket, response.c_str(), response.size(), 0);
            shutdown(clientSocket, SHUT_WR);
        }
    }

    // Close the connection after the client is done
    close(clientSocket);
}
