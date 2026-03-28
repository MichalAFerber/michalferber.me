---
layout: post
title: "Network-Wide Ad Blocking with Pi-hole: Setup Guide and Why I Choose It Over AdGuard Home"
description: "A comprehensive guide to setting up Pi-hole for network-wide ad blocking, including installation on Raspberry Pi and Proxmox LXC, plus a comparison with AdGuard Home and why Pi-hole is my preferred choice for homelab environments."
tags: [homelab, dns, pi-hole, networking, proxmox, raspberry-pi, privacy]
comments: true
thumbnail-img: /assets/img/pi-hole.webp
---

![Pi-hole Logo]({{ "/assets/img/pi-hole.webp" | relative_url | absolute_url }})

If you're tired of ads cluttering your browsing experience across all your devices—from smartphones to smart TVs—it's time to implement network-wide ad blocking. Pi-hole offers an elegant DNS-level solution that blocks ads and trackers for every device on your network without requiring individual software installation. In this guide, I'll walk you through setting up Pi-hole, compare it with AdGuard Home, and explain why Pi-hole has become my go-to choice for homelab DNS management.

## What is Pi-hole?

Pi-hole is a DNS sinkhole that acts as a network-wide ad blocker. Instead of filtering ads at the browser level, Pi-hole intercepts DNS requests from all devices on your network and blocks queries to known advertising and tracking domains before they ever reach your devices.

When a device on your network tries to load an advertisement, Pi-hole checks the domain against its blocklists. If the domain is on the blocklist, Pi-hole returns a non-routable address like `0.0.0.0`, effectively preventing the ad from loading. For legitimate content, Pi-hole forwards the DNS query to your chosen upstream DNS provider and returns the result.

### Key Benefits

**Network-wide protection**: Block ads on all devices including smart TVs, IoT devices, smartphones, and tablets—even those that don't support traditional ad blockers.

**Improved performance**: Pages load faster without ads consuming bandwidth and processing power. Pi-hole also caches DNS queries locally, reducing DNS resolution times.

**Enhanced privacy**: Block tracking domains and analytics services across your entire network, reducing the digital footprint of all your devices.

**Lightweight and efficient**: Runs smoothly on minimal hardware, making it perfect for Raspberry Pi or resource-efficient LXC containers.

**Network insights**: The web dashboard provides detailed statistics about DNS queries, helping you understand what your devices are communicating with.

## Pi-hole vs AdGuard Home: Why I Choose Pi-hole

Both Pi-hole and AdGuard Home are excellent DNS-level ad blockers that function similarly. They're both open source, lightweight, and effective. However, there are some key differences that influenced my decision to use Pi-hole in my homelab.

### Comparison Overview

| Feature | Pi-hole | AdGuard Home |
|---------|---------|--------------|
| Initial Release | 2015 | 2018 |
| Language | Shell, PHP, C | Go |
| Community | Large, established community | Growing community |
| Installation | One-line installer script | Binary download or Docker |
| DNS Encryption | Via Unbound integration | Native DoH, DoT, DNSCrypt |
| User Interface | Functional, classic design | Modern, polished interface |
| Blocklist Management | Extensive community lists | Built-in curated lists |
| Customization | Highly customizable | Streamlined configuration |
| DHCP Server | Built-in option | Built-in option |
| Resource Usage | Minimal (~100MB RAM) | Slightly higher (~150MB RAM) |
| Learning Curve | Moderate | Lower |

### Why I Prefer Pi-hole

**Mature ecosystem**: Pi-hole has been around since 2015, which means it has a massive community, extensive documentation, and countless tutorials for edge cases. When you run into issues, there's likely someone who has already solved it.

**Extensive blocklist community**: The Pi-hole community has developed comprehensive blocklists covering everything from ads to malware to telemetry. You can find curated lists for specific use cases, making it easy to tailor blocking to your needs.

**Command-line tools**: Pi-hole's robust CLI (`pihole` command) makes it excellent for automation and scripting. I can easily integrate it into my infrastructure-as-code approach.

**Perfect for homelabs**: Running in an LXC container on Proxmox, Pi-hole uses minimal resources while providing reliable service. It's designed to run 24/7 on lightweight hardware.

**Integration flexibility**: Pi-hole works seamlessly with other DNS tools like Unbound for recursive DNS resolution, giving me complete control over my DNS infrastructure without relying on external providers.

**Customization depth**: For someone who enjoys tinkering and optimizing, Pi-hole offers more opportunities to customize behavior, from custom blocklists to advanced DNS configurations.

### Where AdGuard Home Shines

To be fair, AdGuard Home has some advantages:

- **Easier initial setup**: The web-based installer is more beginner-friendly
- **Native DNS encryption**: Built-in support for DoH, DoT, and DNSCrypt without additional software
- **Modern interface**: The UI is more polished and intuitive
- **Parental controls**: Better built-in options for content filtering and safe search

If you're new to DNS management or prefer a more plug-and-play experience, AdGuard Home might be a better fit. However, for homelab enthusiasts who want maximum control and customization, Pi-hole is the superior choice.

## Hardware Requirements

Pi-hole is remarkably lightweight and can run on various platforms:

**Minimum requirements:**
- 512MB RAM
- 2GB disk space (4GB recommended)
- Any modern CPU architecture

**Recommended platforms:**
- **Raspberry Pi 4** (2GB or 4GB): The sweet spot for price and performance
- **Proxmox LXC Container**: Resource-efficient virtualization
- **Proxmox VM**: More isolation if preferred
- **Docker container**: Portable and easy to manage

For my setup, I run Pi-hole in a Proxmox LXC container, which provides the perfect balance of efficiency and isolation.

## Installation on Raspberry Pi

Setting up Pi-hole on a Raspberry Pi is straightforward and takes about 15 minutes.

### Prerequisites

- Raspberry Pi with Raspberry Pi OS installed
- Network connection (Ethernet recommended)
- SSH access or direct console access
- Static IP address for the Pi (configured via router or OS)

### Installation Steps

1. **Update your system:**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Assign a static IP address** (if not done via router):
```bash
sudo nano /etc/dhcpcd.conf
```

Add the following lines (adjust for your network):
```
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=1.1.1.1 8.8.8.8
```

Reboot to apply changes:
```bash
sudo reboot
```

3. **Run the Pi-hole installer:**
```bash
curl -sSL https://install.pi-hole.net | bash
```

**Note**: While piping to bash is controversial, this is the official installation method. You can review the script at https://install.pi-hole.net before running it if you prefer.

4. **Follow the installer prompts:**
   - Confirm static IP address setup
   - Select network interface (eth0 for Ethernet, wlan0 for Wi-Fi)
   - Choose upstream DNS provider (Cloudflare 1.1.1.1, Google 8.8.8.8, OpenDNS, etc.)
   - Select default blocklists (recommended: Yes)
   - Install web admin interface (recommended: Yes)
   - Enable query logging (your choice based on privacy preferences)

5. **Save the admin password** displayed at the end of installation. You can change it later with:
```bash
pihole -a -p
```

6. **Access the web interface:**
Navigate to `http://YOUR_PI_IP/admin` (e.g., `http://192.168.1.100/admin`)

### Configure Your Network

To enable network-wide ad blocking, configure your router to use Pi-hole as the DNS server:

1. Log into your router's admin panel
2. Find DHCP/DNS settings
3. Set primary DNS to your Pi-hole IP address
4. Leave secondary DNS blank (or set to a backup Pi-hole)
5. Save and reboot router if necessary

Alternatively, manually configure DNS on individual devices for testing before network-wide deployment.

## Installation on Proxmox LXC

Running Pi-hole in a Proxmox LXC container is my preferred method. LXC containers are lightweight, efficient, and perfectly suited for services like Pi-hole.

### Creating the LXC Container

1. **Download Debian template** (if not already available):

From Proxmox web interface:
- Navigate to your storage (e.g., local)
- Click CT Templates → Templates
- Download Debian 12 (Bookworm)

Or via command line:
```bash
pveam update
pveam download local debian-12-standard_12.2-1_amd64.tar.zst
```

2. **Create the LXC container** via web interface or command line:

**Via command line:**
```bash
pct create 100 local:vztmpl/debian-12-standard_12.2-1_amd64.tar.zst \
  --hostname pihole \
  --memory 512 \
  --cores 1 \
  --rootfs local-lvm:4 \
  --net0 name=eth0,bridge=vmbr0,ip=192.168.1.100/24,gw=192.168.1.1 \
  --unprivileged 1 \
  --features nesting=1 \
  --onboot 1 \
  --start 1
```

**Via web interface:**
- Click Create CT
- General: Set CT ID (e.g., 100), hostname (pihole), password
- Template: Select Debian 12
- Disks: 4GB root disk
- CPU: 1 core
- Memory: 512MB RAM, 512MB Swap
- Network: Static IP (e.g., 192.168.1.100/24), gateway
- DNS: Use host settings
- Check "Start after created"

3. **Install Pi-hole inside the container:**

Access the container console:
```bash
pct enter 100
```

Or SSH into the container:
```bash
ssh root@192.168.1.100
```

Update the system:
```bash
apt update && apt upgrade -y
```

Install curl (required for Pi-hole installer):
```bash
apt install -y curl
```

Run Pi-hole installer:
```bash
curl -sSL https://install.pi-hole.net | bash
```

Follow the same installation prompts as the Raspberry Pi installation.

4. **Access the web interface:**
Navigate to `http://192.168.1.100/admin`

### Advantages of LXC Deployment

- **Resource efficiency**: LXC containers share the host kernel, using minimal resources
- **Easy backup**: Proxmox makes container backups trivial
- **High availability**: With Proxmox clustering, you can implement automatic failover
- **Multiple instances**: Easy to run multiple Pi-hole instances for redundancy
- **Centralized management**: Control everything from the Proxmox interface

## Post-Installation Configuration

Once Pi-hole is installed, there are several optimizations and configurations worth considering:

### 1. Adding Additional Blocklists

Navigate to Settings → Adlists and add additional blocklists. Some popular options:

```
https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts
https://dbl.oisd.nl
https://v.firebog.net/hosts/lists.php?type=tick
```

After adding lists, update gravity:
```bash
pihole -g
```

### 2. Whitelisting Essential Domains

Some domains may need to be whitelisted to prevent breaking functionality:

- Settings → Whitelist
- Add domains that are incorrectly blocked
- Common examples: update servers, CDN domains, authentication services

### 3. Configuring Upstream DNS

For enhanced privacy, consider using encrypted DNS or recursive DNS with Unbound:

**Using Cloudflare DNS:**
- Settings → DNS → Upstream DNS Servers
- Select Cloudflare (1.1.1.1 and 1.0.0.1)

**Setting up Unbound** (recursive DNS):
```bash
apt install -y unbound
curl -o /etc/unbound/unbound.conf.d/pi-hole.conf https://docs.pi-hole.net/guides/dns/unbound/
systemctl restart unbound
```

Then configure Pi-hole to use Unbound:
- Settings → DNS → Upstream DNS Servers
- Custom 1: `127.0.0.1#5353`
- Uncheck all other upstream servers

### 4. Enable DHCP (Optional)

If your router's DHCP server is limited, Pi-hole can act as your DHCP server:

- Settings → DHCP
- Enable DHCP server
- Configure IP range, router/gateway, and domain
- **Important**: Disable DHCP on your router first

### 5. Local DNS Records

Add local DNS entries for your homelab services:

- Local DNS → DNS Records
- Add domain names and corresponding IP addresses
- Example: `proxmox.home.lab` → `192.168.1.10`

This eliminates the need to remember IP addresses for your homelab services.

## Monitoring and Maintenance

### Web Dashboard

The Pi-hole dashboard provides comprehensive statistics:

- Total queries
- Queries blocked (percentage)
- Top blocked domains
- Top clients
- Query types
- Forwarding destinations

### Command-Line Tools

Pi-hole includes powerful CLI tools:

```bash
# Update Pi-hole
pihole -up

# Update blocklists
pihole -g

# Restart Pi-hole services
pihole restartdns

# View real-time logs
pihole -t

# Check status
pihole status

# Disable blocking temporarily (in seconds)
pihole disable 300

# Re-enable blocking
pihole enable

# Change web password
pihole -a -p
```

### Regular Maintenance

- **Update Pi-hole**: Run `pihole -up` monthly
- **Update blocklists**: Automatic by default (weekly), or manually with `pihole -g`
- **Review statistics**: Identify blocked domains that might need whitelisting
- **Backup configuration**: Export your settings regularly

## Redundancy and High Availability

For critical homelab infrastructure, consider running two Pi-hole instances:

### Primary and Secondary Setup

1. Install Pi-hole on two separate devices/containers
2. Configure router to use both as DNS servers:
   - Primary DNS: Pi-hole 1 (192.168.1.100)
   - Secondary DNS: Pi-hole 2 (192.168.1.101)

### Keeping Instances in Sync

Use **Gravity Sync** to synchronize configurations between Pi-holes:

```bash
# On both Pi-hole instances
curl -sSL https://raw.githubusercontent.com/vmstan/gravity-sync/master/GS_INSTALL.sh | bash
```

Configure gravity-sync to sync:
- Blocklists
- Whitelists
- Blacklists
- Local DNS records
- DHCP settings

This ensures you only need to manage one Pi-hole while maintaining redundancy.

## Troubleshooting Common Issues

### Websites Not Loading

**Problem**: Legitimate websites fail to load or function properly.

**Solution**: 
- Check query log to identify blocked domains
- Whitelist necessary domains
- Temporarily disable Pi-hole (`pihole disable 300`) to confirm it's the cause

### High False Positive Rate

**Problem**: Too many legitimate domains are blocked.

**Solution**:
- Review and adjust blocklists
- Remove aggressive blocklists
- Use more curated lists like OISD

### Pi-hole Not Blocking Ads

**Problem**: Ads still appear on some websites.

**Solution**:
- Verify devices are using Pi-hole as DNS (check router settings)
- Some ads are served from the same domain as content (YouTube, Hulu)
- Update blocklists: `pihole -g`
- Check if domains are on whitelist

### YouTube Ads Still Showing

**Problem**: Pi-hole doesn't block YouTube ads.

**Limitation**: YouTube serves ads from the same domains as content, making DNS-level blocking impossible without breaking functionality. Solutions:
- Use browser extensions like uBlock Origin
- Consider YouTube Premium
- Accept that DNS blocking has limitations

## Performance Considerations

Pi-hole is remarkably efficient, but there are ways to optimize performance:

### DNS Caching

Pi-hole caches DNS responses, significantly speeding up repeat queries. You can monitor cache effectiveness in the dashboard.

### Rate Limiting

Configure rate limiting to prevent DNS amplification attacks:

Edit `/etc/dnsmasq.d/02-pihole-rate-limit.conf`:
```
rate-limit=1000/60/60
```

### Log Management

Query logging can impact performance on high-traffic networks. Consider:
- Reducing log retention period
- Disabling logging if privacy is paramount
- Using anonymous mode (logs without client identification)

## Security Best Practices

1. **Change default password immediately** after installation
2. **Enable HTTPS** for the web interface (requires certificate setup)
3. **Restrict web interface access** to local network only
4. **Keep Pi-hole updated** with `pihole -up`
5. **Use strong upstream DNS providers** (Cloudflare, Quad9)
6. **Consider recursive DNS** (Unbound) for maximum privacy
7. **Regular backups** of configuration via teleporter (Settings → Teleporter)

## Integration with Other Homelab Services

Pi-hole integrates seamlessly with homelab infrastructure:

### Unbound (Recursive DNS)

Eliminate reliance on external DNS providers by resolving DNS queries yourself.

### VPN (WireGuard/OpenVPN)

Configure your VPN to use Pi-hole, enabling ad blocking when away from home.

### Home Assistant

Monitor Pi-hole statistics and control blocking via Home Assistant integrations.

### Grafana

Visualize Pi-hole metrics with Grafana dashboards for comprehensive monitoring.

### Custom Blocklists

Create custom blocklists targeting specific threats or unwanted domains relevant to your network.

## Conclusion

Pi-hole transforms your network experience by eliminating ads and trackers across all devices without individual configuration. Its lightweight design, extensive customization options, and strong community support make it ideal for homelab environments.

While AdGuard Home offers a more polished interface and simpler setup, Pi-hole's maturity, flexibility, and powerful CLI tools make it my preferred choice. Whether you deploy it on a Raspberry Pi or a Proxmox LXC container, Pi-hole provides reliable, efficient, network-wide ad blocking.

For homelab enthusiasts who value control, customization, and open-source solutions, Pi-hole is an essential addition to your infrastructure. Start with a basic setup, experiment with advanced features like Unbound, and enjoy a cleaner, faster, more private internet experience.

## Additional Resources

- [Official Pi-hole Documentation](https://docs.pi-hole.net/)
- [Pi-hole GitHub Repository](https://github.com/pi-hole/pi-hole)
- [Pi-hole Discourse Community](https://discourse.pi-hole.net/)
- [Recommended Blocklists](https://firebog.net/)
- [Gravity Sync](https://github.com/vmstan/gravity-sync)
- [Pi-hole + Unbound Guide](https://docs.pi-hole.net/guides/dns/unbound/)

*Have you implemented Pi-hole in your homelab? Share your experience and any customizations you've found useful in the comments below.*
