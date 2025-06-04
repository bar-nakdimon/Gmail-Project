#ifndef DELETE_COMMAND_H
#define DELETE_COMMAND_H

#include "ICommand.h"   // Base interface for all commands
#include <string>       // For std::string

/**
 * @brief Handles the DELETE command.
 * 
 * This command removes a URL from the internal blacklist (e.g., std::set),
 * but **not** from the Bloom filter itself (since Bloom filters do not support true deletion).
 */
class DeleteCommand : public ICommand {
private:
    std::string url;  // The URL to be removed

public:
    /**
     * Constructor to initialize the DeleteCommand with the given URL.
     * @param url The URL to be removed from the blacklist
     */
    explicit DeleteCommand(const std::string& url);

    /**
     * Executes the delete operation on the Bloom filter’s auxiliary structure.
     * @param bloom Reference to the BloomFilter instance
     * @return "204 No Content" if successful, or "404 Not Found" if the URL wasn't in the list
     */
    std::string execute(BloomFilter& bloom) override;
};

#endif // DELETE_COMMAND_H
