#include "DeleteCommand.h"             // Declaration of DeleteCommand class
#include "Bloom/BloomFilter.h"         // BloomFilter class used for deletion

// Constructor for DeleteCommand
// Initializes the command with the provided URL
DeleteCommand::DeleteCommand(const std::string& url) : url(url) {}

// Executes the delete command using the provided BloomFilter
// Tries to remove the URL from the Bloom filter
//
// If the URL is not found (removal failed), return "404 Not Found"
// If the URL was successfully removed, return "204 No Content"
std::string DeleteCommand::execute(BloomFilter& bloom) {
    if (!bloom.remove(url)) {
        return "404 Not Found";        // Indicates that the URL was not in the filter
    }
    return "204 No Content";           // Indicates successful removal with no additional content
}
