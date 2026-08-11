#!/bin/bash
# Not the active deploy path -- the live site deploys via .github/workflows/main.yml.
# Kept as a legacy/alternate Vercel build config (see readme.md Deploy section).
# NOTE: unlike main.yml, this script does not fetch the themes/blowfish git
# submodule (Vercel's own checkout settings control that) -- confirm submodule
# fetch is enabled on the Vercel project before relying on this path.

# default versions
NODE_VERSION='18.16.1';
HUGO_VERSION='0.164.0';

echo "USING NODE VERSION: $(node -v)"

# install Hugo
echo "Installing Hugo $HUGO_VERSION..."
curl -sSOL https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz
tar -xzf hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz
mv hugo /usr/local/bin/
rm -rf hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz
hugo version

# install dependencies
echo "Installing project dependencies..."
npm install

# run the build command
echo "Running the build command..."
npm run build
