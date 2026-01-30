---
layout: post
date: 2025-07-09 00:00:00 +0000
title: Configure mDNS for Hostname Resolution on Ubuntu
subtitle: Configure Ubuntu for mDNS to ping/SSH using hostname.local (e.g., yourservername.local). Install Avahi, set hostname, and enable SSH discovery.
tags: [linux, how-to, dns]
comments: true
style: fill
color: primary
thumbnail-img: /assets/img/systemctl_status_avahi-daemon.png
---

![avahi-daemon]({{ "/assets/img/systemctl_status_avahi-daemon.png" | relative_url | absolute_url }})

Enable your Ubuntu servers to be accessed via `hostname.local` (e.g., `ping yourservername.local` or `ssh username@yourservername.local`) using Avahi for Zero Configuration Networking (Zeroconf). This is perfect for local networks, like my setup with pi5server, pi4server, and pi3server.

## Install Avahi

Install the mDNS daemon and tools:

```bash
sudo apt update
sudo apt install avahi-daemon avahi-utils libnss-mdns
```

- **avahi-daemon**: Handles mDNS and service discovery.
- **avahi-utils**: Provides tools like avahi-browse.
- **libnss-mdns**: Enables .local resolution in the system.

## Verify Avahi Service

Ensure Avahi is running:

```bash
sudo systemctl enable avahi-daemon
sudo systemctl start avahi-daemon
sudo systemctl status avahi-daemon
```

Look for `active (running)` in the output.

## Configure Hostname

Set a unique hostname for each server:

```bash
sudo hostnamectl set-hostname yourservername  # Replace with your hostname
```

Update /etc/hosts to include the hostname:

```bash
sudo nano /etc/hosts
```

Add or verify:

```bash
127.0.0.1 localhost
127.0.1.1 yourservername  # Replace with your hostname
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

## Advertise SSH Service

Allow SSH discovery via mDNS:

```bash
sudo nano /etc/avahi/services/ssh.service
```

Add:

```bash
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
    <name replace-wildcards="yes">%h</name>
    <service>
        <type>_ssh._tcp</type>
        <port>22</port>
    </service>
</service-group>
```

Restart Avahi:

```bash
sudo systemctl restart avahi-daemon
```

## Configure Client for mDNS

On the client device accessing the server:

- **Linux (Ubuntu, etc.)**: Install `libnss-mdns`:

```bash
sudo apt install libnss-mdns
```

Edit `/etc/nsswitch.conf`:

```bash
sudo nano /etc/nsswitch.conf
```

Ensure the `hosts` line includes:

```bash
hosts: files mdns4_minimal [NOTFOUND=return] resolve [!UNAVAIL=return] dns
```

- **macOS**: Built-in Bonjour support, no action needed.
- **Windows**: Install Bonjour (via iTunes or standalone) or use an mDNS-capable SSH client like Termius.
- **iOS/Android**: Use an mDNS-capable SSH app like Termius.

## Test mDNS Resolution

From a client on the same network (e.g., `192.168.x.x`):

```bash
ping yourservername.local
ssh <username@yourservername.local>
```

Verify services:

```bash
avahi-browse -a
```

Look for entries like:

```bash
+ eth0 IPv4 pi5server [hostname] _ssh._tcp local
```

## Troubleshooting

- **Same Subnet**: Ensure client and server are on the same network (e.g., `192.168.x.x`).
- **Firewall**: Allow mDNS traffic:

```bash
sudo ufw allow 5353/udp
```

- **Resolution Fails**: Check Avahi logs:

```bash
journalctl -u avahi-daemon
```

## 🧠 Notes

Ensure SSH is enabled (`sudo systemctl enable ssh`; `sudo systemctl start ssh`).
