(() => {
  'use strict';

  const album = document.getElementById('memoryAlbum');
  const cards = [...(album ? album.querySelectorAll('.album-card') : [])];

  const lightbox = document.getElementById('photoLightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
  const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;

  function closeLightboxModal() {
    if (!lightbox) return;
    if (typeof lightbox.close === 'function') {
      try { lightbox.close(); } catch {}
    }
    lightbox.removeAttribute('open');
  }

  function openLightbox(src, text, date) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) {
      lightboxCaption.innerHTML = `<span class="lightbox-text">${text}</span><span class="lightbox-date">${date}</span>`;
    }
    if (typeof lightbox.showModal === 'function') {
      try {
        lightbox.showModal();
      } catch {
        lightbox.setAttribute('open', '');
      }
    } else {
      lightbox.setAttribute('open', '');
    }
    if (window.playSparkleChime) window.playSparkleChime();
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightboxModal);
  }
  if (lightbox) {
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) closeLightboxModal();
    });
  }

  window.albumPhotosReady = Promise.allSettled(cards.map(async (card) => {
    const photo = card.querySelector('img');
    const photoWrap = card.querySelector('.portrait-photo');

    if (photoWrap && photo) {
      photoWrap.style.cursor = 'zoom-in';
      photoWrap.addEventListener('click', () => {
        const dedication = card.querySelector('.portrait-dedication')?.textContent || '';
        const date = card.querySelector('.portrait-date')?.textContent || '';
        openLightbox(photo.src, dedication, date);
      });
    }

    if (photo) {
      try {
        await photo.decode();
      } catch {
        // Fallback
      }
    }
  }));
})();
