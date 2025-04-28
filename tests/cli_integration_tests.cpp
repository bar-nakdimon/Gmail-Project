#include <gtest/gtest.h>
#include <fstream>
#include <sstream>
#include <cstdlib>

// === SANITY TEST 1 ===
// Add a URL and immediately check it
// Expected output: "true true"
TEST(CLIIntegrationTest, AddAndCheck_TrueTrue) {
    std::ofstream input("input_cli.txt");
    input << "16 1\n";
    input << "1 example.com\n";
    input << "2 example.com\n";
    input.close();

    system("./runCli < input_cli.txt > output_cli.txt");

    std::ifstream output("output_cli.txt");
    std::stringstream buffer;
    buffer << output.rdbuf();
    EXPECT_EQ(buffer.str(), "true true\n");

    std::remove("input_cli.txt");
    std::remove("output_cli.txt");
    std::remove("filter_data.txt");
}

// === SANITY TEST 2 ===
// Check a URL that was never added
// Expected output: "false"
TEST(CLIIntegrationTest, CheckNonAddedURL) {
    std::ofstream input("input_cli.txt");
    input << "16 1\n";
    input << "2 notfound.com\n";
    input.close();

    system("./runCli < input_cli.txt > output_cli.txt");

    std::ifstream output("output_cli.txt");
    std::stringstream buffer;
    buffer << output.rdbuf();
    EXPECT_EQ(buffer.str(), "false\n");

    std::remove("input_cli.txt");
    std::remove("output_cli.txt");
    std::remove("filter_data.txt");
}

// === SANITY TEST 3 ===
// Add two URLs and check one of them
// Expected output: "true true"
TEST(CLIIntegrationTest, AddTwo_CheckOne) {
    std::ofstream input("input_cli.txt");
    input << "16 1\n";
    input << "1 first.com\n";
    input << "1 second.com\n";
    input << "2 second.com\n";
    input.close();

    system("./runCli < input_cli.txt > output_cli.txt");

    std::ifstream output("output_cli.txt");
    std::stringstream buffer;
    buffer << output.rdbuf();
    EXPECT_EQ(buffer.str(), "true true\n");

    std::remove("input_cli.txt");
    std::remove("output_cli.txt");
    std::remove("filter_data.txt");
}

// === INPUT VALIDATION TEST 1 ===
// Use an invalid command (e.g., 99)
// Expected output: command ignored, URL not added
TEST(CLIIntegrationTest, InvalidCommandIgnored) {
    std::ofstream input("input_cli.txt");
    input << "16 1\n";
    input << "99 fake.com\n";
    input << "2 fake.com\n";
    input.close();

    system("./runCli < input_cli.txt > output_cli.txt");

    std::ifstream output("output_cli.txt");
    std::stringstream buffer;
    buffer << output.rdbuf();
    EXPECT_EQ(buffer.str(), "false\n");

    std::remove("input_cli.txt");
    std::remove("output_cli.txt");
    std::remove("filter_data.txt");
}

// === INPUT VALIDATION TEST 2 ===
// Missing URL in add command
// Expected: command ignored
TEST(CLIIntegrationTest, MissingURLIgnored) {
    std::ofstream input("input_cli.txt");
    input << "16 1\n";
    input << "1\n";               // malformed command
    input << "2 example.com\n";   // never added
    input.close();

    system("./runCli < input_cli.txt > output_cli.txt");

    std::ifstream output("output_cli.txt");
    std::stringstream buffer;
    buffer << output.rdbuf();
    EXPECT_EQ(buffer.str(), "false\n");

    std::remove("input_cli.txt");
    std::remove("output_cli.txt");
    std::remove("filter_data.txt");
}

// === INPUT VALIDATION TEST 3 ===
// Empty line in the input should be ignored
TEST(CLIIntegrationTest, EmptyLineIgnored) {
    std::ofstream input("input_cli.txt");
    input << "16 1\n";
    input << "\n";                 // empty line
    input << "2 example.com\n";    // never added
    input.close();

    system("./runCli < input_cli.txt > output_cli.txt");

    std::ifstream output("output_cli.txt");
    std::stringstream buffer;
    buffer << output.rdbuf();
    EXPECT_EQ(buffer.str(), "false\n");

    std::remove("input_cli.txt");
    std::remove("output_cli.txt");
    std::remove("filter_data.txt");
}

// === VALIDATION TEST 1 ===
// Invalid initial configuration line (non-numeric values)
// Should skip the line and fallback to the next valid config
TEST(CLIIntegrationTest, InvalidInitialConfigIgnored) {
    std::ofstream input("input_cli.txt");
    input << "hello world\n";       // invalid config line
    input << "16 1\n";              // valid fallback
    input << "1 site.com\n";
    input << "2 site.com\n";
    input.close();

    system("./runCli < input_cli.txt > output_cli.txt");

    std::ifstream output("output_cli.txt");
    std::stringstream buffer;
    buffer << output.rdbuf();
    EXPECT_EQ(buffer.str(), "true true\n");

    std::remove("input_cli.txt");
    std::remove("output_cli.txt");
    std::remove("filter_data.txt");
}

// === VALIDATION TEST 2 ===
// Zero size config should be ignored and replaced with valid one
TEST(CLIIntegrationTest, ZeroSizeConfigIgnored_ValidConfigUsed) {
    std::ofstream input("input_cli.txt");
    input << "0 1\n";               // invalid size
    input << "16 1\n";              // valid fallback
    input << "1 recovered.com\n";
    input << "2 recovered.com\n";
    input.close();

    system("./runCli < input_cli.txt > output_cli.txt");

    std::ifstream output("output_cli.txt");
    std::stringstream buffer;
    buffer << output.rdbuf();
    EXPECT_EQ(buffer.str(), "true true\n");

    std::remove("input_cli.txt");
    std::remove("output_cli.txt");
    std::remove("filter_data.txt");
}

// === VALIDATION TEST 3 ===
// Provide only invalid config lines and expect no output
TEST(CLIIntegrationTest, NoValidConfig_ProducesNoOutput) {
    std::ofstream input("input_cli.txt");
    input << "0 1\n";               // zero size
    input << "-100 1 2\n";          // negative size
    input << "hello world\n";       // non-numeric
    input << "1 test.com\n";        // interpreted as config
    input << "2 test.com\n";        // still no config
    input.close();

    system("./runCli < input_cli.txt > output_cli.txt");

    std::ifstream output("output_cli.txt");
    std::stringstream buffer;
    buffer << output.rdbuf();
    EXPECT_EQ(buffer.str(), "");  // no config means no BloomFilter constructed

    std::remove("input_cli.txt");
    std::remove("output_cli.txt");
}

// === VALIDATION TEST 4 ===
// Add and check URL with extra whitespace around the command
TEST(CLIIntegrationTest, URLWithSpacesIgnored) {
    std::ofstream input("input_cli.txt");
    input << "16 1\n";
    input << "1   spaced.com   \n";
    input << "2 spaced.com\n";
    input.close();

    system("./runCli < input_cli.txt > output_cli.txt");

    std::ifstream output("output_cli.txt");
    std::stringstream buffer;
    buffer << output.rdbuf();
    EXPECT_EQ(buffer.str(), "true true\n");

    std::remove("input_cli.txt");
    std::remove("output_cli.txt");
    std::remove("filter_data.txt");
}
