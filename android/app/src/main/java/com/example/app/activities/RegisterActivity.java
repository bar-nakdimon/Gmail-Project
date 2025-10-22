package com.example.app.activities;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.SpannableString;
import android.widget.Button;
import com.bumptech.glide.Glide;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import com.example.app.R;
import com.example.app.repositories.UserRepository;

public class RegisterActivity extends AppCompatActivity {

    private EditText editTextUsername, editTextPassword, confirmPasswordEditText, nameEditText;
    private TextView buttonGoToLogin;
    private Button buttonRegister, buttonPickImage;
    private ImageView imagePreview;

    private UserRepository userRepository;

    private Uri selectedImageUri = null;

    private final ActivityResultLauncher<String> pickImageLauncher = registerForActivityResult(
            new ActivityResultContracts.GetContent(),
            uri -> {
                if (uri != null) {
                    selectedImageUri = uri;

                    Glide.with(this)
                            .load(uri)
                            .placeholder(R.drawable.ic_profile) 
                            .circleCrop()
                            .into(imagePreview);
                }
            });

    private boolean isValidUsername(String username) {
        return username.matches("^(?![_.])[a-zA-Z0-9._]{3,20}(?<![_.])$");
    }

    private boolean isValidPassword(String password) {
        return password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?\":{}|<>]).{8,}$");
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        editTextUsername = findViewById(R.id.editTextUsername);
        editTextPassword = findViewById(R.id.editTextPassword);
        confirmPasswordEditText = findViewById(R.id.editTextConfirmPassword);
        nameEditText = findViewById(R.id.editTextName);

        buttonRegister = findViewById(R.id.buttonRegister);
        buttonPickImage = findViewById(R.id.buttonPickImage);
        buttonGoToLogin = findViewById(R.id.buttonGoToLogin);

        imagePreview = findViewById(R.id.imagePreview);

        String text = "Already have an account? Login";
        SpannableString content = new SpannableString(text);
        content.setSpan(new android.text.style.UnderlineSpan(), text.indexOf("Login"), text.length(), 0);
        buttonGoToLogin.setText(content);

        userRepository = new UserRepository(getApplicationContext());

        buttonPickImage.setOnClickListener(v -> {
            pickImageLauncher.launch("image/*");
        });

        buttonRegister.setOnClickListener(v -> {
            String username = editTextUsername.getText().toString().trim();
            String password = editTextPassword.getText().toString().trim();
            String confirmPassword = confirmPasswordEditText.getText().toString().trim();
            String name = nameEditText.getText().toString().trim();

            if (username.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
                return;
            }

            if (!isValidUsername(username)) {
                Toast.makeText(this, "Username must be 3-20 characters, letters, numbers, dots, underscores; no _ or . at start/end", Toast.LENGTH_LONG).show();
                return;
            }

            if (!isValidPassword(password)) {
                Toast.makeText(this, "Password must be 8+ chars, include uppercase, lowercase, number and special char", Toast.LENGTH_LONG).show();
                return;
            }

            if (!password.equals(confirmPassword)) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show();
                return;
            }

            if (name.length() < 2 || name.length() > 50) {
                Toast.makeText(this, "Display name must be between 2 and 50 characters", Toast.LENGTH_SHORT).show();
                return;
            }

            userRepository.register(username, password, name, selectedImageUri, this)
                    .observe(this, success -> {
                        if (success != null && success) {
                            Toast.makeText(this, "Registration successful", Toast.LENGTH_SHORT).show();
                            startActivity(new Intent(this, LoginActivity.class));
                            finish();
                        } else {
                            Toast.makeText(this, "Registration failed", Toast.LENGTH_SHORT).show();
                        }
                    });
        });

        buttonGoToLogin.setOnClickListener(v -> {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });
    }
}
