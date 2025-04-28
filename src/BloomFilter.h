#ifndef BLOOM_FILTER_H
#define BLOOM_FILTER_H

#include <vector>
#include <string>
#include <functional>
#include <set>

class BloomFilter {
private:
    std::vector<bool> bitArray;  // Bit array representing the Bloom filter
    std::vector<int> hashConfig;  // Stores the depth of each hash function
    std::set<std::string> blacklist;  // Real blacklist for double-checking false positives
    std::string saveFile;  // Path to the file where Bloom filter data is saved

public:
    /**
     * @brief Constructs a BloomFilter with given size, hash config, and file path.
     *
     * @param size Size of the Bloom filter bit array.
     * @param config Vector representing the hash function depths.
     * @param saveFile File path for saving/loading filter state.
     */
    BloomFilter(size_t size, const std::vector<int>& config, const std::string& saveFile);

    /**
     * @brief Adds a URL to the Bloom filter and the actual blacklist.
     *
     * @param url The URL to add to the filter.
     */
    void add(const std::string& url);

    /**
     * @brief Checks whether a URL might be in the blacklist using the Bloom filter.
     *        May return false positives.
     *
     * @param url The URL to check.
     * @return true if the Bloom filter indicates possible presence, false otherwise.
     */
    bool check(const std::string& url) const;

    /**
     * @brief Performs an exact lookup in the actual blacklist.
     *
     * @param url The URL to verify.
     * @return true if the URL is really blacklisted, false if it was a false positive.
     */
    bool doubleCheck(const std::string& url) const;

    /**
     * @brief Saves the current bit array, hash configuration, and blacklist to a file.
     */
    void save() const;

    /**
     * @brief Loads the bit array, hash configuration, and blacklist from the save file.
     *        This restores the filter's previous state.
     */
    void load();
};

#endif
