

#include "CommandFactory.h"    // Header for the CommandFactory interface
#include "PostCommand.h"       // Concrete implementation of the POST command
#include "GetCommand.h"        // Concrete implementation of the GET command
#include "DeleteCommand.h"     // Concrete implementation of the DELETE command

// Factory method to create ICommand instances based on CommandType enum.
// Each command type is mapped to its corresponding class that implements ICommand.
//
// @param type The type of command (POST, GET, DELETE_CMD)
// @param url  The URL the command will operate on
// @return A unique_ptr to an ICommand instance, or nullptr for an invalid type
std::unique_ptr<ICommand> CommandFactory::create(CommandType type, const std::string& url) {
    switch (type) {
        case CommandType::POST:
            return std::make_unique<PostCommand>(url);     // Create POST command
        case CommandType::GET:
            return std::make_unique<GetCommand>(url);      // Create GET command
        case CommandType::DELETE_CMD:
            return std::make_unique<DeleteCommand>(url);   // Create DELETE command
        default:
            return nullptr;  // Return null if the command type is invalid
    }
}
