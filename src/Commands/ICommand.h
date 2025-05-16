#ifndef ICOMMAND_H
#define ICOMMAND_H

#include <string>

// Forward declaration of BloomFilter to avoid including its full definition here.
// This reduces compile-time dependencies and allows looser coupling.
class BloomFilter;

/**
 * @brief Interface for the command pattern.
 * 
 * This abstract base class defines a uniform interface for all command types (POST, GET, DELETE).
 * Each concrete command implements the execute method, which performs the corresponding action
 * using the provided BloomFilter instance.
 */
class ICommand {
public:
    virtual ~ICommand() = default;  // Virtual destructor for proper cleanup in derived classes

    /**
     * Executes the command logic using the given BloomFilter.
     * This method must be implemented by every class that inherits from ICommand.
     *
     * @param bloom A reference to the BloomFilter object used in the operation
     * @return A string representing the response of the command
     */
    virtual std::string execute(BloomFilter& bloom) = 0;
};

#endif // ICOMMAND_H
