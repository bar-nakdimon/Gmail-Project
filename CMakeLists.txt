# Minimum CMake version required
cmake_minimum_required(VERSION 3.14)

# Set policy for timestamp robustness
if(POLICY CMP0135)
  cmake_policy(SET CMP0135 NEW)
endif()

# Name of the project
project(BloomFilterProject)

# Use C++17 standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Ensure position-independent code (useful for shared libraries)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# === GoogleTest Section ===
# Fetch GoogleTest (used for unit testing)
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/release-1.11.0.zip
  DOWNLOAD_EXTRACT_TIMESTAMP TRUE
)

# Required for using GoogleTest with Visual Studio
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)

# Download and make available GoogleTest
FetchContent_MakeAvailable(googletest)

# === Global Include Directories ===
# Add source folders so all source/header files are visible globally
include_directories(
  ${PROJECT_SOURCE_DIR}/src
)

# === Source Files Used Across Targets ===

# Bloom filter core implementation files
set(COMMON_BLOOM_SRC
  src/Bloom/BloomFilter.cpp
  src/Bloom/HashFunctions.cpp
  src/Bloom/InputValidator.cpp
)

# All command handler implementations
set(COMMON_COMMANDS_SRC
  src/Commands/PostCommand.cpp
  src/Commands/GetCommand.cpp
  src/Commands/DeleteCommand.cpp
  src/Commands/BadRequestCommand.cpp
  src/Commands/CommandFactory.cpp
)

# Server core components (parser, server loop, connection handler)
set(COMMON_SERVER_SRC
  src/Server/Server.cpp
  src/Server/ConnectionHandler.cpp
  src/Server/CommandParser.cpp
)

# === Build the Server Executable ===
# Main TCP server executable built from main.cpp and all shared logic
add_executable(server
  src/main.cpp
  ${COMMON_SERVER_SRC}
  ${COMMON_COMMANDS_SRC}
  ${COMMON_BLOOM_SRC}
)

# === Build the Unit Tests Executable ===
# Creates a test executable to run all GoogleTest-based unit tests
add_executable(runTests
  tests/input_validator_tests.cpp
  tests/bloom_save_load_tests.cpp
  tests/socket_integration_tests.cpp
  tests/bloom_core_tests.cpp
  tests/server_args_tests.cpp
  ${COMMON_SERVER_SRC}
  ${COMMON_COMMANDS_SRC}
  ${COMMON_BLOOM_SRC}
)

# Link the test target with GoogleTest and pthread
target_link_libraries(runTests gtest_main pthread)

# Enable CTest and discover test cases automatically
enable_testing()
include(GoogleTest)
gtest_discover_tests(runTests)
