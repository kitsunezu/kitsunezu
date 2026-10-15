# Kitsunet Homelab diagram

The About page embeds a localized, interactive architecture diagram. The JSON files here are the editable sources; the HTML files in `public/architecture/` are generated artifacts. The previous `kitsunezu-portfolio.html` URL redirects to the selected language while preserving theme, embed parameters, and the fragment.

## Evidence snapshot — 2026-10-15, Hong Kong time

Read-only checks of Unraid, its two VMs, Pangolin route targets and policies, Traefik configuration, DNS, and public HTTPS established:

- Unraid hosts both the Edge VM and Apps VM.
- Pangolin and its Traefik on the Edge VM are the public ingress. Traefik owns public TLS using Let's Encrypt production and Cloudflare DNS-01. Cloudflare DNS records for the checked public apps resolve directly to the home WAN.
- The four custom application domains route to Coolify's internal HTTP proxy on the Apps VM: Portfolio, Eventernote Dashboard, Eventernote Autofill, and Voiceprint Search. Their public HTTPS roots returned 200 with successful certificate verification.
- Nextcloud, Immich, Vaultwarden, n8n, Sub2API, and Homarr remain on Unraid. Portainer was subsequently retired on 2026-10-15; its container, proxy resource and dedicated DNS record were removed. Data stacks are managed by Unraid Compose Manager. Old website containers on Unraid are not the current public origins.
- Management policies allow LAN/Tailscale access. n8n public access is limited to configured webhook/form paths; its editor uses the private management route. Listing a service on Unraid does not imply every endpoint is public.

The UniFi TCP 80/443 forwarding rule is carried forward from the accepted migration report of 2026-10-14; this run confirmed gateway/VM attachments, edge listeners and successful public HTTPS, but did not independently read the current NAT configuration. Cloudflare Access/Tunnel account deletion was not rechecked and is not asserted by the diagram. Public root responses do not establish native-client sync, uploads, webhooks, certificate renewal, or successful CI/CD. This update changes no live infrastructure or deployment workflow.

The diagram is a logical traffic/management view. VM containment is stated in the Unraid card; Unraid is also the physical host of both VMs. Detailed ports, credentials, private keys, and full server inventories are intentionally absent from the public artifact.

## Regeneration

The generator uses the installed Archify 2.17 skill; it is not an application runtime dependency. Set `ARCHIFY_DIR` if it is installed somewhere other than `~/.codex/skills/archify`.

```sh
node scripts/build-homelab-diagrams.mjs
```

Update all three source JSON files together, keeping IDs, geometry, connections and view focus lists consistent. The generator validates each source and uses Archify `deliver` to create a temporary artifact. Since the renderer's UI locale supports only English and Simplified Chinese, a narrow integration step corrects the HTML/SVG language tags to `zh-TW` or `ja` for authored content. Viewer controls remain English. The final integrated bytes are checked again before replacing the public file. `receipts.json` records both the raw Archify hash and final integrated hash, so the renderer receipt is not misrepresented as covering the integration step.

The iframe height follows the source viewBox `1390×750` plus the renderer's 16px embed padding. Keep it aligned when changing the geometry.

## Verification

- Each final artifact passes all 9 showcase checks with zero composition errors or warnings.
- Browser containment checked at 1440×900, 1600×1000, 1920×1080 and 2048×1320; light/dark screenshots inspected.
- About page checked at desktop and 390px mobile width: no horizontal overflow or iframe clipping. Site language/theme switching and the old URL redirect were exercised in the browser.
- `npm run lint` and `npm run build` pass.

To repeat the artifact browser checks, provide Chrome/Chromium through `ARCHIFY_CHROME` if it is not automatically discovered:

```sh
for locale in en zh-TW ja; do
  node "$ARCHIFY_DIR/bin/archify.mjs" visual-check "public/architecture/kitsunet-homelab.$locale.html" --json
done
```

`visual-check` writes screenshot/receipt sidecars next to the artifact. Move those review files outside `public/` after inspection. They are evidence, not website assets. Browser receipts refer to the final integrated artifact hashes in `receipts.json`.
