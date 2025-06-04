#ifndef GET_COMMAND_H
#define GET_COMMAND_H

#include "ICommand.h"   // Base interface for command execution
#include <string>       // For std::string

/**
 * @brief Handles the GET command - checks if a given URL is blacklisted.
 *
 * The command checks for the presence of a URL in the Bloom filter and, if found,
 * performs a secondary check in the actual blacklist (e.g., a std::set) to eliminate false positives.
 */
class GetCommand : public ICommand {
private:
    std::string url;  // The URL to check

public:
    /**
     * @brief Constructor that initializes the command with a specific URL.
     * @param url The URL to be checked against the Bloom filter
     */
    explicit GetCommand(const std::string& url); 

    /**
     * @brief Executes the GET command.
     *        Uses the Bloom filter to quickly check if a URL is possibly blacklisted.
     *        If so, uses a real data structure to double-check the result.
     *
     * @param bloom Reference to the BloomFilter object
     * @return A string response formatted as:
     *         - "false" (definitely not blacklisted)
     *         - "true true" (possibly in filter and confirmed blacklisted)
     *         - "true false" (false positive from the Bloom filter)
     */
    std::string execute(BloomFilter& bloom) override;
};

#endif // GET_COMMAND_H
