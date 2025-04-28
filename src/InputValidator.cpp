#include "InputValidator.h"
#include <sstream>
#include <regex>

/**
 * @brief Parses the initial config line and extracts Bloom filter size and hash configuration.
 *        The expected format is: "<size> <depth1> <depth2> ..." 
 *        Example input: "256 1 2 3" → Size = 256, hashConfigs = {1, 2, 3}
 *
 * @param line Input string from the user.
 * @param Size Output parameter for the bit array size.
 * @param hashConfigs Output vector storing hash function depths.
 * @return true if parsing was successful and config is valid.
 */
bool parseInitialConfig(const std::string& line, size_t& Size, std::vector<int>& hashConfigs) {
    std::istringstream iss(line);  // convert the input line into a stream
    if (!(iss >> Size)) return false;  // first value must be the bit array size
    int val;
    while (iss >> val) hashConfigs.push_back(val);  // read remaining values as hash depths
    return Size > 0 && !hashConfigs.empty();  // ensure valid size and at least one hash depth
}

/**
 * @brief Parses a command line of the form "1 url" (to add) or "2 url" (to check).
 *
 * @param line The input command line string.
 * @param command Output: either 1 or 2.
 * @param url Output: the URL string.
 * @return true if format is valid and command is 1 or 2 and URL is valid.
 */
bool parseCommandLine(const std::string& line, int& command, std::string& url) {
    std::istringstream iss(line);  // tokenize the line
    if (!(iss >> command >> url)) return false;  // must contain exactly 2 tokens
    return isValidUrl(url) && (command == 1 || command == 2);  // valid commands are 1 (add) or 2 (check) and url is valid

}

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
bool isValidUrl(const std::string& url) {
    const std::regex urlCheck(R"(^((https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,})(\/\S+)?$)");
    return std::regex_match(url, urlCheck);
}