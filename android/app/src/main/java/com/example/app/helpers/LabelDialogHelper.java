package com.example.app.helpers;

import android.app.Activity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.example.app.R;
import com.example.app.auth.SessionManager;
import com.example.app.entities.Label;
import com.example.app.repositories.LabelRepository;
import com.google.android.material.bottomsheet.BottomSheetDialog;

public class LabelDialogHelper {

    public static void showAddLabelDialog(Activity activity, LabelRepository repo, Runnable onSuccess) {
        BottomSheetDialog dialog = new BottomSheetDialog(activity);
        View view = activity.getLayoutInflater().inflate(R.layout.dialog_add_label, null);

        EditText editLabelName = view.findViewById(R.id.editLabelName);
        Button buttonAdd = view.findViewById(R.id.buttonAddLabel);

        buttonAdd.setOnClickListener(v -> {
            String newLabelName = editLabelName.getText().toString().trim();
            if (newLabelName.isEmpty()) {
                Toast.makeText(activity, "Please enter label name", Toast.LENGTH_SHORT).show();
                return;
            }

            if (newLabelName.equalsIgnoreCase("Add label")) {
                Toast.makeText(activity, "Invalid name!", Toast.LENGTH_SHORT).show();
                return;
            }

            Label newLabel = new Label(null, newLabelName, null, new SessionManager(activity).getUserId());

            repo.createLabel(newLabel, new retrofit2.Callback<>() {
                @Override
                public void onResponse(retrofit2.Call call, retrofit2.Response response) {
                    if (response.isSuccessful()) {
                        Toast.makeText(activity, "Label added", Toast.LENGTH_SHORT).show();
                        onSuccess.run();
                        dialog.dismiss();
                    } else {
                        Toast.makeText(activity, "Failed to add label", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(retrofit2.Call call, Throwable t) {
                    Toast.makeText(activity, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        });

        dialog.setContentView(view);
        dialog.show();
    }
}
