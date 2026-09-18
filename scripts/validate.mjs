// Checks community-plugins.json: an array of entries with a valid, unique id,
// a name, author and description, and an "owner/repo" repo. A bit stricter
// than the app, which only drops entries it can't use.
import fs from 'node:fs'

const list = JSON.parse(fs.readFileSync('community-plugins.json', 'utf-8'))
if (!Array.isArray(list)) throw new Error('community-plugins.json must be an array')

const errors = []
const ids = new Set()
list.forEach((e, i) => {
  const where = `entry ${i} (${e?.id ?? '?'})`
  if (typeof e?.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(e.id)) errors.push(`${where}: invalid id`)
  if (ids.has(e?.id)) errors.push(`${where}: duplicate id`)
  ids.add(e?.id)
  if (typeof e?.name !== 'string' || !e.name.trim()) errors.push(`${where}: missing name`)
  if (typeof e?.description !== 'string' || !e.description.trim()) errors.push(`${where}: missing description`)
  if (typeof e?.author !== 'string' || !e.author.trim()) errors.push(`${where}: missing author`)
  if (typeof e?.repo !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9._-]{1,100}$/.test(e.repo) || e.repo.includes('..')) {
    errors.push(`${where}: repo must look like "owner/repo"`)
  }
  const extra = Object.keys(e ?? {}).filter((k) => !['id', 'name', 'author', 'description', 'repo'].includes(k))
  if (extra.length) errors.push(`${where}: unknown fields ${extra.join(', ')}`)
})

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`${list.length} entries OK`)
