#include <gtest/gtest.h>
#include "BloomFilter.h"

// *************************
//   TESTS FOR SAVE/LOAD
// *************************

// SANITY TEST: save and reload a filter with one URL
TEST(BloomTest, SaveAndLoadState) {
    std::string filename = "test_save_load.txt";

    {
        BloomFilter bf(16, {1}, filename);
        bf.add("test.com"); 	//add() should call to save() for saving the url in this file
    }

    {
        BloomFilter bf2(16, {1}, filename); //constructor should call to load() for loading previous urls in this file
        EXPECT_TRUE(bf2.check("test.com"));
        EXPECT_TRUE(bf2.doubleCheck("test.com"));
    }
}
// NEGATIVE TEST: Load from a file that does not exist
TEST(BloomTest, LoadFromNonexistentFile) {
    BloomFilter bf(16, {1}, "file_does_not_exist.txt");
    EXPECT_FALSE(bf.check("anything.com"));       // should act as a clean filter
    EXPECT_FALSE(bf.doubleCheck("anything.com"));
}
// NEGATIVE TEST: Save to invalid file path (cannot be created)
TEST(BloomTest, SaveToInvalidFilePath) {
    std::string badPath = "/this/path/does/not/exist/save.txt";

    BloomFilter bf(16, {1}, badPath);
    bf.add("test.com");  // save likely fails silently

    BloomFilter bf2(16, {1}, badPath); // load should find nothing
    EXPECT_FALSE(bf2.check("test.com"));
    EXPECT_FALSE(bf2.doubleCheck("test.com"));
}


// BOUNDARY TEST: Save and load with very long URL
TEST(BloomTest, SaveLoadVeryLongURL) {
    std::string filename = "test_long_url.txt";
    std::string longURL(5000, 'a');  // 5000-character URL

    {
        BloomFilter bf(1000, {1}, filename);
        bf.add(longURL);
    }

    {
        BloomFilter bf2(1000, {1}, filename);
        EXPECT_TRUE(bf2.check(longURL));
        EXPECT_TRUE(bf2.doubleCheck(longURL));
    }
}

// BOUNDARY TEST: Save and load with large bit array
TEST(BloomTest, SaveLoadLargeBitArray) {
    std::string filename = "test_large_bitarray.txt";

    {
        BloomFilter bf(100000, {1, 2}, filename);
        bf.add("largebit.com");
    }

    {
        BloomFilter bf2(100000, {1, 2}, filename);
        EXPECT_TRUE(bf2.check("largebit.com"));
        EXPECT_TRUE(bf2.doubleCheck("largebit.com"));
    }
}