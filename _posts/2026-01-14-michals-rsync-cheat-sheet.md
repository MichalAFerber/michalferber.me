---
layout: post
title: "Michal's rsync Cheat Sheet: Reliable Backups & Sync"
description: "My go-to tool for implementing the 3-2-1 backup strategy"
tags: [rsync, scp, rclone, backup, 3-2-1-backup, sync, linux, macos, automation, cron, google-drive, wasabi, synology, proxmox, time-machine, data-protection, homelab, self-hosted, system-administration, devops, data-sync, cheat-sheet, guide, tutorial, file-transfer, ssh, nas]
comments: true
thumbnail-img: /assets/img/rsync.webp
---

![rsync]({{ "/assets/img/rsync.webp" | relative_url | absolute_url }})

Hey everyone, Michal here! Today I want to share one of the most essential tools in my homelab arsenal: **rsync**. If you're serious about protecting your data and implementing a proper backup strategy, rsync is the battle-tested workhorse that should be in your toolkit. After years of managing backups for both personal and professional systems, I've settled on rsync as my primary sync and backup tool—and for good reason.

### What is rsync?

rsync (remote sync) is a fast, versatile file copying tool that's been around since 1996. It's a Unix/Linux utility designed to efficiently synchronize files and directories between two locations—whether that's on the same machine, across a local network, or to remote servers.

What makes rsync special is its **delta-transfer algorithm**. Instead of copying entire files every time, it only transfers the differences (deltas) between the source and destination. This makes it incredibly efficient for keeping large datasets synchronized while minimizing bandwidth and time.

### rsync vs rclone vs scp: Which Tool for Which Job?

You might be wondering: "Michal, why rsync instead of rclone or scp?" The truth is, I use all three—but for very different purposes. Here's a comprehensive comparison:

| Feature | rsync | rclone | scp |
|---------|-------|--------|-----|
| **Primary Use Case** | Local & network sync/backup | Cloud storage sync | One-time file transfers |
| **Transfer Method** | Delta-transfer (only changes) | Full file or chunked | Full file copy |
| **Best For** | Recurring backups, large datasets | Cloud storage, remote filesystems | Quick ad-hoc transfers |
| **Speed (large files)** | ⭐⭐⭐⭐⭐ (incremental) | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Speed (many small files)** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Bandwidth Efficiency** | Excellent (delta sync) | Good | Basic |
| **Cloud Provider Support** | None (SSH/local only) | 70+ providers | None (SSH only) |
| **Sync Capabilities** | Bidirectional, sophisticated | Bidirectional, cloud-focused | One-way copy only |
| **Automation (cron)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Learning Curve** | Moderate | Moderate | Easy |
| **Pre-installed** | Most Unix systems | No | Most Unix systems |
| **Compression** | Optional (-z flag) | Built-in for cloud | Optional (-C flag) |
| **Resume Capability** | Yes (--partial) | Yes | No |
| **Verification** | Checksums, dry-run | Checksums, cryptcheck | None built-in |

**When I use each tool:**

**rsync:**

- Syncing my Mac mini Desktop 6TB G-Drive to Mac mini Plex 6TB G-Drive
- Daily/hourly automated backups via cron
- Any recurring sync task between servers or local drives
- Any scenario where I need to verify the sync worked

**rclone:**

- Syncing to/from Google Drive
- Backing up to Wasabi (my offsite cloud storage)
- Mounting cloud storage as a local filesystem
- Any cloud provider interaction

**scp:**

- Quick one-time file transfers between Raspberry Pis
- Copying a single file from server to server
- Transferring files from my servers to my Mac for inspection
- Grabbing a config file from a remote machine
- Any time I think "I just need to copy this one thing right now"

**My philosophy:** Use rsync for anything repeatable, rclone for cloud, and scp for quick one-offs. If I find myself using scp for the same task twice, I write an rsync command and add it to cron.

### My 3-2-1 Backup Strategy

Before diving into the commands, let me explain my backup philosophy and how I've implemented it across my homelab. I follow the industry-standard **3-2-1 backup rule**:

- **3 copies** of your data (1 primary + 2 backups)
- **2 different media types** (e.g., internal drive + external drive, or local NAS + cloud)
- **1 copy offsite** (protection against physical disasters like fire, theft, or natural disasters)

**Important clarification:** The 3-2-1 rule is a *minimum* standard, not a maximum. In some cases, I exceed this rule—and that's perfectly okay! More backups mean more protection. The key is to never go *below* 3-2-1. If you have the storage capacity and infrastructure to maintain 4, 5, or even 6 copies of your critical data across different locations and media types, you're just adding more layers of protection.

Here's my complete infrastructure:

**Primary Systems:**

- **Mac mini Desktop** - My daily driver with internal SSD + SanDisk G-Drive 6TB (attached storage)
- **Mac mini Plex** - Dedicated media server with SanDisk G-Drive 12TB for Plex media + SanDisk G-Drive 6TB for backups
- **3 Mac minis, 2 MacBook Pros, 1 MacBook Air** - All protected with Time Machine
- **Multiple Raspberry Pis** - Various homelab services and projects
- **Proxmox VE** - Running several Ubuntu VMs for various services

**Backup Infrastructure:**

- **Synology DS220j NAS** - (2) 2TB drives in RAID 0 for Time Machine backups from all Macs
- **Proxmox Backup Server** - Backs up the Synology NAS and Proxmox VE VMs, itself backed up to Wasabi
- **Google Drive** - Cloud storage for files I need across devices, backed up to Mac mini Desktop 6TB G-Drive
- **Wasabi** - My offsite/cloud backup solution (S3-compatible object storage)

**How rsync fits into this:**

1. **Mac mini Desktop 6TB ↔ Mac mini Plex 6TB** - rsync keeps these synchronized
2. **Google Drive → Mac mini Desktop 6TB** - rclone pulls down, then rsync handles local organization
3. **Critical data → Wasabi** - rclone for cloud uploads after rsync organizes locally
4. **Synology NAS** - Receives rsync backups from various homelab services

**What's NOT backed up yet (on my todo list):**

- Plex media library on the 12TB drive - This is my last major project to tackle. With 12TB of media, I need to carefully plan the backup strategy and budget (probably another large drive or Wasabi deep archive).
- Wasabi bucket replication - Wasabi has the ability to replicate S3 buckets to different regions. I plan to replicate my North America bucket to an EU bucket for true geographic redundancy across continents.

**Why RAID 0 on the Synology?**
You might notice I use RAID 0 (striping, no redundancy) on my Synology NAS. Normally this would be risky, but since the Synology itself is backed up to my Proxmox Backup Server, I get the performance benefits of RAID 0 without the risk. The Proxmox server has redundant drives and acts as my safety net.

This setup gives me:

- **Multiple copies** of critical data
- **Geographic diversity** (local drives + cloud storage)
- **Different media types** (SSD, HDD, NAS, cloud)
- **Automated protection** via rsync, rclone, and Time Machine
- **Verification** through rsync's checksums and dry-runs

### Setting Up Google Drive as a Remote (Using rclone)

Since you mentioned Google Drive, let me clarify: rsync itself doesn't natively support cloud storage APIs. For Google Drive, I use **rclone** to mount Google Drive as a local filesystem, then rsync to it. Here's how I set it up:

#### Step 1: Install rclone

```bash
# macOS
brew install rclone

# Linux
sudo apt install rclone  # Debian/Ubuntu
sudo dnf install rclone  # Fedora
```

#### Step 2: Configure Google Drive

```bash
rclone config
```

Follow the interactive setup:

1. Choose `n` for new remote
2. Name it `gdrive`
3. Choose `drive` for Google Drive
4. Leave client_id and client_secret blank (unless you want your own OAuth app)
5. Choose `1` for full access
6. Follow the browser authentication flow
7. Choose `n` for team drive (unless you're using one)

#### Step 3: Mount Google Drive (optional but recommended)

```bash
# Create mount point
mkdir -p ~/gdrive

# Mount Google Drive
rclone mount gdrive: ~/gdrive --vfs-cache-mode writes --daemon

# Verify it's mounted
ls ~/gdrive
```

Now you can use rsync to sync to `~/gdrive/` and it will sync to Google Drive!

#### Step 4: Unmount when done (if needed)

```bash
fusermount -u ~/gdrive  # Linux
umount ~/gdrive         # macOS
```

**Why I couldn't get Proton Drive working:** Proton Drive's rclone support is still experimental and has limitations with file locking, sync conflicts, and performance. Google Drive's rclone integration is mature and stable. If privacy is a concern, I'd recommend rclone with encrypted remotes or switching to something like Backblaze B2 with client-side encryption.

### How to Sync Two Folders with rsync

This is where rsync truly shines. Let me show you the essential patterns I use daily.

**Basic sync (one-way):**

```bash
rsync -av /source/folder/ /destination/folder/
```

**Important note about trailing slashes:**

- `/source/folder/` (with slash) = sync contents of folder
- `/source/folder` (no slash) = sync the folder itself into destination

**My standard backup command:**

```bash
rsync -avh --progress --delete /source/folder/ /destination/folder/
```

Let me break down these flags:

- `-a` = archive mode (preserves permissions, timestamps, symlinks, etc.)
- `-v` = verbose (show what's being transferred)
- `-h` = human-readable sizes
- `--progress` = show progress during transfer
- `--delete` = delete files in destination that no longer exist in source (keeps it perfectly synced)

**For remote servers (over SSH):**

```bash
rsync -avh --progress --delete /local/folder/ user@remote-server:/remote/folder/
```

### Validating & Verifying Synced Folders

One of my most important practices is **verification**. Here's how I ensure my backups are identical:

#### Method 1: Dry run (preview what would change)

```bash
rsync -avhn --delete /source/ /destination/
```

The `-n` flag does a dry run—it shows what *would* change without actually changing anything.

#### Method 2: Checksum comparison

```bash
rsync -avhc --dry-run /source/ /destination/
```

The `-c` flag compares files by checksum (slower but more accurate than timestamp/size).

#### Method 3: Count files and compare

```bash
# Count files in source
find /source -type f | wc -l

# Count files in destination
find /destination -type f | wc -l
```

#### Method 4: Use diff to verify (small folders)

```bash
diff -r /source/ /destination/
```

No output = folders are identical!

#### Method 5: My favorite - rsync with stats

```bash
rsync -avh --stats --dry-run /source/ /destination/
```

This gives you a detailed summary of what would change.

---

### Michal's rsync Cheat Sheet

Here are all the essential rsync commands I use, organized by use case.

#### 📋 Basic Sync Operations

| Command | Description |
|---------|-------------|
| `rsync -av /src/ /dst/` | Basic sync (archive mode, verbose) |
| `rsync -avh /src/ /dst/` | Sync with human-readable sizes |
| `rsync -avh --progress /src/ /dst/` | Show transfer progress |
| `rsync -avh --delete /src/ /dst/` | Sync and delete files not in source |
| `rsync -avhn --delete /src/ /dst/` | Dry run (preview changes) |
| `rsync -avz /src/ user@host:/dst/` | Sync over SSH with compression |

#### 🔍 Verification & Validation

| Command | Description |
|---------|-------------|
| `rsync -avhn /src/ /dst/` | Dry run - see what would change |
| `rsync -avhc /src/ /dst/` | Compare using checksums (slower but accurate) |
| `rsync -avh --stats /src/ /dst/` | Show detailed transfer statistics |
| `rsync -avh --itemize-changes /src/ /dst/` | Show detailed list of changes |
| `diff -r /src/ /dst/` | Verify folders are identical |

#### 🎯 Selective Sync (Includes & Excludes)

**Exclude specific files/folders:**

```bash
# Exclude single pattern
rsync -avh --exclude='*.log' /src/ /dst/

# Exclude multiple patterns
rsync -avh --exclude='*.log' --exclude='temp/' --exclude='.DS_Store' /src/ /dst/

# Exclude from file
echo "*.log" > exclude-list.txt
echo "temp/" >> exclude-list.txt
rsync -avh --exclude-from=exclude-list.txt /src/ /dst/
```

**Include only specific files:**

```bash
# Include only .txt files
rsync -avh --include='*.txt' --exclude='*' /src/ /dst/

# Include specific directory and its contents
rsync -avh --include='docs/***' --exclude='*' /src/ /dst/
```

#### 🔐 Bandwidth & Performance

| Command | Description |
|---------|-------------|
| `rsync -avh --bwlimit=1000 /src/ /dst/` | Limit bandwidth to 1000 KB/s |
| `rsync -avzh /src/ user@host:/dst/` | Compress during transfer (-z) |
| `rsync -avh --partial /src/ /dst/` | Keep partially transferred files |
| `rsync -avh --partial-dir=.rsync-partial /src/ /dst/` | Store partial files in specific dir |
| `rsync -avh --inplace /src/ /dst/` | Update files in-place (faster, less safe) |

#### 🌐 Remote Server Sync (SSH)

**Basic remote operations:**

```bash
# Push to remote
rsync -avh /local/folder/ user@host:/remote/folder/

# Pull from remote
rsync -avh user@host:/remote/folder/ /local/folder/

# Use specific SSH key
rsync -avh -e "ssh -i ~/.ssh/backup_key" /local/ user@host:/remote/

# Use non-standard SSH port
rsync -avh -e "ssh -p 2222" /local/ user@host:/remote/

# Sync between two remote hosts
rsync -avh user1@host1:/path/ user2@host2:/path/
```

#### 📤 scp Quick Reference (One-Time Transfers)

For quick ad-hoc file transfers when you don't need rsync's sync capabilities:

| Command | Description |
|---------|-------------|
| `scp file.txt user@host:/path/` | Copy file to remote |
| `scp user@host:/path/file.txt ./` | Copy file from remote |
| `scp -r /folder/ user@host:/path/` | Copy entire folder recursively |
| `scp -P 2222 file.txt user@host:/path/` | Use non-standard SSH port |
| `scp -i ~/.ssh/key file.txt user@host:/path/` | Use specific SSH key |
| `scp -C large-file.zip user@host:/path/` | Enable compression |
| `scp user@pi1:/file.txt user@pi2:/file.txt` | Copy between two remote hosts |

**My typical scp use cases:**

```bash
# Grab a config file from a Pi for inspection
scp pi@raspberrypi.local:/etc/nginx/nginx.conf ~/Desktop/

# Send a script to a server for testing
scp ~/scripts/test.sh user@server:/tmp/

# Copy files between two Pis
scp pi@pi1.local:/data/export.csv pi@pi2.local:/data/import.csv

# Quick transfer with progress (using -v for verbose)
scp -v large-backup.tar.gz user@server:/backups/
```

**When to use scp vs rsync:**

- **Use scp:** One-time transfers, grabbing a single file, quick testing
- **Use rsync:** Recurring tasks, large datasets, need verification, automation via cron

#### 🛡️ Backup-Specific Commands

**My daily backup command:**

```bash
rsync -avh \
  --progress \
  --delete \
  --exclude='.DS_Store' \
  --exclude='node_modules/' \
  --exclude='.git/' \
  --exclude='*.tmp' \
  --log-file=/var/log/rsync-backup.log \
  /source/important-data/ \
  /backup/destination/
```

**Incremental backup with hard links (saves space):**

```bash
rsync -avh \
  --delete \
  --link-dest=/backup/previous/ \
  /source/ \
  /backup/current/
```

This creates hard links for unchanged files, so you get multiple "full" backups that only use space for changed files!

#### 📊 Logging & Monitoring

| Command | Description |
|---------|-------------|
| `rsync -avh --log-file=sync.log /src/ /dst/` | Log to file |
| `rsync -avh --stats /src/ /dst/` | Show transfer statistics |
| `rsync -avhP /src/ /dst/` | Show progress (shorthand for --progress --partial) |
| `rsync -avh --itemize-changes /src/ /dst/` | Detailed change output |

#### ⚙️ Advanced Options

| Command | Description |
|---------|-------------|
| `rsync -avh --delete-after /src/ /dst/` | Delete files after transfer (safer) |
| `rsync -avh --backup --backup-dir=/backup/old/ /src/ /dst/` | Keep deleted/replaced files |
| `rsync -avh --ignore-existing /src/ /dst/` | Skip files that exist in destination |
| `rsync -avh --update /src/ /dst/` | Skip files newer in destination |
| `rsync -avh --max-size=100M /src/ /dst/` | Skip files larger than 100MB |
| `rsync -avh --min-size=1K /src/ /dst/` | Skip files smaller than 1KB |

---

### My Automated Cron Jobs

Here's how I automate my backups with cron. I run different jobs for different purposes.

**Edit your crontab:**

```bash
crontab -e
```

**My actual cron jobs:**

```bash
# Daily backup of important documents to NAS (runs at 2 AM)
0 2 * * * /usr/bin/rsync -avh --delete --log-file=/var/log/rsync-docs.log \
  /Users/michal/Documents/ \
  /Volumes/NAS/Backups/Documents/ 2>&1

# Weekly full system backup to external drive (runs Sunday at 3 AM)
0 3 * * 0 /usr/bin/rsync -avh --delete --exclude='Library/' --exclude='Downloads/' \
  --log-file=/var/log/rsync-weekly.log \
  /Users/michal/ \
  /Volumes/BackupDrive/Michal-MacMini/ 2>&1

# Hourly sync of active projects to NAS (runs every hour)
0 * * * * /usr/bin/rsync -avh --delete --exclude='node_modules/' \
  /Users/michal/Projects/ \
  /Volumes/NAS/ActiveProjects/ 2>&1

# Daily offsite backup to remote server (runs at 4 AM)
0 4 * * * /usr/bin/rsync -avzh --delete -e "ssh -i /Users/michal/.ssh/backup_key" \
  --log-file=/var/log/rsync-offsite.log \
  /Users/michal/CriticalData/ \
  backup@backup-server.example.com:/backups/michal/ 2>&1
```

**Cron schedule quick reference:**

```tree
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 and 7 = Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Common patterns:**

- `0 2 * * *` = Daily at 2:00 AM
- `0 */4 * * *` = Every 4 hours
- `0 0 * * 0` = Weekly on Sunday at midnight
- `0 0 1 * *` = Monthly on the 1st at midnight

**Important cron tips:**

1. **Use full paths:** Cron doesn't have your normal PATH, so use `/usr/bin/rsync` not just `rsync`
2. **Redirect output:** Add `2>&1` to see errors
3. **Test first:** Run your command manually before adding to cron
4. **Check logs:** I always use `--log-file` to troubleshoot issues
5. **Email notifications:** By default, cron emails you on errors (if mail is configured)

**Wrapper script for better logging (optional):**

I created a simple wrapper script for my most important backups:

```bash
#!/bin/bash
# /Users/michal/scripts/rsync-backup.sh

LOG_FILE="/var/log/rsync-backup-$(date +\%Y\%m\%d-\%H\%M\%S).log"
ERROR_LOG="/var/log/rsync-errors.log"

echo "=== Backup started at $(date) ===" | tee -a "$LOG_FILE"

rsync -avh --delete \
  --exclude='.DS_Store' \
  --exclude='*.tmp' \
  --log-file="$LOG_FILE" \
  /Users/michal/Documents/ \
  /Volumes/NAS/Backups/Documents/

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "=== Backup completed successfully at $(date) ===" | tee -a "$LOG_FILE"
else
  echo "=== Backup FAILED at $(date) with exit code $EXIT_CODE ===" | tee -a "$LOG_FILE" "$ERROR_LOG"
  # Could send email notification here
fi

exit $EXIT_CODE
```

Make it executable and add to cron:

```bash
chmod +x /Users/michal/scripts/rsync-backup.sh
```

Cron entry:

```bash
0 2 * * * /Users/michal/scripts/rsync-backup.sh
```

---

### Common rsync Scenarios

Here are some real-world scenarios I encounter regularly:

#### Scenario 1: Initial backup of large dataset

```bash
# First run with progress and compression
rsync -avzhP --stats /large/dataset/ /backup/location/
```

#### Scenario 2: Daily incremental backup

```bash
# Subsequent runs go much faster (only changes)
rsync -avh --delete --stats /large/dataset/ /backup/location/
```

#### Scenario 3: Backup excluding cache and temp files

```bash
rsync -avh --delete \
  --exclude='Cache/' \
  --exclude='Tmp/' \
  --exclude='*.tmp' \
  --exclude='.DS_Store' \
  /Users/michal/ \
  /backup/
```

#### Scenario 4: Mirror a website from remote server

```bash
rsync -avz --delete \
  user@webserver:/var/www/html/ \
  /local/website-backup/
```

#### Scenario 5: Sync only specific file types

```bash
# Sync only photos
rsync -avh --include='*.jpg' --include='*.png' --include='*.raw' \
  --include='*/' --exclude='*' \
  /Photos/Source/ /Photos/Backup/
```

---

### Useful Tips & Tricks

**1. Test with dry run first:**

Always test your rsync command with `-n` before running it for real, especially with `--delete`:

```bash
rsync -avhn --delete /source/ /destination/
```

**2. Preserve all attributes (for exact copies):**

```bash
rsync -aAXvh --delete /source/ /destination/
```

- `-A` = preserve ACLs
- `-X` = preserve extended attributes

**3. Resume interrupted transfers:**

```bash
rsync -avh --partial --progress /large-files/ /destination/
```

Or use the shorthand: `rsync -avhP`

**4. Bandwidth limiting for background jobs:**

```bash
rsync -avh --bwlimit=5000 /source/ user@remote:/destination/
```

This limits to 5 MB/s, so it doesn't saturate your connection.

**5. Create timestamped backups:**

```bash
BACKUP_DIR="/backups/$(date +\%Y-\%m-\%d)"
rsync -avh /source/ "$BACKUP_DIR/"
```

**6. Compare two directories:**

```bash
# Show only differences
rsync -avhn --delete /folder1/ /folder2/ | grep -v "/$"
```

**7. Sync and keep local deletions:**

If you want to sync new/updated files but NOT delete anything in the destination:

```bash
rsync -avh --ignore-existing --update /source/ /destination/
```

---

### Troubleshooting Common Issues

#### Problem: Permission denied errors

```bash
# If backing up system files, use sudo
sudo rsync -avh /system/files/ /backup/

# If remote, ensure SSH key has proper permissions
chmod 600 ~/.ssh/backup_key
```

#### Problem: "vanished files" warning

This happens when files change during the sync. It's usually harmless:

```bash
# Add ignore-missing-args to suppress
rsync -avh --ignore-missing-args /source/ /destination/
```

#### Problem: Slow performance

```bash
# Try these optimizations:
rsync -avh --inplace --no-whole-file /source/ /destination/  # For SSDs
rsync -avzh /source/ user@host:/destination/  # Add compression for remote
rsync -avh --info=progress2 /source/ /destination/  # Better progress info
```

#### Problem: Too many small files

```bash
# Disable incremental recursion for small file operations
rsync -avh --no-inc-recursive /source/ /destination/
```

---

### Monitoring Backup Success

I created a simple script to check my last backup status:

```bash
#!/bin/bash
# /Users/michal/scripts/check-backup-status.sh

LOG_FILE="/var/log/rsync-backup.log"

if [ ! -f "$LOG_FILE" ]; then
  echo "❌ No backup log found!"
  exit 1
fi

LAST_BACKUP=$(grep "Backup completed successfully" "$LOG_FILE" | tail -1)

if [ -z "$LAST_BACKUP" ]; then
  echo "❌ Last backup failed or never ran!"
  exit 1
else
  echo "✅ Last successful backup:"
  echo "$LAST_BACKUP"
  exit 0
fi
```

I use UptimeRobot to monitor my cron jobs. UptimeRobot sends notifications to my Discord server and pushes alerts to the mobile app:

```bash
# Check backup status daily at 6 AM, ping UptimeRobot heartbeat
0 6 * * * /Users/michal/scripts/check-backup-status.sh && curl https://heartbeat.uptimerobot.com/YOUR_HEARTBEAT_KEY
```

---

### Why rsync is Essential for the 3-2-1 Strategy

Let me bring this back to my 3-2-1 backup strategy. rsync is perfect because:

1. **Reliable:** It's been battle-tested for 25+ years
2. **Efficient:** Delta transfers mean fast, incremental backups
3. **Verifiable:** Built-in checksum verification ensures data integrity
4. **Automatable:** Works perfectly in cron jobs
5. **Universal:** Available on every Unix-like system
6. **Network-capable:** SSH support for remote/offsite backups
7. **Space-efficient:** Hard link support for snapshot-style backups

My complete 3-2-1 implementation using rsync:

- **Primary:** Mac mini Desktop SSD + 6TB G-Drive (working data)
- **Backup 1:** Mac mini Plex 6TB G-Drive (rsync sync from Desktop)
- **Backup 2:** Synology NAS (Time Machine + rsync from various services)
- **Backup 3:** Wasabi cloud storage (rclone for offsite protection)
- **Backup 4:** Proxmox Backup Server (backs up the Synology NAS)

Plus Google Drive synced locally for cross-device file access.

This gives me redundancy, geographic diversity, and peace of mind.

---

### Conclusion

rsync has been an indispensable part of my homelab infrastructure for years. It's reliable, efficient, and incredibly powerful once you understand its options. Whether you're implementing a robust 3-2-1 backup strategy like mine, syncing data between Mac minis and Raspberry Pis, or just making sure your important files are protected, rsync is a tool worth mastering.

The learning curve is minimal—start with simple `rsync -avh` commands and gradually add options as you need them. Set up some cron jobs, monitor your logs, and sleep better knowing your data is protected across multiple locations and media types.

**My advice:** Start small. Pick one important folder and set up a simple rsync backup to an external drive or NAS. Once you see how reliable it is, expand your strategy. Before you know it, you'll have a comprehensive backup system protecting everything from your family photos to your Plex media library (well, I'm still working on that last one!).

**Important note:** Don't get hung up on getting this project completed in a matter of days or weeks. It has taken me a year to get my 3-2-1 strategy to where it is now today, and I still have more tasks to do. Building a robust backup infrastructure is a marathon, not a sprint. Start with protecting your most critical data, then gradually expand your coverage. Each backup you add is one more layer of protection.

Remember: Use rsync for recurring tasks, rclone for cloud storage, and scp for quick one-offs. If you find yourself doing the same thing twice, automate it with rsync and cron.

#### Happy backing up! 💾🔄📦

Let me know in the comments what your backup strategy looks like and whether you're using rsync. I'd love to hear about your setup, especially if you have a good solution for backing up massive Plex libraries!
