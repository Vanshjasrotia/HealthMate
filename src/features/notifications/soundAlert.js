const DEFAULT_SOUND_PATH = '/freesound_community-alarm-clock-90867.mp3'

let audio = null

export async function playReminderSound() {
  try {
    if (!audio) {
      audio = new Audio(DEFAULT_SOUND_PATH)
      audio.loop = true
      audio.volume = 1.0
      audio.preload = 'auto'
    }

    audio.currentTime = 0
    await audio.play()
    return true
  } catch (err) {
    console.log("Audio play blocked:", err)
    return false
  }
}

export function stopReminderSound() {
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
  window.__alarmPlaying = false
  console.log('Alarm stopped')
}
