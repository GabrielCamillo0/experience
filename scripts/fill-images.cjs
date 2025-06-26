// scripts/fill-images.js
const fs = require('fs')
const path = require('path')

// 1) leia o seu JSON original
const dataPath = path.resolve(__dirname, '../src/data/tours.json')
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

// 2) liste todos os arquivos da pasta
const imagesDir = path.resolve(__dirname, '../src/search_images')
const files = fs.readdirSync(imagesDir).filter(f => /\.(jpe?g|webp)$/i.test(f))

// 3) para cada item do JSON, atribua um arquivo (por índice)
//    — você pode implementar outra lógica de matching, se quiser
data.forEach((item, i) => {
  const file = files[i]
  if (!file) return
  item.image   = `/search_images/${file}`
  item.gallery = [`/search_images/${file}`]
})

// 4) escreva de volta o JSON já corrigido
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8')
console.log(`Atualizei ${data.length} entradas com imagens de search_images/`)
