package com.example.app.viewmodels;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.ViewModel;

import com.example.app.entities.User;
import com.example.app.repositories.UserRepository;

public class UserViewModel extends ViewModel {

    private final UserRepository userRepository;

    public UserViewModel(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LiveData<User> createUser(User user) {
        return userRepository.createUser(user);
    }

    public LiveData<User> getUserById(int id) {
        return userRepository.getUserById(id);
    }
}
