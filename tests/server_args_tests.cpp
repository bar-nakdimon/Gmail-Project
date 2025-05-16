#include <gtest/gtest.h>
#include <fstream>
#include <sstream>
#include <sys/wait.h>  // For WIFEXITED, WEXITSTATUS

// Helper to check if a file is empty
bool isFileEmpty(const std::string& filename) {
    std::ifstream file(filename, std::ios::ate);
    return file.tellg() == 0;
}

// === Tests for Argument Validation ===

// Missing init line (size/hash); should fail
TEST(ServerArgsTest, MissingInitLine) {
    int status = system("./server 5555 > out.txt 2>&1");
    EXPECT_TRUE(WIFEXITED(status));
    EXPECT_NE(WEXITSTATUS(status), 0);
    EXPECT_TRUE(isFileEmpty("out.txt"));
    std::remove("out.txt");
}

// Missing port & init line; should fail
TEST(ServerArgsTest, MissingPortAndInitLine) {
    int status = system("./server > out.txt 2>&1");
    EXPECT_TRUE(WIFEXITED(status));
    EXPECT_NE(WEXITSTATUS(status), 0);
    EXPECT_TRUE(isFileEmpty("out.txt"));
    std::remove("out.txt");
}

// No arguments at all; should fail
TEST(ServerArgsTest, MissingAllArgs) {
    int status = system("./server > out.txt 2>&1");
    EXPECT_TRUE(WIFEXITED(status));
    EXPECT_NE(WEXITSTATUS(status), 0);
    EXPECT_TRUE(isFileEmpty("out.txt"));
    std::remove("out.txt");
}

// Port is non-numeric; should fail
TEST(ServerArgsTest, InvalidPort) {
    int status = system("./server notaport 16 1 > out.txt 2>&1");
    EXPECT_TRUE(WIFEXITED(status));
    EXPECT_NE(WEXITSTATUS(status), 0);
    EXPECT_TRUE(isFileEmpty("out.txt"));
    std::remove("out.txt");
}

// Init line is empty string; should fail
TEST(ServerArgsTest, EmptyInitLine) {
    int status = system("./server 5555 \"\" > out.txt 2>&1");
    EXPECT_TRUE(WIFEXITED(status));
    EXPECT_NE(WEXITSTATUS(status), 0);
    EXPECT_TRUE(isFileEmpty("out.txt"));
    std::remove("out.txt");
}

// Init line has non-numeric text
TEST(ServerArgsTest, InvalidInitLineNonNumeric) {
    int status = system("./server 5555 abc def > out.txt 2>&1");
    EXPECT_TRUE(WIFEXITED(status));
    EXPECT_NE(WEXITSTATUS(status), 0);
    EXPECT_TRUE(isFileEmpty("out.txt"));
    std::remove("out.txt");
}

// Init line missing hash count
TEST(ServerArgsTest, InitLineMissingHashes) {
    int status = system("./server 5555 1000 > out.txt 2>&1");
    EXPECT_TRUE(WIFEXITED(status));
    EXPECT_NE(WEXITSTATUS(status), 0);
    EXPECT_TRUE(isFileEmpty("out.txt"));
    std::remove("out.txt");
}

// Init line with size 0 (invalid)
TEST(ServerArgsTest, InitLineSizeZero) {
    int status = system("./server 5555 0 5 > out.txt 2>&1");
    EXPECT_TRUE(WIFEXITED(status));
    EXPECT_NE(WEXITSTATUS(status), 0);
    EXPECT_TRUE(isFileEmpty("out.txt"));
    std::remove("out.txt");
}

// Init line with negative size
TEST(ServerArgsTest, InitLineNegativeSize) {
    int status = system("./server 5555 -1 1 > out.txt 2>&1");
    EXPECT_TRUE(WIFEXITED(status));
    EXPECT_NE(WEXITSTATUS(status), 0);
    EXPECT_TRUE(isFileEmpty("out.txt"));
    std::remove("out.txt");
}

// Init line with negative hash function count
TEST(ServerArgsTest, InitLineNegativeHashFunction) {
    int status = system("./server 5555 16 -1 > out.txt 2>&1");
    EXPECT_TRUE(WIFEXITED(status));
    EXPECT_NE(WEXITSTATUS(status), 0);
    EXPECT_TRUE(isFileEmpty("out.txt"));
    std::remove("out.txt");
}

// Port 0 (reserved & invalid)
TEST(ServerArgsTest, PortZero) {
    int status = system("./server 0 16 1 > out.txt 2>&1");
    EXPECT_TRUE(WIFEXITED(status));
    EXPECT_NE(WEXITSTATUS(status), 0);
    EXPECT_TRUE(isFileEmpty("out.txt"));
    std::remove("out.txt");
}

// Negative port
TEST(ServerArgsTest, NegativePort) {
    int status = system("./server -1 16 1 > out.txt 2>&1");
    EXPECT_TRUE(WIFEXITED(status));
    EXPECT_NE(WEXITSTATUS(status), 0);
    EXPECT_TRUE(isFileEmpty("out.txt"));
    std::remove("out.txt");
}

// Port exceeds valid range
TEST(ServerArgsTest, PortTooBig) {
    int status = system("./server 70000 16 1 > out.txt 2>&1");
    EXPECT_TRUE(WIFEXITED(status));
    EXPECT_NE(WEXITSTATUS(status), 0);
    EXPECT_TRUE(isFileEmpty("out.txt"));
    std::remove("out.txt");
}
