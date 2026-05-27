# Pull Request Draft

## Summary

**Fix Vercel & Railway deployment infrastructure and prepare the project for production.**

### Key Changes

- **CI/CD & Deployment:** Fixed script permissions in GitHub Actions, integrated Railway CLI (`RAILWAY_TOKEN`), and added dynamic `/health` probes.
- **Production Hardening:** Optimized Docker image using `Alpine Linux` (~150MB), integrated SonarCloud, and configured **Resend** SMTP with local fallback to **Ethereal**.
- **Refactoring:** Cleaned up legacy client-side content blocks, refactored database context, and hardened TypeScript constraints.
- **Documentation:** Updated deployment guides and synchronized the Postman collection.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / cleanup
- [x] Chore (config, deps, docs)

## Testing

- [x] Runs locally (`turbo dev`)
- [x] Lint: `turbo lint` — no errors
- [x] Types: `check-types` — no errors
- [x] CI/CD: Railway deploy hook verified

## Documentation

- [x] `docs/08-deployment/` updated (Resend & Railway details)
