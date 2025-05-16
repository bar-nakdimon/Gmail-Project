#include <string>
#include <sstream>
#include "GetCommand.h"                 // Declaration of GetCommand
#include "Bloom/BloomFilter.h"         // BloomFilter class to check and double-check URLs

// Constructor for GetCommand
// Initializes the command with the URL provided by the user
GetCommand::GetCommand(const std::string& url) : url(url) {}


// Executes the GET command logic
// This checks whether the given URL is in the Bloom filter and, if found, performs a secondary check
//
// The returned format is:
//  - "false" if not in the filter
//  - "true true" if in filter and also in real blacklist (double check passed)
//  - "true false" if possibly in filter but not actually blacklisted
std::string GetCommand::execute(BloomFilter& bloom) {
    if (url.empty()) {
        return "400 Bad Request";  // Input validation: empty URL is considered malformed
    }

    bool bloomResult = bloom.check(url);  // Check via Bloom filter (fast but might be false-positive)
    std::ostringstream response;
    response << "200 Ok\n\n";             // Always return 200 if the input format was valid

    if (bloomResult) {
        // If Bloom filter *may* contain the URL, perform a real lookup
        bool isActuallyBlacklisted = bloom.doubleCheck(url);  // Check in the actual std::set
        response << "true " << (isActuallyBlacklisted ? "true" : "false");
    } else {
        // Definitely not in the Bloom filter
        response << "false";
    }

    return response.str();  // Return the full formatted response
}
