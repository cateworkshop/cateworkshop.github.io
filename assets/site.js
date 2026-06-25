(function () {
  const canvas = document.getElementById("trust-map");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const palette = ["#8ed8cf", "#f2bd4c", "#d67669", "#a7b2e6"];
  const nodes = Array.from({ length: 34 }, (_, index) => ({
    x: (index * 73 % 101) / 100,
    y: (index * 41 % 89) / 88,
    r: 2.4 + (index % 4) * 0.7,
    phase: index * 0.71,
    color: palette[index % palette.length],
  }));

  let width = 0;
  let height = 0;
  let animationFrame = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = Math.max(rect.width, 1);
    height = Math.max(rect.height, 1);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function nodePosition(node, time) {
    const drift = reduceMotion ? 0 : Math.sin(time * 0.00045 + node.phase) * 11;
    const counter = reduceMotion ? 0 : Math.cos(time * 0.00036 + node.phase) * 8;
    return {
      x: node.x * width + drift,
      y: node.y * height + counter,
    };
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(255, 253, 248, 0.03)";
    context.fillRect(0, 0, width, height);

    const positions = nodes.map((node) => nodePosition(node, time));

    for (let i = 0; i < positions.length; i += 1) {
      for (let j = i + 1; j < positions.length; j += 1) {
        const a = positions[i];
        const b = positions[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const threshold = Math.min(width, height) * 0.34;

        if (distance < threshold) {
          context.strokeStyle = `rgba(255, 253, 248, ${0.16 * (1 - distance / threshold)})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    }

    positions.forEach((position, index) => {
      const node = nodes[index];
      context.beginPath();
      context.fillStyle = node.color;
      context.shadowColor = node.color;
      context.shadowBlur = 14;
      context.arc(position.x, position.y, node.r, 0, Math.PI * 2);
      context.fill();
    });

    context.shadowBlur = 0;

    if (!reduceMotion) {
      animationFrame = window.requestAnimationFrame(draw);
    }
  }

  resize();
  draw(0);

  window.addEventListener("resize", () => {
    resize();
    draw(0);
  });

  if (!reduceMotion) {
    animationFrame = window.requestAnimationFrame(draw);
  }

  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(animationFrame);
  });
})();
