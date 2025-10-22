package com.example.app.helpers;

import android.content.Context;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.lifecycle.LifecycleOwner;

import com.example.app.R;
import com.example.app.activities.MainActivity;
import com.example.app.entities.Label;
import com.example.app.repositories.LabelRepository;

import java.util.ArrayList;
import java.util.List;

public class LabelMenuHelper {

    public static void populateLabelMenu(
            Menu menu,
            List<Label> labels,
            LabelRepository repo,
            Context context,
            LifecycleOwner owner
    ) {

        List<String> fixedOrder = List.of(
                "received", "sent", "star", "trash", "spam", "drafts", "read", "unread"
        );

        List<Label> ordered = new ArrayList<>();
        List<Label> others = new ArrayList<>();

        for (String key : fixedOrder) {
            for (Label label : labels) {
                if (label.getName().equalsIgnoreCase(key)) {
                    ordered.add(label);
                }
            }
        }

        for (Label label : labels) {
            if (!fixedOrder.contains(label.getName().toLowerCase())) {
                others.add(label);
            }
        }

        ordered.addAll(others);

        for (Label label : ordered) {
            String name = label.getName();
            String displayName = name.equalsIgnoreCase("received") ? "Inbox" : name;
            int iconRes = getIconForLabel(name.toLowerCase());

            MenuItem item = menu.add(Menu.NONE, Menu.NONE, Menu.NONE, displayName);
            item.setIcon(iconRes);
            item.setTitleCondensed(label.getId());

            if (!isFixedLabel(name)) {
                item.setActionView(R.layout.menu_item_delete);
                ImageView btnDelete = item.getActionView().findViewById(R.id.btnDeleteLabel);
                btnDelete.setOnClickListener(v -> {
                    repo.deleteLabel(label.getId(), new retrofit2.Callback<>() {
                        @Override
                        public void onResponse(retrofit2.Call<Void> call, retrofit2.Response<Void> response) {
                            if (response.isSuccessful()) {
                                Toast.makeText(context, "Label deleted!", Toast.LENGTH_SHORT).show();
                                if (context instanceof MainActivity) {
                                    MainActivity ma = (MainActivity)context;
                                    ma.refreshLabels();   // rebuild the drawer
                                    ma.getSupportFragmentManager().setFragmentResult("inboxRefresh", new Bundle());
                                }
                            } else {
                                Toast.makeText(context, "Failed to delete", Toast.LENGTH_SHORT).show();
                            }
                        }

                        @Override
                        public void onFailure(retrofit2.Call<Void> call, Throwable t) {
                            Toast.makeText(context, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    });
                });
            }
        }
    }

    private static int getIconForLabel(String labelName) {
        switch (labelName) {
            case "received":
                return R.drawable.inbox_24px;
            case "sent":
                return R.drawable.send_24px;
            case "star":
                return R.drawable.star_24px;
            case "trash":
                return R.drawable.delete_24px;
            case "spam":
                return R.drawable.block_24px;
            case "drafts":
                return R.drawable.drafts_24px;
            default:
                return R.drawable.label_24px;
        }
    }

    public static boolean isFixedLabel(String name) {
        String n = name.toLowerCase();
        return n.equals("received") || n.equals("sent") || n.equals("star")
                || n.equals("trash") || n.equals("spam") || n.equals("drafts")
                || n.equals("read") || n.equals("unread");
    }
}
