# GitHub Secrets Setup Guide

Configure these secrets in your GitHub repository for automated deployment.

**Location:** GitHub Repo → Settings → Secrets and variables → Actions → New repository secret

---

## Required Secrets

| Secret Name | Value | Example |
|-------------|-------|---------|
| `ORACLE_VM_HOST` | Oracle VM public IP address | `129.154.xxx.xxx` |
| `ORACLE_VM_USER` | SSH username on VM | `ubuntu` |
| `ORACLE_VM_SSH_KEY` | Full private SSH key content | (see below) |
| `DEPLOY_PATH` | Absolute path to Backend on VM | `/opt/bfsi-backend/Backend` |

## Optional Secrets

| Secret Name | Value | Example |
|-------------|-------|---------|
| `MONGO_URI_TEST` | MongoDB connection for CI tests | `mongodb+srv://...` |

---

## SSH Key Setup

### 1. Generate Deploy Key (if not already done)

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/bfsi-deploy -N ""
```

### 2. Add Public Key to VM

```bash
# Copy public key to VM
ssh-copy-id -i ~/.ssh/bfsi-deploy.pub ubuntu@<VM_IP>

# Or manually:
ssh ubuntu@<VM_IP>
echo "<paste public key content>" >> ~/.ssh/authorized_keys
```

### 3. Add Private Key to GitHub

```bash
# Display private key
cat ~/.ssh/bfsi-deploy
```

Copy the **entire** output including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

Paste this as the value for `ORACLE_VM_SSH_KEY` in GitHub Secrets.

---

## GitHub Environment Setup

The workflow uses a `production` environment for the deploy job.

### Create Environment:
1. GitHub Repo → Settings → Environments → New environment
2. Name: `production`
3. (Optional) Add protection rules:
   - Required reviewers (for manual approval before deploy)
   - Wait timer (delay between CI pass and deploy)
   - Deployment branches: `main` only

---

## Verification

After adding all secrets, push a commit to `main` that modifies `Backend/**`:

```bash
git add .
git commit -m "ci: enable auto deployment"
git push origin main
```

Watch the Actions tab:
1. ✅ Build & Compile
2. ✅ Test & Coverage
3. ✅ Docker Build Validation
4. ✅ Deploy to Oracle VM

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| SSH connection refused | Verify `ORACLE_VM_HOST` IP and port 22 open |
| Permission denied (publickey) | Verify SSH key matches VM's authorized_keys |
| Deploy path not found | Verify `DEPLOY_PATH` exists on VM |
| Git pull fails | Ensure VM has git credentials or deploy key for the repo |
| Docker build fails on VM | SSH in and check disk space: `df -h` |
| Health check fails | Check `.env.production` on VM has valid MONGO_URI |

### Git Access on VM

The VM needs to pull from GitHub. Options:

**Option A: Deploy Key (recommended)**
```bash
# On VM
ssh-keygen -t ed25519 -C "oracle-vm-deploy" -f ~/.ssh/github-deploy -N ""
cat ~/.ssh/github-deploy.pub
# Add as Deploy Key in GitHub: Repo → Settings → Deploy keys → Add
```

Add to `~/.ssh/config` on VM:
```
Host github.com
    IdentityFile ~/.ssh/github-deploy
```

**Option B: HTTPS with Personal Access Token**
```bash
git remote set-url origin https://<PAT>@github.com/<user>/<repo>.git
```
