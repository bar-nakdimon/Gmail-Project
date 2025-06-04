#ifndef THREAD_MANAGER_H
#define THREAD_MANAGER_H

#include <functional>
#include <thread>

class ThreadManager {
public:
    void run(std::function<void()> task) {
        std::thread(std::move(task)).detach();
    }
};

#endif
