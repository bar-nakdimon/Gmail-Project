#include "PostCommand.h"               // Declaration of the PostCommand class
#include "Bloom/BloomFilter.h"         // BloomFilter class used to add the URL


// Constructor for PostCommand
// Initializes the command with the provided URL
PostCommand::PostCommand(const std::string& url) : url(url) {}


// Executes the POST command logic
// Adds the URL to the Bloom filter (and likely to an internal set for double-checking).
//
// Returns an HTTP-style response string indicating success.
std::string PostCommand::execute(BloomFilter& bloom) {
    bloom.add(url);                   // Insert the URL into the Bloom filter and underlying set
    return "201 Created";             // Response indicating the resource (URL) was added
}
