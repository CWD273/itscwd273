# Cloudflare Pages Dynamic Redirector

Cloudflare Pages Function that dynamically redirects requests based on hostname and destination availability.

## Structure

- `/functions/[[path]].js`
  - Handles all routes
  - Tests destination domains
  - Returns 302 redirects

## Deployment

Connect this repository to Cloudflare Pages.

Build command:
