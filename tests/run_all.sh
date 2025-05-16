#!/bin/bash

# This script builds the Docker image (using Dockerfile.test)
# and runs all tests inside the container using the runTests executable.
# It will exit if the build fails.

# Step 1: Build Docker image

# Build Docker image (optional: can remove if already built)
docker build -f Dockerfile.test -t bloomtest .
if [ $? -ne 0 ]; then
    echo "Docker build failed. Exiting."
    exit 1
fi

# Start the container: runs server + tests
docker run --rm bloomtest

# To Run (from EX-2 folder)
# chmod +x tests/run_all.sh
# ./tests/run_all.sh