<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deployment

- Pushes to `master` run `.github/workflows/deploy.yml`: install, lint, build, audit production dependencies, build and scan the exact candidate image, push `ghcr.io/kitsunezu/kitsunezu-portfolio`, then join Tailscale with a repository-scoped GitHub OIDC identity and call Coolify's deploy API for the portfolio resource.
- Required GitHub Actions secrets are `TS_OAUTH_CLIENT_ID`, `TS_AUDIENCE`, and the Coolify `COOLIFY_DEPLOY_TOKEN`. Do not commit their values.
- Production npm audit blocks High/Critical findings. Trivy blocks fixed and unfixed High/Critical OS/library findings before image push; `.trivyignore` has no active exceptions, and any future exception requires a CVE, rationale, owner, expiry date, and review.

## Dependencies

- Generated UI components are committed source. The `shadcn` scaffolding CLI is not a runtime dependency; invoke it on demand with `npx shadcn` only when regenerating components.
- Keep `next` and `eslint-config-next` pinned to the same exact version, and validate upgrades with `npm ci`, `npm run lint`, and `npm run build`.
- `sharp` is an explicit production dependency for the standalone `next/image` runtime; keep it pinned to a patched release and verify the final image with Trivy.
- Docker build and runner stages use digest-pinned Node.js 24 LTS images. Refresh the official `node:24-slim` and `node:24-alpine` digests deliberately when updating base-image security fixes.
- The production runner applies `apk upgrade --no-cache` before removing npm, npx, and Yarn so Alpine security fixes are included in the candidate image.
- The production runner intentionally removes npm, npx, and Yarn; `node server.js` is the only runtime entrypoint.
