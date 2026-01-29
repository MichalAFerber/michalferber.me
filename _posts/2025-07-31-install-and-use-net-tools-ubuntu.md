---
layout: post
date: 2025-07-31 00:00:00 +0000
title: How To Install And Use Net Tools In Ubuntu
subtitle: Install and use the classic net-tools package on Ubuntu to get commands like ifconfig, netstat, route, and more.
tags: [Raspberry Pi, Linux, How To, ubuntu, networking, cli, tools]
comments: true
style: fill
color: primary
thumbnail-img: /assets/img/ubuntu-sudo.jpg
---

![Ubuntu Sudo]({{ "/assets/img/ubuntu-sudo.jpg" | relative_url | absolute_url }})

The `net-tools` package contains classic networking commands like `ifconfig`, `netstat`, `route`, `arp`, and `hostname`.  
While newer tools like `ip` (from the `iproute2` package) are now the default, some scripts and tutorials still rely on these older commands.

This guide will help you:

- Install `net-tools` on Ubuntu
- Use common commands from the package
- Learn about modern alternatives and complementary tools

## 1. Installing Net Tools

Ubuntu no longer includes `net-tools` by default, but you can easily add it:

```bash
sudo apt update
sudo apt install net-tools
```

Verify the installation:

```bash
ifconfig --version
```

## 2. Common Commands in Net Tools

### **1. ifconfig**

View and configure network interfaces:

```bash
ifconfig
```

Use it to quickly check IP addresses and interface status.

### **2. netstat**

Check open ports, connections, and routing tables:

```bash
netstat -tulnp
```

### **3. route**

Display or modify the system’s routing table:

```bash
route -n
```

### **4. arp**

Show the ARP table:

```bash
arp -a
```

### **5. hostname**

View or set the system’s hostname:

```bash
hostname
```

## 3. Modern Alternatives

The `iproute2` suite has replaced most `net-tools` commands.  
Here is a quick reference table for modern equivalents:

| Deprecated Command (net-tools) | Modern Equivalent |
|-------------------------------|--------------------|
| `ifconfig`                    | `ip addr`, `ip link` |
| `netstat`                     | `ss`, `ip route`, `ip -s link` |
| `arp`                         | `ip neighbour` |
| `route`                       | `ip route` |

For example, instead of `ifconfig`, you can use:

```bash
ip addr show
```

And instead of `netstat -tulnp`, use:

```bash
ss -tulnp
```

## 4. Complementary Networking Tools

Beyond `net-tools`, these utilities are worth knowing:

- **ss** – Advanced socket statistics and connections.
- **lsof** – List open files and network sockets (`lsof -i -P -n`).
- **nmap** – Scan hosts and ports (`sudo apt install nmap`).
- **tcpdump** – Capture packets for detailed inspection.
- **traceroute** / **mtr** – Trace network routes and diagnose latency.
- **dig** / **nslookup** – DNS queries and troubleshooting.
- **ethtool** – Show and modify NIC settings.
- **vnStat** – Lightweight network traffic logger.
- **iw / iwlist** – Wireless tools (legacy, replaced by `iw`).

These tools, combined with `net-tools`, provide a more comprehensive networking toolkit.

## 5. When Should You Use Net Tools?

Modern Ubuntu recommends `ip`, `ss`, and related commands from the `iproute2` package. However:

- Legacy scripts may require `ifconfig` or `netstat`.
- Some tutorials still use these commands.
- Quick, familiar checks are sometimes faster.

Think of `net-tools` as a **fallback toolkit**, while learning modern tools for new workflows.

## 6. Conclusion

`net-tools` provides a simple way to access classic network commands on Ubuntu.  
Even though newer tools are preferred, keeping `net-tools` installed can be useful for compatibility and quick diagnostics.  
Combine these with modern utilities for a full-featured networking toolbox.

### References

- [Ubuntu Net Tools Documentation](https://manpages.ubuntu.com/)
- [iproute2 vs net-tools](https://wiki.linuxfoundation.org/networking/iproute2)
- [LinuxStart: Network Tools on Ubuntu](https://www.linuxstart.com/network-tools-ubuntu/)
