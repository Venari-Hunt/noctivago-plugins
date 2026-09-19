// Rebuilds community-plugin-stats.json from GitHub release download counts,
// the way Obsidian's bot does: { "<id>": { downloads, updated, "<version>": count } }.
// downloads is the sum over every release; updated is when the newest release
// was published (ms). A release counts one install per download of its most
// downloaded asset other than manifest.json, because the app also fetches
// manifest.json just to check for updates.
//
// Run by .github/workflows/stats.yml once a day. Locally: GITHUB_TOKEN=... node scripts/update-stats.mjs
import fs from 'node:fs'

const LIST_FILE = 'community-plugins.json'
const STATS_FILE = 'community-plugin-stats.json'

function headers() {
  const h = { Accept: 'application/vnd.github+json', 'User-Agent': 'noctivago-plugin-stats' }
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  return h
}

async function releasesOf(repo) {
  const all = []
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`, { headers: headers() })
    if (!res.ok) throw new Error(`${repo}: HTTP ${res.status}`)
    const batch = await res.json()
    all.push(...batch)
    if (batch.length < 100) break
  }
  return all
}

function statsFor(releases) {
  const out = { downloads: 0, updated: 0 }
  for (const r of releases) {
    if (r.draft) continue
    const counts = (r.assets ?? []).filter((a) => a.name !== 'manifest.json').map((a) => a.download_count ?? 0)
    const installs = counts.length ? Math.max(...counts) : 0
    out[r.tag_name] = installs
    out.downloads += installs
    const published = Date.parse(r.published_at ?? '')
    if (published > out.updated) out.updated = published
  }
  return out
}

async function main() {
  const list = JSON.parse(fs.readFileSync(LIST_FILE, 'utf-8'))
  const previous = fs.existsSync(STATS_FILE) ? JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8')) : {}
  const stats = {}
  let failed = 0
  for (const { id, repo } of list) {
    try {
      stats[id] = statsFor(await releasesOf(repo))
    } catch (err) {
      // Keep yesterday's numbers rather than dropping the plugin to zero.
      console.error(err.message)
      failed++
      if (previous[id]) stats[id] = previous[id]
    }
  }
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2) + '\n')
  console.log(`${Object.keys(stats).length} plugins, ${failed} failed`)
}

await main()
