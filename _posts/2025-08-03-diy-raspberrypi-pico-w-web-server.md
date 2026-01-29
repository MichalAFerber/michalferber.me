---
layout: post
date: 2025-08-03 00:00:00 +0000
title: "DIY Raspberry Pi Pico W Web Server"
subtitle: Learn how to host a simple web page from your Raspberry Pi Pico W using MicroPython and Wi-Fi.
tags: [raspberry pi pico w, web server, micropython, diy, iot, wifi]
comments: true
style: fill
color: primary
thumbnail-img: /assets/img/raspberry-pi-pico-web-server.jpg
---

![Pico Web Server]({{ "/assets/img/raspberry-pi-pico-web-server.jpg" | relative_url | absolute_url }})

By connecting the **Raspberry Pi Pico W** to your local Wi-Fi network, you can host a small web interface accessible from any device on the same network. While it won’t be as full-featured as a LAMP server on a full Raspberry Pi, it’s perfect for controlling LEDs, reading sensor data, or serving static pages.

## 🧰 What You’ll Need

- **Raspberry Pi Pico W or Pico WH** — Built-in Wi-Fi makes this project possible  
  *(If using a regular Pico, you’ll need an ESP8266/ESP32 Wi-Fi module)*
- **MicroPython firmware** — Comes with networking libraries for quick setup
- **A computer or Raspberry Pi** — For coding and testing
- **Optional sensors or LEDs** — For interactive web pages (e.g., temperature/humidity sensors like DHT22)

## 🛠 Step-by-Step Instructions

### 1. Install MicroPython

Follow the [official guide](https://www.raspberrypi.com/documentation/microcontrollers/micropython.html) to install MicroPython on your Pico W.

### 2. Connect to Wi-Fi

Use the built-in `network` module to connect your Pico W to your local Wi-Fi network.

### 3. Create the Web Server Script

Below is a simple MicroPython script that hosts a **Hello, World!** page:

```python
import network
import socket
import time

# Connect to Wi-Fi
ssid = 'Your_WiFi_Name'
password = 'Your_WiFi_Password'

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)

# Wait for connection
print("Connecting to Wi-Fi...")
while not wlan.isconnected():
    time.sleep(1)

print("Connected to Wi-Fi!")
print("IP Address:", wlan.ifconfig()[0])

# HTML content for the webpage
html = """<!DOCTYPE html>
<html>
<head>
<title>Pico Web Server</title>
</head>
<body style="background-color: #f0f8ff; color: #333; font-family: Arial, sans-serif; text-align: center; padding: 20px;">
<h1 style="color: #4CAF50;">Hello, World!</h1>
<p style="font-size: 18px;">Welcome to your Raspberry Pi Pico W web server.</p>
<p style="font-style: italic; color: #555;">This page is served directly from your Pico W!</p>
</body>
</html>"""

# Set up the socket server
addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]
server = socket.socket()
server.bind(addr)
server.listen(1)
print("Listening on", addr)

# Serve the webpage
while True:
    conn, addr = server.accept()
    print('Client connected from', addr)
    request = conn.recv(1024)
    conn.send('HTTP/1.0 200 OK\r\nContent-type: text/html\r\n\r\n')
    conn.send(html)
    conn.close()
```

## 💡 Tips

- **Same Network** — The Pico W and the device accessing it must be on the same Wi-Fi network.
- **Enhancements** — Add sensor readings (e.g., DHT22 temperature/humidity) to your HTML page for a live dashboard.
- **Security** — For public networks, consider adding password protection or restricting access.

## ✅ Conclusion

Hosting a web page from your Raspberry Pi Pico W is a fun and practical way to learn about IoT and MicroPython. Whether you’re controlling LEDs or displaying sensor data, this project provides a great foundation for more advanced Pico W applications.
