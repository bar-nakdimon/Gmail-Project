cmake_minimum_required(VERSION 3.14)
project(BloomFilterProject)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/release-1.11.0.zip
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# Include src headers
include_directories(${PROJECT_SOURCE_DIR}/src)

# Executable for running the actual CLI
add_executable(runCli
  src/main.cpp
  src/BloomFilter.cpp
  src/HashFunctions.cpp
  src/InputValidator.cpp
)

# Executable for running Google Test-based tests
add_executable(runTests
  tests/input_validator_tests.cpp
  tests/bloom_add_check_tests.cpp
  tests/bloom_save_load_tests.cpp
  tests/cli_integration_tests.cpp  
  src/BloomFilter.cpp
  src/HashFunctions.cpp
  src/InputValidator.cpp
)

# Link GoogleTest to the test executable
target_link_libraries(runTests gtest_main)

enable_testing()
include(GoogleTest)
gtest_discover_tests(runTests)
