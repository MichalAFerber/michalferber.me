---
layout: post
title: "Setting Up Ubuntu Server VMs in Proxmox VE with QEMU Guest Agent"
description: "A complete guide to creating Ubuntu Server virtual machines in Proxmox VE with full QEMU Guest Agent integration for seamless management and monitoring."
tags: [proxmox, ubuntu, virtualization, homelab, linux]
comments: true
thumbnail-img: /assets/img/proxmox.webp
---

![Proxmox Logo]({{ "/assets/img/proxmox.webp" | relative_url | absolute_url }})

If you're running a Proxmox VE homelab, you've probably spun up countless VMs. But have you ever noticed that some VMs show their IP addresses and status in the Proxmox web UI while others remain frustratingly blank? The secret ingredient is the **QEMU Guest Agent** – a small but powerful tool that bridges the gap between your hypervisor and guest operating system.

In this guide, I'll walk you through creating a net-new Ubuntu Server VM in Proxmox VE with full QEMU Guest Agent integration from the start. This setup gives you proper IP address reporting, clean shutdowns, and better backup integration – all the things that make VM management actually pleasant.

## Why the QEMU Guest Agent Matters

Before we dive in, let me explain why this extra step is worth your time. The QEMU Guest Agent allows Proxmox to:

- Display the VM's IP address directly in the web UI
- Execute clean shutdowns instead of hard power-offs
- Freeze the filesystem during backups for consistency
- Report detailed OS information and network interfaces
- Enable fstrim operations for better disk performance

Without it, Proxmox can only see your VM as a black box. With it, you get full visibility and control.

## Getting Started: Download Ubuntu

First, grab the latest Ubuntu Server ISO. You can download it directly on your Proxmox host:

```bash
wget https://releases.ubuntu.com/24.04/ubuntu-24.04.1-live-server-amd64.iso
```

Then upload it through the Proxmox web interface:
**Datacenter → your-node → local (storage) → ISO Images → Upload**

## Creating Your VM

Now let's create the VM with the right settings from the start. In the Proxmox web UI, click **Create VM** and configure each tab:

### General Tab
- **Name**: `ubuntu-server` (or whatever makes sense for your setup)
- **Start after creation**: Optional, but handy if you want to install immediately

### OS Tab
- **ISO image**: Select your uploaded Ubuntu ISO
- **Guest OS**: Linux, kernel 6.x

### System Tab
- **BIOS**: I recommend **OVMF (UEFI)** for modern setups
- **QEMU Agent**: Tick this box – we'll configure it properly later

### Disks Tab
- **Storage**: Your preferred storage pool (`local-lvm`, ZFS, etc.)
- **Disk size**: 20-40 GB is usually sufficient for a server

### CPU Tab
- **Cores**: 2 is a good starting point
- **Type**: `host` for best performance

### Memory Tab
- **Memory**: 4096 MB (4 GB) – adjust based on your workload

### Network Tab
- **Model**: **VirtIO (paravirtualized)** – this is important for performance
- **Bridge**: `vmbr0` (your default bridge)

Click **Finish** to create the VM.

## Enabling QEMU Guest Agent Integration

Here's where most guides skip a crucial step. Before you start the VM, SSH into your Proxmox host and enable the agent properly. Replace `100` with your actual VM ID:

```bash
qm set 100 --agent enabled=1
```

Verify it's configured:

```bash
cat /etc/pve/qemu-server/100.conf | grep agent
# Output should show: agent: 1
```

Now start your VM:

```bash
qm start 100
```

## Installing Ubuntu Server

Open the VM console in the web UI and proceed with the standard Ubuntu installation:

1. Select **Install Ubuntu Server**
2. Configure your network (DHCP or static IP)
3. Create your admin username and password
4. Choose **Use the entire disk** for partitioning
5. Select **Install OpenSSH server** for remote access

After the installation completes and the system reboots, log in with your credentials.

## The Critical Step: Install the Guest Agent

This is where the magic happens. Inside your Ubuntu VM, install the QEMU Guest Agent package:

```bash
sudo apt update
sudo apt install qemu-guest-agent -y
```

Verify that the virtio communication device exists:

```bash
ls /dev/virtio-ports/
# You should see: org.qemu.guest_agent.0
```

Start the agent service:

```bash
sudo systemctl start qemu-guest-agent
sudo systemctl status qemu-guest-agent
```

You should see `Active: active (running)` in green.

## Verification: Does It Work?

Jump back to your Proxmox host shell and test the agent communication:

```bash
qm agent 100 ping
qm agent 100 get-osinfo
qm agent 100 network-get-interfaces
```

Each command should return JSON output with detailed information. If you see errors, double-check that the agent service is running inside the VM.

Now refresh the Proxmox web UI and navigate to your VM's **Summary** page. You should see:
- The VM's IP address populated automatically
- Guest agent status showing "Running"
- More detailed system information

## Finishing Touches

With your VM up and running, here are a few recommended cleanup and security steps:

```bash
# Remove unnecessary packages
sudo apt autoremove -y

# Install useful utilities
sudo apt install ufw htop curl net-tools -y

# Enable firewall with SSH access
sudo ufw allow ssh
sudo ufw enable
```

For an extra performance boost on SSDs, enable fstrim support from the Proxmox host:

```bash
qm set 100 --agent enabled=1,fstrim_cloned_disks=1
```

## What You've Accomplished

You now have a fully functional Ubuntu Server VM that:
- Communicates seamlessly with Proxmox VE
- Shows its IP address in the web UI without logging in
- Supports clean shutdowns via the Proxmox interface
- Enables filesystem-consistent backups
- Provides detailed guest information to the hypervisor

This might seem like extra work compared to just creating a VM and installing Ubuntu, but the integration you get is worth every minute. No more SSHing into VMs just to check their IP addresses. No more wondering if your backups caught the VM in a consistent state. Everything just works the way it should.

## What's Next?

If you're planning to create multiple Ubuntu VMs with the same configuration, you might want to convert this into a template or create a shell script that automates the entire process. The `qm` command-line tool supports creating VMs entirely from the terminal, which could save you significant time in the long run.

Have questions about this setup or want to share your own Proxmox tips? Drop a comment below – I'm always interested in hearing how others configure their homelabs.
