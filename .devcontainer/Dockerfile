FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

ENV DEBIAN_FRONTEND=noninteractive

SHELL ["/bin/bash", "-lc"]

# -----------------------------------------------------------------------------
# Local devcontainer image for dnd-claude-code (Jörn's Ubuntu desktop)
#
# Design goals:
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
    python3-venv \
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
    tmux \
    trash-cli \
    && rm -rf /var/lib/apt/lists/*

# PDF generation (pandoc + weasyprint C dependencies for session handouts)
RUN apt-get update && apt-get install -y --no-install-recommends \
    pandoc \
    poppler-utils \
    libglib2.0-0 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libcairo2 \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# VS Code tunnel CLI (bake into image to avoid slow postCreate download)
RUN set -eux; \
    tmpdir="$(mktemp -d)"; \
    curl -fsSL "https://update.code.visualstudio.com/latest/cli-linux-x64/stable" -o "$tmpdir/vscode-cli.tar.gz"; \
    tar -xzf "$tmpdir/vscode-cli.tar.gz" -C "$tmpdir"; \
    install -m 0755 "$tmpdir/code" /usr/local/bin/code-tunnel; \
    rm -rf "$tmpdir"

# Node.js (npm included). Pin an exact package version so rebuilds do not drift
# within the 22.x line.
ENV NODEJS_VERSION=22.22.1-1nodesource1
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get update \
    && apt-get install -y --no-install-recommends "nodejs=${NODEJS_VERSION}" \
    && rm -rf /var/lib/apt/lists/* \
    && node -v && npm -v

# Install uv (Python package/script runner with inline dependency support).
# The installer appends "/bin" to UV_INSTALL_DIR, so point it at /usr/local to
# land in /usr/local/bin.
ENV UV_INSTALL_DIR=/usr/local
ENV UV_VERSION=0.11.7
RUN curl -LsSf https://astral.sh/uv/${UV_VERSION}/install.sh | sh

# Switch to dev user
USER vscode
ENV HOME=/home/vscode
ENV PATH="$HOME/.local/bin:/usr/local:$PATH"

WORKDIR /workspaces/dnd-claude-code
