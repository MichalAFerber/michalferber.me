---
layout: post
title: "Managing My Raspberry Pi 4 Home Server: A Practical Operations Guide"
description: "A comprehensive guide to managing Docker containers, systemd services, and rclone cloud mounts on a Raspberry Pi 4 home server"
tags: [homelab, raspberry-pi, docker, linux, self-hosting]
comments: true
thumbnail-img: /assets/img/raspberry-pi.webp
---

![Raspberry Pi Logo]({{ "/assets/img/raspberry-pi.webp" | relative_url | absolute_url }})

Running a Raspberry Pi 4 as a home server has been one of my most rewarding homelab projects. It's powerful enough to handle multiple containerized services, cloud storage mounts, and various automation tasks—all while sipping minimal power compared to traditional server hardware.

Over time, I've developed a set of workflows and commands that I use daily to maintain and troubleshoot my Pi4Server. This guide documents those operations for both my future self and anyone else running a similar setup.

## Docker Container Management

Docker is the backbone of my Pi4Server, running everything from media services to monitoring tools. Here are the essential operations I use regularly.

### Viewing Running Containers

The first thing I do when checking on the server is see what's actually running:

```bash
docker ps
```

This gives me a quick overview of all active containers, their status, and port mappings.

### Restarting Container Stacks

When I need to restart an entire application stack (like my media server or monitoring suite), I navigate to the compose directory and bounce the whole stack:

```bash
cd ~/docker-stacks/stack-name
docker compose down && docker compose up -d
```

This approach ensures that all containers in the stack restart together, maintaining their dependencies and network connectivity.

### Restarting Individual Containers

Sometimes a single container needs attention without disturbing the others:

```bash
docker restart container_name
```

This is particularly useful when a specific service becomes unresponsive but the rest of the stack is healthy.

### Monitoring Container Logs

When troubleshooting issues, live log tailing is invaluable:

```bash
docker logs -f container_name
```

The `-f` flag follows the log output in real-time, letting me see exactly what's happening inside the container.

### Cleaning Up Docker Resources

Docker has a tendency to accumulate unused images, stopped containers, and orphaned volumes. I periodically run a comprehensive cleanup:

```bash
docker system prune -af --volumes
```

This aggressive pruning reclaims disk space by removing everything that's not actively in use. On a Pi with limited storage, this maintenance is essential.

## Managing systemd Services

Beyond Docker, several critical services run directly through systemd, including my rclone mounts and custom automation scripts.

### Checking Service Status

To see if a service is running properly:

```bash
systemctl status servicename --no-pager
```

The `--no-pager` flag displays the full output without pagination, which I prefer for quick checks.

### Restarting Services

When configuration changes or issues require a service restart:

```bash
sudo systemctl restart servicename
```

### Reloading systemd Configuration

After modifying any `.service` files, systemd needs to reload its configuration:

```bash
sudo systemctl daemon-reload
```

This step is easy to forget but crucial—without it, your service changes won't take effect.

### Listing Active Services

To get a bird's-eye view of everything systemd is currently running:

```bash
systemctl list-units --type=service --state=running
```

This command helps me identify any unexpected services or confirm that expected ones are indeed active.

## Managing Wasabi Cloud Mounts with rclone

I use rclone to mount Wasabi cloud storage on my Pi, giving me effectively unlimited storage for backups, media, and archives. These mounts need occasional maintenance.

### Verifying Mount Health

To confirm a mount is properly connected:

```bash
findmnt -o TARGET,FSTYPE,PROPAGATION /mnt/ferber-storage
```

This shows the mount point, filesystem type, and propagation settings—useful for diagnosing mounting issues.

### Checking Mount Contents

Sometimes a mount appears connected but isn't actually serving files:

```bash
ls -l /mnt/ferber-storage/path
```

If this returns an error or empty directory when it shouldn't, the mount needs attention.

### Restarting Mount Services

Each of my rclone mounts runs as a dedicated systemd service. To restart one:

```bash
sudo systemctl restart rclone-wasabi-books.service
```

I have separate services for different storage categories (books, media, backups), which allows me to restart them independently.

### Monitoring rclone Logs

When investigating mount issues, the rclone logs tell the whole story:

```bash
tail -f /home/michal/rclone-books.log
```

These logs reveal network issues, authentication problems, or API rate limiting from the cloud provider.

### Verifying rclone Configuration

To confirm rclone is using the correct configuration file:

```bash
rclone config file
```

This displays the path to the active config, ensuring you're not accidentally using a test or outdated configuration.

## Monitoring System Health

Regular monitoring helps me catch issues before they become problems.

### Docker Resource Usage

To see real-time resource consumption by containers:

```bash
docker stats
```

This is my go-to command for identifying memory leaks or CPU-heavy containers.

### Disk Space Monitoring

Since I'm mounting cloud storage, I regularly check available space:

```bash
df -h /mnt/ferber-storage
```

### Overall System Resources

For a comprehensive view of system performance:

```bash
htop
```

This interactive process viewer shows CPU, memory, and swap usage, plus a detailed process list.

## Maintenance and Cleanup

Preventive maintenance keeps the Pi running smoothly.

### Unmounting Stale Mounts

When a mount becomes unresponsive, I unmount it before restarting the service:

```bash
sudo umount /mnt/ferber-storage/path || true
```

The `|| true` ensures the command doesn't fail if the mount is already gone, which prevents script failures.

### Removing Dead Containers and Networks

Docker sometimes leaves behind stopped containers and unused networks:

```bash
docker container prune -f
docker network prune -f
```

The `-f` flag forces removal without confirmation—useful for automated cleanup scripts.

## Closing Thoughts

These commands form the foundation of my Pi4Server operations. I've documented them here because I found myself repeatedly searching for the exact syntax or forgetting useful flags. Now I have a single reference that covers my most common tasks.

The beauty of running a home server is that you can iterate on your setup continuously. This operations guide will evolve as I add new services, refine my workflows, and discover better approaches.

If you're running a similar setup, I'd love to hear about your operational practices. What commands do you use most frequently? What challenges have you encountered with Pi-based servers?

---

Have questions about any of these commands or want to share your own Pi server tips? Feel free to reach out!