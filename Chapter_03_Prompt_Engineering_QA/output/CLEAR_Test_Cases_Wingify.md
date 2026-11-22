# Test Cases for app.wingify.com — Login Functionality
### Generated using the CLEAR Prompt Engineering Framework

---

## CLEAR Framework Applied

| Element | Detail |
|---------|--------|
| **Context** | Creating test cases for the login functionality of **app.wingify.com** (VWO – Visual Website Optimizer) |
| **Limits** | Limited to **positive** and **negative** test cases |
| **Examples** | Verify login with valid credentials · Verify login is blocked with invalid credentials |
| **Action** | Create test cases covering valid and invalid credential scenarios |
| **Review** | All cases are realistic, based on standard login-page behavior; no hallucinated features |

---

## Positive Test Cases

| TC # | Title | Preconditions | Steps | Test Data | Expected Result |
|------|-------|---------------|-------|-----------|-----------------|
| TC-001 | Login with valid email and password | User has a registered VWO account | 1. Navigate to `https://app.wingify.com` <br> 2. Enter valid email <br> 3. Enter valid password <br> 4. Click **Sign In** | Email: `registered@example.com` <br> Password: `ValidPass123!` | User is redirected to the VWO dashboard successfully |
| TC-002 | Login with email in mixed case | User has a registered account | 1. Navigate to login page <br> 2. Enter email in mixed case <br> 3. Enter valid password <br> 4. Click **Sign In** | Email: `Registered@Example.COM` <br> Password: `ValidPass123!` | Login succeeds (email should be case-insensitive) |
| TC-003 | Login with email containing leading/trailing spaces | User has a registered account | 1. Navigate to login page <br> 2. Enter email with spaces before/after <br> 3. Enter valid password <br> 4. Click **Sign In** | Email: `  registered@example.com  ` <br> Password: `ValidPass123!` | Application trims whitespace and logs in successfully |
| TC-004 | Login and verify "Remember Me" / session persistence | User has a registered account | 1. Navigate to login page <br> 2. Enter valid credentials <br> 3. Check "Remember me" (if available) <br> 4. Click **Sign In** <br> 5. Close browser and reopen `app.wingify.com` | Valid credentials | User remains logged in after reopening the browser |
| TC-005 | Login via pressing Enter key instead of clicking Sign In | User has a registered account | 1. Navigate to login page <br> 2. Enter valid email and password <br> 3. Press **Enter** key on keyboard | Valid credentials | Login proceeds the same as clicking the Sign In button |

---

## Negative Test Cases

| TC # | Title | Preconditions | Steps | Test Data | Expected Result |
|------|-------|---------------|-------|-----------|-----------------|
| TC-006 | Login with valid email and incorrect password | User has a registered account | 1. Navigate to login page <br> 2. Enter valid email <br> 3. Enter incorrect password <br> 4. Click **Sign In** | Email: `registered@example.com` <br> Password: `WrongPass999!` | Error message is displayed (e.g., "Your email or password is invalid"); user is NOT logged in |
| TC-007 | Login with unregistered email | None | 1. Navigate to login page <br> 2. Enter an email that is not registered <br> 3. Enter any password <br> 4. Click **Sign In** | Email: `notregistered@example.com` <br> Password: `AnyPass123!` | Error message is displayed; user is NOT logged in |
| TC-008 | Login with empty email field | None | 1. Navigate to login page <br> 2. Leave email field blank <br> 3. Enter a password <br> 4. Click **Sign In** | Email: *(empty)* <br> Password: `AnyPass123!` | Validation error is shown (e.g., "Email is required"); form is not submitted |
| TC-009 | Login with empty password field | None | 1. Navigate to login page <br> 2. Enter a valid email <br> 3. Leave password field blank <br> 4. Click **Sign In** | Email: `registered@example.com` <br> Password: *(empty)* | Validation error is shown (e.g., "Password is required"); form is not submitted |
| TC-010 | Login with both fields empty | None | 1. Navigate to login page <br> 2. Leave both email and password fields blank <br> 3. Click **Sign In** | Email: *(empty)* <br> Password: *(empty)* | Validation errors are shown for both fields; form is not submitted |
| TC-011 | Login with invalid email format | None | 1. Navigate to login page <br> 2. Enter a malformed email <br> 3. Enter a password <br> 4. Click **Sign In** | Email: `not-an-email` <br> Password: `AnyPass123!` | Validation error (e.g., "Please enter a valid email address"); form is not submitted |
| TC-012 | Login with SQL injection in email field | None | 1. Navigate to login page <br> 2. Enter SQL injection string in email <br> 3. Enter any password <br> 4. Click **Sign In** | Email: `' OR 1=1 --` <br> Password: `anything` | Input is sanitized; error message is shown; no unauthorized access |
| TC-013 | Login with XSS script in email field | None | 1. Navigate to login page <br> 2. Enter XSS payload in email <br> 3. Enter any password <br> 4. Click **Sign In** | Email: `<script>alert('xss')</script>` <br> Password: `anything` | Script is NOT executed; input is sanitized; appropriate error shown |
| TC-014 | Login with password containing only spaces | None | 1. Navigate to login page <br> 2. Enter valid email <br> 3. Enter only spaces as password <br> 4. Click **Sign In** | Email: `registered@example.com` <br> Password: `      ` | Error message is displayed; user is NOT logged in |
| TC-015 | Brute-force protection — multiple failed login attempts | None | 1. Navigate to login page <br> 2. Enter valid email <br> 3. Enter wrong password <br> 4. Repeat steps 2–3 five or more times rapidly | Email: `registered@example.com` <br> Password: `Wrong1!`, `Wrong2!`, … | Account is temporarily locked or CAPTCHA is triggered after threshold is reached |

---

## Summary

| Category | Count |
|----------|-------|
| **Positive Test Cases** | 5 |
| **Negative Test Cases** | 10 |
| **Total** | **15** |

> [!NOTE]
> All test cases are scoped to the login page of `app.wingify.com` per the CLEAR framework's **Limits** constraint. No assumptions about features beyond the login flow have been made, in line with the **Review** criterion of avoiding hallucinations.
