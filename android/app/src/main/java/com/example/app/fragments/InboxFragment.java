package com.example.app.fragments;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import java.util.Collections;
import java.util.Comparator;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapters.MailCardAdapter;
import com.example.app.entities.Mail;
import com.example.app.entities.MailLabel;
import com.example.app.repositories.MailRepository;
import com.example.app.viewmodels.MailViewModel;
import com.example.app.viewmodels.MailViewModelFactory;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;           // CHANGED: needed for callbacks
import retrofit2.Callback;       // CHANGED
import retrofit2.Response;       // CHANGED
import android.widget.Toast;      // CHANGED (optional, if you want to show toasts)

public class InboxFragment extends Fragment
        implements MailCardAdapter.OnMailActionListener {  // CHANGED: implement the 4-method listener

    private static final String TAG = "InboxFragment";
    private MailViewModel mailViewModel;
    private MailCardAdapter adapter;

    private String labelId = "received";
    private String searchQuery = null;


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        Log.d(TAG, "onCreateView started");

        View view = inflater.inflate(R.layout.fragment_inbox, container, false);

        if (getArguments() != null) {
            labelId = getArguments().getString("labelId", "received").toLowerCase();
            searchQuery = getArguments().getString("searchQuery", null);
        }


        FloatingActionButton fab = view.findViewById(R.id.fabCompose);
        fab.setOnClickListener(v -> {
            getParentFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, new ComposeMailFragment())
                    .addToBackStack(null)
                    .commit();
        });

        RecyclerView recyclerView = view.findViewById(R.id.recyclerViewMails);
        TextView textEmpty = view.findViewById(R.id.textEmpty);

        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));

        // CHANGED: pass 'this' so all four callbacks are handled
        adapter = new MailCardAdapter(this);

        recyclerView.setAdapter(adapter);

        MailRepository repository = new MailRepository(requireContext());
        MailViewModelFactory factory = new MailViewModelFactory(repository);
        mailViewModel = new ViewModelProvider(this, factory).get(MailViewModel.class);

        getParentFragmentManager().setFragmentResultListener(
                "inboxRefresh",
                getViewLifecycleOwner(),
                (key, bundle) -> {
                    mailViewModel.getInbox().observe(getViewLifecycleOwner(), mails -> {
                        if (mails != null) {
                            Collections.sort(mails, (a, b) ->
                                    b.getTimestamp().compareTo(a.getTimestamp()));
                        }
                        filterAndDisplay(mails, labelId, textEmpty);
                    });
                }
        );


        mailViewModel.getInbox().observe(getViewLifecycleOwner(), mails -> {
            if (mails != null) {
                Log.d(TAG, "Loaded inbox, total mails: " + mails.size());

                Collections.sort(mails, new Comparator<Mail>() {
                    @Override
                    public int compare(Mail a, Mail b) {
                        // assuming getTimestamp() returns an ISO-style String, lexicographic works:
                        return b.getTimestamp().compareTo(a.getTimestamp());
                    }
                });


                filterAndDisplay(mails, labelId, textEmpty);
            } else {
                Log.d(TAG, "Fetched empty inbox");
                adapter.setMailList(new ArrayList<>());
                textEmpty.setVisibility(View.VISIBLE);
            }
        });

        return view;
    }

    private void filterAndDisplay(List<Mail> allMails, String labelId, TextView textEmpty) {
        List<Mail> filtered = new ArrayList<>();

        for (Mail mail : allMails) {

            if (searchQuery != null && !searchQuery.trim().isEmpty()) {
                String content = (mail.getSubject() + " " + mail.getBody()).toLowerCase();
                if (content.contains(searchQuery.toLowerCase())) {
                    filtered.add(mail);
                }
                continue;
            }

            List<String> labelIds = new ArrayList<>();
            if (mail.getLabels() != null) {
                for (MailLabel l : mail.getLabels()) {
                    labelIds.add(l.getId().toLowerCase());
                }
            }

            boolean isTrash = labelIds.contains("trash");
            boolean isSpam = labelIds.contains("spam");
            boolean isAll = labelId.equalsIgnoreCase("all");
            boolean isInbox = labelId.equalsIgnoreCase("inbox") || labelId.equalsIgnoreCase("received");

            if (isAll) {
                if (!isTrash && !isSpam) {
                    filtered.add(mail);
                }
            } else if (labelId.equalsIgnoreCase("trash")) {
                if (isTrash) {
                    filtered.add(mail);
                }
            } else if (labelId.equalsIgnoreCase("spam")) {
                if (isSpam && !isTrash) {
                    filtered.add(mail);
                }
            } else if (isInbox) {
                if (!isTrash && !isSpam && labelIds.contains("received")) {
                    filtered.add(mail);
                }
            } else {
                if (labelIds.contains(labelId.toLowerCase()) && !isTrash && !isSpam) {
                    filtered.add(mail);
                }
            }
        }

        if (!filtered.isEmpty()) {
            Log.d(TAG, "Filtered mails count for label '" + labelId + "': " + filtered.size());
            adapter.setMailList(filtered);
            textEmpty.setVisibility(View.GONE);
        } else {
            Log.d(TAG, "No mails found for label '" + labelId + "'");
            adapter.setMailList(new ArrayList<>());
            textEmpty.setVisibility(View.VISIBLE);
        }
    }

    // ─── New callbacks to match the 4-button adapter ───────────────────────

    @Override
    public void onMailClick(Mail mail) {
        // moved your original “open detail” lambda here:
        Bundle bundle = new Bundle();
        bundle.putString("mail", new Gson().toJson(mail));

        Fragment dest;
        if ("drafts".equalsIgnoreCase(labelId)) {
            dest = new ComposeMailFragment();
        } else {
            dest = new MailDetailFragment();
        }

        dest.setArguments(bundle);
        requireActivity().getSupportFragmentManager()
                .beginTransaction()
                .replace(R.id.fragment_container, dest)
                .addToBackStack(null)
                .commit();
    }

    @Override
    public void onToggleRead(Mail mail) {
        new MailRepository(requireContext())
                .toggleReadMail(mail, new Callback<Void>() {
                    @Override public void onResponse(Call<Void> call, Response<Void> resp) {
                        Bundle result = new Bundle();
                        result.putBoolean("shouldRefresh", true);
                        getParentFragmentManager().setFragmentResult("inboxRefresh", result);
                    }
                    @Override public void onFailure(Call<Void> call, Throwable t) { }
                });
    }

    @Override
    public void onStar(Mail mail) {
        List<String> labels = new ArrayList<>();
        if (mail.getLabels() != null) {
            for (MailLabel l : mail.getLabels()) {
                labels.add(l.getId());
            }
        }
        boolean wasStarred = labels.remove("star");
        if (!wasStarred) labels.add("star");

        new MailRepository(requireContext())
                .updateMailLabels(mail.getId(), labels, new Callback<Void>() {
                    @Override public void onResponse(Call<Void> call, Response<Void> resp) {
                        Bundle result = new Bundle();
                        result.putBoolean("shouldRefresh", true);
                        getParentFragmentManager().setFragmentResult("inboxRefresh", result);
                    }
                    @Override public void onFailure(Call<Void> call, Throwable t) { }
                });
    }

    @Override
    public void onTrash(Mail mail) {
        new MailRepository(requireContext())
                .trashOrDeleteMail(mail, new Callback<Void>() {
                    @Override public void onResponse(Call<Void> call, Response<Void> resp) {
                        Bundle result = new Bundle();
                        result.putBoolean("shouldRefresh", true);
                        getParentFragmentManager().setFragmentResult("inboxRefresh", result);
                    }
                    @Override public void onFailure(Call<Void> call, Throwable t) { }
                });
    }
}
