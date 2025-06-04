

#ifndef COMMAND_FACTORY_H
#define COMMAND_FACTORY_H

#include <memory>   // For std::unique_ptr
#include <string>   // For std::string
#include "ICommand.h"  // Base interface for all command types
#include "../Server/CommandParser.h"  // For CommandType enum definition

/**
 * CommandFactory is a static factory class that creates ICommand objects.
 * It selects the correct command class (e.g., PostCommand, GetCommand, etc.)
 * based on the CommandType parsed from the client's input.
 */
class CommandFactory {
public:
    /**
     * Creates a concrete ICommand object based on the given command type and URL.
     *
     * @param type The CommandType (e.g., POST, GET, DELETE_CMD)
     * @param url The URL that the command will operate on
     * @return A unique_ptr to the corresponding ICommand implementation, or nullptr if the type is invalid
     */
    static std::unique_ptr<ICommand> create(CommandType type, const std::string& url);
};

#endif // COMMAND_FACTORY_H
