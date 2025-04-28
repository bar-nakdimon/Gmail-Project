#ifndef HASH_FUNCTIONS_H
#define HASH_FUNCTIONS_H

#include <string>

/**
 * @brief Hashes a string using recursive hashing by the given depth.
 */
size_t make_hash(const std::string& input, int depth);

#endif