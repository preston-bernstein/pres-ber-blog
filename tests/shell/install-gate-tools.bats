#!/usr/bin/env bats
# Behavior tests for scripts/install-gate-tools.sh. Pack: shell, rule sh-bats-tests.

setup() {
  SCRIPT="$BATS_TEST_DIRNAME/../../scripts/install-gate-tools.sh"
  STUBS="$BATS_TEST_TMPDIR/stubs"
  mkdir -p "$STUBS"
  # A curl that writes fixed bytes, so no test touches the network.
  cat >"$STUBS/curl" <<'STUB'
#!/usr/bin/env bash
out=""
while [ "$#" -gt 0 ]; do
  if [ "$1" = "-o" ]; then out="$2"; fi
  shift
done
printf 'not the real tool' >"$out"
STUB
  chmod +x "$STUBS/curl"
}

@test "no arguments prints usage and exits 2" {
  run "$SCRIPT"
  [ "$status" -eq 2 ]
  [[ "$output" == *Usage* ]]
}

@test "an unknown tool exits 2 with a message" {
  run "$SCRIPT" "$BATS_TEST_TMPDIR/bin" nope
  [ "$status" -eq 2 ]
  [[ "$output" == *"unknown tool: nope"* ]]
}

@test "a download with the wrong checksum fails and installs nothing" {
  PATH="$STUBS:$PATH" run "$SCRIPT" "$BATS_TEST_TMPDIR/bin" shfmt
  [ "$status" -eq 1 ]
  [[ "$output" == *"checksum mismatch"* ]]
  [ ! -e "$BATS_TEST_TMPDIR/bin/shfmt" ]
}
