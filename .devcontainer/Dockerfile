FROM mcr.microsoft.com/devcontainers/base:ubuntu

ENV DEBIAN_FRONTEND=noninteractive

SHELL ["/bin/bash", "-lc"]

# -----------------------------------------------------------------------------
# Local devcontainer image for dnd-claude-code (Jörn's Ubuntu desktop)
#
# Design goals (same as msc-math / xrisk-minigames):
# - Keep the image simple and close to standard devcontainer patterns (KISS).
# - Heavyweight dependencies in earlier layers for caching.
# - More frequently tweaked tools after base deps.
# -----------------------------------------------------------------------------

# Base system dependencies (rarely change)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    build-essential \
    python3 \
    python3-pip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# CLI tools used by agents
RUN apt-get update && apt-get install -y --no-install-recommends \
    ripgrep \
    jq \
    gh \
    tree \
    inotify-tools \
    && rm -rf /var/lib/apt/lists/*

# PDF generation (pandoc + weasyprint for session handouts)
RUN apt-get update && apt-get install -y --no-install-recommends \
    pandoc \
    poppler-utils \
    && pip3 install --break-system-packages weasyprint \
    && rm -rf /var/lib/apt/lists/*

# VS Code tunnel CLI (bake into image to avoid slow postCreate download)
RUN set -eux; \
    tmpdir="$(mktemp -d)"; \
    curl -fsSL "https://update.code.visualstudio.com/latest/cli-linux-x64/stable" -o "$tmpdir/vscode-cli.tar.gz"; \
    tar -xzf "$tmpdir/vscode-cli.tar.gz" -C "$tmpdir"; \
    install -m 0755 "$tmpdir/code" /usr/local/bin/code-tunnel; \
    rm -rf "$tmpdir"

# Node.js 22.x (npm included)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && node -v && npm -v

# Switch to dev user
USER vscode
ENV HOME=/home/vscode
ENV PATH="$HOME/.local/bin:$PATH"

WORKDIR /workspaces/dnd-claude-code
