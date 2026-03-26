#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
CHANGELOG="$REPO_ROOT/docs/CHANGELOG.md"

# Get REPO_URL: strip .git suffix, convert SSH to HTTPS
RAW_URL="$(git remote get-url origin 2>/dev/null || echo "")"
if [[ "$RAW_URL" =~ ^git@([^:]+):(.+)$ ]]; then
  REPO_URL="https://${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
else
  REPO_URL="$RAW_URL"
fi
REPO_URL="${REPO_URL%.git}"

# Section order
SECTION_ORDER=(feat fix refactor perf test docs chore ci style build)

declare -A TYPE_SECTION=(
  [feat]="Features"
  [fix]="Bug Fixes"
  [refactor]="Refactoring"
  [perf]="Performance"
  [test]="Tests"
  [docs]="Documentation"
  [chore]="Chores"
  [ci]="CI"
  [style]="Style"
  [build]="Build"
)

# Read git log into an array grouped by date
declare -a ALL_ENTRIES=()
declare -a ALL_DATES=()
declare -A SEEN_DATES=()

while IFS='|' read -r fullhash date subject; do
  [[ "$subject" == "chore: update changelog and stats" ]] && continue
  [[ "$subject" == "chore: update changelog" ]] && continue
  [[ -z "$subject" ]] && continue

  if [[ -z "${SEEN_DATES[$date]+x}" ]]; then
    ALL_DATES+=("$date")
    SEEN_DATES[$date]=1
  fi
  ALL_ENTRIES+=("$date|$fullhash|$subject")
done < <(git log --pretty=format:"%H|%as|%s" --no-merges)

# Build output
{
  echo "# Changelog"
  echo ""

  for date in "${ALL_DATES[@]}"; do
    echo "## $date"
    echo ""

    declare -A sec_lines=()
    for t in "${SECTION_ORDER[@]}"; do sec_lines[$t]=""; done

    for entry in "${ALL_ENTRIES[@]}"; do
      IFS='|' read -r edate fullhash subject <<< "$entry"
      [[ "$edate" != "$date" ]] && continue

      short7="${fullhash:0:7}"
      _pattern='^([a-z]+)(\([^)]*\))?[!]?:[[:space:]]'
      if [[ "$subject" =~ $_pattern ]]; then
        type="${BASH_REMATCH[1]}"
      else
        type="chore"
      fi
      [[ -z "${sec_lines[$type]+x}" ]] && type="chore"

      line="- $subject [\`$short7\`]($REPO_URL/commit/$fullhash)"
      if [[ -z "${sec_lines[$type]}" ]]; then
        sec_lines[$type]="$line"
      else
        sec_lines[$type]+=$'\n'"$line"
      fi
    done

    for t in "${SECTION_ORDER[@]}"; do
      [[ -z "${sec_lines[$t]}" ]] && continue
      echo "### ${TYPE_SECTION[$t]}"
      echo ""
      echo "${sec_lines[$t]}"
      echo ""
    done

    unset sec_lines
  done
} > "$CHANGELOG"

echo "[update-changelog] Written $CHANGELOG"
