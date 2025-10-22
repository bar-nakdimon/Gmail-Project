package com.example.app.viewmodels;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.ViewModel;

import com.example.app.entities.Label;
import com.example.app.repositories.LabelRepository;

import java.util.List;

public class LabelViewModel extends ViewModel {

    private final LabelRepository repository;

    public LabelViewModel(LabelRepository repository) {
        this.repository = repository;
    }

    public LiveData<List<Label>> getAllLabels() {
        return repository.getAllLabels();
    }

    public void createLabel(Label label, retrofit2.Callback<Label> callback) {
        repository.createLabel(label, callback);
    }

    public void updateLabel(String  id, Label label, retrofit2.Callback<Label> callback) {
        repository.updateLabel(id, label, callback);
    }

    public void deleteLabel(String  id, retrofit2.Callback<Void> callback) {
        repository.deleteLabel(id, callback);
    }
}
