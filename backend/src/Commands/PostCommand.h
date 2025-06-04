#ifndef POST_COMMAND_H
#define POST_COMMAND_H

#include "ICommand.h"   // Base interface for command execution
#include <string>       // For std::string

/**
 * @brief Handles the POST command.
 *
 * This command is responsible for adding a new URL to the Bloom filter
 * as well as to the real blacklist (e.g., a std::set used for double-checking).
 */
class PostCommand : public ICommand {
private:
    std::string url;  // The URL to be added to the blacklist

public:
    /**
     * @brief Constructor to initialize the command with a given URL.
     * @param url The URL that will be added to the Bloom filter
     */
    explicit PostCommand(const std::string& url);

    /**
     * @brief Executes the POST operation.
     *
     * Adds the URL to the Bloom filter (and to a real data structure for verification).
     *
     * @param bloom Reference to the BloomFilter instance
     * @return A string response, typically "201 Created" to indicate success
     */
    std::string execute(BloomFilter& bloom) override;
};

#endif // POST_COMMAND_H
