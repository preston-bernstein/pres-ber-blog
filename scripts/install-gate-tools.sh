#!/usr/bin/env bash
# Installs the pinned gate tools (Linux x86_64) into DIR. Each download is checked against a SHA-256
# before it is unpacked, so a moved release tag cannot change what CI runs. Change a version and its hash together.
#
# Usage: install-gate-tools.sh DIR [TOOL...]   TOOL is one of: actionlint shellcheck shfmt vale bats hugo
set -euo pipefail

PROG="${0##*/}"
GH="https://github.com"
tmp=""

log() { printf '%s: %s\n' "$PROG" "$*" >&2; }
die() {
  log "error: $1"
  exit "${2:-1}"
}
need() { command -v "$1" >/dev/null 2>&1 || die "missing tool: $1" 127; }
cleanup() { [ -z "$tmp" ] || rm -rf "$tmp"; }

# fetch URL SHA256 FILE: download, then refuse anything that does not match the hash.
fetch() {
  local url="$1" want="$2" file="$3" got
  curl -fsSL --retry 3 -o "$file" "$url" || die "download failed: $url"
  got="$(sha256sum "$file")"
  got="${got%% *}"
  [ "$got" = "$want" ] || die "checksum mismatch for $url (got $got)"
}

install_actionlint() {
  fetch "$GH/rhysd/actionlint/releases/download/v1.7.12/actionlint_1.7.12_linux_amd64.tar.gz" \
    8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8 "$tmp/actionlint.tgz"
  tar -xzf "$tmp/actionlint.tgz" -C "$1" actionlint
}

install_shellcheck() {
  fetch "$GH/koalaman/shellcheck/releases/download/v0.11.0/shellcheck-v0.11.0.linux.x86_64.tar.xz" \
    8c3be12b05d5c177a04c29e3c78ce89ac86f1595681cab149b65b97c4e227198 "$tmp/shellcheck.txz"
  tar -xJf "$tmp/shellcheck.txz" -C "$tmp"
  cp "$tmp/shellcheck-v0.11.0/shellcheck" "$1/shellcheck"
}

install_shfmt() {
  fetch "$GH/mvdan/sh/releases/download/v3.14.1/shfmt_v3.14.1_linux_amd64" \
    76e77641faa025814b77f153b29796b8e6fa2fca03e0c76a691608b86c7ea7bf "$tmp/shfmt"
  install -m 755 "$tmp/shfmt" "$1/shfmt"
}

install_vale() {
  fetch "$GH/errata-ai/vale/releases/download/v3.27.0/vale_3.27.0_Linux_64-bit.tar.gz" \
    c80d62f6bce87b81843ac5b512a26e63213927b957adba0a64fc594570da2000 "$tmp/vale.tgz"
  tar -xzf "$tmp/vale.tgz" -C "$1" vale
}

install_bats() {
  fetch "$GH/bats-core/bats-core/archive/refs/tags/v1.13.0.tar.gz" \
    a85e12b8828271a152b338ca8109aa23493b57950987c8e6dff97ba492772ff3 "$tmp/bats.tgz"
  mkdir "$tmp/bats-src"
  tar -xzf "$tmp/bats.tgz" -C "$tmp/bats-src" --strip-components=1
  # bats looks for its libexec through the symlink target, so keep the tree and link the entry point.
  "$tmp/bats-src/install.sh" "$1/bats-core" >/dev/null
  ln -sf "$1/bats-core/bin/bats" "$1/bats"
}

install_hugo() {
  fetch "$GH/gohugoio/hugo/releases/download/v0.164.0/hugo_extended_0.164.0_Linux-64bit.tar.gz" \
    fea17b8c076f950bb2e9f9486667bdaa29422883888d509d63931c73e8a9b3a4 "$tmp/hugo.tgz"
  tar -xzf "$tmp/hugo.tgz" -C "$1" hugo
}

main() {
  if [ "$#" -eq 0 ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    printf 'Usage: %s DIR [TOOL...]\n' "$PROG" >&2
    exit 2
  fi
  local dest="$1" tool
  shift
  need curl
  need sha256sum
  need tar
  mkdir -p "$dest"
  dest="$(cd "$dest" && pwd)"
  tmp="$(mktemp -d)"
  trap cleanup EXIT

  local -a tools=("$@")
  [ "${#tools[@]}" -gt 0 ] || tools=(actionlint shellcheck shfmt vale bats)
  for tool in "${tools[@]}"; do
    case "$tool" in
      actionlint | shellcheck | shfmt | vale | bats | hugo) ;;
      *) die "unknown tool: $tool" 2 ;;
    esac
    log "installing $tool"
    "install_$tool" "$dest"
  done
}

main "$@"
