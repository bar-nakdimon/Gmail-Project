package com.example.app.viewmodels;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.ViewModel;
import okhttp3.ResponseBody;
import com.example.app.entities.Mail;
import com.example.app.repositories.MailRepository;

import java.util.List;

import retrofit2.Callback;

public class MailViewModel extends ViewModel {
    private final MailRepository mailRepository;

    public MailViewModel(MailRepository repository) {
        this.mailRepository = repository;
    }

    // Used in InboxFragment
    public LiveData<List<Mail>> getInbox() {
        return mailRepository.getInbox(); // no userId needed
    }

    public void sendMail(Mail mail, Callback<ResponseBody> callback) {
        mailRepository.sendMail(mail, callback);
    }


    public LiveData<Mail> getMailById(int id) {
        return mailRepository.getMailById(id);
    }
}
