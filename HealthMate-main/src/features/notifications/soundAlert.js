const DEFAULT_SOUND_PATH = '/sounds/reminder-alert.mp3'

let cachedAudio = null
let audioContext = null

function createAudio(soundPath) {
  try {
    const audio = new Audio(soundPath)
    audio.preload = 'auto'
    return audio
  } catch (error) {
    return null
  }
}

export async function playReminderSound(soundPath = DEFAULT_SOUND_PATH) {
  if (!cachedAudio || cachedAudio.src !== new URL(soundPath, window.location.origin).href) {
    cachedAudio = createAudio(soundPath)
  }

  if (!cachedAudio) return false

  try {
    const playSafe = () => {
      const p = cachedAudio.play()
      if (p !== undefined) p.catch(() => {})
    }

    // Clear existing interval if present
    if (playReminderSound._interval) {
      clearInterval(playReminderSound._interval)
      playReminderSound._interval = null
    }

    // Reset audio (pause + currentTime = 0)
    cachedAudio.pause()
    cachedAudio.currentTime = 0
    cachedAudio.volume = 1.0

    // Play immediately once
    playSafe()

    // Start interval
    playReminderSound._interval = setInterval(() => {
      cachedAudio.currentTime = 0
      playSafe()
    }, 2000)

    return true
  } catch (error) {
    console.warn('Audio playback failed', error)
    return false
  }
}

export function stopReminderSound() {
  if (playReminderSound._interval) {
    clearInterval(playReminderSound._interval)
    playReminderSound._interval = null
  }

  if (cachedAudio) {
    cachedAudio.pause()
    cachedAudio.currentTime = 0
  }
} 
