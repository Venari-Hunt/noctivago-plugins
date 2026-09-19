# Noctívago community plugins

This repo holds `community-plugins.json`, the list that **Settings > Community plugins > Browse** in [Noctívago](https://github.com/Venari-Hunt/Noctivago) reads, and `community-plugin-stats.json`, the download counts shown there. Only the list lives here. Each plugin's code stays in its own repo.

Start from [noctivago-sample-plugin](https://github.com/Venari-Hunt/noctivago-sample-plugin): it already has the release workflow below, and the recommended `domain/` + `components/` layout (rules with no DOM, plus small React components) that every Noctívago screen uses.

## Publishing a plugin

1. **Build your plugin.** A plugin is a `manifest.json` plus the files it names. See [docs/plugins.md](https://github.com/Venari-Hunt/Noctivago/blob/master/docs/plugins.md) and the typed contract in [types/plugin.d.ts](https://github.com/Venari-Hunt/Noctivago/blob/master/types/plugin.d.ts). Plain JS or any framework (bundle it yourself) is fine.
2. **Keep every file at the top level.** `main`, `styles` and `mainProcess` in your manifest must be plain file names like `main.js`, not `dist/main.js`.
3. **Make a GitHub Release** whose tag is exactly the manifest `version` (`1.2.0`, no `v`). Attach `manifest.json` and every file it names as release assets. The workflow below does this for you.
4. **Open a pull request here** adding one entry to the end of `community-plugins.json`:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "author": "Your Name",
  "description": "One sentence on what it does.",
  "repo": "your-github-user/your-plugin-repo"
}
```

`id` must match your manifest's `id` exactly: lowercase letters, digits and dashes.

## Automatic releases

Add `.github/workflows/release.yml` to your plugin repo:

```yaml
name: Release
on:
  push:
    tags: ['*']
permissions:
  contents: write
jobs:
  release:
    uses: Venari-Hunt/noctivago-plugins/.github/workflows/plugin-release.yml@main
```

Then bump `version` in `manifest.json` (and `versions.json`), commit, and push a tag with the same version: `git tag 1.2.0 && git push origin 1.2.0`. The workflow runs `npm ci`, `npm run build` and `npm test` if you have a `package.json`, checks that the tag, manifest and `versions.json` agree, and publishes the release.

## Supporting older app versions

Set `minAppVersion` in `manifest.json` to the oldest Noctívago your plugin runs on. When you raise it, keep a `versions.json` at the top of your repo that maps each plugin version to its `minAppVersion`:

```json
{
  "1.0.0": "0.1.200",
  "1.1.0": "0.1.235"
}
```

The app installs your latest release when it can run it. If the latest needs a newer app, it reads `versions.json` and installs the newest release that still works, downloaded by its tag.

## Download counts

`.github/workflows/stats.yml` runs once a day and rebuilds `community-plugin-stats.json` from your releases' download counts. Each release counts the downloads of its most-downloaded file other than `manifest.json` (the app also fetches that one just to check for updates).

## Review

Every PR is read by a maintainer before merging. We check that the plugin does what its description says and doesn't do anything harmful. Plugins with a `mainProcess` module run with full access to the user's computer, so they get a closer read, and the app warns users before installing them.

Updates you publish later as new releases aren't re-reviewed. If a listed plugin turns harmful, it's removed from this list.
