#include <gtest/gtest.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <cstring>
#include <string>

const char* SERVER_HOST = "127.0.0.1";
const int SERVER_PORT = 5555;

class SocketIntegrationTest : public ::testing::Test {
protected:
    int client_fd;

    void SetUp() override {
        client_fd = socket(AF_INET, SOCK_STREAM, 0);
        ASSERT_NE(client_fd, -1) << "Failed to create socket";

        struct sockaddr_in serv_addr;
        serv_addr.sin_family = AF_INET;
        serv_addr.sin_port = htons(SERVER_PORT);

        ASSERT_NE(inet_pton(AF_INET, SERVER_HOST, &serv_addr.sin_addr), 0)
            << "Invalid address";

        ASSERT_NE(connect(client_fd, (struct sockaddr*)&serv_addr, sizeof(serv_addr)), -1)
            << "Connection failed";
    }

    void TearDown() override {
        close(client_fd);
    }

    std::string sendAndReceive(const std::string& message) {
        std::string msg = message + "\n";
        ssize_t sent = send(client_fd, msg.c_str(), msg.length(), 0);
        EXPECT_GT(sent, 0) << "Failed to send message";

        char buffer[1024] = {0};
        ssize_t valread = recv(client_fd, buffer, sizeof(buffer), 0);
        EXPECT_GT(valread, 0) << "No response received";

        return std::string(buffer, valread);
    }

    // NEW helper: send only, don't receive (for initial Bloom filter config)
    void sendOnly(const std::string& message) {
        std::string msg = message + "\n";
        ssize_t sent = send(client_fd, msg.c_str(), msg.length(), 0);
        EXPECT_GT(sent, 0) << "Failed to send message";
    }
};

// === UPDATED TESTS (Bloom filter init is "16 1") ===

// The server is expected to be pre-initialized with args:
// ./server 127.0.0.1 5555 "16 1"
// No Bloom filter init is sent via socket anymore.

// Test: Basic POST + GET flow for an added URL; checks positive and negative lookups.
TEST_F(SocketIntegrationTest, PostAndGetFlow) {

    std::string res1 = sendAndReceive("POST www.integration-test.com");
    EXPECT_EQ(res1, "201 Created\n");

    std::string res2 = sendAndReceive("GET www.integration-test.com");
    EXPECT_EQ(res2, "200 Ok\n\ntrue true\n");

    std::string res3 = sendAndReceive("GET www.unknown.com");
    EXPECT_TRUE(
        res3 == "200 Ok\n\nfalse\n" ||
        res3 == "200 Ok\n\ntrue false\n"
    );
}

// Test: POST + DELETE flow; ensures deletion works and responds correctly if deleting twice.
TEST_F(SocketIntegrationTest, DeleteFlow) {

    sendAndReceive("POST www.deletetest.com");

    std::string res1 = sendAndReceive("DELETE www.deletetest.com");
    EXPECT_EQ(res1, "204 No Content\n");

    std::string res2 = sendAndReceive("DELETE www.deletetest.com");
    EXPECT_EQ(res2, "404 Not Found\n");

    std::string res3 = sendAndReceive("GET www.deletetest.com");
    EXPECT_EQ(res3, "200 Ok\n\ntrue false\n");
}

// Test: Sends invalid commands (PUT, incomplete POST, random text); expects 400 Bad Request.
TEST_F(SocketIntegrationTest, InvalidCommands) {

    std::string res1 = sendAndReceive("PUT www.test.com");
    EXPECT_EQ(res1, "400 Bad Request\n");

    std::string res2 = sendAndReceive("POST");
    EXPECT_EQ(res2, "400 Bad Request\n");

    std::string res3 = sendAndReceive("RANDOM JUNK");
    EXPECT_EQ(res3, "400 Bad Request\n");
}

// Test: POST and GET different URLs; deletes one and checks correct results.
TEST_F(SocketIntegrationTest, PostGetDeleteDifferentUrls) {

    sendAndReceive("POST www.first.com");
    sendAndReceive("POST www.second.com");

    std::string res1 = sendAndReceive("DELETE www.first.com");
    EXPECT_EQ(res1, "204 No Content\n");

    std::string res2 = sendAndReceive("GET www.first.com");
    EXPECT_EQ(res2, "200 Ok\n\ntrue false\n");

    std::string res3 = sendAndReceive("GET www.second.com");
    EXPECT_EQ(res3, "200 Ok\n\ntrue true\n");
}

// Test: Adds a URL and immediately checks it returns true true.
TEST_F(SocketIntegrationTest, AddAndCheckTrueTrue) {

    std::string res1 = sendAndReceive("POST www.socket-addcheck.com");
    EXPECT_EQ(res1, "201 Created\n");

    std::string res2 = sendAndReceive("GET www.socket-addcheck.com");
    EXPECT_EQ(res2, "200 Ok\n\ntrue true\n");
}

// Test: Checks a URL that was never added; expects false or true false.
TEST_F(SocketIntegrationTest, CheckNonAddedUrl) {

    std::string res = sendAndReceive("GET www.never-added.com");
    EXPECT_EQ(res, "200 Ok\n\nfalse\n");
}

// Test: Adds two URLs, checks one to ensure it’s stored properly.
TEST_F(SocketIntegrationTest, AddTwoCheckOne) {

    sendAndReceive("POST www.first-cli.com");
    sendAndReceive("POST www.second-cli.com");

    std::string res = sendAndReceive("GET www.second-cli.com");
    EXPECT_EQ(res, "200 Ok\n\ntrue true\n");
}

// Test: Sends invalid command (PUT) after valid POST; ensures existing data remains unaffected.
TEST_F(SocketIntegrationTest, InvalidCommandIgnored) {

    sendAndReceive("POST www.invalidcmd.com");

    std::string res1 = sendAndReceive("PUT www.invalidcmd.com");
    EXPECT_EQ(res1, "400 Bad Request\n");

    std::string res2 = sendAndReceive("GET www.invalidcmd.com");
    EXPECT_EQ(res2, "200 Ok\n\ntrue true\n");
}

// Test: Sends POST/GET without a URL; expects 400 Bad Request.
TEST_F(SocketIntegrationTest, MissingUrlIgnored) {

    std::string res1 = sendAndReceive("POST");
    EXPECT_EQ(res1, "400 Bad Request\n");

    std::string res2 = sendAndReceive("GET");
    EXPECT_EQ(res2, "400 Bad Request\n");
}

// Test: Adds URL with extra spaces; ensures trimming works.
TEST_F(SocketIntegrationTest, AddAndCheckWithSpaces) {

    std::string res1 = sendAndReceive("POST   www.spaced.com   ");
    EXPECT_EQ(res1, "201 Created\n");

    std::string res2 = sendAndReceive("GET www.spaced.com");
    EXPECT_EQ(res2, "200 Ok\n\ntrue true\n");
}

// Test: Sends a URL in an invalid format; expects 400 Bad Request.
TEST_F(SocketIntegrationTest, InvalidUrlFormat) {

    std::string res = sendAndReceive("POST not_a_valid_url");
    EXPECT_EQ(res, "400 Bad Request\n");
}

// Test: Posts the same URL twice; expects both to succeed (idempotent behavior).
TEST_F(SocketIntegrationTest, DuplicatePostSameUrl) {

    std::string res1 = sendAndReceive("POST www.duplicate.com");
    EXPECT_EQ(res1, "201 Created\n");

    std::string res2 = sendAndReceive("POST www.duplicate.com");
    EXPECT_EQ(res2, "201 Created\n");  // Should still succeed
}

// Test: Sends lowercase POST; expects 400 (commands should be case-sensitive).
TEST_F(SocketIntegrationTest, LowerCasePostFails) {

    std::string res = sendAndReceive("post www.test.com");
    EXPECT_EQ(res, "400 Bad Request\n");
}

// Test: Sends lowercase GET; expects 400 (commands should be case-sensitive).
TEST_F(SocketIntegrationTest, LowerCaseGetFails) {

    std::string res = sendAndReceive("get www.test.com");
    EXPECT_EQ(res, "400 Bad Request\n");
}

// Test: Attempts to re-initialize Bloom filter after valid POST; expects 400 error.
TEST_F(SocketIntegrationTest, SecondInitIgnoredAfterFirstValid) {
    sendAndReceive("POST www.keepme.com");

    // Send a second (invalid) init after valid init - should be error
    std::string res = sendAndReceive("32 2");
    EXPECT_EQ(res, "400 Bad Request\n");

    // The Bloom filter should still have www.keepme.com
    std::string res2 = sendAndReceive("GET www.keepme.com");
    EXPECT_EQ(res2, "200 Ok\n\ntrue true\n");
}

// Test: Sends an empty line as a command; expects 400 Bad Request.
TEST_F(SocketIntegrationTest, EmptyLineCommand) {
    std::string res = sendAndReceive("");
    EXPECT_EQ(res, "400 Bad Request\n");
}

// Test: Sends whitespace-only line as a command; expects 400 Bad Request.
TEST_F(SocketIntegrationTest, WhitespaceOnlyCommand) {
    std::string res = sendAndReceive("      ");
    EXPECT_EQ(res, "400 Bad Request\n");
}
