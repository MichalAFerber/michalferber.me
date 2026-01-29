---
title: Building a Redundant Unbound DNS Setup in My Home Lab
description: Build a redundant Unbound DNS setup on Raspberry Pi with automated config sync, security hardening, and health monitoring.
tags:
  - DNS
  - unbound
  - Homelab
  - raspberry-pi
  - self-hosted
  - networking
  - Linux
  - devops
  - dnssec
  - home-networking
  - redundancy
  - guide
  - tutorial
comments: true
style: fill
color: primary
thumbnail-img: /assets/img/unbound_logo.avif
---

![Website Code]({{ "/assets/img/unbound_logo.avif" | relative_url | absolute_url }})

## 🛡️ Building a Redundant Unbound DNS Setup in My Home Lab

When you've got a growing home lab, stable DNS becomes the foundation everything else relies on. Over the last few weeks, I took the time to standardize my DNS with **Unbound** running on two Raspberry Pi 4 servers, making it redundant, secure, and easy to maintain.

This post is a recap of that journey — from tearing out containerized Unbound, to building configs by hand, syncing between Pis, and writing scripts to keep things healthy.

---

## 🎯 Why Unbound?

I needed:

- **Recursive DNS** that talks directly to the root servers (not forwarding to my ISP).
- **Redundancy** across two Pi 4 servers.
- **Authoritative local zone** (`mykk.foo`) so I can use short names for lab devices.
- **Maintainability** — easy updates and quick health checks.

Pi-hole is great for ad-blocking, but I wanted to separate concerns: Unbound handles DNS resolution, and I can plug Pi-hole back in later if needed.

---

## 🔄 Why I Moved Away from Containers

Previously, I was running Unbound in Docker containers using the `mvance/unbound` image. While containers are great for isolation and portability, I ran into a few issues in my home lab context:

**Problems with the containerized approach:**
- **Config management complexity**: Mounting volumes and managing permissions for zone files was more complicated than it needed to be
- **System integration**: Systemd timers and service dependencies were awkward to handle from inside containers
- **Restart reliability**: Container networking occasionally caused DNS resolution delays during restarts
- **Debugging overhead**: When things went wrong, I had an extra layer (container runtime) to troubleshoot

**The native install wins:**

- Direct systemd integration for services and timers
- Simpler file permissions and backup workflows
- Faster restarts (no container orchestration overhead)
- One less moving part to maintain

For a production multi-tenant environment, containers make sense. For my two-Pi home lab, native installation is cleaner and more reliable.

---

## 🛠️ Base Installation

On each Pi (`pi4server` = 192.168.50.2, `pi4server02` = 192.168.50.3):

```bash
sudo apt update
sudo apt install -y unbound curl
sudo mkdir -p /var/lib/unbound
sudo curl -fsSL -o /var/lib/unbound/root.hints https://www.internic.net/domain/named.root
```

Then I dropped in a minimal config (`/etc/unbound/unbound.conf.d/lan53.conf`) to listen on the LAN IP and enforce basic hardening:

```conf
server:
    # Network configuration
    interface: 192.168.50.2  # Change to .3 on pi4server02
    port: 53
    do-ip4: yes
    do-ip6: no
    do-udp: yes
    do-tcp: yes
    
    # Access control
    access-control: 127.0.0.0/8 allow
    access-control: 192.168.50.0/24 allow
    access-control: 0.0.0.0/0 refuse
    
    # Performance tuning
    num-threads: 2
    msg-cache-size: 8m
    rrset-cache-size: 16m
    cache-min-ttl: 300
    cache-max-ttl: 86400
    
    # Security hardening
    hide-identity: yes
    hide-version: yes
    harden-glue: yes
    harden-dnssec-stripped: yes
    use-caps-for-id: yes
    
    # Privacy
    qname-minimisation: yes
    minimal-responses: yes
    
    # Root hints
    root-hints: "/var/lib/unbound/root.hints"
    
    # Logging (adjust verbosity as needed)
    verbosity: 1
    log-queries: no
```

---

## 🌐 Local Zone: `mykk.foo`

To keep short names working, I built out a static zone file in `/etc/unbound/unbound.conf.d/local-zone-mykk-foo.conf`:

```conf
server:
    local-zone: "mykk.foo." static

    # A records for lab hosts
    local-data: "pi4server.mykk.foo.   IN A 192.168.50.2"
    local-data: "pi4server02.mykk.foo. IN A 192.168.50.3"
    local-data: "plex.mykk.foo.        IN A 192.168.50.205"
    local-data: "truenas.mykk.foo.     IN A 192.168.50.202"

    # PTR records (reverse DNS)
    local-data-ptr: "192.168.50.2 pi4server.mykk.foo."
    local-data-ptr: "192.168.50.3 pi4server02.mykk.foo."
    local-data-ptr: "192.168.50.205 plex.mykk.foo."
    local-data-ptr: "192.168.50.202 truenas.mykk.foo."
    
    # CNAMEs for convenience aliases
    local-data: "nas.mykk.foo.         IN CNAME truenas.mykk.foo."
    local-data: "media.mykk.foo.       IN CNAME plex.mykk.foo."
    local-data: "dns1.mykk.foo.        IN CNAME pi4server.mykk.foo."
    local-data: "dns2.mykk.foo.        IN CNAME pi4server02.mykk.foo."
    
    # External CNAME (points to public domain)
    local-data: "www.mykk.foo.         IN CNAME mykk.us."
```

This gives me both the canonical names and convenient shortcuts.

---

## 🔄 Automating Updates

Manually editing zone files is error-prone. So I wrote a TSV-based workflow:

- **`/etc/unbound/hosts.d/mykk.foo.tsv`** → the source of truth
- **`/usr/local/sbin/update_dns.sh`** → converts TSV → Unbound config, validates, restarts
- **Backups** → every run creates timestamped backups
- **Rollback** → just copy back a `.bak` file and restart

### The TSV Format

The TSV file (`/etc/unbound/hosts.d/mykk.foo.tsv`) looks like this:

```tsv
# hostname	ip_address	aliases (comma-separated, optional)
pi4server	192.168.50.2	dns1
pi4server02	192.168.50.3	dns2
plex	192.168.50.205	media
truenas	192.168.50.202	nas
```

### The Update Script

Here's the core of `update_dns.sh`:

```bash
#!/bin/bash
set -euo pipefail

TSV_FILE="/etc/unbound/hosts.d/mykk.foo.tsv"
CONF_FILE="/etc/unbound/unbound.conf.d/local-zone-mykk-foo.conf"
BACKUP_DIR="/etc/unbound/backups"
DOMAIN="mykk.foo"

# Create backup
mkdir -p "$BACKUP_DIR"
if [[ -f "$CONF_FILE" ]]; then
    cp "$CONF_FILE" "$BACKUP_DIR/local-zone-mykk-foo.conf.$(date +%Y%m%d-%H%M%S).bak"
fi

# Generate new config
{
    echo "server:"
    echo "    local-zone: \"${DOMAIN}.\" static"
    echo ""
    echo "    # A records"
    
    while IFS=$'\t' read -r hostname ip aliases; do
        [[ "$hostname" =~ ^#.*$ ]] && continue  # Skip comments
        [[ -z "$hostname" ]] && continue         # Skip empty lines
        
        echo "    local-data: \"${hostname}.${DOMAIN}. IN A ${ip}\""
    done < "$TSV_FILE"
    
    echo ""
    echo "    # PTR records"
    
    while IFS=$'\t' read -r hostname ip aliases; do
        [[ "$hostname" =~ ^#.*$ ]] && continue
        [[ -z "$hostname" ]] && continue
        
        echo "    local-data-ptr: \"${ip} ${hostname}.${DOMAIN}.\""
    done < "$TSV_FILE"
    
    echo ""
    echo "    # CNAME aliases"
    
    while IFS=$'\t' read -r hostname ip aliases; do
        [[ "$hostname" =~ ^#.*$ ]] && continue
        [[ -z "$hostname" ]] && continue
        [[ -z "$aliases" ]] && continue
        
        IFS=',' read -ra ALIAS_ARRAY <<< "$aliases"
        for alias in "${ALIAS_ARRAY[@]}"; do
            alias=$(echo "$alias" | xargs)  # Trim whitespace
            echo "    local-data: \"${alias}.${DOMAIN}. IN CNAME ${hostname}.${DOMAIN}.\""
        done
    done < "$TSV_FILE"
    
} > "$CONF_FILE"

# Validate configuration
if ! unbound-checkconf > /dev/null 2>&1; then
    echo "ERROR: Configuration validation failed!"
    echo "Restoring from backup..."
    cp "$BACKUP_DIR"/local-zone-mykk-foo.conf.*.bak "$CONF_FILE" 2>/dev/null || true
    exit 1
fi

# Restart Unbound
systemctl restart unbound

echo "DNS configuration updated successfully!"
```

This means adding a host is as simple as:

```bash
printf "newhost\t192.168.50.123\talias1,alias2\n" | sudo tee -a /etc/unbound/hosts.d/mykk.foo.tsv
sudo /usr/local/sbin/update_dns.sh
```

---

## 🔄 Keeping Configs Synced Between Pi Servers

Since I have two independent DNS servers, I needed a way to keep their configurations in sync. Here's my approach:

### Option 1: Primary/Secondary Model (What I Use)

I designated `pi4server` (192.168.50.2) as the **primary** where all DNS changes happen. Then I use a simple sync script:

**`/usr/local/sbin/sync_dns_to_secondary.sh`** on pi4server:

```bash
#!/bin/bash
set -euo pipefail

SECONDARY="192.168.50.3"
SECONDARY_USER="michal"

# Sync TSV file
rsync -avz /etc/unbound/hosts.d/mykk.foo.tsv \
    ${SECONDARY_USER}@${SECONDARY}:/etc/unbound/hosts.d/

# SSH to secondary and regenerate config
ssh ${SECONDARY_USER}@${SECONDARY} "sudo /usr/local/sbin/update_dns.sh"

echo "DNS config synced to secondary server"
```

I run this manually after making changes, or it can be added as a post-hook to `update_dns.sh`.

### Option 2: Git-Based Sync (Alternative)

For those who prefer version control, you could:

1. Keep `/etc/unbound/hosts.d/` as a git repo
2. Commit changes on the primary
3. Pull and regenerate on the secondary

I kept it simple with rsync since my home lab doesn't need full version history.

---

## ⏱️ Root Hints Maintenance

Resolvers only work well if they know the root servers. To keep that fresh:

**`/usr/local/sbin/update-unbound-root-hints.sh`**:

```bash
#!/bin/bash
set -euo pipefail

ROOT_HINTS="/var/lib/unbound/root.hints"
TEMP_FILE="/tmp/root.hints.tmp"
BACKUP_FILE="${ROOT_HINTS}.bak"

# Download fresh root hints
curl -fsSL -o "$TEMP_FILE" https://www.internic.net/domain/named.root

# Verify it's not empty and looks like a zone file
if [[ ! -s "$TEMP_FILE" ]] || ! grep -q "^\\." "$TEMP_FILE"; then
    echo "ERROR: Downloaded root hints file is invalid"
    rm -f "$TEMP_FILE"
    exit 1
fi

# Check if content has changed
if [[ -f "$ROOT_HINTS" ]] && cmp -s "$ROOT_HINTS" "$TEMP_FILE"; then
    echo "Root hints unchanged, no update needed"
    rm -f "$TEMP_FILE"
    exit 0
fi

# Backup old file
[[ -f "$ROOT_HINTS" ]] && cp "$ROOT_HINTS" "$BACKUP_FILE"

# Replace with new file
mv "$TEMP_FILE" "$ROOT_HINTS"
chown unbound:unbound "$ROOT_HINTS"
chmod 644 "$ROOT_HINTS"

# Restart Unbound
systemctl restart unbound

echo "Root hints updated successfully"
```

**Systemd service** (`/etc/systemd/system/update-unbound-root-hints.service`):

```ini
[Unit]
Description=Update Unbound Root Hints
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/update-unbound-root-hints.sh
User=root

[Install]
WantedBy=multi-user.target
```

**Systemd timer** (`/etc/systemd/system/update-unbound-root-hints.timer`):

```ini
[Unit]
Description=Monthly update of Unbound root hints

[Timer]
OnCalendar=monthly
Persistent=true
RandomizedDelaySec=1h

[Install]
WantedBy=timers.target
```

Enable with:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now update-unbound-root-hints.timer
```

The `Persistent=true` ensures missed runs execute on next boot, and `RandomizedDelaySec=1h` prevents both Pis from hammering IANA simultaneously.

---

## 📡 Router & Client Integration

Finally, I pointed my **Asus router DHCP** to:

- DNS1: `192.168.50.2`
- DNS2: `192.168.50.3`
- Search domain: `mykk.foo`

Now every device on the LAN resolves short names without extra configuration.

**Testing from a client:**

```bash
$ nslookup plex
Server:		192.168.50.2
Address:	192.168.50.2#53

Name:	plex.mykk.foo
Address: 192.168.50.205

$ ping nas
PING truenas.mykk.foo (192.168.50.202): 56 data bytes
64 bytes from 192.168.50.202: icmp_seq=0 ttl=64 time=2.1 ms
```

---

## ✅ Health Checks & Troubleshooting

I wrote a monitoring script to confirm both resolvers are answering consistently:

**`/usr/local/sbin/dns-check.sh`**:

```bash
#!/bin/bash

SERVERS=(192.168.50.2 192.168.50.3)
HOSTS=("pi4server.mykk.foo" "plex.mykk.foo" "truenas.mykk.foo" "google.com")

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "DNS Health Check - $(date)"
echo "=================================="

ERRORS=0

for h in "${HOSTS[@]}"; do
    echo -e "\nChecking: ${YELLOW}$h${NC}"
    
    RESULTS=()
    for s in "${SERVERS[@]}"; do
        RESULT=$(dig +short @"$s" "$h" | head -n1)
        RESULTS+=("$RESULT")
        
        if [[ -z "$RESULT" ]]; then
            echo -e "  ${RED}✗${NC} $s - NO RESPONSE"
            ((ERRORS++))
        else
            echo -e "  ${GREEN}✓${NC} $s - $RESULT"
        fi
    done
    
    # Check if all results match
    if [[ ${#RESULTS[@]} -gt 1 ]]; then
        FIRST="${RESULTS[0]}"
        for r in "${RESULTS[@]}"; do
            if [[ "$r" != "$FIRST" ]]; then
                echo -e "  ${RED}⚠ MISMATCH DETECTED${NC}"
                ((ERRORS++))
                break
            fi
        done
    fi
done

echo ""
echo "=================================="
if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}$ERRORS error(s) detected${NC}"
    exit 1
fi
```

### Troubleshooting Steps When Checks Fail

**If one server doesn't respond:**

1. Check if Unbound is running: `systemctl status unbound`
2. Look at logs: `journalctl -u unbound -n 50`
3. Verify network: `ping 192.168.50.2` from another machine
4. Test manually: `dig @192.168.50.2 google.com`

**If responses don't match:**

1. Check if configs are in sync: `diff /etc/unbound/hosts.d/mykk.foo.tsv` between servers
2. Re-run the sync script
3. Validate configs: `unbound-checkconf` on both servers
4. Clear cache: `unbound-control flush_zone mykk.foo` (if unbound-control is configured)

**If external queries fail but local ones work:**

1. Check root hints are current: `ls -lh /var/lib/unbound/root.hints`
2. Test direct root query: `dig @198.41.0.4 google.com` (a.root-servers.net)
3. Verify firewall isn't blocking outbound UDP/53
4. Check systemd timer: `systemctl status update-unbound-root-hints.timer`

---

## 📊 Performance & Results

**Query response times** (measured with `hyperfine 'dig @192.168.50.2 google.com'`):

- **Cold cache**: ~180ms (typical recursive lookup)
- **Warm cache**: ~2ms (cached response)
- **Local zone**: <1ms (static data)

**Redundancy testing:**

Simulated failure by stopping Unbound on pi4server:

```bash
sudo systemctl stop unbound  # on pi4server
```

Client resolution continued seamlessly using pi4server02 as fallback. No interruption to ongoing connections or DNS lookups.

**Uptime stats** (after 30 days):

- Both servers: 100% availability
- Zero DNS-related service interruptions
- Average query load: ~50 queries/minute across both servers

---

## 🔐 Security Hardening Details

The configuration includes several security best practices:

**Access Control:**

- Only LAN subnet (192.168.50.0/24) can query
- Explicit refusal of all other sources
- No open resolver risk

**Privacy Protections:**

- `qname-minimisation`: Only sends necessary parts of domain to upstream
- `hide-identity/version`: Doesn't leak server details
- No query logging in production (can enable for debugging)

**DNSSEC Validation:**

- `harden-dnssec-stripped`: Protects against downgrade attacks
- `harden-glue`: Prevents cache poisoning via authority section

**Additional Hardening I Considered:**

```conf
# Rate limiting (uncomment if needed)
# ratelimit: 1000  # queries per second
# ip-ratelimit: 10  # per IP address

# Aggressive cache settings for privacy
# prefetch: yes  # Refresh cache before expiry
# serve-expired: yes  # Serve stale records when upstream fails
```

For my home lab, the baseline hardening is sufficient. For internet-facing DNS, I'd enable rate limiting and consider DNSSEC signing for my local zones.

---

## 🚀 Lessons Learned

- **Redundancy is worth the effort**: Clients fail over cleanly between `.2` and `.3`. No single point of failure.
- **Automating config updates avoids fat-finger errors**: The TSV workflow prevents syntax mistakes and provides instant rollback.
- **Root.hints refresh is often forgotten**: But it matters for long-term stability. Systemd timers make it invisible.
- **Building this out forced me to think like an ops team**: Backups, rollback, monitoring, and documentation became natural habits.
- **Native > containers for simple home lab DNS**: Less complexity, faster troubleshooting, better system integration.

---

## 📦 GitHub Repository Structure

I packaged everything into a GitHub-ready repo layout:

```tree
unbound-homelab/
├── scripts/
│   ├── update_dns.sh
│   ├── sync_dns_to_secondary.sh
│   ├── update-unbound-root-hints.sh
│   └── dns-check.sh
├── systemd/
│   ├── update-unbound-root-hints.service
│   └── update-unbound-root-hints.timer
├── etc/
│   ├── unbound.conf.d/
│   │   ├── lan53.conf
│   │   └── local-zone-mykk-foo.conf.example
│   └── hosts.d/
│       └── mykk.foo.tsv.example
├── docs/
│   ├── CHEATSHEET.md
│   ├── ARCHITECTURE.md
│   └── TROUBLESHOOTING.md
└── README.md
```

That way, I can clone fresh onto a new Pi and be up and running in minutes.

**Quick setup:**

```bash
git clone https://github.com/MichalAFerber/unbound-homelab.git
cd unbound-homelab
sudo ./install.sh  # Copies files, sets permissions, enables services
```

---

## 🧭 Next Steps

- **Tie in Pi-hole**: Add ad-blocking with Unbound as upstream resolver
- **Monitoring/Alerting**: Prometheus exporter or systemd watchdog for proactive alerts
- **Expand local zones**: Add zones for other VLANs (IoT devices, guest network)
- **DNSSEC signing**: Sign the `mykk.foo` zone for full chain of trust
- **Conditional forwarding**: Forward specific domains (like `internal.company.com`) to corporate DNS

---

**DNS may not be glamorous, but it's the glue of a home lab.**  
With this setup, I've got redundant, secure, and self-maintaining resolution — and peace of mind that everything else in the lab can rely on it.

---

Want to replicate this setup? The full configuration and scripts are available on my [GitHub](https://github.com/MichalAFerber/unbound-homelab). Questions or suggestions?
