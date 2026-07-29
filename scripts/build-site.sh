#!/usr/bin/env sh
set -eu

output_directory="${1:-dist}"

rm -rf "$output_directory"
mkdir -p "$output_directory"

cp -R public/. "$output_directory"
cp openapi.yaml "$output_directory/openapi.yaml"
touch "$output_directory/.nojekyll"
