#ifndef INPUT_VALIDATOR_H
#define INPUT_VALIDATOR_H

#include <string>
#include <vector>

/**
 * Parses the initial configuration line for the Bloom filter.
 * Expected input format: "<bitSize> <hashDepth1> <hashDepth2> ..."
 * Example: "256 1 2 3" means a filter size of 256 bits and 3 hash functions with depths 1, 2, 3.
 *
 * @param line         The configuration line as a string
 * @param bitSize      Output: number of bits to use in the Bloom filter
 * @param hashConfigs  Output: vector of hash depths for the Bloom filter
 * @return true if parsing is successful and valid
 */
bool parseInitialConfig(const std::string& line, size_t& bitSize, std::vector<int>& hashConfigs);

/**
 * Parses a user command from the client, such as:
 * "POST www.site.com", "GET www.site.com", "DELETE www.site.com"
 * Ensures the command and URL are valid and properly formatted.
 *
 * @param input   The raw command line string from the client
 * @param command Output: the parsed command (POST, GET, or DELETE)
 * @param url     Output: the URL string associated with the command
 * @return true if the format is valid and both parts are accepted
 */
bool parseCommandLine(const std::string& input, std::string& command, std::string& url);

/**
 * Checks if the provided URL matches a valid web format.
 * Supports optional "http://" or "https://", optional "www.", and domain + optional path.
 *
 * Examples of accepted URLs:
 * - "example.com"
 * - "https://www.example.com/path"
 * - "http://example.co"
 *
 * @param url  The URL string to check
 * @return true if the format is valid
 */
bool isValidUrl(const std::string& url);

/**
 * Checks if the given string is a valid IPv4 address in the form X.X.X.X
 * Each X must be between 0 and 255.
 *
 * @param ip  The IP address as a string
 * @return true if it's a valid IPv4 address
 */
bool isValidIP(const std::string& ip);

/**
 * Checks if a string contains any whitespace (space, tab, newline, etc.).
 * Useful for validating input arguments that must be clean.
 *
 * @param str  The string to examine
 * @return true if the string contains any whitespace
 */
bool containsAnyWhitespace(const std::string& str);


/**
 * Checks if a port number is within the allowed user-space range.
 * Ports 0–1023 are reserved for system-level services, so this function
 * ensures the port is in the valid range: 1024–65535.
 *
 * @param port  The port number to check
 * @return true if the port is between 1024 and 65535 (inclusive)
 */
 bool isValidPort(int port);



#endif  // INPUT_VALIDATOR_H
