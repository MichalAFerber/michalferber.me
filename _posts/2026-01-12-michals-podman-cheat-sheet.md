---
title: "Michal's Podman Cheat Sheet: Docker Alternative"
description: "Complete Podman cheat sheet with commands, rootless containers, pod management, and Docker Compose compatibility."
tags:
  - Podman
  - Docker
  - containers
  - container-engine
  - Homelab
  - self-hosted
  - Linux
  - devops
  - macOS
  - Windows
  - rootless-containers
  - OCI
  - Kubernetes
  - pods
  - virtualization
  - systemd
  - guide
  - tutorial
  - cheat-sheet
  - docker-alternative
  - containerization
comments: true
thumbnail-img: /assets/img/podman.png

---

![Podman Logo]({{ "/assets/img/podman.png" | relative_url | absolute_url }})

## Michal's Podman Cheat Sheet: Docker Alternative

Hey everyone, Michal here! Today, I want to share my journey into the world of Podman—a powerful, daemonless container engine that's quickly becoming a go-to for many, including myself. My personal dive into Podman came out of a very specific need: getting [BmuS (Back-Me-Up Scotty)](https://www.back-me-up-scotty.com/) up and running on my various home devices. I wanted to manage a single container without the overhead of Docker Desktop on my trusty Mac mini, and Podman seemed like the perfect fit. So far, it's been an excellent experience!

### What is Podman?

At its core, Podman (POD MANager) is a Linux-native tool designed for managing containers and pods. It's a daemonless engine, meaning it doesn't require a constantly running background service (like Docker's `dockerd`) to function. This makes it incredibly lightweight and often preferred in environments where security and resource efficiency are paramount.

### How Podman Differs from Docker

While both are container engines, their architectural differences are significant:

* **Daemonless vs. Daemon-based:** This is the big one. Docker relies on a client-server architecture with a daemon (`dockerd`) that manages containers. Podman, on the other hand, operates directly with `runc` (the OCI runtime) and doesn't require a central daemon.
* **Rootless by Default:** Podman is designed to run containers as non-root users by default, significantly enhancing security. Docker usually requires root privileges or membership in the Docker group, which grants root-level access.
* **Pod Management:** Podman has native support for "pods"—groups of co-located containers that share resources. This is directly inspired by Kubernetes and makes Podman a fantastic tool for local Kubernetes development.
* **Fewer Moving Parts:** Without a daemon, there's less to go wrong, fewer processes consuming resources, and a more straightforward security model.

### How Podman is Similar to Docker

Despite the differences, Podman intentionally mirrors much of Docker's user experience:

* **CLI Compatibility:** Most Podman commands are identical or nearly identical to their Docker counterparts (e.g., `podman run`, `podman ps`, `podman images`). This makes the transition incredibly smooth. In fact, you can even alias `docker=podman` if you want!
* **OCI Compliance:** Both adhere to the Open Container Initiative (OCI) standards for container images and runtimes, meaning images built for Docker run on Podman, and vice-versa.
* **Image Registries:** Both can pull and push images from common registries like Docker Hub, Quay.io, and private registries.
* **Container Functionality:** Fundamentally, they both provide isolated environments for applications, using the same underlying Linux kernel features (namespaces and cgroups).

### Why Choose Podman (or Vice Versa)?

**Choose Podman if:**

* **Security is a priority:** Its daemonless and rootless-by-default design offers a smaller attack surface.
* **Resource efficiency matters:** On systems like my Mac mini, not having a persistent daemon frees up precious RAM and CPU cycles.
* **Kubernetes local development:** Native pod support makes it a perfect companion for developing and testing Kubernetes manifests locally.
* **Simplicity:** For single-container deployments or simpler setups (like my BmuS use case), it feels less heavy.
* **You're on a Linux server:** Podman is truly a first-class citizen on Linux and integrates seamlessly with systemd for container management.

**Choose Docker (especially Docker Desktop) if:**

* **You need a complete ecosystem:** Docker Desktop for macOS/Windows offers a comprehensive GUI, extensions, and an integrated development experience that goes beyond just the container engine.
* **Your team heavily relies on Docker Compose:** While Podman has good `docker-compose` compatibility (often via `podman-compose` or `podman compose` in recent versions), Docker's native integration is still more mature.
* **You're deeply embedded in the Docker ecosystem:** If your existing CI/CD pipelines and tooling are heavily optimized for Docker, switching might be more effort than it's worth.
* **You're developing primarily on Windows/macOS and prefer a GUI:** Docker Desktop provides an accessible interface for those who prefer clicking to typing commands.

### Why Podman Was the Right Choice for BmuS

For my specific setup with **BmuS (Back-Me-Up Scotty)**, the decision ultimately came down to "right-sizing" the tool for the job.

My Mac mini serves as a host for various home services, and resources like RAM and CPU cycles are valuable currency. Docker Desktop for Mac is a fantastic, robust product, but it comes with a "batteries included" philosophy—a full GUI dashboard, Kubernetes clusters, extensions, and background processes that run even when you aren't actively managing containers.

I simply needed to run **one single container** to handle my backups. Installing the full Docker Desktop suite felt like buying a semi-truck just to carry a single bag of groceries.

Podman offered the perfect middle ground:

1. **Zero "Dashboard" Bloat:** I didn't want another icon in my menu bar or a GUI application I'd never look at. Podman runs entirely in the terminal, which is where I prefer to be.
2. **Leaner Resource Usage:** The `podman machine` spins up a minimal Fedora VM that is strictly there to run the containers and nothing else. It felt much lighter on my Mac mini's system resources compared to the Docker VM.
3. **Set It and Forget It:** Once I ran `podman machine start` and launched BmuS, it just worked. It sits quietly in the background, doing its job without demanding attention or updates for a UI I don't use.

For a retired IT consultant who likes clean, efficient systems, Podman was the clear winner.

### Platforms Supported by Podman

Podman is primarily a Linux tool, but it offers excellent support for other operating systems through virtual machines:

* **Linux:** Native support, no VM required. This is where Podman truly shines—you can run containers as a regular user without any elevated privileges.
* **macOS:** Achieved via a lightweight virtual machine (VM) that runs a minimal Linux distribution (typically Fedora CoreOS). Commands like `podman machine init` and `podman machine start` set this up automatically.
* **Windows:** Similar to macOS, it uses a WSL 2 (Windows Subsystem for Linux) VM or a Hyper-V VM to run containers. The experience is nearly identical to the macOS setup.

---

### Michal's Podman Cheat Sheet

Here are the essential Podman commands I use, which I've found incredibly useful for managing my containers, especially for my BmuS setup. Feel free to save this to your own wiki or notes!

#### 🖥 Machine Management (macOS/Windows)
Commands for managing the underlying Virtual Machine on non-Linux systems.

| Command | Description |
| :--- | :--- |
| `podman machine init` | Initialize a new VM with default settings. |
| `podman machine init --cpus 4 --memory 4096` | Initialize VM with specific resources (4 CPUs, 4GB RAM). |
| `podman machine set --cpus X --memory Y` | Modify resources of the existing VM. |
| `podman machine start` | Start the Podman VM. |
| `podman machine stop` | Stop the Podman VM. |
| `podman machine list` | List all initialized VMs and their status. |
| `podman machine ssh` | SSH into the Podman VM for low-level debugging. |
| `podman machine rm <name>` | Remove the Podman VM and its data. |

#### 📦 Container Lifecycle
The core commands for running and managing containers.

* **Run a container (detached):**
    ```bash
    podman run -d --name my-app -p 8080:80 nginx
    ```
* **Run a container (interactive):**
    ```bash
    podman run -it --rm alpine /bin/sh
    ```
* **List running containers:**
    ```bash
    podman ps
    ```
* **List ALL containers (including stopped):**
    ```bash
    podman ps -a
    ```
* **Stop a container:**
    ```bash
    podman stop <name_or_id>
    ```
* **Start a stopped container:**
    ```bash
    podman start <name_or_id>
    ```
* **Restart a container:**
    ```bash
    podman restart <name_or_id>
    ```
* **Remove a container:**
    ```bash
    podman rm <name_or_id>
    ```
* **Force remove a running container:**
    ```bash
    podman rm -f <name_or_id>
    ```
* **View container logs:**
    ```bash
    podman logs <container_name>
    ```
* **Follow logs in real-time:**
    ```bash
    podman logs -f <container_name>
    ```
* **View last N lines of logs:**
    ```bash
    podman logs --tail 50 <container_name>
    ```

#### 🖼 Image Management
Working with container images from registries (like Quay.io or Docker Hub).

* **Pull an image:**
    ```bash
    podman pull docker.io/nginx:latest
    ```
* **List local images:**
    ```bash
    podman images
    ```
* **Remove an image:**
    ```bash
    podman rmi <image_id>
    ```
* **Remove unused images:**
    ```bash
    podman image prune
    ```
* **Build an image from a Dockerfile:**
    ```bash
    podman build -t my-custom-image:v1 .
    ```
* **Tag an image:**
    ```bash
    podman tag <image_id> myrepo/myimage:v2
    ```
* **Push an image to a registry:**
    ```bash
    podman push myrepo/myimage:v2
    ```

#### 🌐 Networking & Volumes
Essential for persistent data and communication between containers.

* **Create a volume:**
    ```bash
    podman volume create my-data
    ```
* **List volumes:**
    ```bash
    podman volume ls
    ```
* **Inspect a volume:**
    ```bash
    podman volume inspect my-data
    ```
* **Remove a volume:**
    ```bash
    podman volume rm my-data
    ```
* **Mount a volume to a container:**
    ```bash
    podman run -v my-data:/app/data my-image
    ```
* **Bind mount a host directory:**
    ```bash
    podman run -v /path/on/host:/path/in/container:Z my-image
    ```
* **Create a network:**
    ```bash
    podman network create dev-net
    ```
* **List networks:**
    ```bash
    podman network ls
    ```
* **Connect container to network:**
    ```bash
    podman run --network dev-net nginx
    ```

#### 🔍 Debugging & Maintenance

* **Execute a command inside a running container:**
    ```bash
    podman exec <container_name> ls -la /app
    ```
* **Get an interactive shell inside a container:**
    ```bash
    podman exec -it <container_name> /bin/bash
    ```
* **Inspect container details (JSON format):**
    ```bash
    podman inspect <container_name>
    ```
* **Check resource usage (CPU/RAM) in real-time:**
    ```bash
    podman stats
    ```
* **View container processes:**
    ```bash
    podman top <container_name>
    ```
* **System Prune (clean up unused data):**
    ```bash
    podman system prune
    ```
* **Aggressive prune (remove ALL unused images, not just dangling):**
    ```bash
    podman system prune -a
    ```
* **Check Podman version:**
    ```bash
    podman version
    ```
* **View system-wide Podman info:**
    ```bash
    podman info
    ```

#### 🚀 Advanced: Pods
Podman's unique feature that allows grouping containers together (similar to Kubernetes pods).

* **Create a pod:**
    ```bash
    podman pod create --name my-stack -p 8080:80
    ```
* **Run a container in a pod:**
    ```bash
    podman run -d --pod my-stack --name app-container nginx
    ```
* **List all pods:**
    ```bash
    podman pod ps
    ```
* **Inspect a pod:**
    ```bash
    podman pod inspect my-stack
    ```
* **Stop a pod (stops all containers in it):**
    ```bash
    podman pod stop my-stack
    ```
* **Start a pod:**
    ```bash
    podman pod start my-stack
    ```
* **Remove a pod (removes all containers in it):**
    ```bash
    podman pod rm my-stack
    ```
* **Generate Kubernetes YAML from a pod:**
    ```bash
    podman generate kube my-stack > my-stack.yaml
    ```
* **Play (deploy) a Kubernetes YAML:**
    ```bash
    podman play kube my-stack.yaml
    ```

#### 🔄 Docker Compose Compatibility

Podman supports Docker Compose workflows! You can use either `podman-compose` (a separate tool) or the built-in `podman compose` command (available in Podman 4.1+).

* **Run with docker-compose.yml:**
    ```bash
    podman compose up -d
    ```
* **Stop services:**
    ```bash
    podman compose down
    ```
* **View logs:**
    ```bash
    podman compose logs -f
    ```

---

### Useful Tips & Tricks

**1. Alias Podman as Docker:**
If you're transitioning from Docker and want muscle memory to work, add this to your `.bashrc` or `.zshrc`:
```bash
alias docker=podman
```

**2. Auto-start Containers on Boot (Linux):**
Podman integrates beautifully with systemd. Generate a service file for a container:
```bash
podman generate systemd --new --files --name my-container
sudo mv container-my-container.service /etc/systemd/system/
sudo systemctl enable container-my-container.service
sudo systemctl start container-my-container.service
```

**3. Rootless Containers:**
On Linux, you can run containers without root privileges. Just use Podman as your regular user—no `sudo` required!

**4. SELinux Context for Volumes (Linux):**
If you're on a system with SELinux (like Fedora or RHEL), use the `:Z` flag when mounting volumes to automatically set the correct SELinux context:
```bash
podman run -v /host/path:/container/path:Z image-name
```

---

### Conclusion

Podman has proven to be a fantastic tool for my homelab, offering a lean, secure, and performant way to manage containers without the full Docker Desktop footprint. Whether you're running it natively on Linux or via the lightweight VM on macOS/Windows, it provides an excellent container experience with better security defaults and lower resource consumption.

If you're looking for a powerful, daemonless alternative—especially on Linux or for specific use cases on macOS/Windows where you don't need the full Docker ecosystem—I highly recommend giving Podman a try. The learning curve is minimal if you're already familiar with Docker, and the benefits are substantial.

Let me know in the comments if you're using Podman and what your favorite features are! I'd love to hear about your experiences and any tips you've discovered along the way.

**Happy containerizing! 🐳➡️🦭**
