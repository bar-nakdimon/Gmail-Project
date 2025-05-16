#include "BadRequestCommand.h"  // Include the class declaration

// Implements the execute method for a "bad request" scenario.
// This will be called when the input is invalid or the command is unrecognized.
//
// It ignores the BloomFilter because no logic should be applied
// to a malformed request — it just returns a standard HTTP-style error.
std::string BadRequestCommand::execute(BloomFilter&) {
    return "400 Bad Request";  // Response sent to client
}
