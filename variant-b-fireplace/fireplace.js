(function () {
  var ad = document.querySelector('.ad');
  if (!ad) return;

  var clickTag = new URLSearchParams(window.location.search).get('clickTag') ||
    window.clickTag ||
    'https://example.com/';

  function start() {
    ad.classList.add('is-started');
  }

  function restart() {
    ad.classList.remove('is-started');
    void ad.offsetWidth;
    start();
  }

  window.addEventListener('message', function (event) {
    if (!event.data) return;
    if (event.data.type === 'fireplace:start') start();
    if (event.data.type === 'fireplace:restart') restart();
  });

  if (window.parent === window) {
    start();
  } else {
    window.parent.postMessage({ type: 'fireplace:ready' }, '*');
  }

  ad.addEventListener('click', function () {
    window.open(clickTag, '_blank', 'noopener,noreferrer');
  });
}());
