---
layout: post
title: "Install and Automate Ookla Speedtest CLI on Ubuntu"
description: "Using the Ookla Speedtest CLI to perform speedtest"
tags: [raspberry-pi, linux, how-to, ubuntu, speedtest, networking, cli, automation]
comments: true
thumbnail-img: /assets/img/ookla-cli.webp
redirect_from:
  - /blog/ubuntu-speedtest-cli
---

[![Ookla-cli]({{ "/assets/img/ookla-cli.webp" | relative_url | absolute_url }})](https://www.speedtest.net/apps/cli)

The **Ookla Speedtest CLI** lets you run the same speedtest.net benchmarks directly from your terminal. Perfect for servers or automated monitoring.

## Install the Ookla CLI

For Ubuntu 24.x/25.x, the **standalone binary** is the easiest:

```bash
cd ~
curl -LO https://install.speedtest.net/app/cli/ookla-speedtest-1.2.0-linux-x86_64.tgz # See Note
tar xvf ookla-speedtest-*-linux-x86_64.tgz
sudo mv speedtest /usr/local/bin/
```

### Note

- Download the version supported for your operating system.
  - **i386** <https://install.speedtest.net/app/cli/ookla-speedtest-1.2.0-linux-i386.tgz>
  - **x86_64** <https://install.speedtest.net/app/cli/ookla-speedtest-1.2.0-linux-x86_64.tgz>
  - **armel** <https://install.speedtest.net/app/cli/ookla-speedtest-1.2.0-linux-armel.tgz>
  - **armhf** <https://install.speedtest.net/app/cli/ookla-speedtest-1.2.0-linux-armhf.tgz>
  - **aarch64** <https://install.speedtest.net/app/cli/ookla-speedtest-1.2.0-linux-aarch64.tgz>

## Run a Test

```bash
speedtest
```

On first run, type `YES` to accept the license. Sample output:

```bash
   Speedtest by Ookla

      Server: Spectrum - Durham, NC (id: 58326)
         ISP: Spectrum
    Latency: 15.01 ms
   Download: 935.55 Mbps
     Upload: 37.42 Mbps
```

![Ookla Speedtest CLI installation and usage output on Ubuntu]({{ "/assets/img/ookla_cli_install_and_use.webp" | relative_url | absolute_url }})

## Automating with Cron

Create a script `/usr/local/bin/log-speedtest.sh`:

```bash
#!/bin/bash
timestamp=$(date '+%Y-%m-%d %H:%M:%S')
result=$(speedtest --accept-license --accept-gdpr --format=tsv)
echo "$timestamp  $result" >> /var/log/speedtest.log
```

Make it executable:

```bash
sudo chmod +x /usr/local/bin/log-speedtest.sh
```

Add to cron:

```bash
sudo crontab -e
```

Example (run daily at 8 AM):

```bash
0 8 * * * /usr/local/bin/log-speedtest.sh
```

## View Logs

```bash
cat /var/log/speedtest.log
```

## Conclusion

With the Ookla CLI, you can track and log your network performance automatically—without a browser.
