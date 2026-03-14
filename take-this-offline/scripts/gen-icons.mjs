import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'

function u32be(n) {
  const b = Buffer.alloc(4); b.writeUInt32BE(n); return b
}
function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) { c ^= b; for (let i = 0; i < 8; i++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1 }
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const t = Buffer.from(type)
  const td = Buffer.concat([t, data])
  return Buffer.concat([u32be(data.length), t, data, u32be(crc32(td))])
}
function makePNG(size, r, g, b) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10])
  const ihdr = chunk('IHDR', Buffer.concat([u32be(size), u32be(size), Buffer.from([8,2,0,0,0])]))
  const rawRows = Buffer.alloc(size * (1 + size * 3))
  for (let y = 0; y < size; y++) {
    rawRows[y * (1 + size * 3)] = 0
    for (let x = 0; x < size; x++) {
      rawRows[y * (1 + size * 3) + 1 + x * 3] = r
      rawRows[y * (1 + size * 3) + 1 + x * 3 + 1] = g
      rawRows[y * (1 + size * 3) + 1 + x * 3 + 2] = b
    }
  }
  const idat = chunk('IDAT', deflateSync(rawRows))
  const iend = chunk('IEND', Buffer.alloc(0))
  return Buffer.concat([sig, ihdr, idat, iend])
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', makePNG(192, 24, 24, 27))  // zinc-900 #18181b
writeFileSync('public/icons/icon-512.png', makePNG(512, 24, 24, 27))
console.log('Icons written to public/icons/')
