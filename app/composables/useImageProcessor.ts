export const useImageProcessor = () => {
  
  const processImageWithHolds = (imageSrc: string, holds: Hold[], originalWidth: number, originalHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Définir les dimensions du canvas
        canvas.width = originalWidth
        canvas.height = originalHeight
        
        // Dessiner l'image originale
        ctx!.drawImage(img, 0, 0, originalWidth, originalHeight)
        
        // Dessiner les marqueurs de prises
        holds.forEach((hold, index) => {
          drawHoldMarker(ctx!, hold, index + 1)
        })
        
        // Convertir en base64
        const processedImageData = canvas.toDataURL('image/png', 0.9)
        resolve(processedImageData)
      }
      
      img.onerror = () => {
        reject(new Error('Impossible de charger l\'image'))
      }
      
      img.src = imageSrc
    })
  }
  
  const drawHoldMarker = (ctx: CanvasRenderingContext2D, hold: Hold, number: number): void => {
    const { actualX, actualY, type } = hold
    
    // Couleurs selon le type de prise
    const colors = {
      start: '#10B981', // Vert
      normal: '#3B82F6', // Bleu
      finish: '#EF4444'  // Rouge
    }
    
    const color = colors[type]
    const radius = type === 'start' || type === 'finish' ? 25 : 20
    
    // Sauvegarder le contexte
    ctx.save()
    
    // Dessiner le cercle de fond
    ctx.beginPath()
    ctx.arc(actualX, actualY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
    
    // Bordure blanche
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 4
    ctx.stroke()
    
    // Ombre pour le cercle
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    // Dessiner le cercle avec ombre
    ctx.beginPath()
    ctx.arc(actualX, actualY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 4
    ctx.stroke()
    
    // Réinitialiser l'ombre pour le texte
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
    ctx.shadowBlur = 3
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1
    
    // Dessiner le numéro
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold ${radius * 0.8}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(number.toString(), actualX, actualY)
    
    // Restaurer le contexte
    ctx.restore()
  }
  
  const downloadProcessedImage = (imageSrc: string, holds: Hold[], originalWidth: number, originalHeight: number, filename: string): void => {
    processImageWithHolds(imageSrc, holds, originalWidth, originalHeight)
      .then(processedImageData => {
        // Créer un lien de téléchargement
        const link = document.createElement('a')
        link.download = `${filename}_avec_marqueurs.png`
        link.href = processedImageData
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch(error => {
        console.error('Erreur lors du traitement de l\'image:', error)
        alert('Erreur lors du traitement de l\'image')
      })
  }
  
  return {
    processImageWithHolds,
    downloadProcessedImage
  }
}