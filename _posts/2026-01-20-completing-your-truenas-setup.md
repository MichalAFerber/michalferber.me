---
layout: post
title: "Completing Your TrueNAS Setup: Backups, HTTPS, and Hardening"
description: "Complete your TrueNAS setup with automated backups, HTTPS, and security hardening for Windows, macOS, and Linux."
tags: [truenas, backup, homelab, nas, zfs, https, security]
comments: true
thumbnail-img: /assets/img/truenas.avif
---

![TrueNAS Logo]({{ "/assets/img/truenas.avif" | relative_url | absolute_url }})

You've got the hard parts done—TrueNAS is installed, your pool is configured, and the basics are working. Now let's finish the essentials in three focused areas: getting backups INTO TrueNAS from your machines, adding HTTPS to the web interface, and a quick hardening checklist so you don't get caught out later.

## Part A: Send Backups to TrueNAS

The goal here is simple and quiet—automated backups from your daily machines to TrueNAS, with snapshots providing rollback capability if you accidentally delete something.

### Create Dedicated Datasets

Start by creating a dataset for each machine you'll back up:

1. Navigate to **Storage → Datasets → Add dataset** under your pool
2. Create datasets like `backups/michal-laptop` or `backups/desktop`
3. Set **Share Type** to SMB
4. Optional but recommended: enable encryption on these child datasets and store the recovery key safely

### Create Backup Users

Keep things secure with dedicated backup users:

1. Go to **Accounts → Users → Add**
2. Create a user (e.g., `michal`) with a strong password
3. Home directory configuration is optional for backup-only users

### Configure SMB Shares

Set up shares that your machines can access:

1. Navigate to **Sharing → Windows (SMB) Shares → Add**
2. Set **Path** to your dataset (e.g., `/mnt/pool/backups/michal-laptop`)
3. Choose **Purpose**: "Multi-user SMB" or "Private SMB"
4. In **Advanced** settings, ensure **Enable SMB2/3 durable handles** is checked
5. If you plan to use Windows "Previous Versions" feature, make sure **Enable SMB Shadow Copies** is enabled (automatic on recent SCALE versions when snapshots exist)

### Enable Snapshots for Point-in-Time Recovery

Snapshots are what make TrueNAS backups powerful—they give you the "Previous Versions" feature in Windows Explorer:

1. Go to **Data Protection → Periodic Snapshot Tasks → Add**
2. Select your **Dataset** (either `backups` parent or individual children)
3. Set **Schedule** to hourly or daily based on your needs
4. Configure **Lifetime** to 30–90 days for backup targets
5. Don't forget to add a monthly **boot-pool scrub** under **System → Boot**

### Configure Each Machine

Now point your machines at these shares.

#### Windows: Robocopy with Task Scheduler

Windows users should use Robocopy—it's built-in, reliable, and handles network interruptions gracefully:

1. Map the network drive: `\\truenas\michal-laptop`
2. Create a batch script with this Robocopy command:

```bat
robocopy "C:\Users\Michal" "\\truenas\michal-laptop" /MIR /R:1 /W:3 /XJ /FFT /XD "AppData\Local\Temp" /LOG:C:\backup\robocopy.log
```

The `/MIR` flag mirrors your source (including deletions), but TrueNAS snapshots provide rollback if you need it. Schedule this via Task Scheduler to run nightly.

#### macOS: Native Time Machine Support

TrueNAS works beautifully with Time Machine:

1. In your SMB share's **Advanced** settings, enable **Time Machine** support
2. On your Mac, open **Time Machine → Select Disk** and choose the SMB share
3. Optional: set a quota on the dataset to prevent Time Machine from consuming unlimited space

#### Linux: rsync Over SMB

For Linux machines, mount the share and use rsync:

```bash
rsync -aHAX --delete --info=progress2 /home/USER/ /mnt/truenas/michal-laptop/
```

Schedule this with a systemd timer or cron job for automated backups.

**Alternative approach**: If you want client-side deduplication and encryption, consider using **restic** or **borg** to TrueNAS via SFTP or SMB.

## Part B: Add HTTPS to the Web Interface

Running the TrueNAS web UI over plain HTTP exposes your credentials. Let's fix that with one of three approaches.

### Option 1: Self-Signed Certificate (Fastest, LAN-Only)

Best for purely local access with no external domain:

1. Go to **Credentials → Certificates → Add** and create an **Internal CA**
2. **Add → Certificate (Internal)** signed by your new CA (use a CN like `truenas.local`)
3. Navigate to **System Settings → General → GUI**
4. Set **Web Interface HTTPS Certificate** to your new certificate
5. Enable **Redirect HTTP to HTTPS**
6. Export the CA certificate and import it into your computers' trust stores to eliminate browser warnings

### Option 2: Let's Encrypt via DNS-01 (No Port Forwarding Required)

This gives you a valid, trusted certificate without opening any ports:

1. You'll need a domain you control (e.g., `nas.mydomain.com`)
2. Go to **Credentials → Certificates → ACME DNS-Authenticator → Add**
3. Select your DNS provider and paste your API token
4. **Add → ACME Certificate** with FQDN `nas.mydomain.com` and select your authenticator
5. Configure your local DNS (router override or hosts file) so `nas.mydomain.com` resolves to the NAS's LAN IP
6. Select this certificate in **System Settings → General → GUI**

The DNS-01 challenge means Let's Encrypt verifies ownership through DNS records, not HTTP, so no port 80/443 exposure required.

### Option 3: Import Existing Certificate

If you already manage certificates elsewhere, simply use **Certificates → Import** and upload your cert and key, then select it for the GUI.

## Part C: Hardening and Housekeeping

These quick wins will save you headaches down the road.

### Network Configuration

- Assign a **static IP** to your NAS under **Network → Interfaces**
- **Never expose the TrueNAS UI to the internet**—keep your Wasabi cloud sync outbound-only

### Access Control

- Enable **two-factor authentication**: **Credentials → 2FA** (TOTP) for the web UI
- Keep datasets private to their respective users
- Avoid guest access unless absolutely necessary

### Monitoring and Alerts

- Verify your **SMTP configuration** by sending a test alert
- Ensure you're receiving scheduled task notifications

### System Maintenance

- Configure a monthly scrub for boot environments: **System → Boot**
- Keep a couple of previous boot environments for rollback capability
- If you have a UPS, configure **Services → UPS** (NUT) for graceful shutdown on power loss

### Cloud Backup Best Practices

Since you're using Wasabi:

- Enable **bucket versioning** on the Wasabi side
- Consider lifecycle rules to expire old versions automatically and prevent cost creep

### ZFS Tuning

The defaults are sensible for most use cases:

- LZ4 compression is enabled by default—keep it
- Disabling `atime` is beneficial for backup datasets
- **Avoid deduplication** unless you have specific needs and 5GB RAM per TB of deduplicated storage

## Ready-Made Scripts

Need help automating these tasks? I can provide:

- Windows Task Scheduler XML for the Robocopy job
- Systemd timer and service units for Linux rsync
- Step-by-step ACME DNS configuration for your specific DNS provider

## Conclusion

With automated backups flowing to TrueNAS, HTTPS securing your web interface, and basic hardening in place, you've got a solid foundation. TrueNAS snapshots give you point-in-time recovery, and the combination of local backups plus cloud sync to Wasabi provides good data protection.

The beauty of this setup is that it's quiet—once configured, it runs in the background while you focus on other things. Just keep an eye on those email alerts and verify your backups occasionally.

---

*Have questions about your TrueNAS setup? Found this guide helpful? Leave a comment below or reach out on social media.*