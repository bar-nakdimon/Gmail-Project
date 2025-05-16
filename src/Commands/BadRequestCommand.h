#ifndef BAD_REQUEST_COMMAND_H
#define BAD_REQUEST_COMMAND_H

#include "ICommand.h"   // Base command interface
#include <string>

// Forward declaration of BloomFilter class to avoid unnecessary includes
class BloomFilter;

/**
 * BadRequestCommand is a concrete implementation of ICommand.
 * It represents an invalid or malformed command input.
 * When executed, it simply returns a "400 Bad Request" response.
 */
class BadRequestCommand : public ICommand {
public:
    // Overrides the execute method to return an error response.
    // The BloomFilter parameter is unused in this implementation.
    std::string execute(BloomFilter& bloom) override;
};

#endif  // BAD_REQUEST_COMMAND_H
