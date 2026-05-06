export const AVATAR_COLORS = [
  'linear-gradient(135deg, #D4A574, #B8895A)',
  'linear-gradient(135deg, #8FB4D9, #5A8BB8)',
  'linear-gradient(135deg, #A0C2A8, #6A9E78)',
  'linear-gradient(135deg, #C8A0D4, #9E6AA8)',
  'linear-gradient(135deg, #D4956A, #B86A3A)',
  'linear-gradient(135deg, #A8A0C8, #786A9E)',
]

export function getAvatarBg(colorIndex: number): string {
  return AVATAR_COLORS[colorIndex] ?? AVATAR_COLORS[0]
}

export function getInitials(displayName: string, email: string): string {
  return (displayName || email).slice(0, 2).toUpperCase() || 'MJ'
}
