#ifndef INPUT_VALIDATOR_H
#define INPUT_VALIDATOR_H

#include <string>
#include <vector>

/**
 * @brief Parses the initial configuration line for the Bloom filter.
 *        Expected format: "<bitSize> <depth1> <depth2> ..."
 *        Example: "256 1 2 3" → bitSize = 256, hashConfigs = {1, 2, 3}
 *
 * @param line The line of input to parse.
 * @param bitSize Output variable to hold the bit array size.
 * @param hashConfigs Output vector holding depths of hash functions.
 * @return true if parsing was successful and inputs are valid.
 */
bool parseInitialConfig(const std::string& line, size_t& bitSize, std::vector<int>& hashConfigs);

/**
 * @brief Parses a command line input of the form "1 url" or "2 url".
 *        Used for either adding to or checking the Bloom filter.
 *
 * @param line The line to parse.
 * @param command Output: 1 (add) or 2 (check).
 * @param url Output: the URL string.
 * @return true if parsing was successful and the command is valid.
 */
bool parseCommandLine(const std::string& line, int& command, std::string& url);

/**
 * @brief Validates if the given URL matches a basic web URL pattern.
 *
 * The regular expression is designed to match URLs with or without protocol prefixes
 * like "http://", "https://", and optionally "www.".
 * It checks for valid domain names, subdomains, and optional path components.
 *
 * Examples of valid inputs:
 * - https://www.example.com/path
 * - http://example.co
 * - example.com
 * - sub.domain.example
 *
 * Limitations:
 * - This regex is a simplified version and does not cover all edge cases of real-world URLs.
 * - It assumes a minimal path if present and basic domain naming rules.
 *
 * @param url The URL string to validate.
 * @return true if the URL matches the expected pattern, false otherwise.
 */
bool isValidUrl(const std::string& url);

#endif
