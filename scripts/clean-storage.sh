#!/bin/bash
# ==============================================================================
# DWstore.lk Automated Storage & Cache Optimizer
# Keeps Hetzner VPS lean, fast, and prevents disk overflow.
# ==============================================================================

echo "=== [DWstore.lk] Starting System Cache & Storage Cleanup ==="

# 1. Clean Next.js Build & Image Caches older than 7 days
if [ -d "/var/www/dwstore/apps/storefront/.next/cache" ]; then
    echo "Pruning Next.js cache older than 7 days..."
    find /var/www/dwstore/apps/storefront/.next/cache/images -type f -mtime +7 -delete 2>/dev/null || true
    find /var/www/dwstore/apps/storefront/.next/cache/fetch-cache -type f -mtime +7 -delete 2>/dev/null || true
fi

# 2. Flush PM2 runtime logs so logs don't grow indefinitely
if command -v pm2 &> /dev/null; then
    echo "Flushing PM2 runtime log files..."
    pm2 flush
fi

# 3. Clean Linux journal system logs (keep only last 7 days)
if command -v journalctl &> /dev/null; then
    echo "Vacuuming system journal logs..."
    journalctl --vacuum-time=7d 2>/dev/null || true
fi

# 4. Clean APT package cache
if command -v apt-get &> /dev/null; then
    echo "Cleaning APT package cache..."
    apt-get clean 2>/dev/null || true
fi

echo "=== [DWstore.lk] Cache & Storage Cleanup Completed Successfully! ==="
