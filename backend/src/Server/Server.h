#ifndef SERVER_H
#define SERVER_H

#include <string>
#include "Bloom/BloomFilter.h"
#include "ThreadManager.h"

/**
 * @brief The Server class handles setting up a TCP server socket,
 * accepting incoming client connections, and delegating client
 * handling to ConnectionHandler instances.
 */
class Server {
public:
    /**
     * @brief Constructor for the Server class.
     * @param port Port number the server will listen on.
     * @param configLine Configuration string passed to clients (e.g., Bloom filter settings).
     */
    Server(int port, const std::string& configLine, BloomFilter* bloom, ThreadManager* manager);

    /**
     * @brief Starts the server and enters the main accept loop to handle clients.
     */
    void run();

private:
    int port;                  // Port number to listen on
    int serverSocket;          // Server socket file descriptor
    std::string configLine;    // Configuration line to pass to each ConnectionHandler
    BloomFilter* bloom;
    ThreadManager* threadManager;


    /**
     * @brief Initializes and configures the server socket.
     */
    void setupSocket();

    /**
     * @brief Handles an individual client connection.
     * @param clientSocket The socket file descriptor for the connected client.
     */
    void handleClient(int clientSocket);
};

#endif // SERVER_H
