package com.example.app.fragments;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.example.app.R;
import com.example.app.entities.Mail;
import com.example.app.entities.MailLabel;
import com.example.app.repositories.MailRepository;
import com.example.app.viewmodels.MailViewModel;
import com.example.app.viewmodels.MailViewModelFactory;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ComposeMailFragment extends Fragment {
    private static final String TAG = "ComposeMailFragment";

    private EditText toEditText, subjectEditText, bodyEditText;
    private Button sendButton, saveDraftButton;
    private MailViewModel mailViewModel;
    private MailRepository repository;
    private Mail initialMail;
    private boolean isEditingDraft = false;

    @Override
    public View onCreateView(LayoutInflater inflater,
                             ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_compose_mail, container, false);

        // Toolbar
        MaterialToolbar toolbar = view.findViewById(R.id.composeTopAppBar);
        toolbar.setNavigationOnClickListener(v -> requireActivity().getSupportFragmentManager().popBackStack());

        // Inputs
        toEditText = view.findViewById(R.id.toEditText);
        subjectEditText = view.findViewById(R.id.subjectEditText);
        bodyEditText = view.findViewById(R.id.bodyEditText);
        sendButton = view.findViewById(R.id.sendButton);
        saveDraftButton = view.findViewById(R.id.saveDraftButton);

        // ViewModel & Repo
        repository = new MailRepository(requireContext());
        mailViewModel = new ViewModelProvider(this, new MailViewModelFactory(repository)).get(MailViewModel.class);

        // Prefill fields if editing a draft
        if (getArguments() != null && getArguments().containsKey("mail")) {
            initialMail = new Gson().fromJson(getArguments().getString("mail"), Mail.class);
            boolean isDraft = initialMail.getLabels() != null &&
                    initialMail.getLabels().stream().anyMatch(l -> "drafts".equalsIgnoreCase(l.getId()));
            if (isDraft) {
                if (initialMail.getToUsername() != null)
                    toEditText.setText(initialMail.getToUsername());
                subjectEditText.setText(initialMail.getSubject());
                bodyEditText.setText(initialMail.getBody());
                isEditingDraft = true;
            }
        }

        // ▶ SEND button
        sendButton.setOnClickListener(v -> {
            String to = toEditText.getText().toString().trim();
            String sub = subjectEditText.getText().toString().trim();
            String bd = bodyEditText.getText().toString().trim();

            if (to.isEmpty() || sub.isEmpty() || bd.isEmpty()) {
                Toast.makeText(getContext(), "Please fill in all fields", Toast.LENGTH_SHORT).show();
                return;
            }

            sendButton.setEnabled(false);

            Mail newMail = new Mail();
            newMail.setToUsername(to);
            newMail.setSubject(sub);
            newMail.setBody(bd);
            newMail.setIsDraft(false);

            Callback<ResponseBody> sendCallback = new Callback<>() {
                @Override
                public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                    if (response.isSuccessful()) {
                        Toast.makeText(getContext(), "Mail sent!", Toast.LENGTH_SHORT).show();
                        requireActivity().getSupportFragmentManager().popBackStack();
                    } else {
                        Toast.makeText(getContext(), "Send failed", Toast.LENGTH_SHORT).show();
                        sendButton.setEnabled(true);
                    }
                }

                @Override
                public void onFailure(Call<ResponseBody> call, Throwable t) {
                    Log.e(TAG, "Send failed", t);
                    Toast.makeText(getContext(), "Send failed: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    sendButton.setEnabled(true);
                }
            };

            if (isEditingDraft) {
                List<String> labels = new ArrayList<>();
                if (initialMail.getLabels() != null) {
                    for (MailLabel l : initialMail.getLabels()) {
                        labels.add(l.getId().toLowerCase());
                    }
                }
                if (!labels.contains("trash")) {
                    labels.add("trash");
                }

                repository.updateMailLabels(initialMail.getId(), labels, new Callback<Void>() {
                    @Override
                    public void onResponse(Call<Void> call, Response<Void> response) {
                        repository.deleteMail(initialMail.getId(), new Callback<Void>() {
                            @Override
                            public void onResponse(Call<Void> call, Response<Void> response) {
                                mailViewModel.sendMail(newMail, sendCallback);
                            }

                            @Override
                            public void onFailure(Call<Void> call, Throwable t) {
                                sendCallback.onFailure(null, t);
                            }
                        });
                    }

                    @Override
                    public void onFailure(Call<Void> call, Throwable t) {
                        sendCallback.onFailure(null, t);
                    }
                });
            }   else {
                mailViewModel.sendMail(newMail, sendCallback);
            }
        });

        // ▶ SAVE DRAFT button
        saveDraftButton.setOnClickListener(v -> {
            String to = toEditText.getText().toString().trim();
            String sub = subjectEditText.getText().toString().trim();
            String bd = bodyEditText.getText().toString().trim();

            if (to.isEmpty() && sub.isEmpty() && bd.isEmpty()) {
                Toast.makeText(getContext(), "Draft is empty — nothing saved", Toast.LENGTH_SHORT).show();
                return;
            }

            saveDraftButton.setEnabled(false);

            Mail draft = new Mail();
            if (isEditingDraft && initialMail != null) {
                draft.setId(initialMail.getId());
            }
            draft.setToUsername(to);
            draft.setSubject(sub);
            draft.setBody(bd);
            draft.setIsDraft(true);

            Callback<ResponseBody> saveCallback = new Callback<>() {
                @Override
                public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                    repository.updateMailLabels(
                            draft.getId(),
                            Collections.singletonList("drafts"),
                            new Callback<Void>() {
                                @Override
                                public void onResponse(Call<Void> c2, Response<Void> r2) {
                                    Toast.makeText(getContext(), "Draft saved", Toast.LENGTH_SHORT).show();
                                    requireActivity().getSupportFragmentManager().popBackStack();
                                }

                                @Override
                                public void onFailure(Call<Void> c2, Throwable t2) {
                                    Toast.makeText(getContext(), "Label error: " + t2.getMessage(), Toast.LENGTH_SHORT).show();
                                    saveDraftButton.setEnabled(true);
                                }
                            }
                    );
                }

                @Override
                public void onFailure(Call<ResponseBody> call, Throwable t) {
                    Toast.makeText(getContext(), "Save failed: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    saveDraftButton.setEnabled(true);
                }
            };

            if (isEditingDraft) {
                repository.updateMail(draft, new Callback<Mail>() {
                    @Override
                    public void onResponse(Call<Mail> call, Response<Mail> response) {
                        saveCallback.onResponse(null, null);
                    }

                    @Override
                    public void onFailure(Call<Mail> call, Throwable t) {
                        saveCallback.onFailure(null, t);
                    }
                });
            } else {
                repository.createDraft(draft, saveCallback);
            }
        });

        return view;
    }
}
