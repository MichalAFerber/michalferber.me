---
layout: post
title: How to Set a Static IP on Ubuntu (Netplan) with DNS Failover
description: Using the Ubuntu (Netplan) to manage your ip address
tags: [raspberry-pi, linux, how-to, ubuntu, networking, netplan, static-ip, dns]
comments: true
thumbnail-img: /assets/img/ubuntu-vector.png
---

[![Ookla-cli]({{ "/assets/img/ubuntu-vector.png" | relative_url | absolute_url }})](https://documentation.ubuntu.com/server/explanation/networking/about-netplan/)

Modern Ubuntu uses **Netplan** for network configuration. Netplan’s YAML makes it simple to assign a static IP, configure routes, and set reliable DNS servers with failover.

## 1. Identify Your Network Interface

List interfaces:

```bash
ip addr
```

Find your wired interface (for example `enp1s0`).

## 2. Create or Edit a Netplan Config

Create `/etc/netplan/01-ethernet.yaml`:

```bash
sudo nano /etc/netplan/01-ethernet.yaml
```

Add:

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp1s0:
      dhcp4: false
      addresses:
        - 192.168.50.4/24
      routes:
        - to: default
          via: 192.168.50.1
      nameservers:
        addresses:
          - 1.1.1.1
          - 8.8.8.8
```

## 3. Fix Permissions

```bash
sudo chmod 600 /etc/netplan/01-ethernet.yaml
```

## 4. Disable Cloud-Init DHCP

If `/etc/netplan/50-cloud-init.yaml` exists, rename it:

```bash
sudo mv /etc/netplan/50-cloud-init.yaml /etc/netplan/50-cloud-init.yaml.disabled
```

## 5. Apply Settings

```bash
sudo netplan generate
sudo netplan apply
```

## 6. Verify

```bash
ip addr show enp1s0
ping -c 3 8.8.8.8
ping -c 3 google.com
```

## Why Two DNS Servers?

Specifying two DNS servers gives automatic failover. If Cloudflare (1.1.1.1) is unavailable, your system falls back to Google (8.8.8.8).

## Conclusion

With this configuration, your machine has:

- A fixed IP address
- Reliable DNS with failover
