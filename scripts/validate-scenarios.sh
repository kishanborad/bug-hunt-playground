#!/usr/bin/env bash
set -euo pipefail

SCENARIOS_DIR="public/scenarios"
MANIFEST_DIR="src/scenarios"
EXIT_CODE=0

for manifest in "$MANIFEST_DIR"/*.json; do
  scenario_id=$(basename "$manifest" .json)
  scenario_dir="$SCENARIOS_DIR/$scenario_id"

  if [ ! -d "$scenario_dir" ]; then
    echo "FAIL: Missing directory $scenario_dir for $manifest"
    EXIT_CODE=1
    continue
  fi

  # Extract page files from manifest using grep (no jq dependency)
  page_files=$(grep -o '"file": *"[^"]*"' "$manifest" | sed 's/"file": *"//;s/"//')

  for page_file in $page_files; do
    if [ ! -f "$scenario_dir/$page_file" ]; then
      echo "FAIL: Missing $scenario_dir/$page_file referenced in $manifest"
      EXIT_CODE=1
    else
      echo "  OK: $scenario_dir/$page_file"
    fi
  done
done

if [ $EXIT_CODE -eq 0 ]; then
  echo "All scenario pages validated."
else
  echo "Validation failed."
fi
exit $EXIT_CODE
