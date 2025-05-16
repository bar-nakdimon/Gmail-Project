## Gmail-Project
This project is part of an Advanced Programming course at Bar-Ilan University, developed by a team of three students.

The goal of the project is to design and implement a full-stack Gmail-like email system, focusing on backend architecture, API development, secure authentication, and scalable deployment using modern software engineering principles.

## TCP Client–Server Bloom‐Filter Service  
- **Server (C++)**  
  - Listens on a configurable IP & port  
  - Parses newline-terminated commands (`POST`, `GET`, `DELETE`) via a `CommandParser` + `CommandFactory`  
  - Executes Bloom-filter operations and auxiliary blacklist logic with HTTP-style responses:  
    - `POST [URL]` → `201 Created`  
    - `GET  [URL]` → `200 Ok` + result  
    - `DELETE [URL]` → `204 No Content` or `404 Not Found`  
    - Invalid commands → `400 Bad Request`  
  - Persists filter state in `filter_data.txt` between runs  
- **Client (Python 3)**  
  - Validates server IP & port  
  - Opens a TCP connection, sends user commands (with trailing `\n`), and prints newline-terminated replies  
- **Testing (TDD)**  
  - Google Test unit tests & end-to-end socket integration tests  
  - Python helper tests for `client.py`  
- **Containerization**  
  - `Dockerfile.server` for building & running the server
  - `Dockerfile.client` for building & running the client   
  - `Dockerfile.test` for compiling and executing all C++ tests in Docker  
## Running the Main Program with Docker

1. **Build the server image**  
   ```bash
   docker build -t ex2-server -f Dockerfile.server .

2. **Run the server (defaults: PORT=5555, Bloom config 16 1):**  
   ```bash
   docker run --rm -it --network host ex2-server

3. **Build the client image (in a separate terminal):**  
   ```bash
   docker build -t ex2-client -f Dockerfile.client .
   
4. **Run the client (defaults: IP=127.0.0.1, PORT=5555):**  
   ```bash
   docker run --rm -it --network host ex2-client

## Running the Tests

1. **Ensure correct file format**  
   ```bash
   dos2unix ./tests/run_all.sh

2. **Run all tests**  
   ```bash
   ./tests/run_all.sh

 ## Contribution & Workflow
- All work is tracked in Jira (Epics → Stories → Tasks) and linked via smart commits.
- Branch protection on main requires passing CI checks and at least one approving review.

## Design Reflections: Open/Closed Principle

In this iteration we examined how our codebase responded to several types of changes, and whether those touched modules that should remain “closed for modification, open for extension.”

1. **Changing command names**  
   - **Did it require modifying closed code?**  
     No. While the entire server and command system were newly introduced in EX-2, the core Bloom Filter logic from EX-1 was reused without any modification. Changing command names only affected the CommandParser and CommandType, leaving all existing logic—including the reused Bloom module—fully untouched. 
   - **Why it worked:**  
     The parser/factory separation isolates name-to-type mapping in one place. Once a new keyword is parsed correctly, existing components don’t care what the keyword is called.

2. **Adding new commands (e.g. DELETE)**  
   - **Did it require modifying closed code?**  
     Partially. We created a new `DeleteCommand` class (extension) and registered it in `CommandFactory`.  
   - **Future safety improvement:**  
     To avoid editing `CommandFactory`, we can switch to a registration map (e.g. `std::unordered_map<CommandType, FactoryFn>`) where each command self-registers its factory function at startup. That way new commands live entirely in their own module.

3. **Changing command output format (HTTP-style status codes)**  
   - **Did it require modifying closed code?**  
     No. Output formatting is encapsulated in each concrete `execute()` method. Adjusting status codes only touched those classes, not the core dispatch or parser.

4. **Switching I/O from console to TCP sockets**  
   - **Did it require modifying closed code?**  
     No. All networking changes were confined to `ConnectionHandler` and `Server` classes. The command modules (`commands/` and `BloomFilter`) remain agnostic to the transport layer.  

By keeping parsing, instantiation, execution, and transport in separate modules, we preserved the **Open/Closed Principle**: new functionality and format changes extend the code without modifying the stable core.  

## Example Session

```bash
$ python3 Client/Client.py 127.0.0.1 5555
POST www.example.com
201 Created
GET www.example.com
200 Ok

true true
DELETE www.example.com
204 No Content
GET www.example.com
200 Ok

true false
PUT www.example.com
400 Bad Request


