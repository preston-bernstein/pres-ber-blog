#!/usr/bin/env bats
# Behavior tests for vercel-build.sh. Pack: shell, rule sh-bats-tests.

setup() {
  SCRIPT="$BATS_TEST_DIRNAME/../../vercel-build.sh"
  STUBS="$BATS_TEST_TMPDIR/stubs"
  CALLS="$BATS_TEST_TMPDIR/calls"
  mkdir -p "$STUBS"
  : >"$CALLS"
  # Every external command is a stub that records its name, so the test touches neither the network nor /usr/local/bin.
  for tool in node curl tar mv rm hugo npm; do
    printf '#!/usr/bin/env bash\necho "%s $*" >>"%s"\n' "$tool" "$CALLS" >"$STUBS/$tool"
    chmod +x "$STUBS/$tool"
  done
  PATH="$STUBS:$PATH"
}

@test "installs Hugo, then dependencies, then builds" {
  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
  run grep -E '^(curl|tar|mv|rm|hugo|npm)' "$CALLS"
  [ "${lines[0]}" = "curl -sSOL https://github.com/gohugoio/hugo/releases/download/v0.164.0/hugo_extended_0.164.0_Linux-64bit.tar.gz" ]
  [ "${lines[1]}" = "tar -xzf hugo_extended_0.164.0_Linux-64bit.tar.gz" ]
  [ "${lines[5]}" = "npm install" ]
  [ "${lines[6]}" = "npm run build" ]
}

@test "a failed download stops the script before npm runs" {
  printf '#!/usr/bin/env bash\nexit 22\n' >"$STUBS/curl"
  run bash "$SCRIPT"
  [ "$status" -eq 22 ]
  run grep -c '^npm' "$CALLS"
  [ "$output" = "0" ]
}
