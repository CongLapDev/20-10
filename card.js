(() => {
  'use strict';

  const defaultGreeting = {
    recipient: 'Ánh yêu của anh',
    message: 'Hôm nay là ngày 20/10, ngày tôn vinh những người phụ nữ tuyệt vời nhất, và với anh, em chính là món quà quý giá và ngọt ngào nhất mà cuộc sống đã mang lại.\n\nAnh rất tiếc và nhớ em nhiều lắm khi hôm nay ở xa không thể kề bên để tự tay trao tặng hoa và ôm em thật chặt như mong muốn. Nhưng khoảng cách địa lý không thể nào ngăn được nỗi nhớ và tình yêu anh dành cho Ánh từng giây phút.\n\nBó hoa tươi này anh gửi trọn tình cảm chân thành nhất. Mong Ánh của anh luôn mạnh khỏe, bình an, công việc thuận lợi và nụ cười rạng rỡ ấy sẽ mãi nở trên môi mỗi ngày. Phía sau em luôn có anh dõi theo, chở che và thương em vô điều kiện.\n\nChờ anh về nhé, anh sẽ bù đắp cho em thật nhiều. Chúc em bé của anh một ngày 20/10 ngập tràn niềm vui và hạnh phúc!',
    sender: 'Người yêu em nhiều nhất ♡'
  };
  const dialog = document.getElementById('greetingCard');
  const openButton = document.getElementById('openCard');
  const reading = document.getElementById('cardReading');
  const status = document.getElementById('cardStatus');
  const closeButton = document.getElementById('closeCard');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopLayout = window.matchMedia('(min-width: 1100px)');
  const sceneElements = [...document.querySelectorAll('.bouquet-composition, .scene-footer')];
  const layoutAnimations = new Set();
  const album = document.getElementById('memoryAlbum');
  const albumToggle = document.getElementById('toggleAlbum');
  const albumObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      album.classList.add('is-revealed');
      albumObserver.unobserve(album);
    }
  }, { threshold: 0.08 });

  let albumRevealPromise;
  function revealAlbum() {
    if (albumRevealPromise) return albumRevealPromise;
    const photos = [...album.querySelectorAll('img')];
    photos.forEach(photo => { photo.loading = 'eager'; });
    albumRevealPromise = Promise.resolve(window.albumPhotosReady)
      .then(() => Promise.allSettled(photos.map(photo => photo.decode())))
      .then(() => {
        album.hidden = false;
        albumObserver.observe(album);
      });
    return albumRevealPromise;
  }

  if (albumToggle) {
    albumToggle.addEventListener('click', () => {
      const expanded = album.classList.toggle('is-spread');
      albumToggle.setAttribute('aria-expanded', String(expanded));
      albumToggle.innerHTML = expanded ? 'Gấp album <span aria-hidden="true">♡</span>' : 'Xòe album <span aria-hidden="true">♡</span>';
    });
  }

  const viewAlbumBtn = document.getElementById('viewAlbum');
  if (viewAlbumBtn) {
    viewAlbumBtn.addEventListener('click', async () => {
      await revealAlbum();
      album.classList.add('is-revealed');
      album.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
      if (albumToggle) albumToggle.focus({ preventScroll: true });
    });
  }

  function reflowScene(changeLayout) {
    layoutAnimations.forEach(animation => animation.cancel());
    layoutAnimations.clear();
    const before = sceneElements.map(element => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left + window.scrollX, top: rect.top + window.scrollY, width: rect.width, height: rect.height };
    });
    changeLayout();
    if (motion.matches) return;
    sceneElements.forEach((element, index) => {
      const after = element.getBoundingClientRect();
      if (!after.width || !after.height) return;
      const dx = before[index].left - after.left - window.scrollX;
      const dy = before[index].top - after.top - window.scrollY;
      const scale = element.matches('.bouquet-composition')
        ? ` scale(${before[index].width / after.width}, ${before[index].height / after.height})` : '';
      const animation = element.animate([
        { transform: `translate(${dx}px, ${dy}px)${scale}` },
        { transform: 'none' }
      ], { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' });
      layoutAnimations.add(animation);
      animation.onfinish = () => layoutAnimations.delete(animation);
    });
  }

  function revealCard() {
    const rect = dialog.getBoundingClientRect();
    if (!desktopLayout.matches || rect.top < 16 || rect.top > window.innerHeight * 0.35 || rect.bottom > window.innerHeight - 16) {
      dialog.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
    }
  }

  function setCardOpen(open) {
    if (dialog.open === open) return;
    reflowScene(() => {
      if (open) {
        showReading();
        if (status) status.textContent = '';
        document.body.classList.add('card-open');
        dialog.show();
      } else {
        dialog.close();
        document.body.classList.remove('card-open');
        showReading();
      }
      openButton.setAttribute('aria-expanded', String(open));
      openButton.querySelector('.envelope-action').textContent = open ? 'Gấp thiệp' : 'Mở thiệp';
    });
    if (open) {
      closeButton.focus({ preventScroll: true });
      revealAlbum();
      revealCard();
      document.dispatchEvent(new Event('bouquet:celebrate'));
    } else {
      openButton.focus({ preventScroll: true });
      const rect = openButton.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        openButton.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'center' });
      }
    }
  }

  motion.addEventListener('change', () => {
    if (motion.matches) {
      layoutAnimations.forEach(animation => animation.cancel());
      layoutAnimations.clear();
    }
  });

  const greeting = { ...defaultGreeting };

  function renderGreeting() {
    const recipientEl = document.getElementById('cardRecipient');
    if (recipientEl) recipientEl.textContent = greeting.recipient;
    const messageEl = document.getElementById('cardMessage');
    if (messageEl) {
      const paragraphs = greeting.message.split(/\n\s*\n/).map(text => {
        const paragraph = document.createElement('span');
        paragraph.className = 'message-paragraph';
        paragraph.textContent = text;
        return paragraph;
      });
      messageEl.replaceChildren(...paragraphs);
    }
    const senderEl = document.getElementById('cardSender');
    if (senderEl) senderEl.textContent = greeting.sender;
  }

  function showReading() {
    if (reading) reading.hidden = false;
    dialog.setAttribute('aria-labelledby', 'cardTitle');
    dialog.scrollTop = 0;
  }

  document.addEventListener('bouquet:ready', () => { openButton.hidden = false; });
  document.addEventListener('bouquet:rose', event => {
    const wish = document.getElementById('roseWish');
    if (wish) {
      wish.classList.remove('is-new');
      wish.textContent = event.detail.message;
      void wish.offsetWidth;
      wish.classList.add('is-new');
    }
  });
  const replayBtn = document.getElementById('replayBloom');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      document.dispatchEvent(new Event('bouquet:replay'));
      const wish = document.getElementById('roseWish');
      if (wish) wish.textContent = '';
    });
  }

  openButton.addEventListener('click', () => setCardOpen(!dialog.open));
  closeButton.addEventListener('click', () => setCardOpen(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.open && !event.defaultPrevented) {
      event.preventDefault();
      setCardOpen(false);
    }
  });
  dialog.addEventListener('close', () => {
    if (dialog.open || !document.body.classList.contains('card-open')) return;
    document.body.classList.remove('card-open');
    openButton.setAttribute('aria-expanded', 'false');
    openButton.querySelector('.envelope-action').textContent = 'Mở thiệp';
    showReading();
  });

  renderGreeting();
})();
