#include "InputValidator.h"
#include <sstream>  // For string stream parsing
#include <regex>    // For regex pattern matching

/**
 * Parses the initial Bloom filter configuration string.
 * Expected format: "<bit array size> <hash depth 1> <hash depth 2> ..."
 * Example: "256 1 2" → Size = 256, hashConfigs = {1, 2}
 *
 * @param line         The input configuration string
 * @param Size         Output: number of bits in the filter
 * @param hashConfigs  Output: vector of hash function depths
 * @return true if successfully parsed and valid
 */
bool parseInitialConfig(const std::string& line, size_t& Size, std::vector<int>& hashConfigs) {
    std::istringstream iss(line);  // Token stream from input line

    int tempSize;
    if (!(iss >> tempSize) || tempSize <= 0) return false;  // First token: must be a positive integer
    Size = static_cast<size_t>(tempSize);  // Store the filter size

    int val;
    std::string token;
    // Loop through remaining tokens and convert to integers
    while (iss >> token) {
        try {
            val = std::stoi(token);  // Convert to int
            if (val <= 0) return false;  // Hash depth must be positive
            hashConfigs.push_back(val);  // Store valid hash depth
        } catch (...) {
            return false;  // Token is not a valid integer
        }
    }

    return !hashConfigs.empty();  // At least one hash function is required
}

/**
 * Parses a client command line (e.g., "POST www.site.com").
 * Validates format and supported command types.
 *
 * @param line     The command input from the client
 * @param command  Output: command type (e.g., POST, GET, DELETE)
 * @param url      Output: the URL passed to the command
 * @return true if command is valid and correctly formatted
 */
bool parseCommandLine(const std::string& line, std::string& command, std::string& url) {
    std::istringstream iss(line);  // Token stream from input
    std::string extra;

    if (!(iss >> command >> url)) return false;  // Must contain exactly two tokens

    if (iss >> extra) return false;  // Reject more than two tokens

    // Accept only these exact command strings
    if (command != "POST" && command != "GET" && command != "DELETE") return false;

    // URL must match expected format
    if (!isValidUrl(url)) return false;

    return !url.empty();  // Final check (redundant with isValidUrl)
}

/**
 * Validates if the given URL is structurally valid.
 * Allows optional protocol (http/https), "www", subdomains, and path.
 *
 * @param url  The URL to validate
 * @return true if the URL matches expected web format
 */
bool isValidUrl(const std::string& url) {
    const std::regex urlCheck(R"(^((https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,})(\/\S+)?$)");
    return std::regex_match(url, urlCheck);  // Check if URL matches the pattern
}

/**
 * Checks if an IP address is valid (IPv4 format: X.X.X.X)
 *
 * @param ip  The input IP address string
 * @return true if the IP is valid
 */
bool isValidIP(const std::string& ip) {
    std::istringstream ss(ip);
    std::string part;
    int count = 0;

    while (std::getline(ss, part, '.')) {  // Split by '.'
        if (++count > 4 || part.empty() || part.size() > 3 || !std::all_of(part.begin(), part.end(), ::isdigit))
            return false;
        int num = std::stoi(part);  // Convert part to integer
        if (num < 0 || num > 255) return false;  // Each segment must be in 0–255 range
    }

    return count == 4;  // Valid IPv4 address must have 4 segments
}

/**
 * Checks if the string contains any whitespace (space, tab, newline, etc.)
 *
 * @param str  The string to check
 * @return true if any whitespace is found
 */
bool containsAnyWhitespace(const std::string& str) {
    return std::any_of(str.begin(), str.end(), ::isspace);
}

/**
 * Checks if a port number is valid (must be between 1024 and 65535)
 *
 * @param port  The port number to check
 * @return true if the port is valid
 */
 bool isValidPort(int port) {
    return port >= 1024 && port <= 65535;
}
