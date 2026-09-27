/**
 * MOHIT — Interactive Ideas Node Canvas
 * Renders connected network of problem/product nodes with animated red data pulses
 */

(function () {
  'use strict';

  const canvas = document.getElementById('ideas-node-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let nodes = [];
  let mouse = { x: null, y: null, radius: 140 };
  let activeNodeIndex = -1;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
    createNodes();
  }

  function createNodes() {
    nodes = [];
    const count = Math.min(Math.floor((width * height) / 18000), 32);

    for (let i = 0; i < count; i++) {
      const isAnchor = i < 3; // First 3 correspond to the 3 main idea cards
      nodes.push({
        x: isAnchor ? (width / 4) * (i + 1) : Math.random() * width,
        y: isAnchor ? height * 0.45 + (Math.random() - 0.5) * 80 : Math.random() * height,
        baseX: isAnchor ? (width / 4) * (i + 1) : 0,
        baseY: isAnchor ? height * 0.45 : 0,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: isAnchor ? 5 : 2.5 + Math.random() * 2,
        isAnchor: isAnchor,
        pulseOffset: Math.random() * Math.PI * 2,
        color: isAnchor ? '#ff2a23' : '#b8b8b8'
      });
    }
  }

  function animate(time) {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);

    // Draw connection lines
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 160;

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.35;
          const isHighlighted = (i === activeNodeIndex || j === activeNodeIndex);

          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);

          if (isHighlighted) {
            ctx.strokeStyle = `rgba(255, 42, 35, ${Math.min(alpha * 2.5, 0.85)})`;
            ctx.lineWidth = 1.5;
            
            // Draw traveling pulse dot
            const progress = (time * 0.0015 + i) % 1;
            const px = nodes[i].x + (nodes[j].x - nodes[i].x) * progress;
            const py = nodes[i].y + (nodes[j].y - nodes[i].y) * progress;
            ctx.fillStyle = '#ff2a23';
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.strokeStyle = `rgba(180, 180, 180, ${alpha * 0.4})`;
            ctx.lineWidth = 0.75;
          }
          ctx.stroke();
        }
      }
    }

    // Connect to mouse if nearby
    if (mouse.x !== null) {
      for (let i = 0; i < nodes.length; i++) {
        const dx = mouse.x - nodes[i].x;
        const dy = mouse.y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const alpha = (1 - dist / mouse.radius) * 0.45;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(225, 6, 0, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Update and draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Physics / drift
      node.x += node.vx;
      node.y += node.vy;

      // Bounce at boundary
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          node.x += (dx / dist) * force * 1.5;
          node.y += (dy / dist) * force * 1.5;
        }
      }

      const isCurrentActive = i === activeNodeIndex;
      const pulsingRadius = node.radius + Math.sin(time * 0.003 + node.pulseOffset) * 1.2;

      ctx.beginPath();
      ctx.arc(node.x, node.y, isCurrentActive ? pulsingRadius * 1.8 : pulsingRadius, 0, Math.PI * 2);
      ctx.fillStyle = isCurrentActive ? '#ff2a23' : node.color;
      ctx.fill();

      if (node.isAnchor || isCurrentActive) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, (isCurrentActive ? 14 : 9) + Math.sin(time * 0.004) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = isCurrentActive ? 'rgba(255, 42, 35, 0.7)' : 'rgba(225, 6, 0, 0.3)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
  }

  // Connect Card Hover to Node Highlight
  const ideaCards = document.querySelectorAll('.idea-card');
  ideaCards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
      activeNodeIndex = index;
    });
    card.addEventListener('mouseleave', () => {
      activeNodeIndex = -1;
    });
  });

  const canvasParent = canvas.parentElement;
  canvasParent.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvasParent.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resize);

  // Initialize
  resize();
  requestAnimationFrame(animate);
})();
