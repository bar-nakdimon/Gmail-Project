package com.example.app.viewmodels;

import androidx.annotation.NonNull;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;

import com.example.app.repositories.MailRepository;

public class MailViewModelFactory implements ViewModelProvider.Factory {
    private final MailRepository repository;

    public MailViewModelFactory(MailRepository repository) {
        this.repository = repository;
    }

    @NonNull
    @Override
    public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
        if (modelClass.isAssignableFrom(MailViewModel.class)) {
            return (T) new MailViewModel(repository);
        }
        throw new IllegalArgumentException("Unknown ViewModel class");
    }
}
