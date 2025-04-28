#include <gtest/gtest.h>
#include "BloomFilter.h"

// *************************
//     SANITY TESTS
// *************************

// first sanity test: adding one valid URL and check it
TEST(BloomTest, AddAndCheckValidURL) {
    BloomFilter bf(8, {1}, "test_filter_data.txt");
    // test before adding
    EXPECT_FALSE(bf.check("www.example.com0"));
    EXPECT_FALSE(bf.doubleCheck("www.example.com0"));

    // adding url
    bf.add("www.example.com0");

    // test after adding 
    EXPECT_TRUE(bf.check("www.example.com0"));
    EXPECT_TRUE(bf.doubleCheck("www.example.com0"));
}

// second sanity test: adding two URLs and check it
TEST(BloomTest, AddMultipleAndCheckEach) {
    BloomFilter bf(16, {1}, "test_pos_2.txt");
    bf.add("url1");
    bf.add("url2");

    EXPECT_TRUE(bf.check("url1"));
    EXPECT_TRUE(bf.doubleCheck("url1"));

    EXPECT_TRUE(bf.check("url2"));
    EXPECT_TRUE(bf.doubleCheck("url2"));
}

// third sanity test: checking false for URL not added
TEST(BloomTest, CheckNonAddedURL) {
    BloomFilter bf(16, {1}, "test_pos_3.txt");

    EXPECT_FALSE(bf.check("nonexistent.com"));
    EXPECT_FALSE(bf.doubleCheck("nonexistent.com"));
}

// *************************
//     NEGATIVE TESTS
// *************************

// first negative test: add empty string as URL
TEST(BloomTest, AddEmptyString) {
    BloomFilter bf(16, {1}, "test_neg_1.txt");
    bf.add("");
    EXPECT_TRUE(bf.check(""));
    EXPECT_TRUE(bf.doubleCheck(""));
}

// second negative test: check empty string
TEST(BloomTest, CheckEmptyString) {
    BloomFilter bf(16, {1}, "test_neg_2.txt");
    EXPECT_FALSE(bf.check(""));
    EXPECT_FALSE(bf.doubleCheck(""));
}

// third negative test: check URL with special characters
TEST(BloomTest, SpecialCharactersURL) {
    BloomFilter bf(16, {1}, "test_neg_3.txt");
    std::string weird = "@#$%^&*()_+|";

    EXPECT_FALSE(bf.check(weird));
    EXPECT_FALSE(bf.doubleCheck(weird));

    bf.add(weird);

    EXPECT_TRUE(bf.check(weird));
    EXPECT_TRUE(bf.doubleCheck(weird));
}

// *************************
//     BOUNDARY TESTS
// *************************

// first boundary test: create BloomFilter with large bit array and check URL on it
TEST(BloomTest, VeryLargeBitArray) {
    BloomFilter bf(100000, {1}, "test_bound_2.txt");
    bf.add("large.com");

    EXPECT_TRUE(bf.check("large.com"));
    EXPECT_TRUE(bf.doubleCheck("large.com"));
}

// second boundary test: add long URL and check it
TEST(BloomTest, VeryLongURL) {
    std::string longURL(1000, 'a');
    BloomFilter bf(16, {1}, "test_bound_3.txt");

    bf.add(longURL);

    EXPECT_TRUE(bf.check(longURL));
    EXPECT_TRUE(bf.doubleCheck(longURL));
}

// third boundary test: create BloomFilter with single hash function used multiple times and check URL on it
TEST(BloomTest, RepeatedHashFunction) {
    BloomFilter bf(16, {1, 1, 1}, "test_bound_5.txt");

    bf.add("repeat.com");

    EXPECT_TRUE(bf.check("repeat.com"));
    EXPECT_TRUE(bf.doubleCheck("repeat.com"));
}