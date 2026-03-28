---
layout: post
title: "Donetick: A Lightweight Self-Hosted Task Manager for Your Homelab"
description: "How I set up Donetick — a self-hosted chore and task manager — on Docker with SQLite, SSE realtime updates, and API automation."
tags: [homelab, self-hosted, docker, task-management, productivity]
comments: true
thumbnail-img: /assets/img/donetick.webp
---

![Donetick Logo]({{ "/assets/img/donetick.webp" | relative_url | absolute_url }})

# Donetick: A Lightweight Self-Hosted Task Manager for Your Homelab

If you've been looking for a simple, self-hosted task and chore manager that doesn't require a cloud subscription or a sprawling tech stack, Donetick is worth a look. It's a clean, lightweight application that runs in a single Docker container with SQLite — no external database server, no complex dependencies, no ongoing costs.

I've been running it in my homelab alongside the rest of my Docker stack, and it's become the go-to tool for tracking recurring household chores and tasks. It's not trying to be Jira or Notion — it's focused on one thing: helping you and your household keep track of what needs to get done and when.

## What is Donetick?

Donetick is an open-source task and chore management application designed for self-hosting. It supports:

- **Recurring tasks** with flexible scheduling (daily, weekly, custom intervals)
- **Multiple users** with "Circles" for shared household task management
- **Realtime updates** via Server-Sent Events (SSE) or WebSockets
- **A clean web UI** that works well on desktop and mobile browsers
- **A REST API** for automation and scripting

It stores everything in a single SQLite database file, which makes backups dead simple — just copy one file.

## Why Self-Host a Task Manager?

You might be wondering why I'd bother self-hosting something as simple as a to-do list. Fair question. Here's my reasoning:

- **No subscriptions** — Todoist, Asana, and similar tools all eventually push you toward a paid plan
- **Data ownership** — my task history stays on my server, not on someone else's cloud
- **API access** — I can script against it, integrate it with my other homelab services, and automate task completion
- **It's lightweight** — Donetick uses minimal resources, making it perfect for a Pi or a small VM

## Setting It Up

The setup is straightforward. Donetick runs as a single Docker container with two bind mounts: one for configuration and one for data.

### Folder Structure

```bash
~/donetick/
├── docker-compose.yml
├── config/
│   └── selfhosted.yaml
└── data/
    └── donetick.db
```

### Docker Compose

```yaml
services:
  donetick:
    image: donetick/donetick
    container_name: donetick
    restart: unless-stopped
    ports:
      - "2021:2021"
    volumes:
      - ./data:/donetick-data
      - ./config:/config
      - /usr/share/zoneinfo:/usr/share/zoneinfo:ro
    environment:
      - DT_ENV=selfhosted
      - DT_SQLITE_PATH=/donetick-data/donetick.db
      - DT_PUBLIC_URL=http://<YOUR-IP>:2021
    user: "1000:1000"
```

The timezone bind mount (`/usr/share/zoneinfo`) ensures Donetick schedules recurring tasks correctly for your local time. Without it, everything defaults to UTC.

### Configuration

Create `config/selfhosted.yaml` with your settings:

```yaml
name: "selfhosted"
is_done_tick_dot_com: false

database:
  type: "sqlite"
  migration: true

jwt:
  secret: "generate-a-long-random-string-here"
  session_time: 168h
  max_refresh: 168h

server:
  port: 2021
  serve_frontend: true
  cors_allow_origins:
    - "https://your-domain.tld"
    - "https://localhost"

logging:
  level: "info"
  encoding: "json"

realtime:
  enabled: true
  sse_enabled: true
  websocket_enabled: false
  heartbeat_interval: 60s
  connection_timeout: 120s
  max_connections: 1000
  enable_compression: true
```

**Important:** Generate a real random string for the JWT secret. Don't use the default.

### Start It Up

```bash
docker compose up -d
docker compose logs -f
```

You should see `Real-time service started` and `SSE connection established` in the logs. The web UI is now available at `http://<your-ip>:2021`.

## SSE vs WebSockets: Keep It Simple

Donetick supports both Server-Sent Events (SSE) and WebSockets for realtime updates. My recommendation: **stick with SSE** unless you have a specific reason to use WebSockets.

SSE works over standard HTTP, which means it plays nicely with reverse proxies like Nginx Proxy Manager without any special configuration. WebSockets require `Upgrade` and `Connection` headers in your proxy config, and getting them wrong leads to frustrating debugging sessions with browser console errors like `ws:///api/v1/realtime/ws`.

If you're running behind a reverse proxy with HTTPS and want WebSockets later, you can flip `websocket_enabled: true` in the config and add the appropriate proxy headers. But SSE is stable and plenty for realtime UI updates.

## Automating with the API

One of Donetick's best features is its REST API. You can authenticate with JWT tokens and manage tasks programmatically.

### Get a Token

```bash
TOKEN=$(curl -s -X POST 'http://<your-ip>:2021/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"username":"your-user","password":"your-pass"}' | jq -r '.token')
```

### List Your Chores

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  'http://<your-ip>:2021/api/v1/chores' | jq .
```

### Mark a Chore Done

```bash
curl -i -X POST \
  -H "Authorization: Bearer $TOKEN" \
  'http://<your-ip>:2021/api/v1/chores/<CHORE-ID>/do'
```

This opens up possibilities for automation — mark tasks complete from scripts, integrate with Home Assistant, or build custom dashboards that pull from the API.

## Backup Strategy

Since everything lives in a single SQLite file, backups are trivial:

```bash
docker stop donetick
cp ~/donetick/data/donetick.db ~/backups/donetick.db.bak-$(date +%F)
docker start donetick
```

I run this weekly as a cron job. The database file is typically small (a few MB), so it's easy to include in your regular backup rotation.

## Troubleshooting

A few issues I've run into and their fixes:

**401 "auth header is invalid"** — Your JWT token expired. Re-run the login command to get a fresh token. The default session time is 168 hours (7 days).

**400 when completing a chore** — This usually means the chore is missing an "open" history row in the database. You can fix it by cloning the chore in the UI, or by inserting the missing row directly in SQLite.

**Browser shows WebSocket errors** — If you're using SSE mode but the browser is trying to connect via WebSocket, clear the client-side overrides in your browser's DevTools console:

```js
Object.keys(localStorage).forEach(k => {
  if (k.startsWith('realtime.')) localStorage.removeItem(k);
});
location.reload();
```

## Putting It Behind a Reverse Proxy

If you're running Nginx Proxy Manager (or similar), Donetick works great behind HTTPS with SSE mode. Just point a proxy host at your Donetick container on port 2021 — no special configuration needed since SSE uses standard HTTP.

If you later enable WebSockets, add these custom NGINX directives to your proxy host:

```
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

## Final Thoughts

Donetick fills a specific niche really well: it's a no-fuss, self-hosted task manager that's easy to deploy, easy to back up, and easy to automate. It's not going to replace a full project management platform, but for tracking household chores, recurring maintenance tasks, and simple to-do lists, it's exactly the right amount of tool.

The single SQLite database means there's one file to back up. The Docker container means there's one service to manage. The REST API means you can script anything. And the whole thing runs on resources you'd barely notice on even the smallest homelab server.

If you're already running Docker in your homelab, adding Donetick takes about 10 minutes. Give it a try.

*Using Donetick or a similar self-hosted task manager? Share your setup in the comments below.*
