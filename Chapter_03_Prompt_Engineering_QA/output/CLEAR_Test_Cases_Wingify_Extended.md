# Test Cases for app.wingify.com — Extended Coverage
### Continuation: Forgot Password, Sign Up, Logout & UI/UX

---

## Forgot Password

| TC # | Type | Title | Steps | Test Data | Expected Result |
|------|------|-------|-------|-----------|-----------------|
| TC-016 | Positive | Reset password with registered email | 1. Navigate to login page <br> 2. Click **Forgot Password** <br> 3. Enter registered email <br> 4. Click **Submit / Reset** | Email: `registered@example.com` | Success message displayed (e.g., "Password reset link sent"); email is received in inbox |
| TC-017 | Positive | Reset password link works and allows setting new password | 1. Receive reset email <br> 2. Click the reset link <br> 3. Enter new valid password <br> 4. Confirm new password <br> 5. Click **Save / Reset** | New Password: `NewValid@456` | Password is updated successfully; user can log in with the new password |
| TC-018 | Negative | Reset password with unregistered email | 1. Click **Forgot Password** <br> 2. Enter an unregistered email <br> 3. Click **Submit** | Email: `unknown@example.com` | Generic message shown (should NOT reveal whether the email exists for security) |
| TC-019 | Negative | Reset password with empty email field | 1. Click **Forgot Password** <br> 2. Leave email blank <br> 3. Click **Submit** | Email: *(empty)* | Validation error: "Email is required" |
| TC-020 | Negative | Reset password with invalid email format | 1. Click **Forgot Password** <br> 2. Enter malformed email <br> 3. Click **Submit** | Email: `abc@` | Validation error: "Enter a valid email address" |
| TC-021 | Negative | Expired password reset link | 1. Request a password reset <br> 2. Wait beyond expiry period (e.g., 24 hrs) <br> 3. Click the reset link | Expired link | Error message (e.g., "This link has expired"); user is prompted to request a new one |

---

## Sign Up / Registration

| TC # | Type | Title | Steps | Test Data | Expected Result |
|------|------|-------|-------|-----------|-----------------|
| TC-022 | Positive | Sign up with valid details | 1. Navigate to login page <br> 2. Click **Start Free Trial** / **Sign Up** <br> 3. Fill in name, email, password <br> 4. Accept terms <br> 5. Click **Create Account** | Name: `Test User` <br> Email: `newuser@example.com` <br> Password: `Strong@Pass1` | Account is created; user receives a verification/welcome email |
| TC-023 | Negative | Sign up with already registered email | 1. Navigate to Sign Up page <br> 2. Enter an email already associated with an account <br> 3. Fill remaining fields <br> 4. Click **Create Account** | Email: `registered@example.com` | Error: "An account with this email already exists" or a generic message |
| TC-024 | Negative | Sign up with weak password | 1. Navigate to Sign Up page <br> 2. Enter valid name and email <br> 3. Enter a weak password <br> 4. Click **Create Account** | Password: `123` | Validation error indicating password strength requirements |
| TC-025 | Negative | Sign up with empty required fields | 1. Navigate to Sign Up page <br> 2. Leave all fields blank <br> 3. Click **Create Account** | All fields empty | Validation errors shown for each required field |
| TC-026 | Negative | Sign up with invalid email format | 1. Navigate to Sign Up page <br> 2. Enter an invalid email <br> 3. Fill other fields <br> 4. Click **Create Account** | Email: `user@@domain..com` | Validation error: "Enter a valid email address" |
| TC-027 | Negative | Sign up without accepting terms & conditions | 1. Navigate to Sign Up page <br> 2. Fill all fields correctly <br> 3. Do NOT check the terms checkbox <br> 4. Click **Create Account** | Terms checkbox: unchecked | Form is not submitted; user is prompted to accept terms |
| TC-028 | Negative | Sign up with XSS payload in name field | 1. Navigate to Sign Up page <br> 2. Enter XSS script in the name field <br> 3. Fill other fields validly <br> 4. Click **Create Account** | Name: `<script>alert('xss')</script>` | Script is NOT executed; input is sanitized or rejected |

---

## Logout

| TC # | Type | Title | Steps | Test Data | Expected Result |
|------|------|-------|-------|-----------|-----------------|
| TC-029 | Positive | Successful logout | 1. Log in with valid credentials <br> 2. Click profile/avatar menu <br> 3. Click **Logout** | N/A | User is logged out and redirected to the login page |
| TC-030 | Positive | Session is invalidated after logout | 1. Log in and copy the dashboard URL <br> 2. Log out <br> 3. Paste the dashboard URL back in the browser | Dashboard URL | User is redirected to the login page; dashboard is NOT accessible |
| TC-031 | Negative | Browser back button after logout | 1. Log in successfully <br> 2. Log out <br> 3. Press the browser **Back** button | N/A | User should NOT see the authenticated dashboard; redirected to login or shown cached-page warning |
| TC-032 | Positive | Logout from multiple tabs | 1. Log in and open app in two tabs <br> 2. Log out from Tab 1 <br> 3. Refresh Tab 2 | N/A | Tab 2 also reflects logged-out state; user is redirected to login |

---

## UI / UX & Accessibility

| TC # | Type | Title | Steps | Test Data | Expected Result |
|------|------|-------|-------|-----------|-----------------|
| TC-033 | Positive | Password field masks input | 1. Navigate to login page <br> 2. Type into the password field | Password: `Test@123` | Characters are masked (shown as dots/asterisks); a "show password" toggle reveals them if available |
| TC-034 | Positive | Login page is responsive on mobile viewport | 1. Open login page on a mobile device or resize browser to 375×667 | N/A | Login form is fully visible, usable, and properly laid out without horizontal scrolling |
| TC-035 | Positive | Tab order follows logical flow | 1. Navigate to login page <br> 2. Press **Tab** key repeatedly | N/A | Focus moves in logical order: Email → Password → Sign In (and other interactive elements) |
| TC-036 | Positive | Error messages are accessible (ARIA) | 1. Submit login form with empty fields <br> 2. Inspect error messages with a screen reader or dev tools | N/A | Error messages have appropriate `role="alert"` or `aria-live` attributes for screen readers |
| TC-037 | Negative | Login page over HTTP (not HTTPS) | 1. Navigate to `http://app.wingify.com` (without HTTPS) | N/A | User is automatically redirected to `https://app.wingify.com`; credentials are never sent over plain HTTP |
| TC-038 | Positive | Password copy-paste works | 1. Navigate to login page <br> 2. Copy a password from a password manager <br> 3. Paste it into the password field <br> 4. Click **Sign In** | Pasted password | Login proceeds normally; paste is not blocked |

---

## Complete Test Suite Summary

| Section | Positive | Negative | Total |
|---------|----------|----------|-------|
| Login *(TC-001 – TC-015)* | 5 | 10 | 15 |
| Forgot Password *(TC-016 – TC-021)* | 2 | 4 | 6 |
| Sign Up *(TC-022 – TC-028)* | 1 | 6 | 7 |
| Logout *(TC-029 – TC-032)* | 3 | 1 | 4 |
| UI/UX & Accessibility *(TC-033 – TC-038)* | 5 | 1 | 6 |
| **Grand Total** | **16** | **22** | **38** |

> [!TIP]
> These test cases can be imported into any test management tool (TestRail, Zephyr, qTest) by converting this markdown table to CSV.

> [!IMPORTANT]
> Security-related test cases (TC-012, TC-013, TC-028, TC-037) should be executed in a staging/sandbox environment, not in production, to avoid triggering WAF rules or account lockouts.
