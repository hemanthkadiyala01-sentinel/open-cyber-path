# OpenCyberPath — VPS staging deployment (not a public product launch)

This overlay moves the existing development stack to a small cloud VM so the laptop and USB cable are not needed to keep the site and mobile login available. It does **not** deploy anything by itself. Create and bill for the cloud account/server through the account holder/parent or guardian where required. Do not bypass a host's age, identity, or billing requirements.

## What this staging kit runs

- `web`: current Vite site, built with the actual HTTPS staging URLs embedded at build time.
- `api`: current Node/Fastify API with existing database migrations.
- `keycloak`: Keycloak 26.8.1 in `start` mode behind HTTPS.
- `postgres`: persistent PostgreSQL volume, no published database port.
- `caddy`: TLS reverse proxy for three DNS names (web, API, authentication).

This is staging, not a production security review. The URLs will be reachable over the internet by someone who knows them. The Caddy configuration adds `noindex` headers, but those headers are **not access control**. Keep Keycloak self-registration disabled and create only test accounts for now. No public announcement or product launch is part of this procedure.

## 0. Cloud account, cost and domain

Use an account managed by an eligible adult account holder. A generic Ubuntu VPS works; for example, the published Amazon Lightsail bundle with 4 GB RAM and public IPv4 is currently listed at about **US$24/month**. The 2 GB bundle is listed at about US$12/month but may be tight when Keycloak, PostgreSQL, API and web build run together. Prices, taxes, transfer limits and availability vary by region and provider. Compute instances may continue to accrue charges when stopped; review the provider's billing terms before creating anything. Official pricing: <https://aws.amazon.com/lightsail/pricing/> and docs: <https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-bundles.html>.

Recommended starting target: Ubuntu 24.04 LTS, x86-64, 4 GB RAM, public IPv4, at least 40 GB disk, SSH key access. Do not choose an instance until the adult account holder has reviewed the expected charge. Do not share payment details, account passwords or private SSH keys in chat.

You need a domain (or three subdomains under a domain controlled by the account holder). Example names below are placeholders and will not work until replaced with your real domain:

- `stage.example.com` — website
- `api-stage.example.com` — API
- `auth-stage.example.com` — Keycloak

Create DNS A records for all three names pointing to the server's public IPv4. Initially use DNS-only records so Caddy can request certificates directly. Allow DNS propagation. Configure the provider firewall and host firewall to allow TCP 22 (preferably only from the account holder's current public IP), TCP 80, TCP 443, and UDP 443. Do **not** publish ports 3000, 5432, 8080, 8081 or 9000.

## 1. Install the overlay into the current local project

Copy the contents of the kit to the matching locations in the local repository, preserving existing files. The kit installer checks every destination before copying and refuses to overwrite any file.

Then, from PowerShell in the repository root, create the staging environment file using real hostnames after DNS is ready. Example only:

```powershell
Set-Location "C:\Users\dell\Downloads\open-cyber-path"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\New-OpenCyberPath-StagingEnv.ps1" `
  -WebDomain "stage.YOURDOMAIN" `
  -ApiDomain "api-stage.YOURDOMAIN" `
  -AuthDomain "auth-stage.YOURDOMAIN" `
  -AcmeEmail "YOUR-ADMIN-EMAIL"
```

Replace all examples. The script creates `infra/staging-vps/.env.staging` containing fresh random credentials. It refuses to overwrite an existing file. Keep this file private; do not upload it to GitHub, share it in chat, or put it inside the source ZIP.

The generated values are used by Docker Compose. Hex-encoded database passwords are URL-safe. `DATABASE_CONTEXT_HMAC_SECRET` is a separate 32-byte random hex secret.

## 2. Package the current local source (include uncommitted work safely)

The current working branch has local/untracked work not present on the remote `main`, so do not deploy from `git clone main` or from GitHub alone. Run the packaging helper after the overlay is installed:

```powershell
Set-Location "C:\Users\dell\Downloads\open-cyber-path"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\Package-OpenCyberPath-VPS-Staging.ps1"
```

The helper creates a ZIP in Downloads, excluding `.env*` files (except `.example` files), `.git`, `node_modules`, build caches, APK/AAB files, keystores, common private-key files and backup archives. **It is not a substitute for inspecting the ZIP.** Before transferring, list the ZIP contents and search source/configuration for embedded credentials or service tokens. Do not continue if secrets appear in source code/config.

Upload the source ZIP to the VPS over SSH/SCP, extract it into `/opt/opencyberpath-staging`, and transfer `.env.staging` separately to `/opt/opencyberpath-staging/infra/staging-vps/.env.staging`. Example (replace user, host/IP, and ZIP path):

```powershell
scp "$env:USERPROFILE\Downloads\OpenCyberPath-vps-source-YYYYMMDD-HHMMSS.zip" VPS_USER@VPS_IP:/tmp/ocp-staging-source.zip
scp "C:\Users\dell\Downloads\open-cyber-path\infra\staging-vps\.env.staging" VPS_USER@VPS_IP:/tmp/ocp-staging.env
```

On the VPS, use the account holder's SSH login and run:

```bash
sudo mkdir -p /opt/opencyberpath-staging
sudo chown "$USER:$USER" /opt/opencyberpath-staging
unzip /tmp/ocp-staging-source.zip -d /opt/opencyberpath-staging
install -m 600 /tmp/ocp-staging.env /opt/opencyberpath-staging/infra/staging-vps/.env.staging
rm -f /tmp/ocp-staging.env /tmp/ocp-staging-source.zip
```

Ensure the source ZIP contains the `Dockerfile.railway-api` and `Dockerfile.railway-postgres` files previously added to the project. The VPS compose file reuses these Dockerfiles and existing DB initialization/migrations.

## 3. Install Docker Engine and Compose on Ubuntu

Use Docker's official Ubuntu installation instructions: <https://docs.docker.com/engine/install/ubuntu/>. For Ubuntu 24.04, follow the official repository method and install `docker-ce`, `docker-ce-cli`, `containerd.io`, `docker-buildx-plugin`, and `docker-compose-plugin`. Verify with `sudo docker version` and `sudo docker compose version`.

Use SSH-key authentication. Do not enable root SSH login or password-based SSH login for convenience. Apply security updates and set the cloud firewall as described above. Docker daemon access is effectively root-level; use `sudo docker ...` rather than adding untrusted accounts to the docker group.

## 4. Verify configuration before starting

On the VPS:

```bash
cd /opt/opencyberpath-staging
sudo docker compose --env-file infra/staging-vps/.env.staging -f infra/staging-vps/compose.yaml config --quiet
```

If it reports a missing variable or invalid configuration, stop and correct it before deploying. Do not print `.env.staging` in logs or send it to anyone.

Start the stack:

```bash
sudo docker compose --env-file infra/staging-vps/.env.staging -f infra/staging-vps/compose.yaml up -d --build
sudo docker compose --env-file infra/staging-vps/.env.staging -f infra/staging-vps/compose.yaml ps
sudo docker compose --env-file infra/staging-vps/.env.staging -f infra/staging-vps/compose.yaml logs --tail=100 postgres keycloak api web caddy
```

First build may take several minutes and can use substantial memory. Do not remove the PostgreSQL volume to troubleshoot. **Never run `docker compose down -v`** for this project; that deletes the database volume. The init script only creates the databases/roles when PostgreSQL starts with an empty data directory.

## 5. Initialize Keycloak manually

Wait for `https://AUTH_DOMAIN/realms/master` and `https://AUTH_DOMAIN/health/ready` to respond appropriately through Caddy. Open `https://AUTH_DOMAIN/admin/` and use the bootstrap credentials from `.env.staging`. Create a permanent admin account in the `master` realm, verify it can log in, then remove the two `KC_BOOTSTRAP_ADMIN_USERNAME` and `KC_BOOTSTRAP_ADMIN_PASSWORD` environment entries from `infra/staging-vps/compose.yaml` and recreate Keycloak. Do not remove bootstrap settings until the permanent admin has been verified.

Create the `opencyberpath` realm. For this initial staging test, keep self-registration disabled and create one test user manually, with email verified.

Create these public OIDC clients (client authentication Off; standard flow On; PKCE required with S256):

- `opencyberpath-web`: valid redirect URI `https://WEB_DOMAIN/*`, web origin `https://WEB_DOMAIN`.
- `opencyberpath-android`: valid redirect URI `org.opencyberpath.app://oauth`; valid post-logout URI `org.opencyberpath.app.logout://logout`.

Create an OIDC client scope (for example `opencyberpath-api-audience`) with an Audience mapper that adds `opencyberpath-api` to access tokens, then add that scope as a default client scope to both clients. Ensure tokens contain the `email_verified` claim and the staging user is marked verified. Configure a real SMTP sender before testing email verification or password-reset email; this kit does not include SMTP.

## 6. Verify online URLs before updating the APK

Replace the example hosts with your actual domain names:

- `https://WEB_DOMAIN/` — website
- `https://API_DOMAIN/healthz` — expect HTTP 200 and `{"status":"ok"}`
- `https://AUTH_DOMAIN/realms/opencyberpath/.well-known/openid-configuration` — expect JSON and issuer exactly `https://AUTH_DOMAIN/realms/opencyberpath`

Then sign in through the web app, verify `/v1/me`, save/read progress, and inspect the API's logs. The published live-case JSON snapshot is bundled in the API image, but background refresh is not configured by this kit. Test the live refresh collector on Linux separately; the local collector previously needed a Windows-native fallback for a CISA source. Do not promise that every live source refreshes until logs confirm it.

Only after these web/API/auth checks pass, rebuild the APK with the actual HTTPS URLs embedded as Vite build args. Keep application ID `org.opencyberpath.app`, increase versionCode above the installed version, and verify the signing certificate before in-place installation. Then test login with USB unplugged.

## Updating the staging deployment later

Package the latest **local working tree** again, inspect it for secrets, transfer it to the VPS, and rebuild with the same compose file. Back up PostgreSQL before any schema/data migration. Keep `.env.staging` separately and never overwrite it with a source bundle. Local services can be stopped only after the cloud version and APK have both passed verification.

## Limitations

- This is a development staging configuration, **not production-ready certification**. API-to-database traffic uses `DATABASE_SSL=false` on a private Docker network. Review TLS, backups, rate limits, monitoring, SMTP, firewalling, disaster recovery and secret rotation before any production launch.
- `X-Robots-Tag: noindex` discourages indexing but does not make the URLs private. If strict access restriction is required, design and test an access-control layer that does not break native OAuth callbacks/API calls.
- The web app is internet-reachable by URL. The flow does not announce/publish the product, but it is not a LAN-only service.
- No cloud account, VM, domain, billable resource, or deployment is created by this kit.
