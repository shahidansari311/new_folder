# 🎵 Audio Files — Song Placeholders

Place your song files here. The app expects these three files:

## Required Files

| File                   | Phase             | Description                                    |
|------------------------|-------------------|------------------------------------------------|
| `countdown-song.mp3`  | Countdown         | Dreamy, anticipatory — plays while waiting      |
| `birthday-song.mp3`   | Birthday Wish     | Magical, celebratory — plays during midnight    |
| `ambient-song.mp3`    | Rest of Experience| Single ambient track — plays through everything |

## Supported Formats
- `.mp3` (recommended for best compatibility)
- `.ogg`
- `.wav`
- `.m4a`

## How It Works
- **Countdown phase**: `countdown-song.mp3` plays on loop with smooth fade-in
- **Midnight/Birthday sequence**: Crossfades from countdown → `birthday-song.mp3`  
- **Gift, Forest Walk, Story, etc.**: Crossfades to `ambient-song.mp3` and loops for the rest

## Music Control
A floating 🔊 toggle button appears bottom-right so the user can mute/unmute at any time.

## To Change Song Paths
Edit the `SONGS` config in: `src/components/ui/AudioManager.tsx`
