# Security Policy

## Supported Versions

The following versions of HomeFarm are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of HomeFarm seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email at: **metawaste03@gmail.com**

### What to Include

Please include the following information in your report:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Any potential impact
- Your suggested fix (if any)

### Response Timeline

You can expect:
- An acknowledgment within **48 hours**
- A preliminary response within **5 business days**
- Regular updates every **7 days** until resolved

### Process

1. **Submit**: Send your report to metawaste03@gmail.com
2. **Acknowledge**: We'll confirm receipt within 48 hours
3. **Assess**: We'll evaluate the vulnerability and determine impact
4. **Fix**: We'll work on a fix and release a security update
5. **Disclose**: Once fixed, we'll coordinate public disclosure with you

### Acceptance Criteria

We accept vulnerabilities that affect:
- Authentication/Authorization
- Data exposure
- Injection attacks (XSS, SQLi, etc.)
- CSRF protection
- Session management

We may decline reports that:
- Affect outdated versions
- Are already known and being addressed
- Require unlikely user interactions
- Are theoretical without practical exploitation

## Security Best Practices

If you're using HomeFarm, please ensure you:
- Keep your dependencies up to date
- Never commit `.env` files or API keys
- Use strong, unique passwords
- Enable two-factor authentication on your Supabase account

---

Thank you for helping keep HomeFarm secure!
