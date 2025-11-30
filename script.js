
// Responsive wave settings (adjust based on viewport width)
let numRows
let bufferRows
let numCols
const charColor = 'hsl(180, 48%, 52%)'

let baseWaveAmplitude
let waveFrequency
let waveSpeed

function computeSettings() {
  const w = window.innerWidth
  const isMobile = w <= 767

  numRows = isMobile ? 5 : 7
  bufferRows = isMobile ? 1 : 2
  // use a slightly larger divisor on mobile so characters don't overflow
  numCols = Math.max(20, Math.round(w / (isMobile ? 10 : 8)))

  baseWaveAmplitude = isMobile ? 1.2 : 2
  waveFrequency = isMobile ? 0.12 : 0.08
  waveSpeed = isMobile ? 0.035 : 0.02
}

const waveElement = document.getElementById('wave')

let phaseShift = 0

computeSettings()

let symbolGrid = Array(numRows)
  .fill()
  .map(() => Array(numCols).fill(''))
let colorGrid = Array(numRows)
  .fill()
  .map(() => Array(numCols).fill(''))
let bufferGrid = Array(bufferRows)
  .fill()
  .map(() => Array(numCols).fill(''))

const words = ['timeflow']
let currentWord = ''
let wordIndex = 0
let charIndex = 0

const fps = 18
const frameInterval = 1000 / fps
let lastFrameTime = 0

const getRandomSymbol = () => {
  if (charIndex >= currentWord.length) {
    currentWord = words[wordIndex]
    wordIndex = (wordIndex + 1) % words.length
    charIndex = 0
  }
  return currentWord[charIndex++]
}

function updateWave(timestamp) {
  if (!lastFrameTime) lastFrameTime = timestamp
  const elapsed = timestamp - lastFrameTime

  if (elapsed >= frameInterval) {
    lastFrameTime = timestamp

    let gridString = ''

    for (let row = 0; row < numRows; row++) {
      let rowString = ''
      for (let col = 0; col < numCols; col++) {
        let amplitudeVariation = Math.sin(col * 0.06 + phaseShift) * 1.2
        let waveValue = Math.cos(waveFrequency * (col + phaseShift)) * (baseWaveAmplitude + amplitudeVariation)
        let waveThreshold = Math.round(waveValue + baseWaveAmplitude)

        if (row > waveThreshold) {
          if (colorGrid[row][col] !== charColor) {
            colorGrid[row][col] = charColor
            symbolGrid[row][col] = getRandomSymbol()
          }
          rowString += `<span style="color: ${charColor};">${symbolGrid[row][col]}</span>`
        } else {
          colorGrid[row][col] = ''
          symbolGrid[row][col] = ''
          rowString += `<span>&nbsp;</span>`
        }
      }
      gridString += `<div>${rowString}</div>`
    }

    for (let row = 0; row < bufferRows; row++) {
      let rowString = ''
      for (let col = 0; col < numCols; col++) {
        if (Math.random() < 0.05 || bufferGrid[row][col] === '') {
          bufferGrid[row][col] = getRandomSymbol()
        }
        rowString += `<span style="color: ${charColor};">${bufferGrid[row][col]}</span>`
      }
      gridString += `<div>${rowString}</div>`
    }

    waveElement.innerHTML = gridString
    phaseShift += waveSpeed
  }

  requestAnimationFrame(updateWave)
}

function resizeGrids() {
  // Recompute responsive settings and resize the grids
  computeSettings()

  symbolGrid = Array(numRows)
    .fill()
    .map(() => Array(numCols).fill(''))
  colorGrid = Array(numRows)
    .fill()
    .map(() => Array(numCols).fill(''))
  bufferGrid = Array(bufferRows)
    .fill()
    .map(() => Array(numCols).fill(''))
}

window.addEventListener('resize', resizeGrids)

requestAnimationFrame(updateWave)

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show')
      observer.unobserve(entry.target)
    }
  })
})

document.querySelectorAll('.hidden-on-load').forEach((e) => observer.observe(e))
