package com.example.app.fragments;

import android.content.res.ColorStateList;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import com.example.app.entities.Label;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.appcompat.app.AlertDialog;

import com.example.app.R;
import com.example.app.api.LabelAPI;
import com.example.app.auth.SessionManager;
import com.example.app.entities.BlacklistResponse;
import com.example.app.entities.Mail;
import com.example.app.entities.MailLabel;
import com.example.app.helpers.LabelMenuHelper;
import com.example.app.repositories.LabelRepository;
import com.example.app.repositories.MailRepository;
import com.example.app.utils.RetrofitClient;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import com.example.app.utils.DateUtils;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MailDetailFragment extends Fragment {
    private static final String TAG = "MailDetailFragment";

    private Mail currentMail;
    private MailRepository repo;

    private LabelRepository labelRepo;

    private TextView subjectTextView, fromTextView, toTextView,
            timestampTextView, bodyTextView;
    private LinearLayout labelsContainer;
    private ImageButton deleteButton, starButton, spamButton, unreadButton,restoreButton,labelsButton;

    private Map<String,Integer> blacklistIds = new HashMap<>();

    @Override
    public View onCreateView(LayoutInflater inflater,
                             ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_mail_detail, container, false);

        getParentFragmentManager().setFragmentResultListener(
                "inboxRefresh",
                getViewLifecycleOwner(),
                (key, bundle) -> {
                    repo.fetchMailById(currentMail.getId(), new Callback<Mail>() {
                        @Override public void onResponse(Call<Mail> c, Response<Mail> r) {
                            if (r.isSuccessful() && r.body() != null) {
                                currentMail = r.body();
                                displayLabels(currentMail.getLabels());
                            }
                        }
                        @Override public void onFailure(Call<Mail> c, Throwable t) { }
                    });
                }
        );

        // Init Repo
        repo = new MailRepository(requireContext());
        labelRepo = new LabelRepository(
                RetrofitClient.getAuthenticatedInstance(requireContext())
                        .create(LabelAPI.class),
                new SessionManager(requireContext()).getUserId()
        );


        // Find Views
        deleteButton  = view.findViewById(R.id.deleteButton);
        starButton    = view.findViewById(R.id.starButton);
        spamButton    = view.findViewById(R.id.spamButton);
        unreadButton  = view.findViewById(R.id.unreadButton);
        restoreButton = view.findViewById(R.id.restoreButton);
        labelsButton   = view.findViewById(R.id.labelsButton);


        LinearLayout restoreContainer = view.findViewById(R.id.restoreContainer);

        MaterialToolbar toolbar = view.findViewById(R.id.topAppBar);
        toolbar.setNavigationOnClickListener(v ->
                requireActivity().getSupportFragmentManager().popBackStack()
        );


        subjectTextView   = view.findViewById(R.id.textSubject);
        fromTextView      = view.findViewById(R.id.textFrom);
        toTextView        = view.findViewById(R.id.textTo);
        timestampTextView = view.findViewById(R.id.textTimestamp);
        bodyTextView      = view.findViewById(R.id.textBody);
        labelsContainer   = view.findViewById(R.id.labelsContainer);

        //  Deserialize Mail
        if (getArguments() == null || !getArguments().containsKey("mail")) {
            Log.e(TAG, "No mail in arguments");
            return view;
        }
        currentMail = new Gson()
                .fromJson(getArguments().getString("mail"), Mail.class);

        if (hasLabel("trash")) {
            restoreContainer.setVisibility(View.VISIBLE);
        } else {
            restoreContainer.setVisibility(View.GONE);
        }

        //  Populate UI & labels
        subjectTextView.setText(currentMail.getSubject());
        fromTextView.setText("From: " + currentMail.getFromUsername());
        toTextView.setText("To: " + currentMail.getToUsername());
        // to keep “Sent:” in front
        timestampTextView.setText("Sent: " + DateUtils.formatMailTs(currentMail.getTimestamp()));
        bodyTextView.setText(currentMail.getBody());
        displayLabels(currentMail.getLabels());

        //  Auto-mark as “read” if it was unread
        if (hasLabel("unread")) {
            repo.toggleReadMail(currentMail, new Callback<Void>() {
                @Override public void onResponse(Call<Void> c, Response<Void> r) {
                    if (r.isSuccessful()) {
                        // update locally & UI
                        currentMail.getLabels().removeIf(l -> l.getId().equalsIgnoreCase("unread"));
                        currentMail.getLabels().add(new MailLabel("read","Read"));
                        displayLabels(currentMail.getLabels());
                        // notify list to refresh
                        Bundle result = new Bundle();
                        result.putBoolean("shouldRefresh", true);
                        getParentFragmentManager().setFragmentResult("inboxRefresh", result);
                    }
                }
                @Override public void onFailure(Call<Void> c, Throwable t) { /* ignore */ }
            });
        }

        //  Button callbacks
        deleteButton.setOnClickListener(v -> trashOrDelete());
        restoreButton.setOnClickListener(v -> restoreMail());
        starButton.setOnClickListener(v ->
                toggleLabel(new MailLabel("star", "Star")));


        spamButton.setOnClickListener(v -> {
            boolean wasSpam = hasLabel("spam");
            toggleLabel(new MailLabel("spam","Spam"));

            String combined = currentMail.getSubject() + "\n" + currentMail.getBody();
            List<String> urls = extractUrls(combined);

            if (!wasSpam) {
                // newly marked spam → add to blacklist and store ID
                for (String url : urls) {
                    repo.addToBlacklist(url, new Callback<BlacklistResponse>() {
                        @Override public void onResponse(Call<BlacklistResponse> c, Response<BlacklistResponse> r) {
                            if (r.isSuccessful() && r.body() != null) {
                                blacklistIds.put(url, r.body().getId());
                            }
                        }
                        @Override public void onFailure(Call<BlacklistResponse> c, Throwable t) {
                            Log.e(TAG, "Failed to add to blacklist: " + url, t);
                        }
                    });
                }
            } else {
                // un-spam → remove from blacklist using stored IDs
                for (String url : urls) {
                    Integer id = blacklistIds.get(url);
                    if (id != null) {
                        repo.removeFromBlacklist(id, new Callback<Void>() {
                            @Override public void onResponse(Call<Void> c, Response<Void> r) { }
                            @Override public void onFailure(Call<Void> c, Throwable t) {
                                Log.e(TAG, "Failed to remove from blacklist: " + url, t);
                            }
                        });
                        blacklistIds.remove(url);
                    }
                }
            }
        });

        unreadButton.setOnClickListener(v -> markUnread());
        labelsButton.setOnClickListener(v -> showLabelPicker());
        return view;
    }

    private void restoreMail() {
        if (!hasLabel("trash")) {
            Toast.makeText(getContext(), "Not in Trash", Toast.LENGTH_SHORT).show();
            return;
        }

        List<String> ids = new ArrayList<>();
        for (MailLabel l : currentMail.getLabels()) {
            if (!l.getId().equalsIgnoreCase("trash")) {
                ids.add(l.getId());
            }
        }

        repo.updateMailLabels(currentMail.getId(), ids, new Callback<Void>() {
            @Override public void onResponse(Call<Void> c, Response<Void> r) {
                if (r.isSuccessful()) {
                    Toast.makeText(getContext(), "Mail restored", Toast.LENGTH_SHORT).show();

                    Bundle result = new Bundle();
                    result.putBoolean("shouldRefresh", true);
                    getParentFragmentManager().setFragmentResult("inboxRefresh", result);

                    requireActivity().getSupportFragmentManager().popBackStack();

                } else {
                    Toast.makeText(getContext(), "Restore failed: " + r.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override public void onFailure(Call<Void> c, Throwable t) {
                Toast.makeText(getContext(), "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }


    private List<String> extractUrls(String text) {
        List<String> urls = new ArrayList<>();
        Pattern p = Pattern.compile("((https?://)?(www\\.)?[\\w.-]+\\.[a-zA-Z]{2,}(\\S*)?)");
        Matcher m = p.matcher(text);
        while (m.find()) urls.add(m.group());
        return urls;
    }

    private void displayLabels(List<MailLabel> labels) {
        if (!isAdded() || getContext() == null) return;
        labelsContainer.removeAllViews();
        if (labels != null) {
            for (MailLabel label: labels) {
                TextView chip = new TextView(getContext());
                chip.setText(label.getName());
                chip.setTextColor(ContextCompat.getColor(requireContext(), android.R.color.black));
                chip.setPadding(24,12,24,12);

                GradientDrawable bg = new GradientDrawable();
                bg.setCornerRadius(40f);
                bg.setColor(getColorForLabel(label.getId()));
                chip.setBackground(bg);

                LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.WRAP_CONTENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT
                );
                p.setMargins(8,0,8,0);
                chip.setLayoutParams(p);

                labelsContainer.addView(chip);
            }
        }

        // update icons
        starButton.setImageResource(
                hasLabel("star")
                        ? R.drawable.star_fill_24px
                        : R.drawable.star_24px
        );
        spamButton.setImageResource(
                hasLabel("spam")
                        ? R.drawable.block_24px
                        : R.drawable.block_24px
        );

        unreadButton.setImageResource(
                hasLabel("read")
                        ? R.drawable.mail_24px
                        : R.drawable.mark_email_read_24px
        );
    }



    private void toggleLabel(final MailLabel clicked) {
        List<String> ids = new ArrayList<>();
        boolean removed = false;
        if (currentMail.getLabels() != null) {
            for (MailLabel l: currentMail.getLabels()) {
                if (l.getId().equalsIgnoreCase(clicked.getId())) {
                    removed = true;
                } else {
                    ids.add(l.getId());
                }
            }
        }
        if (!removed) ids.add(clicked.getId());

        repo.updateMailLabels(currentMail.getId(), ids, new Callback<Void>() {
            @Override public void onResponse(Call<Void> c, Response<Void> r) {
                if (r.isSuccessful()) {
                    // refresh full Mail and UI
                    repo.fetchMailById(currentMail.getId(), new Callback<Mail>() {
                        @Override public void onResponse(Call<Mail> c2, Response<Mail> r2) {
                            if (r2.isSuccessful() && r2.body() != null) {
                                currentMail = r2.body();
                                displayLabels(currentMail.getLabels());

                                if (clicked.getId().equalsIgnoreCase("spam")) {
                                    Bundle result = new Bundle();
                                    result.putBoolean("shouldRefresh", true);
                                    getParentFragmentManager().setFragmentResult("inboxRefresh", result);

                                    requireActivity().getSupportFragmentManager().popBackStack();
                                }
                            }
                        }
                        @Override public void onFailure(Call<Mail> c2, Throwable t) { }
                    });
                }
            }
            @Override public void onFailure(Call<Void> c, Throwable t) { }
        });
    }

    private void showLabelPicker() {
        labelRepo.getAllLabels().observe(getViewLifecycleOwner(), labels -> {
            if (labels == null) return;

            List<Label> customLabels = new ArrayList<>();
            for (Label lbl : labels) {
                if (!LabelMenuHelper.isFixedLabel(lbl.getName())) {
                    customLabels.add(lbl);
                }
            }

            if (customLabels.isEmpty()) {
                Toast.makeText(getContext(), "No custom labels", Toast.LENGTH_SHORT).show();
                return;
            }

            View dialogView = LayoutInflater.from(getContext()).inflate(R.layout.dialog_label_picker, null);
            LinearLayout container = dialogView.findViewById(R.id.labelListContainer);

            for (Label label : customLabels) {
                LinearLayout row = new LinearLayout(getContext());
                row.setOrientation(LinearLayout.HORIZONTAL);
                row.setPadding(8, 16, 8, 16);
                row.setLayoutParams(new LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT
                ));

                TextView labelName = new TextView(getContext());
                labelName.setText(label.getName());
                labelName.setTextSize(16f);
                labelName.setLayoutParams(new LinearLayout.LayoutParams(
                        0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

                boolean alreadyApplied = hasLabel(label.getId());

                TextView actionButton = new TextView(getContext());
                actionButton.setText(alreadyApplied ? "Remove" : "Add");
                actionButton.setTextColor(ContextCompat.getColor(requireContext(),
                        alreadyApplied ? R.color.red : R.color.green));
                actionButton.setPadding(24, 8, 24, 8);
                int backgroundRes = alreadyApplied
                        ? R.drawable.button_remove_background
                        : R.drawable.button_add_background;
                actionButton.setBackground(ContextCompat.getDrawable(requireContext(), backgroundRes));
                actionButton.setOnClickListener(v -> {
                    List<String> updatedIds = new ArrayList<>();

                    for (MailLabel ml : currentMail.getLabels()) {
                        if (!ml.getId().equals(label.getId()) && !LabelMenuHelper.isFixedLabel(ml.getName())) {
                            updatedIds.add(ml.getId());
                        }
                    }

                    if (!alreadyApplied) {
                        updatedIds.add(label.getId());
                    }

                    for (MailLabel ml : currentMail.getLabels()) {
                        if (LabelMenuHelper.isFixedLabel(ml.getName())) {
                            updatedIds.add(ml.getId());
                        }
                    }

                    repo.updateMailLabels(currentMail.getId(), updatedIds, new Callback<Void>() {
                        @Override
                        public void onResponse(Call<Void> c, Response<Void> r) {
                            if (r.isSuccessful()) {
                                repo.fetchMailById(currentMail.getId(), new Callback<Mail>() {
                                    @Override
                                    public void onResponse(Call<Mail> call, Response<Mail> response) {
                                        if (response.isSuccessful() && response.body() != null) {
                                            currentMail = response.body();
                                            displayLabels(currentMail.getLabels());
                                            boolean nowHasLabel = hasLabel(label.getId());

                                            actionButton.setText(nowHasLabel ? "Remove" : "Add");
                                            actionButton.setTextColor(ContextCompat.getColor(requireContext(),
                                                    nowHasLabel ? R.color.red : R.color.green));

                                            GradientDrawable border = new GradientDrawable();
                                            border.setCornerRadius(24f);
                                            border.setStroke(2, ContextCompat.getColor(requireContext(),
                                                    nowHasLabel ? R.color.red : R.color.green));
                                            border.setColor(ContextCompat.getColor(requireContext(), android.R.color.transparent));
                                            actionButton.setBackground(border);
                                        }
                                    }

                                    @Override public void onFailure(Call<Mail> call, Throwable t) {
                                        Toast.makeText(getContext(), "Failed to refresh mail", Toast.LENGTH_SHORT).show();
                                    }
                                });
                            } else {
                                Toast.makeText(getContext(), "Failed to update", Toast.LENGTH_SHORT).show();
                            }
                        }

                        @Override
                        public void onFailure(Call<Void> c, Throwable t) {
                            Toast.makeText(getContext(), "Network error", Toast.LENGTH_SHORT).show();
                        }
                    });

                });

                row.addView(labelName);
                row.addView(actionButton);
                container.addView(row);
            }

            new MaterialAlertDialogBuilder(requireContext())
                    .setView(dialogView)
                    .setNegativeButton("Close", null)
                    .show();
        });
    }


    private boolean hasLabel(String id) {
        if (currentMail.getLabels() == null) return false;
        for (MailLabel l : currentMail.getLabels()) {
            if (l.getId().equalsIgnoreCase(id)) return true;
        }
        return false;
    }

    private void trashOrDelete() {
        boolean inTrash = hasLabel("trash");

        if (inTrash) {
            repo.deleteMail(currentMail.getId(), new Callback<Void>() {
                @Override public void onResponse(Call<Void> c, Response<Void> r) {
                    if (r.isSuccessful()) {
                        Toast.makeText(getContext(),
                                "Mail permanently deleted",
                                Toast.LENGTH_SHORT).show();
                        requireActivity()
                                .getSupportFragmentManager()
                                .popBackStack();
                    }
                }
                @Override public void onFailure(Call<Void> c, Throwable t) {
                    Toast.makeText(getContext(),
                            "Delete failed: "+t.getMessage(),
                            Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            List<String> ids = new ArrayList<>();
            if (currentMail.getLabels() != null) {
                for (MailLabel l: currentMail.getLabels()) ids.add(l.getId());
            }
            ids.add("trash");
            repo.updateMailLabels(currentMail.getId(), ids, new Callback<Void>() {
                @Override public void onResponse(Call<Void> c, Response<Void> r) {
                    if (r.isSuccessful()) {
                        Toast.makeText(getContext(),
                                "Moved to Trash",
                                Toast.LENGTH_SHORT).show();
                        requireActivity()
                                .getSupportFragmentManager()
                                .popBackStack();
                    }
                }
                @Override public void onFailure(Call<Void> c, Throwable t) { }
            });
        }
    }

    private void markUnread() {
        if (!hasLabel("read")) {
            Toast.makeText(getContext(), "Already unread", Toast.LENGTH_SHORT).show();
            return;
        }
        repo.toggleReadMail(currentMail, new Callback<Void>() {
            @Override public void onResponse(Call<Void> c, Response<Void> r) {
                if (r.isSuccessful()) {
                    Toast.makeText(getContext(),
                            "Marked Unread",
                            Toast.LENGTH_SHORT).show();
                    // tell inbox to refresh
                    Bundle result = new Bundle();
                    result.putBoolean("shouldRefresh", true);
                    getParentFragmentManager().setFragmentResult("inboxRefresh", result);
                    requireActivity()
                            .getSupportFragmentManager()
                            .popBackStack();
                }
            }
            @Override public void onFailure(Call<Void> c, Throwable t) { }
        });
    }



    private int getColorForLabel(String id) {
        switch (id.toLowerCase()) {
            default:         return ContextCompat.getColor(requireContext(), R.color.label_gray);
        }
    }
}
