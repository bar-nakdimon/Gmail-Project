# EX-1
https://github.com/yonatansh45/EX-1.git

## EX-1: Bloom Filter URL Blacklisting

This project implements a Bloom Filter in C++ that blacklists URLs and checks them efficiently using hash functions. It includes a CLI for adding/checking URLs and persists the filter between runs.

**The program is designed to:**
- Add URLs to a blacklist using configurable hash functions
- Check if a given URL is (possibly) blacklisted
- Perform a "double check" using a real blacklist (`std::set`)
- Save and load the Bloom Filter state from disk to support persistent behavior
- Run in an interactive CLI mode

In addition, the project follows a **Test-Driven Development (TDD)** workflow, with a robust suite of automated tests to verify core functionality and edge cases. The entire environment, including the main program and test suite, is fully containerized using Docker to ensure portability and consistency across different machines.



## Running the Main Program with Docker



1. To build the image:
```bash
docker build -f Dockerfile -t bloomfilter-app .


2. To run the program:
docker run -it --rm bloomfilter-app


3. The program supports interactive input when:

- First line: bit array size (256), number of hash functions (2), and which to use (1 = std::hash).
- Then:  
  - `1 <url>` → adds to the blacklist  
  - `2 <url>` → checks if blacklisted (returns true/false)

for example:

Input:
256 2 1
1 www.example.com
1 www.example.com
2 www.google.com

Output:
false

Explanation to output:

256 2 1 → Initializes the Bloom Filter (256 bits, 2 hash functions, std::hash).

1 www.example.com → Adds URL to the filter (no output).

1 www.example.com → Adds again (no output).

2 www.google.com → Checks if blacklisted → outputs false because www.google.com was never added.


## Docker testing


This project includes a dedicated `Dockerfile.test` to **run automated unit tests** in an isolated environment.

1. Build the test Docker image:

```bash
docker build -f Dockerfile.test -t bloomfilter-test .
```

2. Run the test container:

```bash
docker run --rm bloomfilter-test
```
The container will compile the code and run all the unit tests using GoogleTest (gtest).


**How to Run the Main Program Without Docker - Compile with CMake**

1. Navigate to the root of the EX-1 project:
   cd path/to/EX-1

2. Create and enter a build directory:
   mkdir build
   cd build

3. Generate the Makefiles using CMake:
   cmake ..

4. Build the project:
   cmake --build .

5. Run the program:
   ./runcli


