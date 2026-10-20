(() => {
  'use strict';

  const card = document.getElementById('wishCard');
  const reading = document.getElementById('cardReading');
  const recipient = document.getElementById('cardRecipient');
  const title = document.getElementById('cardTitle');
  const message = document.getElementById('cardMessage');
  const signature = document.getElementById('cardSignature');

  function readText(element) {
    if (!element) return '';
    const copy = element.cloneNode(true);
    copy.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    return copy.textContent.trim();
  }

  const greeting = {
    recipient: readText(recipient) || 'Ánh yêu của anh',
    title: readText(title) || 'Mong những điều ngọt ngào nhất\nluôn nở rộ bên em.',
    message: message && message.querySelectorAll('p').length
      ? [...message.querySelectorAll('p')].map(readText).join('\n\n')
      : 'Một bông hoa có thể làm một ngày thêm đẹp.\nCòn nụ cười của Ánh, làm cả thế giới của anh bừng sáng.\n\nNhân ngày 20/10, chúc em bé của anh luôn được yêu thương, trân trọng và ngập tràn hạnh phúc. Dù hôm nay ở xa không kề bên được, nhưng từng nhịp đập của trái tim anh đều hướng về Ánh.\n\nHôm nay và cả những ngày sau,\nhãy cứ luôn rạng rỡ và an yên nhé. Chờ anh về với em!',
    signature: readText(signature) || 'Yêu Ánh thật nhiều ♡'
  };

  function renderGreeting() {
    if (recipient) recipient.textContent = greeting.recipient;
    if (title) title.textContent = greeting.title;
    if (signature) signature.textContent = greeting.signature;
    if (message) {
      message.replaceChildren(...greeting.message.split(/\n\s*\n/).map(text => {
        const paragraph = document.createElement('p');
        paragraph.className = 'message';
        paragraph.textContent = text;
        return paragraph;
      }));
    }
  }

  renderGreeting();
})();
