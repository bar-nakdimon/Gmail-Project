#include <gtest/gtest.h>
#include "Bloom/BloomFilter.h"


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

// SANITY TEST: Save and load after remove
TEST(BloomTest, SaveLoadAfterRemove) {
    std::string filename = "test_save_after_remove.txt";

    {
        BloomFilter bf(32, {1}, filename);
        bf.add("removeme.com");
        bf.remove("removeme.com");  // This should save the updated state
    }

    {
        BloomFilter bf2(32, {1}, filename);
        // Bloom filter might still say maybe (can't actually remove bits)
        EXPECT_TRUE(bf2.check("removeme.com"));
        // True blacklist set: should confirm it's removed
        EXPECT_FALSE(bf2.doubleCheck("removeme.com"));
    }
}

// SANITY TEST: Remove, re-add, save, reload
TEST(BloomTest, SaveLoadRemoveAndReAdd) {
    std::string filename = "test_save_remove_readd.txt";

    {
        BloomFilter bf(32, {1}, filename);
        bf.add("flaky.com");
        bf.remove("flaky.com");
        bf.add("flaky.com");  // Should be back in the set
    }

    {
        BloomFilter bf2(32, {1}, filename);
        EXPECT_TRUE(bf2.check("flaky.com"));
        EXPECT_TRUE(bf2.doubleCheck("flaky.com"));
    }
}

// NEGATIVE TEST: Remove URL that was never added, then save/load
TEST(BloomTest, RemoveNeverAdded_SaveLoad) {
    std::string filename = "test_remove_neveradded.txt";

    {
        BloomFilter bf(32, {1}, filename);
        bf.remove("ghost.com");  // Removing something never added
    }

    {
        BloomFilter bf2(32, {1}, filename);
        EXPECT_FALSE(bf2.check("ghost.com"));
        EXPECT_FALSE(bf2.doubleCheck("ghost.com"));
    }
}

// BOUNDARY TEST: Remove very long URL, save/load
TEST(BloomTest, RemoveVeryLongURL_SaveLoad) {
    std::string filename = "test_remove_long_url.txt";
    std::string longURL(5000, 'z');

    {
        BloomFilter bf(1000, {1}, filename);
        bf.add(longURL);
        bf.remove(longURL);
    }

    {
        BloomFilter bf2(1000, {1}, filename);
        EXPECT_TRUE(bf2.check(longURL));          // Bloom: might still say maybe
        EXPECT_FALSE(bf2.doubleCheck(longURL));   // Real set: removed
    }
}

