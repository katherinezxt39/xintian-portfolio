(() => {
  const garden = document.getElementById('cursor-garden');
  const images = [
    'assets/meadow-planner.png',
    'assets/campaign-camera.png',
    'assets/creative-still-life.png'
  ];

  const canAnimate = window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canAnimate || !garden) return;

  let last = { x: innerWidth / 2, y: innerHeight / 2, t: performance.now() };
  let distanceBank = 0;
  let imageIndex = 0;
  let lastSpawn = 0;

  function createCard(x, y, speed) {
    const now = performance.now();
    const minGap = Math.max(26, 84 - speed * 42);
    if (now - lastSpawn < minGap) return;
    lastSpawn = now;

    const img = new Image();
    img.className = 'trail-card';
    img.src = images[imageIndex++ % images.length];
    img.alt = '';
    garden.appendChild(img);

    const side = Math.random() > .5 ? 1 : -1;
    const offsetX = side * (24 + Math.random() * 48);
    const offsetY = -26 + Math.random() * 52;
    const driftX = side * (20 + Math.random() * 48) + (Math.random() - .5) * speed * 24;
    const driftY = -24 - Math.random() * 70;
    const startRotation = -11 + Math.random() * 22;
    const endRotation = startRotation + side * (5 + Math.random() * 13);
    const birthScale = .66 + Math.min(speed, 1.5) * .08;
    const peakScale = .88 + Math.random() * .17;
    const endScale = .48 + Math.random() * .16;
    const lifetime = 720 + Math.random() * 520;

    const animation = img.animate([
      { transform: `translate3d(${x + offsetX}px, ${y + offsetY}px, 0) rotate(${startRotation - side * 7}deg) scale(${birthScale})`, opacity: 0 },
      { transform: `translate3d(${x + offsetX + driftX * .08}px, ${y + offsetY + driftY * .04}px, 0) rotate(${startRotation}deg) scale(${peakScale})`, opacity: .96, offset: .13 },
      { transform: `translate3d(${x + offsetX + driftX * .58}px, ${y + offsetY + driftY * .52}px, 0) rotate(${startRotation + side * 3}deg) scale(${peakScale * .9})`, opacity: .66, offset: .55 },
      { transform: `translate3d(${x + offsetX + driftX}px, ${y + offsetY + driftY}px, 0) rotate(${endRotation}deg) scale(${endScale})`, opacity: 0 }
    ], {
      duration: lifetime,
      easing: 'cubic-bezier(.16,.76,.25,1)',
      fill: 'forwards'
    });

    animation.finished.then(() => img.remove()).catch(() => img.remove());
  }

  window.addEventListener('pointermove', (event) => {
    const now = performance.now();
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    const dt = Math.max(8, now - last.t);
    const distance = Math.hypot(dx, dy);
    const speed = Math.min(2.2, distance / dt * 1.8);

    distanceBank += distance;
    const spawnDistance = Math.max(22, 74 - speed * 25);
    if (distanceBank >= spawnDistance) {
      createCard(event.clientX, event.clientY, speed);
      distanceBank %= spawnDistance;
    }
    last = { x: event.clientX, y: event.clientY, t: now };
  }, { passive: true });
})();
