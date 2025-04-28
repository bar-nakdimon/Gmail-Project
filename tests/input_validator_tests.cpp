#include <gtest/gtest.h>
#include "InputValidator.h"

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
//  TESTS FOR parseCommandLine()
// ===============================

TEST(ParseCommandTest, ValidAddCommandWithValidUrl) {
    int command;
    std::string url;
    bool result = parseCommandLine("1 example.com", command, url);
    EXPECT_TRUE(result);
    EXPECT_EQ(command, 1);
    EXPECT_EQ(url, "example.com");
}

TEST(ParseCommandTest, InvalidUrlInCommand) {
    int command;
    std::string url;
    bool result = parseCommandLine("2 invalid url", command, url);
    EXPECT_FALSE(result);
}

TEST(ParseCommandTest, EmptyUrlInCommand) {
    int command;
    std::string url;
    bool result = parseCommandLine("1 ", command, url);
    EXPECT_FALSE(result);
}

TEST(ParseCommandTest, InvalidUrlFormatInCommand) {
    int command;
    std::string url;
    bool result = parseCommandLine("1 http:/bad.com", command, url);
    EXPECT_FALSE(result);
}

TEST(ParseCommandTest, InvalidCommandNumberWithValidUrl) {
    int command;
    std::string url;
    bool result = parseCommandLine("3 example.com", command, url);
    EXPECT_FALSE(result);
}
