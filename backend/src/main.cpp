
#include "Server/Server.h"             // Server class definition
#include "Bloom/InputValidator.h"      // Input validation utilities
#include "Bloom/BloomFilter.h"
#include <string>
#include <vector>
#include <algorithm>                  // For std::all_of
#include <cctype>                     // For std::isdigit
#include <sstream>

/**
 * Entry point of the server application.
 * Expects command-line arguments in the format:
 * ./server <PORT> <FILTER_SIZE> <HASH_DEPTH_1> <HASH_DEPTH_2> ...
 */
int main(int argc, char* argv[]) {
    // Check if there are at least 3 arguments (program name + 2 others)
    if (argc < 3) return 1;

    // Reject any argument containing whitespace (invalid input)
    for (int i = 1; i < argc; ++i) {
        std::string arg(argv[i]);
        if (containsAnyWhitespace(arg)) return 1;
    }

    std::string portStr = argv[1];        // Port string from user input

    // Validate port string is a number
    if (portStr.empty() || !std::all_of(portStr.begin(), portStr.end(), ::isdigit)) return 1;

    int port = std::stoi(portStr);        // Convert port string to integer

    // Validate port range using helper (must be between 1024–65535)
    if (!isValidPort(port)) return 1;

    // Reconstruct configuration line (space-separated values after port)
    std::string configLine;
    for (int i = 2; i < argc; ++i) {
        configLine += argv[i];
        if (i != argc - 1) configLine += " ";
    }

    size_t filterSize;
    std::vector<int> hashFuncs;

    // Validate the config line and extract filter size and hash function depths
    if (!parseInitialConfig(configLine, filterSize, hashFuncs)) return 1;

    try {
        // Create and start the server with port and config (IP removed)
        BloomFilter* sharedBloom = new BloomFilter(filterSize, hashFuncs, "data/filter_data.txt");
        ThreadManager threadManager;
        Server server(port, configLine, sharedBloom, &threadManager);


        server.run();
    } catch (...) {
        return 1;
    }

    return 0;
}
