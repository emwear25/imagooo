#!/bin/sh
# Download the full-size image behind a public ChatGPT image share link.
#   tools/products/fetch-share.sh https://chatgpt.com/s/m_… out.jpg
set -e
url="$1"; out="$2"
[ -n "$url" ] && [ -n "$out" ] || { echo "usage: $0 <share-url> <out.jpg>"; exit 1; }
tmp=$(mktemp -d)
curl -sL -m 30 -A "Mozilla/5.0" "$url" -o "$tmp/page.html"
best=""; bestpx=0
for u in $(grep -o 'https://chatgpt.com/backend-api/estuary/public_content/enc/[^"\\ ]*' "$tmp/page.html" | sed 's/&amp;/\&/g' | sort -u); do
  curl -sL -m 60 -A "Mozilla/5.0" "$u" -o "$tmp/c"
  w=$(sips -g pixelWidth "$tmp/c" 2>/dev/null | awk '/pixelWidth/{print $2}'); h=$(sips -g pixelHeight "$tmp/c" 2>/dev/null | awk '/pixelHeight/{print $2}')
  px=$(( ${w:-0} * ${h:-0} ))
  if [ "$px" -gt "$bestpx" ]; then bestpx=$px; cp "$tmp/c" "$tmp/best"; fi
done
[ "$bestpx" -gt 0 ] || { echo "no image found at $url"; exit 1; }
sips -s format jpeg -s formatOptions 88 "$tmp/best" --out "$out" >/dev/null
echo "$out $(sips -g pixelWidth -g pixelHeight "$out" | awk '/pixel/{printf "%s ", $2}')"
rm -rf "$tmp"
