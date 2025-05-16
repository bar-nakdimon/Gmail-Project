#include "BloomFilter.h"
#include "HashFunctions.h"
#include <fstream>
#include <sstream>
#include <iostream>  // for std::cout and std::cerr

/**
 * @brief Constructs a BloomFilter with given size and hash configuration, 
 *        and attempts to load previously saved filter state from file.
 *
 * @param size Number of bits in the Bloom filter.
 * @param config Depths of hash functions to be used.
 * @param file Path to file where Bloom filter state is persisted.
 */
BloomFilter::BloomFilter(size_t size, const std::vector<int>& config, const std::string& file)
    : bitArray(size, false), hashConfig(config), saveFile(file) {
    load(); // attempt to load previous state
}

/**
 * @brief Adds a URL to the Bloom filter and stores it in the real blacklist.
 *
 * @param url The URL to add.
 */
void BloomFilter::add(const std::string& url) {
    // Loop through each configured hash depth
    for (int depth : hashConfig) {
        // Compute the hash for this URL at the given depth
        size_t index = make_hash(url, depth) % bitArray.size();

        // Set the corresponding bit in the bit array
        bitArray[index] = true;
    }

    // Add the URL to the actual blacklist (used for double-checking)
    blacklist.insert(url);

    // Save the updated Bloom filter state to disk
    save();
}

/**
 * @brief Checks if the Bloom filter indicates that a URL might be blacklisted.
 *
 * @param url The URL to check.
 * @return true if all relevant bits are set; false otherwise.
 */
bool BloomFilter::check(const std::string& url) const {
    // Loop through each configured hash depth
    for (int depth : hashConfig) {
        // Compute the hash for this URL at the given depth
        size_t index = make_hash(url, depth) % bitArray.size();

        // If any bit is not set, the URL is definitely not in the filter
        if (!bitArray[index]) return false;
    }

    // All bits are set: URL might be in the filter (could be false positive)
    return true;
}

/**
 * @brief Verifies actual presence in the real blacklist (no false positives).
 *
 * @param url The URL to verify.
 * @return true if the URL is definitely blacklisted.
 */
bool BloomFilter::doubleCheck(const std::string& url) const {
    return blacklist.find(url) != blacklist.end();
}

bool BloomFilter::remove(const std::string& url) {
    auto it = blacklist.find(url);
    if (it != blacklist.end()) {
        blacklist.erase(it);
        save();  // save updated list to disk
        return true;
    }
    return false;
}


/**
 * @brief Saves the current state of the Bloom filter to disk, including:
 *        - bit array
 *        - hash configuration
 *        - blacklist
 */
void BloomFilter::save() const {
    std::ofstream out(saveFile);

    // Write bit array as a single line of '0' and '1'
    for (bool bit : bitArray) {
        out << bit;
    }
    out << "\n";

    // Write hash config (depths) as space-separated integers
    for (int d : hashConfig) {
        out << d << " ";
    }
    out << "\n";

    // Write blacklist: one URL per line
    for (const auto& url : blacklist) {
        out << url << "\n";
    }

    out.close();
}

/**
 * @brief Loads Bloom filter state from disk:
 *        - First line: bit array
 *        - Second line: hash config
 *        - Remaining lines: blacklist entries
 */
void BloomFilter::load() {
    std::ifstream in(saveFile);
    if (!in) return;

    std::string line;

    // Load bit array
    if (std::getline(in, line)) {
        for (size_t i = 0; i < line.size() && i < bitArray.size(); ++i) {
            bitArray[i] = line[i] == '1';
        }
    }

    // Load hash config
    if (std::getline(in, line)) {
        std::istringstream iss(line);
        int val;
        hashConfig.clear();
        while (iss >> val) {
            hashConfig.push_back(val); // fill hashConfig vector
        }
    }

    // Load blacklist
    while (std::getline(in, line)) {
        blacklist.insert(line); // insert each line as a blacklisted URL
    }

    in.close();
}
