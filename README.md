# Noctívago community plugins

This repo holds `community-plugins.json`, the list the **Plugins** tab in [Noctívago](https://github.com/Venari-Hunt/Noctivago) reads. Only the list lives here. Each plugin's code stays in its author's own repo.

## Publishing a plugin

1. **Build your plugin.** A plugin is a `manifest.json` plus the files it names. See [docs/plugins.md](https://github.com/Venari-Hunt/Noctivago/blob/master/docs/plugins.md) and the typed contract in [types/plugin.d.ts](https://github.com/Venari-Hunt/Noctivago/blob/master/types/plugin.d.ts). Plain JS or any framework (bundle it yourself) is fine.
2. **Keep every file at the top level.** `main`, `styles` and `mainProcess` in your manifest must be plain file names like `main.js`, not `dist/main.js`.
3. **Make a GitHub Release** in your repo. Attach `manifest.json` and every file it names as release assets. The app always installs your *latest* release, and offers an update when its `version` is higher than the installed one.
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

## Review

Every PR is read by a maintainer before merging. We check that the plugin does what its description says and doesn't do anything harmful. Plugins with a `mainProcess` module run with full access to the user's computer, so they get a closer read, and the app warns users before installing them.

Updates you publish later as new releases aren't re-reviewed. If a listed plugin turns harmful, it's removed from this list.
