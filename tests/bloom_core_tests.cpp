#include <gtest/gtest.h>
#include "Bloom/BloomFilter.h"


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

// Sanity test: Add + Remove + Check
TEST(BloomTest, AddRemoveCheckURL) {
    BloomFilter bf(16, {1}, "test_remove_1.txt");

    // Add the URL
    bf.add("www.remove.com");
    EXPECT_TRUE(bf.check("www.remove.com"));
    EXPECT_TRUE(bf.doubleCheck("www.remove.com"));

    // Remove the URL
    bf.remove("www.remove.com");

    // Bloom filter: still possibly contains (false positive risk)
    EXPECT_TRUE(bf.check("www.remove.com"));  // Bloom filter can't remove
    // True blacklist set: must be gone
    EXPECT_FALSE(bf.doubleCheck("www.remove.com"));
}

// Sanity test: Remove non-existing URL
TEST(BloomTest, RemoveNonExistentURL) {
    BloomFilter bf(16, {1}, "test_remove_2.txt");

    // Remove URL that was never added
    bf.remove("www.neveradded.com");

    // Should still be not found
    EXPECT_FALSE(bf.check("www.neveradded.com"));
    EXPECT_FALSE(bf.doubleCheck("www.neveradded.com"));
}

// Sanity test: Add, Remove, Re-add
TEST(BloomTest, AddRemoveReAddURL) {
    BloomFilter bf(16, {1}, "test_remove_3.txt");

    // Add URL
    bf.add("www.readd.com");
    EXPECT_TRUE(bf.check("www.readd.com"));
    EXPECT_TRUE(bf.doubleCheck("www.readd.com"));

    // Remove it
    bf.remove("www.readd.com");
    EXPECT_FALSE(bf.doubleCheck("www.readd.com"));

    // Re-add it
    bf.add("www.readd.com");
    EXPECT_TRUE(bf.check("www.readd.com"));
    EXPECT_TRUE(bf.doubleCheck("www.readd.com"));
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

// Negative test: Remove empty string
TEST(BloomTest, RemoveEmptyString) {
    BloomFilter bf(16, {1}, "test_remove_4.txt");

    // Remove empty string
    bf.remove("");

    // Should still not exist
    EXPECT_FALSE(bf.check(""));
    EXPECT_FALSE(bf.doubleCheck(""));
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

// Boundary test: Remove very long UR
TEST(BloomTest, RemoveVeryLongURL) {
    std::string longURL(1000, 'b');
    BloomFilter bf(16, {1}, "test_remove_5.txt");

    bf.add(longURL);
    EXPECT_TRUE(bf.check(longURL));
    EXPECT_TRUE(bf.doubleCheck(longURL));

    bf.remove(longURL);
    EXPECT_TRUE(bf.check(longURL));  // Bloom filter: still says maybe
    EXPECT_FALSE(bf.doubleCheck(longURL));  // Real set: gone
}
