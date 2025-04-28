FROM gcc:latest

# Install required tools
RUN apt-get update && apt-get install -y cmake git

# Set working directory
WORKDIR /usr/src/app

# Copy all files
COPY . .

# Create build directory
RUN mkdir build
WORKDIR /usr/src/app/build

# Run CMake and make for the main program
RUN cmake .. && make

# Default command to run the app
CMD ["./runCli"]
