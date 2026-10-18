// Checks a plugin repo's manifest.json (and versions.json) after its build.
// Run from the plugin repo's root; used by plugin-ci.yml and
// plugin-release.yml. With TAG set (a release), the tag must also equal the
// manifest version. Writes `files=` (manifest.json plus every file the
// manifest names) to GITHUB_OUTPUT when that's set.
import fs from 'node:fs'

const fail = (msg) => {
  console.error(`::error::${msg}`)
  process.exit(1)
}
const tag = process.env.TAG
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf-8'))
const version = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/
if (!/^[a-z0-9][a-z0-9-]*$/.test(manifest.id ?? '')) fail('manifest.json: id must be lowercase letters, digits and dashes')
for (const key of ['name', 'main']) if (typeof manifest[key] !== 'string' || !manifest[key]) fail(`manifest.json: missing "${key}"`)
if (!version.test(manifest.version ?? '')) fail('manifest.json: version must look like 1.2.3')
if (manifest.minAppVersion && !version.test(manifest.minAppVersion)) fail('manifest.json: minAppVersion must look like 1.2.3')
if (tag && tag !== manifest.version) fail(`Tag "${tag}" must equal manifest.json version "${manifest.version}" (no "v" prefix)`)
const files = [...new Set([manifest.main, manifest.styles, manifest.mainProcess].filter(Boolean))]
for (const f of files) {
  if (!/^[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(f) || f === 'manifest.json') fail(`"${f}" must be a plain file name at the top of the repo`)
  if (!fs.existsSync(f)) fail(`"${f}" is named in manifest.json but wasn't found after the build`)
}
if (fs.existsSync('versions.json')) {
  const versions = JSON.parse(fs.readFileSync('versions.json', 'utf-8'))
  if (versions[manifest.version] !== (manifest.minAppVersion ?? '0.0.0')) {
    fail(`versions.json must map "${manifest.version}" to "${manifest.minAppVersion ?? '0.0.0'}" (the manifest's minAppVersion)`)
  }
}
const published = ['manifest.json', ...files]
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `files=${published.join(' ')}\n`)
console.log(`${manifest.id} ${manifest.version}: ${published.join(', ')}`)
