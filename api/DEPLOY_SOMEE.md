# Production Deploy (Somee - API + Front Together)

## 1) Build and publish
Run from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\api\scripts\publish-production.ps1
```

This will:
- build Angular in production mode
- copy the frontend bundle into `api/NewApi/wwwroot`
- export a standalone frontend bundle into `api/artifacts/frontend-production`
- publish ASP.NET Core Release into `api/artifacts/publish-production`
- create `api/artifacts/ElMostafaPortfolio-production.zip`

## 2) Upload to Somee
- Upload all files from `api/artifacts/publish-production` to your hosting root.
- Or upload the ready-made zip after extracting it on the server side if your host supports that.

## 3) Config
- Frontend production environment is defined in `src/environments/environment.prod.ts`.
- Backend production settings are defined in `api/NewApi/appsettings.Production.json`.
- If domain, API host, SMTP, or public URLs change, update those two files before publishing.

## 4) Notes
- Keep production secrets out of version control when possible.
- If domain changes, review `Cors:AllowedOrigins`.
- Uploaded media is preserved under `api/NewApi/wwwroot/uploads`.
