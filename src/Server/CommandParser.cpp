#include "CommandParser.h"             // Header for CommandParser class and CommandType enum
#include "Bloom/InputValidator.h"     // Includes parseCommandLine() for validating and splitting input
#include <sstream>                    // Included in case string stream operations are needed

// Parses a string input command from the client and returns a ParsedCommand struct.
// It uses parseCommandLine to extract the command type and URL, and maps the command string
// to a corresponding CommandType enum. If parsing or validation fails, it returns INVALID.
ParsedCommand CommandParser::parseCommand(const std::string& input) {
    std::string commandStr, url;  // To hold parsed command keyword (e.g., POST) and URL

    // Try to parse and validate the input string into commandStr and url
    if (!parseCommandLine(input, commandStr, url)) {
        return {CommandType::INVALID, ""};  // If parsing fails, return INVALID command
    }

    // Match the command string to its corresponding enum
    if (commandStr == "POST") return {CommandType::POST, url};           // Create POST command
    if (commandStr == "GET") return {CommandType::GET, url};             // Create GET command
    if (commandStr == "DELETE") return {CommandType::DELETE_CMD, url};   // Create DELETE command

    // If command is not recognized, return INVALID
    return {CommandType::INVALID, ""};
}
