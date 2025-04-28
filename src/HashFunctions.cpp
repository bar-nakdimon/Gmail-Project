#include <string>
#include <functional>

/**
 * @brief Applies std::hash recursively based on depth to simulate multiple hash functions.
 *
 * This function allows you to create logically different hash functions from a single 
 * base hash (std::hash). For example, depth=1 returns a normal hash, while depth=2 applies 
 * std::hash to the result of the first hash, and so on.
 *
 * @param input The string to hash.
 * @param depth How many times to hash recursively.
 * @return size_t The final hashed value.
 */
size_t make_hash(const std::string& input, int depth) {
    std::hash<std::string> hasher;  // Standard string hash function

    std::string temp = input;  // Start with the original input

    // Apply hashing (depth - 1) times using stringified intermediate results
    for (int i = 1; i < depth; ++i) {
        temp = std::to_string(hasher(temp));  // Hash current string, then convert to string
    }

    // Final hash application — return numeric result
    return hasher(temp);
}
