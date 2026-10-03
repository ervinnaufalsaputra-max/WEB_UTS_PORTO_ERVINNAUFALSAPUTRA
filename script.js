const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== Jaringan interaktif di hero =====
(function () {
  const canvas = document.getElementById("net");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const mouse = { x: -999, y: -999 };
  let w, h, nodes = [], packets = [];
  const LINK = 140, REACH = 180;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.floor((w * h) / 14000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35
    }));
  }

  function edges() {
    const list = [];
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < LINK) list.push([i, j, d]);
      }
    return list;
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    nodes.forEach(n => {
      if (!reduceMotion) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
    });

    const list = edges();
    list.forEach(([i, j, d]) => {
      const a = nodes[i], b = nodes[j];
      const near = Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y) < REACH;
      ctx.strokeStyle = near ? "rgba(255,183,3,0.75)" : `rgba(120,150,210,${0.28 * (1 - d / LINK)})`;
      ctx.lineWidth = near ? 1.4 : 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });

    nodes.forEach(n => {
      const near = Math.hypot(n.x - mouse.x, n.y - mouse.y) < REACH;
      ctx.fillStyle = near ? "#ffb703" : "rgba(160,185,235,0.7)";
      ctx.beginPath(); ctx.arc(n.x, n.y, near ? 3 : 2, 0, Math.PI * 2); ctx.fill();
    });

    if (!reduceMotion) {
      if (list.length && packets.length < 6 && Math.random() < 0.04) {
        const e = list[Math.floor(Math.random() * list.length)];
        packets.push({ a: e[0], b: e[1], t: 0 });
      }
      packets = packets.filter(p => p.t < 1);
      packets.forEach(p => {
        p.t += 0.02;
        const a = nodes[p.a], b = nodes[p.b];
        ctx.fillStyle = "#ffb703";
        ctx.shadowColor = "#ffb703"; ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(a.x + (b.x - a.x) * p.t, a.y + (b.y - a.y) * p.t, 3, 0, Math.PI * 2);
        ctx.fill(); ctx.shadowBlur = 0;
      });
      requestAnimationFrame(frame);
    }
  }

  window.addEventListener("resize", () => { resize(); if (reduceMotion) frame(); });
  window.addEventListener("pointermove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  window.addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });
  resize(); frame();
})();

// ===== Efek mengetik =====
(function () {
  const el = document.getElementById("typing");
  if (!el || reduceMotion) return;
  const words = ["Cybersecurity", "Ethical Hacking", "Network Security", "Network Engineering"];
  let wi = 0, ci = 0, del = false;
  (function tick() {
    const word = words[wi];
    el.textContent = word.slice(0, del ? --ci : ++ci);
    let delay = del ? 45 : 95;
    if (!del && ci === word.length) { del = true; delay = 1600; }
    else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; delay = 300; }
    setTimeout(tick, delay);
  })();
})();

// ===== Progress scroll dan menu aktif =====
const bar = document.getElementById("progress");
const links = document.querySelectorAll(".nav-menu a");
const secs = [...links].map(a => document.querySelector(a.getAttribute("href")));

window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (scrollY / max * 100) + "%";
  let cur = -1;
  secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
  links.forEach((a, i) => a.classList.toggle("active", i === cur));
}, { passive: true });

// ===== Menu mobile =====
const btn = document.getElementById("menuBtn");
const menu = document.getElementById("navMenu");
btn.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  btn.setAttribute("aria-expanded", open);
});
links.forEach(a => a.addEventListener("click", () => {
  menu.classList.remove("open"); btn.setAttribute("aria-expanded", false);
}));

// ===== Tahun footer =====
document.getElementById("year").textContent = new Date().getFullYear();
