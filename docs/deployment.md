# Unraid deployment runbook

MetalBench is a separate static build. Penthouse exposes the finished tree read-only at `/srv/metalbench`; no Penthouse application route changes are needed.

1. Commit the exact MetalBench source and run every local gate.
2. Confirm `build/revision.txt` equals `git rev-parse HEAD`.
3. Confirm Cloudflare A records for the app (`penthouse.blog`, `api.penthouse.blog`) and the MetalBench subdomain `metalbench.teardown.cafe` resolve to the current WAN address. Repair DDNS before proceeding if any differ.
4. Back up the existing MetalBench tree and active Caddy configuration.
5. Copy `build/` to a staging directory on Unraid.
6. Set `METALBENCH_PATH` to the promoted host directory, include `ops/docker-compose.metalbench.yml` in the live Compose command, and add `ops/Caddyfile.metalbench` to the active Caddy configuration. This mounts the site read-only at `/srv/metalbench`.
7. Run `caddy validate` inside the existing container before reload.
8. Atomically rename the staged tree into place, reload Caddy, then check public home, compare, representative dynamic routes, an artifact when present, and `revision.txt`.
9. Confirm Penthouse root and API health still return `200`.

If any public check fails, restore both backed-up tree and Caddy configuration, validate, and reload. Do not add SPA rewrites or API routes.
