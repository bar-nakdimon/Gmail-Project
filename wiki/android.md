# Gmail Android App Documentation

## Table of Contents
- [Overview](#overview)
- [User Activities](#user-activities)

---

## Overview
This is an **Android application** for a Gmail-like system that integrates with a **Node.js + MongoDB backend**, and a C++ blacklist server via TCP.

Users can:
- Register and log in
- View their inbox and sent mail
- Compose new emails or save drafts
- Search, label, star, delete, or mark emails as spam
- Manage custom and built-in labels

---

## User Activities

### 1. Login Activity
- Allows users to log in using a **username and password**.
- Link to register is available at the bottom.

<p align="center">
  <img src="androidDoc/login_screen.png" alt="Login Screen" width="300"/>
</p>

---

### 2. Register Activity
- Allows new users to create an account with:
  - Username
  - Full name
  - Password & confirm password
  - Profile picture (optional)

<p align="center">
  <img src="androidDoc/sign_up_screen.png" alt="Register Screen" width="300"/>
</p>

- Profile picture is selected from local storage:

<p align="center">
  <img src="androidDoc/choose_profile_pic.png" alt="Choose Profile Picture" width="300"/>
</p>

---

### 3. Inbox Activity
- Shows list of received mails.
- Each mail can be opened, deleted, or starred.

<p align="center">
  <img src="androidDoc/inbox_screen.png" alt="Inbox Screen" width="300"/>
</p>

---

### 4. Compose Mail
- Users can write a new mail, send it, or save it as a draft.

<p align="center">
  <img src="androidDoc/compose_mail.png" alt="Compose Mail" width="300"/>
</p>

---

### 5. Mail Detail View
- Opens a mail for full view.
- Allows applying/removing labels, starring, deleting, or marking as spam/unread.

<p align="center">
  <img src="androidDoc/mail_details.png" alt="Mail Details" width="300"/>
</p>

---

### 6. Edit Draft Email
- Draft mails are displayed in the draft's inbox with a timestamp.
- When a user taps on a draft, it opens the **Compose Mail screen** with any fields that were previously filled:
  - For example, if only the subject was entered, only that field will be pre-filled.
- The user can then continue editing and either **send** the mail or **save** it again.

<p align="center">
  <img src="androidDoc/draft_in_inbox.png" alt="Draft in Inbox" width="300"/>
</p>

<p align="center">
  <img src="androidDoc/draft_open_compose.png" alt="Opened Draft in Compose" width="300"/>
</p>

---

### 7. Label Management
- Users can add or remove custom labels from a mail.

<p align="center">
  <img src="androidDoc/manage_new_labels.png" alt="Manage Labels" width="300"/>
</p>

---

### 8. Navigation Drawer
- Built-in labels available:
  - Inbox
  - Sent
  - Star
  - Trash
  - Spam
  - Drafts
  - Read / Unread
- Option to add a new label

<p align="center">
  <img src="androidDoc/label_list_filter.png" alt="Label Drawer" width="300"/>
</p>

---

### 9. Add New Label
- Users can define a new label name and add it to the system.

<p align="center">
  <img src="androidDoc/add_new_label.png" alt="Add New Label" width="300"/>
</p>

---

### 10. Search Emails
- Users can search mails by content, sender, or subject.
- Results are filtered live.

<p align="center">
  <img src="androidDoc/search_result.png" alt="Search Result" width="300"/>
</p>

---

### 11. Profile & Logout
- Clicking the profile image opens a menu with profile details and logout option.

<p align="center">
  <img src="androidDoc/profile_popup.png" alt="Profile Popup" width="300"/>
</p>
