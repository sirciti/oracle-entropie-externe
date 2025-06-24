// Animation favicon ULTRA avec vidéo pour effet WAwa
const staticFrames = [
  '/favicon.ico',
  '/favicon.png', 
  '/favicon_1.png',
  '/favicon_2.png'
];

class WAwaFaviconAnimator {
  constructor() {
    this.staticFrames = staticFrames;
    this.currentFrame = 0;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 32;
    this.canvas.height = 32;
    this.ctx = this.canvas.getContext('2d');
    this.video = null;
    this.mode = 'static'; // 'static' ou 'video'
    this.frameRate = 200; // 200ms pour effet WAwa rapide
  }
  
  async initVideo() {
    this.video = document.createElement('video');
    this.video.src = '/vid_favicon.mp4';
    this.video.loop = true;
    this.video.muted = true;
    this.video.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
      this.video.addEventListener('loadeddata', () => {
        console.log("🎬 Vidéo favicon chargée pour effet WAwa");
        resolve();
      });
      this.video.load();
    });
  }
  
  start() {
    // Démarrer avec images statiques
    this.startStaticAnimation();
    
    // Charger et basculer vers vidéo après 3 secondes
    setTimeout(async () => {
      await this.initVideo();
      this.startVideoMode();
    }, 3000);
  }
  
  startStaticAnimation() {
    this.staticInterval = setInterval(() => {
      if (this.mode === 'static') {
        this.updateStaticFavicon();
      }
    }, this.frameRate);
  }
  
  startVideoMode() {
    this.mode = 'video';
    this.video.play();
    
    // Animation vidéo temps réel
    const updateVideoFavicon = () => {
      if (this.mode === 'video' && this.video.readyState >= 2) {
        // Dessiner frame vidéo sur canvas 32x32
        this.ctx.drawImage(this.video, 0, 0, 32, 32);
        
        // Effet WAwa : Ajouter pulsation colorée
        this.addWAwaEffect();
        
        // Convertir en favicon
        const dataURL = this.canvas.toDataURL('image/png');
        this.updateFaviconWithDataURL(dataURL);
      }
      
      if (this.mode === 'video') {
        requestAnimationFrame(updateVideoFavicon);
      }
    };
    
    updateVideoFavicon();
    
    // Alterner entre vidéo et images toutes les 10 secondes pour effet WAwa
    setInterval(() => {
      this.mode = this.mode === 'video' ? 'static' : 'video';
      if (this.mode === 'video') {
        this.video.play();
        updateVideoFavicon();
      }
      console.log(`🌀 Mode WAwa: ${this.mode}`);
    }, 10000);
  }
  
  addWAwaEffect() {
    // Effet WAwa : Overlay coloré pulsant
    const time = Date.now() * 0.005;
    const pulse = Math.sin(time) * 0.3 + 0.7;
    
    // Gradient coloré WAwa
    const gradient = this.ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, `rgba(0, 255, 255, ${pulse * 0.3})`);
    gradient.addColorStop(1, `rgba(255, 0, 255, ${pulse * 0.1})`);
    
    this.ctx.globalCompositeOperation = 'overlay';
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, 32, 32);
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  updateStaticFavicon() {
    this.currentFrame = (this.currentFrame + 1) % this.staticFrames.length;
    
    // Supprimer ancien favicon
    const oldFavicon = document.querySelector("link[rel='icon']");
    if (oldFavicon) oldFavicon.remove();
    
    // Créer nouveau favicon
    const newFavicon = document.createElement('link');
    newFavicon.rel = 'icon';
    newFavicon.type = 'image/png';
    newFavicon.href = this.staticFrames[this.currentFrame];
    document.head.appendChild(newFavicon);
  }
  
  updateFaviconWithDataURL(dataURL) {
    // Supprimer ancien favicon
    const oldFavicon = document.querySelector("link[rel='icon']");
    if (oldFavicon) oldFavicon.remove();
    
    // Créer nouveau favicon avec vidéo
    const newFavicon = document.createElement('link');
    newFavicon.rel = 'icon';
    newFavicon.type = 'image/png';
    newFavicon.href = dataURL;
    document.head.appendChild(newFavicon);
  }
  
  // Synchronisation avec entropie pour effet WAwa
  syncWithEntropy(shannonValue) {
    if (shannonValue > 4.5) {
      this.frameRate = 100; // Super rapide pour effet WAwa intense
    } else {
      this.frameRate = 300; // Normal
    }
  }
}

// Instance globale
window.WAwaFaviconAnimator = new WAwaFaviconAnimator();

// Démarrage automatique
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.WAwaFaviconAnimator.start();
  }, 1000);
});

export { WAwaFaviconAnimator };
