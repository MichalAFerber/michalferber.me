---
layout: post
title: "Custom Linux Welcome Message Guide"
description: "This guide walks you through setting up a personalized welcome message that appears when you log into your terminal or connect via SSH."
tags: [linux, how-to]
comments: true
thumbnail-img: /assets/img/fastfetch.webp
redirect_from:
  - /blog/custom-linux-welcome-message
---

[![fastfetch-cli]({{ "/assets/img/fastfetch.webp" | relative_url | absolute_url }})](https://github.com/fastfetch-cli/fastfetch)

This guide walks you through setting up a personalized welcome message that appears when you log into your terminal or connect via SSH.

You’ll get:

- A full `fastfetch` system overview
- Colored greeting
- Uptime and load average
- Public IP
- Disk usage
- Update check
- Raspberry Pi temperature and throttle status (if applicable)
- Weather for your location
- A custom message ("Whiskey, Tango, Foxtrot!")

<a class="github-button" href="https://github.com/MichalAFerber/welcome-message/archive/HEAD.zip" data-color-scheme="no-preference: light; light: light; dark: dark;" data-size="large" aria-label="Download MichalAFerber/welcome-message on GitHub">Download</a>

### 🔧 Optional One-Step Installer

<script async defer src="https://buttons.github.io/buttons.js"></script>

Want to skip the manual setup?

Just run the installer script directly from the repo:

```bash
curl -s https://raw.githubusercontent.com/MichalAFerber/welcome-message/main/install_welcome.sh | bash
```

✅ You can re-run this any time — it will only update the script if needed

#### Language Support

The installer auto-detects your system language and uses the appropriate template if available.  
Currently supported: **en, es, nl, fr, de**.  
If no matching template is found, it lists all available templates and falls back to English.

To temporarily force a specific language without changing your system locale permanently:

```bash
LANG=fr_FR.UTF-8 LANGUAGE=fr \\
bash <(curl -s https://raw.githubusercontent.com/MichalAFerber/welcome-message/main/install_welcome.sh)
```

## ✅ Step 1: Create the Welcome Script

Create a new script in your home directory:

```bash
nano ~/welcome.sh
```

Paste the following code into the file:

```bash
#!/bin/bash
clear
fastfetch

CYAN="\033[1;36m"
YELLOW="\033[1;33m"
GREEN="\033[1;32m"
RED="\033[1;31m"
NC="\033[0m" # No Color

echo -e "${CYAN}Hello, $USER!${NC}"
echo -e "${YELLOW}Uptime: $(uptime -p) | Load Average: $(cut -d ' ' -f1-3 /proc/loadavg)${NC}"

PUBIP=$(curl -s ifconfig.me)
echo -e "${GREEN}Public IP: $PUBIP${NC}"

echo -e "${CYAN}Disk Usage on /:$(df -h / | awk 'NR==2 {print " " $3 " used of " $2 " (" $5 ")"}')${NC}"

if command -v apt >/dev/null 2>&1; then
    UPDATES=$(apt list --upgradeable 2>/dev/null | grep -v "Listing..." | wc -l)
    if [ "$UPDATES" -gt 0 ]; then
        echo -e "${RED}Updates available: $UPDATES package(s)${NC}"
    else
        echo -e "${GREEN}Your system is up to date.${NC}"
    fi
fi

if [ -f /var/run/reboot-required ]; then
    echo -e "${RED}⚠️  Reboot required!${NC}"
fi

if command -v vcgencmd &>/dev/null; then
    TEMP=$(vcgencmd measure_temp | cut -d= -f2)
    THROTTLED_RAW=$(vcgencmd get_throttled | cut -d= -f2)
    if [ "$THROTTLED_RAW" != "0x0" ]; then
        THROTTLE_STATUS="${RED}Yes ($THROTTLED_RAW)${NC}"
    else
        THROTTLE_STATUS="${GREEN}No${NC}"
    fi
    echo -e "${CYAN}CPU Temp: $TEMP | Throttled: $THROTTLE_STATUS${NC}"
fi

WEATHER=$(curl -s 'wttr.in/Lake+City?format=3')
echo -e "${YELLOW}Weather: $WEATHER${NC}"

echo -e "${YELLOW}You are good to go for Whiskey, Tango, Foxtrot!${NC}"
```

Save and exit the file (`Ctrl+O`, `Enter`, then `Ctrl+X`).
Make it executable:

```bash
chmod +x ~/welcome.sh
```

## ⚙️ Step 2: Run Script on Terminal Login

Add it to your shell’s startup config.

### 🔹 For Zsh (default on Kali, macOS)

```bash
echo -e '\nif [ -x "$HOME/welcome.sh" ]; then\n "$HOME/welcome.sh"\nfi' >> ~/.zshrc
```

### 🔹 For Bash

```bash
echo -e '\nif [ -x "$HOME/welcome.sh" ]; then\n    "$HOME/welcome.sh"\nfi' >> ~/.bashrc
```

Then apply the changes:

```bash
source ~/.zshrc   # or ~/.bashrc depending on your shell
```

## 🌍 Optional: System-Wide Setup (for All Users)

To show the welcome message for every user on the system, copy the script to `/etc/profile.d/`:

```bash
sudo cp ~/welcome.sh /etc/profile.d/welcome.sh 
sudo chmod +x /etc/profile.d/welcome.sh
```

It will run for any interactive login shell across all users.

## 🔌 Step 3: Install Required Packages

Install the needed tools:

### Debian/Ubuntu/Kali

```bash
sudo apt update sudo apt install fastfetch curl libraspberrypi-bin
```

### Fedora

```bash
sudo dnf install fastfetch curl libraspberrypi-tools
```

### Arch

```bash
sudo pacman -Sy fastfetch curl raspberrypi-firmware
```

## 🧪 Step 4: Test It

Simply run:

```bash
~/welcome.sh
```

Or open a new terminal or SSH session to see the welcome message in action.

## 🧠 Notes

- The update check and reboot prompt only work on Debian-based systems.

- Raspberry Pi-specific temp/throttle requires `vcgencmd` (from `libraspberrypi-bin`).

- Change the weather location in the script (`Lake+City`) to match your area or use IP-based geolocation.

- You can customize the colors, messages, or add even more functionality (like Docker container status, CPU graph, etc.).

- **Smarter Updates, No Hashes**

    The installer no longer relies on hardcoded hashes. It automatically compares the contents of your existing `~/welcome.sh` with the latest version and only replaces it when needed. This makes the script fully idempotent — safe to run as often as you like, without losing custom edits unless there's a real update.

## 🆕 August 2025 Update

- Added Dutch, French, and German templates
- Automatic language detection with template listing and fallback
- Fastfetch installs even on Ubuntu 24.04 ARM and Raspberry Pi
- Fully safe to rerun any time (idempotent installer)

## 🎉 Result Example

```bash
Hello, michal!
Uptime: up 3 hours, 2 minutes | Load Average: 0.15 0.10 0.08
Public IP: 75.176.xxx.xxx
Disk Usage on /: 13G used of 58G (22%)
Updates available: 3 package(s)
CPU Temp: 43.8°C | Throttled: No
Weather: Lake City: 🌤 +91°F
You are good to go for Whiskey, Tango, Foxtrot!
```

![Custom Linux terminal welcome message example]({{ "/assets/img/welcome-message.webp" | relative_url | absolute_url }})

Enjoy your custom login experience, Commander. 🛫
