import socket  # Module for creating and using network sockets
import sys     # Module to access command-line arguments

# Function to validate IPv4 address format
def is_valid_ip(ip):
    parts = ip.split(".")  # Split the IP by dots
    if len(parts) != 4:    # IPv4 should have exactly 4 parts
        return False
    try:
        # Check that each part is numeric and within 0–255
        return all(part.isdigit() and 0 <= int(part) <= 255 for part in parts)
    except ValueError:
        return False  # If any part is not a number

        # Validate that port is numeric and in the range 1024–65535
def is_valid_port(port_str):
    return port_str.isdigit() and 1024 <= int(port_str) <= 65535

# Function to check if a string contains any whitespace (space, tab, newline)
def contains_whitespace(s):
    return any(c.isspace() for c in s)

# Main function: initializes TCP client, connects to server, sends commands, and prints responses
def main():
    # Ensure exactly 3 arguments are provided (script name, IP, port)
    if len(sys.argv) != 3:
        return

    server_ip = sys.argv[1]         # Extract server IP from command-line args
    server_port_str = sys.argv[2]   # Extract server port (as string)

    # Reject input if IP or port contains whitespace or is invalid
    if contains_whitespace(server_ip) or not is_valid_ip(server_ip):
        return
    if contains_whitespace(server_port_str) or not is_valid_port(server_port_str):
        return

    server_port = int(server_port_str)  # Convert port to integer
    if not (1 <= server_port <= 65535):  # Port must be in valid TCP range
        return

    try:
        # Create a TCP socket using IPv4
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.connect((server_ip, server_port))  # Connect to server at (IP, port)

            while True:  # Loop to repeatedly send commands and receive responses
                try:
                    command = input().strip()  # Read input from user and trim whitespace
                    if not command:
                        continue  # Skip empty commands

                    # Send command with newline at the end
                    sock.sendall((command + "\n").encode())

                    response = b""  # Prepare to collect response bytes
                    sock.settimeout(0.5)  # Set socket timeout to prevent blocking

                    try:
                        # Read server response in chunks of up to 4096 bytes
                        while True:
                            chunk = sock.recv(4096)
                            if not chunk:  # No more data
                                break
                            response += chunk  # Append chunk to response
                    except socket.timeout:
                        pass  # Timeout is expected — means no more data

                    print(response.decode().strip())  # Print decoded response

                except KeyboardInterrupt:
                    break  # Gracefully exit on Ctrl+C
                except:
                    break  # Exit on any unexpected runtime error
    except:
        return  # Exit silently if connection fails

# Entry point: run the main() function if script is executed directly
if __name__ == "__main__":
    main()
