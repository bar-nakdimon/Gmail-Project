#include <gtest/gtest.h>
#include "Bloom/InputValidator.h"



// ===============================
//     TESTS FOR isValidUrl()
// ===============================

TEST(UrlValidationTest, ValidUrls) {
    EXPECT_TRUE(isValidUrl("example.com"));
    EXPECT_TRUE(isValidUrl("www.example.com"));
    EXPECT_TRUE(isValidUrl("https://example.com"));
    EXPECT_TRUE(isValidUrl("http://example.com"));
    EXPECT_TRUE(isValidUrl("https://www.example.com/path"));
    EXPECT_TRUE(isValidUrl("sub.domain.example"));
    EXPECT_TRUE(isValidUrl("abc.def.ghi.jkl"));
}

TEST(UrlValidationTest, InvalidUrls) {
    EXPECT_FALSE(isValidUrl(""));
    EXPECT_FALSE(isValidUrl("http:/invalid.com"));
    EXPECT_FALSE(isValidUrl("htps://example"));
    EXPECT_FALSE(isValidUrl("example"));
    EXPECT_FALSE(isValidUrl("exa mple.com"));
    EXPECT_FALSE(isValidUrl("example.com/"));
    EXPECT_FALSE(isValidUrl("http://.com"));
}

// ===============================
//  TESTS FOR parseInitialConfig()
// ===============================
TEST(ParseInitialConfigTest, NonNumericArguments) {
    size_t size;
    std::vector<int> hashConfigs;
    EXPECT_FALSE(parseInitialConfig("256 one two", size, hashConfigs));
}

TEST(ParseInitialConfigTest, ZeroSizeArgument) {
    size_t size;
    std::vector<int> hashConfigs;
    EXPECT_FALSE(parseInitialConfig("0 1 2", size, hashConfigs));
}

TEST(ParseInitialConfigTest, NegativeSizeArgument) {
    size_t size;
    std::vector<int> hashConfigs;
    EXPECT_FALSE(parseInitialConfig("-1 1 2", size, hashConfigs));  // depending on parser, might auto-fail
}

TEST(ParseInitialConfigTest, OnlyOneArgumentFails) {
    size_t size;
    std::vector<int> hashConfigs;
    EXPECT_FALSE(parseInitialConfig("256", size, hashConfigs));  // only size, no hashes
}

TEST(ParseInitialConfigTest, EmptyInputFails) {
    size_t size;
    std::vector<int> hashConfigs;
    EXPECT_FALSE(parseInitialConfig("", size, hashConfigs));
}

// ===============================
//  TESTS FOR parseCommandLine()
// ===============================
TEST(ParseCommandTest, InvalidCommandNumberOne) {
    std::string command;
    std::string url;
    EXPECT_FALSE(parseCommandLine("1 example.com", command, url));
}

TEST(ParseCommandTest, InvalidCommandNumberTwo) {
    std::string command;
    std::string url;
    EXPECT_FALSE(parseCommandLine("2 example.com", command, url));
}

TEST(ParseCommandTest, ValidPostCommand) {
    std::string command;
    std::string url;
    EXPECT_TRUE(parseCommandLine("POST example.com", command, url));
}

TEST(ParseCommandTest, ValidGetCommand) {
    std::string command;
    std::string url;
    EXPECT_TRUE(parseCommandLine("GET example.com", command, url));
}

TEST(ParseCommandTest, ValidDeleteCommand) {
    std::string command;
    std::string url;
    EXPECT_TRUE(parseCommandLine("DELETE example.com", command, url));
}

TEST(ParseCommandTest, PostCommandInvalidUrl) {
    std::string command;
    std::string url;
    EXPECT_FALSE(parseCommandLine("POST invalid-url", command, url));
}

TEST(ParseCommandTest, GetCommandInvalidUrl) {
    std::string command;
    std::string url;
    EXPECT_FALSE(parseCommandLine("GET invalid-url", command, url));
}

TEST(ParseCommandTest, InvalidCommandWord) {
    std::string command;
    std::string url;
    EXPECT_FALSE(parseCommandLine("PUT example.com", command, url));
}

TEST(ParseCommandTest, RandomNumberAsCommand) {
    std::string command;
    std::string url;
    EXPECT_FALSE(parseCommandLine("999 example.com", command, url));
}

TEST(ParseCommandTest, RandomWordAsCommand) {
    std::string command;
    std::string url;
    EXPECT_FALSE(parseCommandLine("HELLO example.com", command, url));
}

TEST(ParseCommandTest, PostNotAtStart) {
    std::string command;
    std::string url;
    EXPECT_FALSE(parseCommandLine("example.com POST", command, url));
}

TEST(ParseCommandTest, GetNotAtStart) {
    std::string command;
    std::string url;
    EXPECT_FALSE(parseCommandLine("example.com GET", command, url));
}

TEST(ParseCommandTest, DeleteNotAtStart) {
    std::string command;
    std::string url;
    EXPECT_FALSE(parseCommandLine("example.com DELETE", command, url));
}

TEST(InputValidatorTest, ValidIPAddresses) {
    EXPECT_TRUE(isValidIP("127.0.0.1"));
    EXPECT_TRUE(isValidIP("192.168.1.1"));
    EXPECT_TRUE(isValidIP("255.255.255.255"));
}

TEST(InputValidatorTest, InvalidIPAddresses) {
    EXPECT_FALSE(isValidIP("256.0.0.1"));      // Out of range
    EXPECT_FALSE(isValidIP("127.0.0"));        // Missing octet
    EXPECT_FALSE(isValidIP("127.0.0.1.5"));    // Too many octets
    EXPECT_FALSE(isValidIP("127.0.0.-1"));     // Negative octet
    EXPECT_FALSE(isValidIP("abc.def.ghi.jkl")); // Text
    EXPECT_FALSE(isValidIP("127.0..1"));       // Double dot
    EXPECT_FALSE(isValidIP(""));               // Empty string
}

TEST(InputValidatorTest, ContainsWhitespace) {
    EXPECT_TRUE(containsAnyWhitespace("hello world"));  // Space
    EXPECT_TRUE(containsAnyWhitespace("tab\tchar"));    // Tab
    EXPECT_TRUE(containsAnyWhitespace("newline\n"));    // Newline
    EXPECT_TRUE(containsAnyWhitespace("\r\ncarriage")); // Carriage return
}

TEST(InputValidatorTest, NoWhitespace) {
    EXPECT_FALSE(containsAnyWhitespace("helloworld"));
    EXPECT_FALSE(containsAnyWhitespace("no_spaces_here"));
    EXPECT_FALSE(containsAnyWhitespace("123456"));
    EXPECT_FALSE(containsAnyWhitespace(""));
}

TEST(InputValidatorTest, ValidPorts) {
    EXPECT_TRUE(isValidPort(1024));      // Smallest valid port
    EXPECT_TRUE(isValidPort(5555));      // Example valid port
    EXPECT_TRUE(isValidPort(65535));     // Largest valid port
}

TEST(InputValidatorTest, InvalidPorts) {
    EXPECT_FALSE(isValidPort(0));        // Zero is invalid
    EXPECT_FALSE(isValidPort(80));       // Well-known port, invalid by logic
    EXPECT_FALSE(isValidPort(1023));     // Just below valid range
    EXPECT_FALSE(isValidPort(-1));       // Negative port invalid
    EXPECT_FALSE(isValidPort(70000));    // Out of valid range
}

TEST(InputValidatorTest, InvalidIP_WithLetters) {
    EXPECT_FALSE(isValidIP("abc.def.ghi.jkl"));    // Fully letters IP
    EXPECT_FALSE(isValidIP("127.0.a.1"));          // Partial letters in octet
    EXPECT_FALSE(isValidIP("192.168.one.1"));      // Word instead of number
}

TEST(InputValidatorTest, InvalidIP_WeirdStrings) {
    EXPECT_FALSE(isValidIP("hello"));              // Not even IP format
    EXPECT_FALSE(isValidIP("256.ABC.-1.xyz"));     // Mixed invalid chars and numbers
}
