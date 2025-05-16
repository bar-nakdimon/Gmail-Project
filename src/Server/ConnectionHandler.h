#ifndef CONNECTION_HANDLER_H
#define CONNECTION_HANDLER_H

#include <string>  // Required for std::string

// The ConnectionHandler class manages the lifecycle of a single client connection.
// It handles receiving input, parsing commands, executing them, and sending responses back.
class ConnectionHandler {
public:
    /**
     * @brief Constructor that initializes the connection handler with a socket and config line.
     * 
     * @param socket The connected client socket (already accepted by the server).
     * @param configLine A configuration string used to initialize the BloomFilter (e.g., "256 1 2").
     */
    ConnectionHandler(int socket, const std::string& configLine);

    /**
     * @brief Starts handling the communication with the client.
     * 
     * This function listens for commands from the client, validates them,
     * executes the corresponding logic using a BloomFilter, and sends back responses.
     */
    void handle();

private:
    int clientSocket;         // Socket descriptor for the client connection
    std::string configLine;   // Configuration string for setting up the BloomFilter
};

#endif // CONNECTION_HANDLER_H
