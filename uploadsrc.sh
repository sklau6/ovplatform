#!/usr/bin/env bash

# Format: YYYYMMDD_HHMMSS
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "Timestamp = ${TIMESTAMP}"

git add .

# Only commit if there are staged changes to prevent git erroring out
if ! git diff-index --quiet HEAD --; then
    git commit -m "${TIMESTAMP}"
    git push
else
    echo "Nothing to commit, working tree clean."
    git push
fi
