---
layout: post
title: "Flight Tracking from My Backyard: Running an ADS-B Feeder on a Raspberry Pi"
description: "How I turned a Raspberry Pi and a cheap SDR dongle into a flight tracking station — feeding three networks, getting free premium subscriptions, and spotting military aircraft near my home."
tags: [homelab, raspberry-pi, adsb, aviation, sdr, flight-tracking]
comments: true
thumbnail-img: /assets/img/adsbexchange.webp
---

![ADSB Exchange Feed Client]({{ "/assets/img/adsbexchange.webp" | relative_url | absolute_url }})

# Flight Tracking from My Backyard: Running an ADS-B Feeder on a Raspberry Pi

There's something deeply satisfying about watching aircraft cross your local sky and knowing exactly what they are, where they're going, and how fast they're moving — all from a $35 Raspberry Pi sitting on a shelf.

I started my ADS-B feeding journey with ADSBexchange, mostly out of curiosity. I'd been reading about software-defined radio (SDR) and realized that for about $25, I could pick up an RTL-SDR dongle and start receiving the ADS-B transponder signals that commercial aircraft broadcast on 1090 MHz. Within an hour of plugging everything in, I had a live map of aircraft within 200 nautical miles of my house in Florence, SC. I was hooked.

Then I realized I could feed the same data to FlightRadar24 and FlightAware simultaneously — and that's when things got really interesting.

## What is ADS-B?

ADS-B (Automatic Dependent Surveillance-Broadcast) is a surveillance technology where aircraft broadcast their GPS position, altitude, speed, and identification in real time. Unlike traditional radar, ADS-B doesn't require ground-based rotating antennas to detect aircraft — the planes voluntarily transmit their position, and anyone with the right receiver can pick it up.

Every commercial flight, most private aircraft, and many military planes broadcast ADS-B signals on 1090 MHz. With an inexpensive SDR receiver and an antenna, you can capture these signals from your home and see exactly what's flying overhead.

## My Setup

The hardware is remarkably simple:

- **Raspberry Pi 3B+** — more than enough power for this workload
- **RTL-SDR dongle** (RTL2832U/R820T chipset) — a $25 USB receiver
- **1090 MHz antenna** — the stock antenna works, but a purpose-built ADS-B antenna improves range significantly
- **SD card and power supply** — standard Pi accessories

The Pi sits near a window with the antenna positioned as high as possible for clear line of sight to the sky. From my location near Florence Regional Airport (KFLO) at about 75 feet elevation, I typically see aircraft out to 200–250 nautical miles at cruising altitude.

## Feeding Three Networks from One Pi

The real magic is that a single SDR dongle can feed multiple flight tracking networks simultaneously. My Pi runs three services:

### ADSBexchange

This is where I started, and it remains my favorite network. ADSBexchange is community-driven and unfiltered — unlike commercial trackers, it doesn't hide military or government aircraft. It runs on **readsb**, which decodes the raw 1090 MHz signals into usable data and serves a beautiful local map via the tar1090 web interface.

What really sets ADSBexchange apart for me is the **alert system**. I have an alert configured to notify me whenever a military-type aircraft comes within 10 nautical miles of my location. Living in South Carolina, I see everything from C-17 Globemasters out of Charleston to the occasional fighter jet or helicopter training flight. Getting a ping on my phone that a military transport is overhead and then walking outside to see it — that never gets old.

### FlightRadar24

FR24 is the most popular flight tracking platform in the world, and feeding it is as simple as running their installer script. The local status page on port 8754 shows your connection health and aircraft count in real time.

### FlightAware

FlightAware runs on **piaware**, their dedicated feeder software, alongside **dump1090-fa** for a local map view. Their stats page shows your feeder's performance over time — message rates, aircraft count, position accuracy.

All three services run simultaneously without conflict. The SDR dongle captures the raw radio data once, and readsb shares that decoded data with FR24 and piaware through local network ports.

**One tip:** If you're feeding multiple networks, disable MLAT (multilateration) on FlightRadar24 to avoid conflicts with ADSBexchange and FlightAware's MLAT calculations.

## Free Premium Subscriptions: The Best Perk

Here's something many people don't know: **feeding data to these networks earns you free premium subscriptions** to their tracking websites.

- **FlightAware** gives feeders a free Enterprise account (normally $899/year) as long as your feeder stays online
- **FlightRadar24** gives feeders a free Business subscription (normally $499/year) with full access to all features
- **ADSBexchange** is free for everyone, but feeders get priority access and recognition in the community

That's over $1,300/year in subscription value from a setup that cost less than $80 in hardware. You get features like extended flight history, detailed aircraft information, airport statistics, and alerts — all for contributing data you're already collecting.

## The Joy of Flight Tracking

I'll be honest — I didn't expect this hobby to stick. I figured I'd set it up, look at it for a week, and move on. But there's something genuinely compelling about watching the sky come alive with data.

On a typical evening, I'll pull up the tar1090 map and see 50–100 aircraft in range. Some are routine — the regional jets flying in and out of Florence, the FedEx and UPS cargo flights on their overnight routes. But then you catch something unexpected: a medical helicopter on an emergency run, a military C-130 doing low-altitude training, or an unusual routing that suggests weather diversions somewhere up the coast.

The military alert on ADSBexchange adds another layer. When that notification fires, I know something interesting is in my airspace. Sometimes it's routine — Shaw Air Force Base isn't far away. Other times it's something you'd never notice without ADS-B: a refueling tanker holding a pattern at altitude, or a Coast Guard aircraft running along the coast.

It connects you to the activity overhead in a way that just looking up never could.

## Quick Setup Guide

If you want to get started, here's the path I'd recommend:

### 1. Start with ADSBexchange

They have a comprehensive setup script that installs readsb and tar1090 in one shot. This gets your SDR decoding and gives you a local map immediately.

### 2. Add FlightRadar24

```bash
wget -qO- https://fr24.com/install.sh | sudo bash -s
```

Follow the signup prompts. Disable MLAT if feeding other networks.

### 3. Add FlightAware

Install the FlightAware repository and piaware package:

```bash
wget https://www.flightaware.com/adsb/piaware/files/packages/pool/piaware/f/flightaware-apt-repository/flightaware-apt-repository_1.2_all.deb
sudo dpkg -i flightaware-apt-repository_1.2_all.deb
sudo apt update && sudo apt install -y piaware dump1090-fa
```

### 4. Verify All Services

```bash
sudo systemctl status readsb fr24feed piaware
```

All three should show `active (running)`. Your local map is at `http://<your-pi-ip>/tar1090/`.

## Monitoring Your Feeder

Each network provides web interfaces to check your feeder's health:

| Network | Local Interface | Remote Stats |
|---------|----------------|--------------|
| ADSBexchange | `http://<pi-ip>/tar1090/` | [adsbexchange.com/myip](https://adsbexchange.com/myip) |
| FlightRadar24 | `http://<pi-ip>:8754` | FlightRadar24 dashboard |
| FlightAware | `http://<pi-ip>/dump1090-fa/` | [FlightAware stats page](https://www.flightaware.com/adsb/stats/) |

## Optimizing Range

A few things I've learned about getting the most out of your setup:

- **Antenna height matters more than anything.** Even moving it a few feet higher can dramatically improve range
- **Keep it away from metal objects** and electronics that generate interference
- **Experiment with SDR gain settings** — auto gain is a good starting point, but manual tuning (try 36–48) can improve reception in your specific environment
- **A purpose-built 1090 MHz antenna** is the single best upgrade you can make over the stock SDR antenna

From my spot at 75 feet elevation, I consistently see aircraft at cruise altitude 200+ nautical miles out. At lower altitudes (10,000 feet), coverage drops to about 150 nautical miles, and ground-level coverage is limited to line of sight — roughly 10–15 miles.

## Maintenance

The feeder is remarkably low-maintenance. I check the web interfaces weekly to confirm all three services are reporting, run `sudo apt update && sudo apt upgrade` monthly, and back up the configuration files quarterly:

```bash
sudo cp /etc/fr24feed.ini ~/backups/
sudo cp /etc/piaware.conf ~/backups/
sudo cp /etc/default/readsb ~/backups/
```

The biggest risk is SD card failure — keep a backup of your config files and you can rebuild the whole setup in about two hours.

## Resources

- [ADSBexchange](https://www.adsbexchange.com/) — Community-driven, unfiltered tracking
- [FlightRadar24](https://www.flightradar24.com/) — World's most popular flight tracker
- [FlightAware](https://www.flightaware.com/) — Flight tracking with deep airline data
- [RTL-SDR.com](https://www.rtl-sdr.com/) — SDR community and tutorials
- [r/ADSB](https://www.reddit.com/r/ADSB/) — Active Reddit community

If you've got a spare Raspberry Pi collecting dust, this is one of the most rewarding projects you can put it to work on. The setup takes an afternoon, the hardware costs less than dinner for two, and you end up with free premium subscriptions and a window into everything flying over your corner of the world.

*Running a feeder or thinking about starting one? Drop a comment below — I'd love to hear about your setup.*
