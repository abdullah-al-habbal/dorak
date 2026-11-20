---
nodeid: docs.deployment.hostinger-questions
parentnode: docs.deployment
childnodes: []
codeanchors:
  - .github/workflows/deploy.yml
---

# Hostinger questions tracker

Part of the [CI/CD setup and checklist](ci-cd-setup.md). Opened 2026-11-20.

**How to use:** send one question to the Hostinger chatbot, paste the answer into **Answer**, and ask Claude to fill **Analysis**, **Impact** and **Status**. Never paste private keys, `.env` content or passwords. When every row is closed, build the final report and decide.

**Status values:** `open` (not asked) · `answered` (answer received, not analysed) · `ok` (matches our workflow) · `change` (workflow or docs must change) · `blocked` (cannot proceed on this plan).

## Summary

| Section | Questions | Open | OK | Change | Blocked |
|---|---|---|---|---|---|
| A. SSH access (feeds the 4 GitHub secrets) | 5 | 5 | 0 | 0 | 0 |
| B. Server tooling (the deploy script checks these) | 5 | 5 | 0 | 0 | 0 |
| C. GitHub deploy key (server pulls the repo) | 2 | 2 | 0 | 0 | 0 |
| D. Folder layout and web root | 4 | 4 | 0 | 0 | 0 |
| E. Environment file and database | 3 | 3 | 0 | 0 | 0 |
| F. Runtime requirements for Laravel | 5 | 5 | 0 | 0 | 0 |
| G. Health check and logs | 2 | 2 | 0 | 0 | 0 |

## A. SSH access (feeds the 4 GitHub secrets)

### A1

- **Question to send:** I have a Hostinger shared hosting plan with the domain dev-dorak-backend.io. Where in hPanel do I find the SSH host/IP, port and username for this site?
- **Why we ask:** HOSTINGER_SERVER_IP, HOSTINGER_SSH_PORT, HOSTINGER_USERNAME. Local SSH config suggests user u685718414, port 65002 (unverified).
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### A2

- **Question to send:** How do I enable SSH access for this hosting plan, and is it enabled by default?
- **Why we ask:** Deploy runs entirely over SSH.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### A3

- **Question to send:** How do I add a new public SSH key in hPanel so a GitHub Actions workflow can log in without a password? Is there a limit on how many keys I can add?
- **Why we ask:** HOSTINGER_SSH_PRIVATE_KEY needs a dedicated CI key pair.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### A4

- **Question to send:** Does Hostinger restrict SSH logins by IP address? If so, can I allow GitHub Actions runners, whose IPs change, or turn the restriction off?
- **Why we ask:** Runner IPs change on every run.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### A5

- **Question to send:** Is there a rate limit or firewall rule that could block repeated SSH connections from GitHub Actions?
- **Why we ask:** A blocked runner fails the deploy before it starts.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

## B. Server tooling (the deploy script checks these)

### B6

- **Question to send:** Which PHP versions can I run in the SSH/CLI shell for dev-dorak-backend.io? I need PHP 8.5. Is it available, and how do I make `php8.5` or `php` point to it in SSH?
- **Why we ask:** The script hard-fails unless the CLI is PHP 8.5.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### B7

- **Question to send:** Is Composer 2 installed on my plan in the SSH shell? If not, what is the supported way to install it?
- **Why we ask:** The script runs `composer install`.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### B8

- **Question to send:** Which git version is installed on the server? I need git 2.25 or newer for `git sparse-checkout`.
- **Why we ask:** The monorepo clone uses a sparse checkout of backend/.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### B9

- **Question to send:** Which PHP functions are disabled on my plan, such as `exec` and `proc_open`? Does Composer or `artisan` still work from SSH?
- **Why we ask:** The script notes exec is disabled on Hostinger.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### B10

- **Question to send:** Does the SSH shell allow `flock`, `mv`, `ln -s` (symlinks) and `readlink -f`?
- **Why we ask:** Migration lock, release swap and storage symlink depend on them.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

## C. GitHub deploy key (server pulls the repo)

### C11

- **Question to send:** Can I create an SSH key pair on the server in `~/.ssh` and use it from the SSH shell to `git clone` a private GitHub repository over SSH? Is outbound SSH to github.com on port 22 allowed from my plan?
- **Why we ask:** The script clones git@github.com with ~/.ssh/deploy_key.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### C12

- **Question to send:** If outbound port 22 to GitHub is blocked, does Hostinger allow SSH over port 443 (`ssh.github.com`) instead?
- **Why we ask:** Fallback if C11 is blocked.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

## D. Folder layout and web root

### D13

- **Question to send:** For dev-dorak-backend.io, what is the exact absolute path of the website's document root? I want to deploy a Laravel app so the web root points to the `public` folder.
- **Why we ask:** Verify DORAK_TARGET (.../public_html/dev).
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### D14

- **Question to send:** Can I swap the web root with a symlink or by renaming folders, for example by moving a new release directory into `public_html/dev`? Does the document root follow symlinks?
- **Why we ask:** The atomic release swap is a directory move.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### D15

- **Question to send:** Can I change the document root of a domain or subdomain to a subfolder such as `public_html/dev/public` in hPanel?
- **Why we ask:** Laravel must serve from public/.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### D16

- **Question to send:** Can I place a folder outside `public_html`, such as `/home/<user>/domains/<domain>/shared`, for `.env` and storage, and is it not publicly accessible?
- **Why we ask:** Verify DORAK_SHARED_DIR.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

## E. Environment file and database

### E17

- **Question to send:** Can I keep a Laravel `.env` file outside the web root and make the app read it through a symlink? Any permission restrictions, such as mode 600?
- **Why we ask:** The release links shared/.env into the app.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### E18

- **Question to send:** Where do I find the MySQL database host, name, user and how do I reset the password? What MySQL version do you run? I need MySQL 8.x.
- **Why we ask:** Tests run on MySQL 8.4; production should match.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### E19

- **Question to send:** Is the database host `localhost` or a different host when connecting from the SSH shell and from the website?
- **Why we ask:** Migrations run from SSH, the app from the web.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

## F. Runtime requirements for Laravel

### F20

- **Question to send:** Does my plan support cron jobs? How do I add a cron that runs `php artisan schedule:run` every minute?
- **Why we ask:** Scheduler runs face-profile:purge.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### F21

- **Question to send:** Can I run a long-lived queue worker (`php artisan queue:work`)? If not, what is the recommended alternative on shared hosting?
- **Why we ask:** Face analysis, notifications and mail use the queue.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### F22

- **Question to send:** Does my plan allow outgoing HTTP requests (curl) to external APIs, such as an SMS gateway and Firebase push?
- **Why we ask:** OTP SMS and FCM push.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### F23

- **Question to send:** What are the limits on memory, execution time, number of processes and disk inodes for my plan?
- **Why we ask:** Composer install and migrations are heavy.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### F24

- **Question to send:** How do I enable HTTPS (free SSL) for dev-dorak-backend.io and force a redirect from HTTP to HTTPS?
- **Why we ask:** Health check and app URLs use https.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

## G. Health check and logs

### G25

- **Question to send:** How can I confirm https://dev-dorak-backend.io/api/v1/health is served by my hosting account and not blocked by a WAF or bot protection? Does Hostinger block `curl` requests from the server to its own domain?
- **Why we ask:** The post-swap health check is the deploy gate.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

### G26

- **Question to send:** Where can I find the PHP error log and the web server error log for this domain?
- **Why we ask:** Needed to debug a failed release.
- **Status:** open
- **Answer:** _(paste here)_
- **Analysis:** _(Claude fills in)_
- **Impact on workflow or docs:** _(Claude fills in)_

## Final report (fill when all rows are closed)

- **Verdict:** _pending_
- **Blocking gaps:** _pending_
- **Workflow changes needed:** _pending_
- **Values for the 4 GitHub secrets:** _pending (names only here, never the values)_
- **Decision:** _pending_
