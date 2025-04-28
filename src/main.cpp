#include <iostream>
#include "BloomFilter.h"
#include "InputValidator.h"

/**
 * @brief Entry point of the program. 
 *        Initializes a Bloom filter using a configuration line, 
 *        then continuously reads commands to add or check URLs.
 *
 * @return int Exit status (0 for success).
 */
int main() {
    std::string line;
    size_t size;
    std::vector<int> config;

    // Read the initial config line from user input (e.g., "256 2 3 4")
    // This sets the bit array size and hash function depths
    while (std::getline(std::cin, line)) {
        if (parseInitialConfig(line, size, config)) break;
    }

    // Create and initialize the Bloom filter using the provided config
    BloomFilter bf(size, config, "filter_data.txt");

    // Continuously read commands from input: either to add or check a URL
    while (std::getline(std::cin, line)) {
        int command;
        std::string url;

        // Parse command line: either "1 url" (add) or "2 url" (check)
        if (!parseCommandLine(line, command, url)) continue;

        switch (command) {
            case 1:
                // Add the URL to the Bloom filter
                bf.add(url);
                break;

            case 2: {
                // Check if the URL might be in the blacklist using the Bloom filter
                bool result = bf.check(url);

                if (result) {
                    std::cout << "true";

                    // Double-check if it's a real match (not a false positive)
                    result = bf.doubleCheck(url);
                    std::cout << " " << (result ? "true" : "false");
                } else {
                    // Definitely not in the blacklist
                    std::cout << "false";
                }

                std::cout << std::endl;
                break;
            }

            default:
                // Ignore unsupported commands
                break;
        }
    }

    return 0;
}
