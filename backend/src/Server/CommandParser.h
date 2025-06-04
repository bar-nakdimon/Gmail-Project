#ifndef COMMAND_PARSER_H
#define COMMAND_PARSER_H

#include <string>  // Required for std::string

// Enum representing the types of supported commands.
// Used to dispatch to the correct logic later in the program.
enum class CommandType {
    POST,        // Add a URL to the Bloom filter and blacklist
    GET,         // Check if a URL is blacklisted
    DELETE_CMD,  // Remove a URL from the blacklist (not from the Bloom filter itself)
    INVALID      // Command could not be parsed or is not recognized
};

// Struct to represent the result of parsing a command string.
// Holds both the command type and the URL associated with it.
struct ParsedCommand {
    CommandType type;     // Type of the command (POST, GET, DELETE, etc.)
    std::string url;      // The URL on which the command should operate
};

// CommandParser is responsible for parsing raw input strings
// and converting them into structured ParsedCommand objects.
class CommandParser {
public:
    // Static method to parse a string and return a ParsedCommand.
    // If parsing fails, the result will have CommandType::INVALID.
    static ParsedCommand parseCommand(const std::string& input);
};

#endif // COMMAND_PARSER_H
