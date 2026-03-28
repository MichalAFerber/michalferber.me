---
layout: post
title: "Automating Docker Compose Updates: A Simple Shell Script for Homelab Management"
description: "Managing multiple Docker Compose services can be tedious. Here's how I automated the update process with a single shell script that handles all my containers intelligently."
tags: [docker, automation, homelab, shell-scripting, devops]
comments: true
thumbnail-img: /assets/img/docker-compose.webp
---

![Docker Compose Logo]({{ "/assets/img/docker-compose.webp" | relative_url | absolute_url }})

# Automating Docker Compose Updates: A Simple Shell Script for Homelab Management

If you're running a homelab with multiple Docker Compose services, you know the drill: checking for updates, pulling new images, restarting containers, and repeating this process for each service. It's tedious, time-consuming, and frankly, boring work that begs to be automated.

I run about a dozen Docker Compose services on my Ubuntu server—everything from Uptime Kuma for monitoring to Nginx Proxy Manager for reverse proxy duties. Each service sits in its own directory with its own `docker-compose.yml` file. Keeping them all updated manually? No thanks.

So I built a shell script that does it all automatically. And because I believe in the principle of "test before you execute," I added a dry-run mode so you can preview changes before committing to them.

## The Problem

Here's what my home directory looks like:

```bash
~/apprise/
~/bentopdf/
~/donetick/
~/homebox/
~/it-tools/
~/mp3-player/
~/nginx/
~/npm/
~/omni-tools/
~/speedtest/
~/uptime-kuma/
~/vert/
```

Each directory contains a `docker-compose.yml` file that defines one or more services. To update them all manually, I'd need to:

1. `cd` into each directory
2. Run `docker compose pull` to get the latest images
3. Run `docker compose up -d` to restart with new images
4. Repeat for every single service

That's 36+ commands for 12 services. And that's assuming nothing goes wrong.

## The Solution

I created a bash script that automates the entire process. It loops through every directory in my home folder, checks for a `docker-compose.yml` file, and if found, pulls the latest images and restarts the containers.

Here's the complete script:

```bash
#!/bin/bash

# Docker Compose Update Script
# Updates images and restarts containers for all docker-compose.yml projects

set -euo pipefail

# Configuration
LOG_FILE="${HOME}/docker-update-$(date +%Y%m%d-%H%M%S).log"
BASE_DIR="${HOME}"
DRY_RUN=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run|-n)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run, -n    Show what would be updated without making changes"
            echo "  --help, -h       Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0              # Update all Docker Compose projects"
            echo "  $0 --dry-run    # Preview updates without making changes"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Logging functions
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓ $*${NC}" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗ $*${NC}" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠ $*${NC}" | tee -a "${LOG_FILE}"
}

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ $*${NC}" | tee -a "${LOG_FILE}"
}

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    log_error "Neither 'docker-compose' nor 'docker compose' command found"
    exit 1
fi

# Determine which compose command to use
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Header
if [[ "${DRY_RUN}" == true ]]; then
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}DRY RUN MODE - No changes will be made${NC}"
    echo -e "${BLUE}=========================================${NC}"
    echo ""
fi

log "Starting Docker Compose update process"
[[ "${DRY_RUN}" == true ]] && log_info "Running in DRY RUN mode"
log "Using compose command: ${COMPOSE_CMD}"
log "Log file: ${LOG_FILE}"
echo ""

# Counter variables
TOTAL_PROCESSED=0
SUCCESSFUL_UPDATES=0
FAILED_UPDATES=0
SKIPPED=0

# Loop through all directories in home
for dir in "${BASE_DIR}"/*/ ; do
    # Remove trailing slash
    dir=${dir%/}
    dir_name=$(basename "${dir}")
    
    # Skip if not a directory
    if [[ ! -d "${dir}" ]]; then
        continue
    fi
    
    # Check for docker-compose.yml or docker-compose.yaml
    if [[ -f "${dir}/docker-compose.yml" ]] || [[ -f "${dir}/docker-compose.yaml" ]]; then
        COMPOSE_FILE="${dir}/docker-compose.yml"
        [[ -f "${dir}/docker-compose.yaml" ]] && COMPOSE_FILE="${dir}/docker-compose.yaml"
        
        log "Processing: ${dir_name}"
        TOTAL_PROCESSED=$((TOTAL_PROCESSED + 1))
        
        # Change to directory
        cd "${dir}" || {
            log_error "Failed to change to directory: ${dir}"
            FAILED_UPDATES=$((FAILED_UPDATES + 1))
            continue
        }
        
        if [[ "${DRY_RUN}" == true ]]; then
            # Dry run mode - just show what would happen
            log_info "  Would pull latest images for:"
            
            # Extract image names from docker-compose file
            if command -v yq &> /dev/null; then
                # Use yq if available for better parsing
                images=$(yq eval '.services.*.image' "${COMPOSE_FILE}" 2>/dev/null | grep -v "^null$" || true)
            else
                # Fallback to grep
                images=$(grep -E "^\s*image:" "${COMPOSE_FILE}" | sed 's/.*image:\s*//' | tr -d '"' || true)
            fi
            
            if [[ -n "${images}" ]]; then
                echo "${images}" | while IFS= read -r image; do
                    [[ -n "${image}" ]] && log_info "    - ${image}"
                done
            else
                log_warning "    Could not parse images from compose file"
            fi
            
            log_info "  Would restart containers"
            SUCCESSFUL_UPDATES=$((SUCCESSFUL_UPDATES + 1))
        else
            # Normal mode - actually update
            log "  Pulling latest images..."
            if ${COMPOSE_CMD} pull 2>&1 | tee -a "${LOG_FILE}"; then
                log_success "  Images pulled successfully"
                
                # Restart containers
                log "  Restarting containers..."
                if ${COMPOSE_CMD} up -d 2>&1 | tee -a "${LOG_FILE}"; then
                    log_success "  Containers restarted successfully"
                    SUCCESSFUL_UPDATES=$((SUCCESSFUL_UPDATES + 1))
                else
                    log_error "  Failed to restart containers"
                    FAILED_UPDATES=$((FAILED_UPDATES + 1))
                fi
            else
                log_error "  Failed to pull images"
                FAILED_UPDATES=$((FAILED_UPDATES + 1))
            fi
        fi
        
        echo ""
    fi
done

# Return to base directory
cd "${BASE_DIR}"

# Summary
echo "========================================="
if [[ "${DRY_RUN}" == true ]]; then
    log_info "Dry run completed - no changes were made"
else
    log "Update process completed"
fi
log "Total projects processed: ${TOTAL_PROCESSED}"
if [[ "${DRY_RUN}" == true ]]; then
    log_info "Projects that would be updated: ${SUCCESSFUL_UPDATES}"
else
    log_success "Successful updates: ${SUCCESSFUL_UPDATES}"
    [[ ${FAILED_UPDATES} -gt 0 ]] && log_error "Failed updates: ${FAILED_UPDATES}"
fi
log "Log file saved to: ${LOG_FILE}"
echo "========================================="

# Exit with appropriate code
[[ ${FAILED_UPDATES} -gt 0 ]] && exit 1
exit 0
```

## Key Features

### 1. Auto-Detection of Docker Compose Command

The script automatically detects whether you're using the old `docker-compose` command or the newer `docker compose` syntax:

```bash
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi
```

This ensures compatibility regardless of your Docker installation.

### 2. Dry-Run Mode

Before making any changes, you can preview what would happen:

```bash
~/update-docker-compose.sh --dry-run
```

This shows you which services would be updated and which images would be pulled, without actually making any changes. It's a safety net that lets you verify everything looks correct before committing.

### 3. Comprehensive Logging

Every run creates a timestamped log file with complete details:

```bash
LOG_FILE="${HOME}/docker-update-$(date +%Y%m%d-%H%M%S).log"
```

The output goes both to your terminal and to the log file, so you have a permanent record of what happened.

### 4. Color-Coded Output

The script uses color coding for easy scanning:
- 🟢 Green for successful operations
- 🔴 Red for errors
- 🟡 Yellow for warnings
- 🔵 Blue for informational messages

### 5. Error Handling

The script uses `set -euo pipefail` for robust error handling, and continues processing other services even if one fails. At the end, it provides a summary showing how many succeeded and how many failed.

### 6. Support for Both `.yml` and `.yaml` Extensions

Some people prefer `docker-compose.yml`, others use `docker-compose.yaml`. The script handles both:

```bash
if [[ -f "${dir}/docker-compose.yml" ]] || [[ -f "${dir}/docker-compose.yaml" ]]; then
    COMPOSE_FILE="${dir}/docker-compose.yml"
    [[ -f "${dir}/docker-compose.yaml" ]] && COMPOSE_FILE="${dir}/docker-compose.yaml"
    # ... process the file
fi
```

## Installation

1. Save the script to your home directory:

```bash
nano ~/update-docker-compose.sh
```

2. Paste the script content and save it.

3. Make it executable:

```bash
chmod +x ~/update-docker-compose.sh
```

## Usage Examples

### Preview Updates (Dry Run)

```bash
~/update-docker-compose.sh --dry-run
```

This shows you what would be updated without making any changes.

### Run the Updates

```bash
~/update-docker-compose.sh
```

This actually pulls new images and restarts containers.

### Get Help

```bash
~/update-docker-compose.sh --help
```

## Real-World Results

Here's what a typical run looks like on my system:

```
[2026-02-01 07:41:49] Starting Docker Compose update process
[2026-02-01 07:41:49] Using compose command: docker compose
[2026-02-01 07:41:49] Log file: /home/michal/docker-update-20260201-074149.log

[2026-02-01 07:41:49] Processing: apprise
[2026-02-01 07:41:49]   Pulling latest images...
[2026-02-01 07:41:50] ✓   Images pulled successfully
[2026-02-01 07:41:50]   Restarting containers...
[2026-02-01 07:41:50] ✓   Containers restarted successfully

... [10 more services] ...

=========================================
[2026-02-01 07:42:15] Update process completed
[2026-02-01 07:42:15] Total projects processed: 12
[2026-02-01 07:42:15] ✓ Successful updates: 12
[2026-02-01 07:42:15] Log file saved to: /home/michal/docker-update-20260201-074149.log
=========================================
```

All 12 services updated in about 30 seconds. What used to take me 10 minutes of manual work now happens automatically.

## Automating with Cron

Want to run this automatically every week? Add it to your crontab:

```bash
crontab -e
```

Add this line to run it every Sunday at 2 AM:

```cron
0 2 * * 0 ~/update-docker-compose.sh >> ~/docker-updates-cron.log 2>&1
```

Or run it every night at 3 AM:

```cron
0 3 * * * ~/update-docker-compose.sh >> ~/docker-updates-cron.log 2>&1
```

## Optional Enhancement: Better Image Parsing

For more detailed dry-run output, you can install `yq` (a YAML parser):

```bash
sudo wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64
sudo chmod +x /usr/local/bin/yq
```

With `yq` installed, the dry-run mode will show you exactly which images would be updated for each service. Without it, the script falls back to grep-based parsing, which still works but is less precise.

## Why This Approach Works

1. **Transparent**: You can see exactly what's happening at each step
2. **Debuggable**: Comprehensive logs make troubleshooting easy
3. **Safe**: Dry-run mode lets you preview changes first
4. **Minimal cognitive overhead**: Set it and forget it
5. **No external dependencies**: Pure bash with Docker

This is exactly the kind of automation that makes homelab management sustainable. Instead of dreading the update process, I can run a single command (or let cron do it) and move on with my day.

## Conclusion

Managing multiple Docker Compose services doesn't have to be tedious. This script handles all the repetitive work while giving you full visibility and control over the process.

The beauty of this approach is its simplicity. It's just a bash script—no complex orchestration tools, no additional services to maintain. It does one thing well: keeps your Docker containers up to date.

If you're running a homelab with multiple services, give this script a try. It's saved me countless hours of manual updates, and the dry-run mode gives me confidence that nothing unexpected will happen.

Happy homelabbing!
