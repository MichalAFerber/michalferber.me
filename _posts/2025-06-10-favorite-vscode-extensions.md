---
layout: post
date: 2025-06-10 00:00:00 +0000
title: My Favorite VS Code Extensions
subtitle: A comprehensive list of my favorite VS Code extensions grouped by category, with links, descriptions, and examples of how to use them.
tags: [VS Code, Extensions, Productivity, Development]
comments: true
style: fill
color: primary
thumbnail-img: /assets/img/visual_studio_code.jpg
---

![Visual Studio Code]({{ "/assets/img/visual_studio_code.jpg" | relative_url | absolute_url }})

After 30+ years in IT and spending countless hours inside VS Code, I’ve curated a set of extensions that truly make a difference in productivity, coding quality, and workflow.  
This post groups them by category, links directly to the Visual Studio Marketplace, and includes a one-liner description and a simple example of how to use each.

## 🐘 PHP

- [Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client) – PHP language support with IntelliSense and type checking.  
  *How to use:* Open a PHP file and start typing—Intelephense provides autocompletion, error detection, and symbol navigation.

## 🤖 AI & GitHub

- [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=github.copilot) – AI-powered code suggestions.  
  *How to use:* Start typing inside a supported language file; Copilot will suggest completions inline (Tab to accept).
- [GitHub Copilot Chat](https://marketplace.visualstudio.com/items?itemName=github.copilot-chat) – AI-powered chat for coding help.  
  *How to use:* Open the **Copilot Chat** view in VS Code and ask coding-related questions.

## ⚙️ .NET & C`&num;`

- [.NET Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit) – Build and debug .NET applications.  
  *How to use:* Open a .NET solution; debugging and IntelliSense are automatically enabled.
- [.NET Pack](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.vscode-dotnet-pack) – Adds .NET workload packs for additional functionality.  
  *How to use:* Automatically works with .NET Dev Kit; no manual steps.
- [.NET Runtime](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.vscode-dotnet-runtime) – Ensures the required runtime is available in VS Code.  
  *How to use:* Required by some extensions; managed automatically.
- [C#](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp) – Core C# support.  
  *How to use:* Open a .cs file and use IntelliSense, debugging, and code navigation features.
- [IntelliCode for C#](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.vscodeintellicode-csharp) – AI-powered completions for C#.  
  *How to use:* Begin typing C# code; IntelliCode improves completion suggestions.

## 📄 Data & Config

- [JSON Tools](https://marketplace.visualstudio.com/items?itemName=eriklynd.json-tools) – Format, sort, and validate JSON.  
  *How to use:* Right-click a JSON file and select **Format JSON**.
- [XML Tools](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-xml) – XML syntax support and validation.  
  *How to use:* Open XML files for IntelliSense and schema validation.
- [YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) – YAML syntax support and validation.  
  *How to use:* Open a YAML file for structure-aware editing and linting.

## 🛠 Productivity & Coding Essentials

- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) – Highlights errors/warnings inline.  
  *How to use:* Open a file; issues appear directly next to the code.
- [Minify](https://marketplace.visualstudio.com/items?itemName=hookyqr.minify) – Minify JS, CSS, and HTML files.  
  *How to use:* Right-click a file → **Minify**.
- [Prettier - Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) – Consistent code formatting.  
  *How to use:* Right-click → **Format Document** or enable format-on-save.
- [Todo Tree](https://marketplace.visualstudio.com/items?itemName=gruntfuggly.todo-tree) – Search and organize TODO comments.  
  *How to use:* Open the **TODO Tree** panel to see all TODOs in your workspace.

## 🎨 Themes

- [Dracula Theme](https://marketplace.visualstudio.com/items?itemName=dracula-theme.theme-dracula) – Popular dark theme.  
  *How to use:* Install and select in **Preferences → Color Theme → Dracula**.

## 🐍 Python & Data

- [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) – Python language support.  
  *How to use:* Open a `.py` file and run scripts with the Python extension.
- [Pylance](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance) – Fast IntelliSense for Python.  
  *How to use:* Installed automatically with Python; provides type checking and code completion.
- [Python Debugger](https://marketplace.visualstudio.com/items?itemName=ms-python.debugpy) – Debug Python applications.  
  *How to use:* Add breakpoints and press **F5** to start debugging.
- [Python Environments](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-python-envs) – Manage Python interpreters.  
  *How to use:* Use **Python: Select Interpreter** from the Command Palette.

## 📝 Markdown & Documentation

- [Dictionary Completion](https://marketplace.visualstudio.com/items?itemName=yzhang.dictionary-completion) – Suggest dictionary words.  
  *How to use:* Start typing in text files; dictionary completions appear.
- [Front Matter CMS](https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-front-matter) – Manage blog front matter.  
  *How to use:* Open a markdown file with front matter; a panel opens to edit metadata.
- [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) – Enhancements for markdown editing.  
  *How to use:* Use shortcuts like **Ctrl+B** for bold, **Ctrl+Shift+V** for preview.
- [markdownlint](https://marketplace.visualstudio.com/items?itemName=davidanson.vscode-markdownlint) – Markdown linter.  
  *How to use:* Linting runs automatically as you edit markdown files.

## 🌐 Web Development & Styling

- [Bootstrap IntelliSense](https://marketplace.visualstudio.com/items?itemName=hossaini.bootstrap-intellisense) – Autocomplete for Bootstrap classes.  
  *How to use:* In HTML, start typing class names and Bootstrap suggestions appear.
- [CSS Peek](https://marketplace.visualstudio.com/items?itemName=pranaygp.vscode-css-peek) – Jump to CSS definitions.  
  *How to use:* Ctrl+click on a class or ID to open its CSS definition.
- [HTML CSS Support](https://marketplace.visualstudio.com/items?itemName=ecmel.vscode-html-css) – IntelliSense for HTML and CSS.  
  *How to use:* Start typing class names in HTML; suggestions appear from your CSS files.
- [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.liveserver) – Launch a local dev server.  
  *How to use:* Right-click on an HTML file → **Open with Live Server**.

## Keep Your Extensions and Settings in Sync

One of the best features of VS Code is **Settings Sync**, which ensures that your extensions, settings, themes, keybindings, and snippets follow you across devices. This is a huge time-saver when setting up a new machine.

### How to Enable Sync

1. Open VS Code.
2. Click the **gear icon (⚙️)** in the lower-left corner.
3. Select **Turn On Settings Sync…**
4. Sign in with either your **GitHub** or **Microsoft** account.
5. Choose what to sync:
   - Settings
   - Keybindings
   - Extensions
   - UI State
   - Snippets

After enabling sync, your extensions and settings will automatically download whenever you sign into VS Code on another machine.

**Pro Tip:**  
If you’re migrating to a new machine, install VS Code, log in with the same account, and everything—including your extensions from this list—will be restored automatically.

## Why these extensions?

- These extensions make VS Code a **more powerful, efficient, and enjoyable coding environment**.  
- They handle everything from linting and formatting to live previews, version control, AI-powered completions, and cloud-based development.  
- Whether you’re a full-stack developer, a blogger, or just coding as a hobby, this set can save time and make coding more enjoyable.

What are your favorite extensions? Did I miss any must-haves?
