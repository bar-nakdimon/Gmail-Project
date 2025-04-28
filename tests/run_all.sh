#!/bin/bash

# This script builds the Docker image (using Dockerfile.test)
# and runs all tests inside the container using the runTests executable.
# It will exit if the build fails.

# Step 1: Build Docker image

docker build --no-cache -f ../Dockerfile.test -t bloomtest ..
if [ $? -ne 0 ]; then
    echo "Docker build failed. Exiting."
    exit 1
fi

docker run --rm bloomtest

