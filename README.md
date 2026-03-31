# GBK Drama
GBK Productions Website

## Past production galleries

When you add, remove, or rename images in `images/Past Productions`, regenerate the gallery manifest before publishing:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\generate-past-productions-manifest.ps1
```

That command rebuilds `scripts/past-productions-manifest.json`, which the past productions carousel reads at runtime.
