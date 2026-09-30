(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const transition = document.getElementById('garden-transition');
  const entry = document.querySelector('.garden-entry');

  if (entry && transition) {
    entry.addEventListener('click', (event) => {
      if (reduceMotion || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();

      const destination = entry.href;
      const x = event.clientX || innerWidth / 2;
      const y = event.clientY || innerHeight / 2;
      const radius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y)
      );

      transition.style.setProperty('--x', `${x}px`);
      transition.style.setProperty('--y', `${y}px`);
      transition.replaceChildren();

      for (let ring = 0; ring < 4; ring += 1) {
        const ripple = document.createElement('i');
        ripple.className = 'garden-ripple';
        ripple.style.setProperty('--x', `${x}px`);
        ripple.style.setProperty('--y', `${y}px`);
        ripple.style.setProperty('--turn', `${ring * 13 - 18}deg`);
        ripple.style.setProperty('--spread', `${(radius / 24) * (1 + ring * .14)}`);
        ripple.style.setProperty('--delay', `${ring * 45}ms`);
        transition.appendChild(ripple);
      }

      for (let index = 0; index < 32; index += 1) {
        const angle = (Math.PI * 2 * index / 32) + (Math.random() - .5) * .35;
        const distance = radius * (.32 + Math.random() * .76);
        const leaf = document.createElement('i');
        leaf.className = 'leaf-wave';
        leaf.style.setProperty('--x', `${x}px`);
        leaf.style.setProperty('--y', `${y}px`);
        leaf.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
        leaf.style.setProperty('--dy', `${Math.sin(angle) * distance + Math.sin(index) * 36}px`);
        leaf.style.setProperty('--size', `${18 + Math.random() * 32}px`);
        leaf.style.setProperty('--start', `${angle * 180 / Math.PI - 35}deg`);
        leaf.style.setProperty('--end', `${angle * 180 / Math.PI + 110 + Math.random() * 90}deg`);
        leaf.style.setProperty('--delay', `${20 + Math.random() * 120}ms`);
        transition.appendChild(leaf);
      }

      transition.classList.add('is-active');
      window.setTimeout(() => window.location.assign(destination), 880);
    });
  }

  const garden = document.getElementById('cursor-garden');
  const canTrail = window.matchMedia('(pointer: fine)').matches && !reduceMotion;
  if (!canTrail || !garden) return;

  const images = [
    'assets/trail-flower.png',
    'assets/trail-mushroom.png',
    'assets/trail-berries.png'
  ];
  const trailSpacing = .2 * 96 / 2.54;
  let last = { x: 0, y: 0, t: performance.now() };
  let hasPointerPosition = false;
  let distanceBank = 0;
  let imageIndex = 0;

  function createCard(x, y, speed) {
    const img = new Image();
    img.className = 'trail-card';
    img.src = images[imageIndex++ % images.length];
    img.alt = '';
    garden.appendChild(img);

    const side = Math.random() > .5 ? 1 : -1;
    const offsetX = side * (20 + Math.random() * 40);
    const offsetY = -18 + Math.random() * 36;
    const driftX = side * (18 + Math.random() * 38) + (Math.random() - .5) * speed * 18;
    const driftY = -18 - Math.random() * 48;
    const startRotation = -8 + Math.random() * 16;
    const endRotation = startRotation + side * (4 + Math.random() * 8);
    const birthScale = .65 + Math.min(speed, 1.5) * .06;
    const peakScale = .84 + Math.random() * .12;
    const endScale = .46 + Math.random() * .14;
    const lifetime = 650 + Math.random() * 430;

    const animation = img.animate([
      { transform: `translate3d(${x + offsetX}px, ${y + offsetY}px, 0) rotate(${startRotation - side * 5}deg) scale(${birthScale})`, opacity: 0 },
      { transform: `translate3d(${x + offsetX + driftX * .08}px, ${y + offsetY + driftY * .04}px, 0) rotate(${startRotation}deg) scale(${peakScale})`, opacity: .88, offset: .13 },
      { transform: `translate3d(${x + offsetX + driftX * .58}px, ${y + offsetY + driftY * .52}px, 0) rotate(${startRotation + side * 2}deg) scale(${peakScale * .9})`, opacity: .55, offset: .55 },
      { transform: `translate3d(${x + offsetX + driftX}px, ${y + offsetY + driftY}px, 0) rotate(${endRotation}deg) scale(${endScale})`, opacity: 0 }
    ], { duration: lifetime, easing: 'cubic-bezier(.16,.76,.25,1)', fill: 'forwards' });

    animation.finished.then(() => img.remove()).catch(() => img.remove());
  }

  window.addEventListener('pointermove', (event) => {
    const now = performance.now();
    if (!hasPointerPosition) {
      last = { x: event.clientX, y: event.clientY, t: now };
      hasPointerPosition = true;
      return;
    }

    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    const dt = Math.max(8, now - last.t);
    const distance = Math.hypot(dx, dy);
    const speed = Math.min(2.2, distance / dt * 1.8);

    if (distance > 0) {
      let nextDistance = trailSpacing - distanceBank;
      let spawned = 0;
      while (nextDistance <= distance && spawned < 32) {
        const ratio = nextDistance / distance;
        createCard(last.x + dx * ratio, last.y + dy * ratio, speed);
        nextDistance += trailSpacing;
        spawned += 1;
      }
      distanceBank = (distanceBank + distance) % trailSpacing;
    }
    last = { x: event.clientX, y: event.clientY, t: now };
  }, { passive: true });
})();
