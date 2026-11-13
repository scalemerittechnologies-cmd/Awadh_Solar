const sourceLimit = 8 * 1024 * 1024
const requestLimit = 3.5 * 1024 * 1024
const accepted = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

export async function prepareImageUpload(file: File): Promise<File> {
  if (!accepted.has(file.type)) throw new Error('Choose a JPEG, PNG, WebP or AVIF photo.')
  if (file.size > sourceLimit) throw new Error('Choose a photo smaller than 8 MB.')
  if (file.size <= requestLimit) return file

  let bitmap: ImageBitmap
  try { bitmap = await createImageBitmap(file) }
  catch { throw new Error('Could not open this photo. Try a JPEG or PNG instead.') }
  try {
    for (const [maxSide, quality] of [[1800, 0.82], [1500, 0.72], [1200, 0.62]]) {
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(bitmap.width * scale)
      canvas.height = Math.round(bitmap.height * scale)
      const context = canvas.getContext('2d')
      if (!context) break
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality))
      canvas.width = 0
      canvas.height = 0
      if (blob?.type === 'image/webp' && blob.size <= requestLimit) {
        return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' })
      }
    }
    throw new Error('This photo is too detailed to upload. Please choose a smaller image.')
  } finally {
    bitmap.close()
  }
}
