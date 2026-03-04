import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/* -----------------------------
   Mobile nav
------------------------------ */
const burger = document.getElementById("burger");
const mobileNav = document.getElementById("mobileNav");

function setMobile(open) {
  burger?.setAttribute("aria-expanded", String(open));
  mobileNav?.classList.toggle("show", open);
  mobileNav?.setAttribute("aria-hidden", String(!open));
}
burger?.addEventListener("click", () => {
  const open = burger.getAttribute("aria-expanded") !== "true";
  setMobile(open);
});
mobileNav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMobile(false)));

/* Footer year */
document.getElementById("year").textContent = String(new Date().getFullYear());

/* -----------------------------
   Scroll reveal
------------------------------ */
const reveals = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.14 });
reveals.forEach(el => io.observe(el));

/* -----------------------------
   Pricing -> Selected plan (demo)
------------------------------ */
const selectedPlanEl = document.getElementById("selectedPlan");
const PLAN_KEY = "taskflow_selected_plan";

function setPlan(plan) {
  if (!selectedPlanEl) return;
  selectedPlanEl.textContent = plan;
  localStorage.setItem(PLAN_KEY, plan);
}

const savedPlan = localStorage.getItem(PLAN_KEY);
if (savedPlan) setPlan(savedPlan);

document.querySelectorAll('[data-plan]').forEach(a => {
  a.addEventListener("click", () => {
    const plan = a.getAttribute("data-plan") || "Pro";
    setPlan(plan);
  });
});

/* -----------------------------
   Task Manager (functional demo)
   - add / toggle done
   - edit title
   - delete
   - filter: all/open/done
   - persist to localStorage
------------------------------ */
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");
const taskStats = document.getElementById("taskStats");
const clearDoneBtn = document.getElementById("clearDone");
const clearAllBtn = document.getElementById("clearAll");

const TASKS_KEY = "taskflow_tasks_v1";
let filter = "all";

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
    if (Array.isArray(data)) return data;
  } catch {}
  return [];
}
function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

let tasks = loadTasks();

/* seed if empty */
if (tasks.length === 0) {
  tasks = [
    { id: uid(), title: "Plan tomorrow in 5 minutes", priority: "low", done: false, createdAt: Date.now() - 500000 },
    { id: uid(), title: "Finish one meaningful task", priority: "high", done: false, createdAt: Date.now() - 200000 },
    { id: uid(), title: "Review what worked today", priority: "medium", done: true, createdAt: Date.now() - 100000 }
  ];
  saveTasks(tasks);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
}

function visibleTasks() {
  if (filter === "open") return tasks.filter(t => !t.done);
  if (filter === "done") return tasks.filter(t => t.done);
  return tasks;
}

function priorityLabel(p) {
  if (p === "high") return "High priority";
  if (p === "low") return "Low priority";
  return "Medium priority";
}

function render() {
  const vis = visibleTasks().slice().sort((a, b) => b.createdAt - a.createdAt);

  if (taskList) {
    taskList.innerHTML = vis.map(t => {
      const titleClass = t.done ? "taskrow__title done" : "taskrow__title";
      const pClass = t.priority === "high" ? "p-high" : t.priority === "low" ? "p-low" : "p-medium";
      const checked = t.done ? "checked" : "";
      return `
        <div class="taskrow" data-id="${t.id}">
          <input type="checkbox" ${checked} aria-label="Mark task as done" />
          <div>
            <div class="${titleClass}">${escapeHtml(t.title)}</div>
            <div class="taskrow__meta">
              <span class="pillmeta ${pClass}">${priorityLabel(t.priority)}</span>
              <span class="pillmeta">${new Date(t.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div class="taskrow__actions">
            <button class="iconbtn" type="button" data-action="edit" aria-label="Edit task">✎</button>
            <button class="iconbtn" type="button" data-action="delete" aria-label="Delete task">🗑</button>
          </div>
        </div>
      `;
    }).join("");

    if (vis.length === 0) {
      taskList.innerHTML = `<div class="muted">No tasks in this view. Add one above.</div>`;
    }
  }

  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const open = total - done;
  if (taskStats) taskStats.textContent = `${total} tasks · ${open} open · ${done} done`;

  // persist
  saveTasks(tasks);
}

function setFilter(next) {
  filter = next;
  document.querySelectorAll(".chipbtn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-filter") === next);
  });
  render();
}

document.querySelectorAll(".chipbtn").forEach(btn => {
  btn.addEventListener("click", () => setFilter(btn.getAttribute("data-filter") || "all"));
});

taskForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!taskForm.checkValidity()) return;

  const title = taskTitle.value.trim();
  const priority = taskPriority.value;

  tasks.push({
    id: uid(),
    title,
    priority,
    done: false,
    createdAt: Date.now()
  });

  taskTitle.value = "";
  taskPriority.value = "medium";
  taskTitle.focus();

  render();
});

taskList?.addEventListener("click", (e) => {
  const row = e.target.closest(".taskrow");
  if (!row) return;
  const id = row.getAttribute("data-id");
  const t = tasks.find(x => x.id === id);
  if (!t) return;

  // checkbox toggle
  if (e.target.matches('input[type="checkbox"]')) {
    t.done = e.target.checked;
    render();
    return;
  }

  const action = e.target?.getAttribute?.("data-action");
  if (action === "delete") {
    tasks = tasks.filter(x => x.id !== id);
    render();
    return;
  }

  if (action === "edit") {
    const next = prompt("Edit task title:", t.title);
    if (next === null) return;
    const trimmed = next.trim();
    if (trimmed.length < 2) return;
    t.title = trimmed;
    render();
    return;
  }
});

clearDoneBtn?.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.done);
  render();
});
clearAllBtn?.addEventListener("click", () => {
  const ok = confirm("Clear ALL tasks? This cannot be undone.");
  if (!ok) return;
  tasks = [];
  render();
});

/* initial render */
render();

/* -----------------------------
   Three.js background: Glass morphing blobs (metaball-like)
   Approach:
   - Raymarch signed-distance-field "metaballs" in a shader plane
   - Apply glassy shading + color accents
   - Smooth motion + mouse parallax
------------------------------ */
const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const uniforms = {
  uTime: { value: 0 },
  uRes: { value: new THREE.Vector2(1, 1) },
  uMouse: { value: new THREE.Vector2(0.5, 0.5) }
};

const vert = /* glsl */`
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const frag = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;

  // Helpers
  float smin(float a, float b, float k){
    float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k*h*(1.0-h);
  }

  mat2 rot(float a){
    float s = sin(a), c = cos(a);
    return mat2(c,-s,s,c);
  }

  // Metaball SDF (2D) + thickness into 3D-ish shading
  float ball(vec2 p, vec2 c, float r){
    return length(p - c) - r;
  }

  float map(vec2 p, float t){
    // center & mouse influence (subtle)
    vec2 m = (uMouse - 0.5) * vec2(uRes.x/uRes.y, 1.0) * 0.55;

    // animate centers
    vec2 c1 = vec2(-0.55,  0.10) + 0.18*vec2(sin(t*0.9), cos(t*0.7)) + m*0.35;
    vec2 c2 = vec2( 0.35, -0.18) + 0.22*vec2(cos(t*0.8), sin(t*0.6)) - m*0.25;
    vec2 c3 = vec2( 0.10,  0.45) + 0.16*vec2(sin(t*0.6+1.7), cos(t*0.9+2.1)) + m*0.20;
    vec2 c4 = vec2(-0.10, -0.55) + 0.14*vec2(cos(t*0.7+3.0), sin(t*0.8+0.3)) - m*0.15;

    float d1 = ball(p, c1, 0.42);
    float d2 = ball(p, c2, 0.36);
    float d3 = ball(p, c3, 0.33);
    float d4 = ball(p, c4, 0.38);

    // Smooth union
    float d = smin(d1, d2, 0.32);
    d = smin(d, d3, 0.30);
    d = smin(d, d4, 0.34);

    return d;
  }

  vec3 getNormal(vec2 p, float t){
    float e = 0.0018;
    float d = map(p, t);
    vec2 n = vec2(
      map(p + vec2(e,0.0), t) - d,
      map(p + vec2(0.0,e), t) - d
    );
    return normalize(vec3(n, e));
  }

  float hash(vec2 p){
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  void main(){
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0);

    float t = uTime;

    // background base
    vec3 bg = vec3(0.03, 0.04, 0.08);
    bg += vec3(0.05, 0.04, 0.10) * (0.6 - p.y);

    // SDF for blobs
    float d = map(p * rot(0.12*sin(t*0.08)), t);

    // mask for inside blob
    float inside = smoothstep(0.02, -0.02, d);

    // normals for fake refraction/reflection
    vec3 n = getNormal(p, t);

    // Glass shading: fresnel + soft spec
    vec3 viewDir = normalize(vec3(0.0, 0.0, 1.2));
    float fres = pow(1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 3.0);

    vec3 lightDir = normalize(vec3(0.6, 0.35, 1.0));
    float diff = clamp(dot(n, lightDir), 0.0, 1.0);
    float spec = pow(clamp(dot(reflect(-lightDir, n), viewDir), 0.0, 1.0), 48.0);

    // Color accents (TaskFlow palette)
    vec3 a = vec3(0.49, 0.23, 0.93);
    vec3 c = vec3(0.22, 0.74, 0.97);
    vec3 g = vec3(0.13, 0.77, 0.37);

    float swirl = 0.5 + 0.5*sin(2.2*p.x - 1.7*p.y + t*0.35);
    vec3 tint = mix(a, c, swirl);
    tint = mix(tint, g, 0.35 + 0.35*sin(t*0.25 + p.y*2.0));

    // "Refraction": shift background by normal
    vec2 refrUv = uv + n.xy * 0.018 * inside;
    vec3 refr = bg
      + vec3(0.04, 0.02, 0.08) * (0.5 + 0.5*sin(refrUv.x*7.0 + t*0.15))
      + vec3(0.02, 0.05, 0.06) * (0.5 + 0.5*cos(refrUv.y*6.0 - t*0.12));

    // Blob body
    vec3 blob = refr;
    blob = mix(blob, tint, 0.35);
    blob += diff * 0.22;
    blob += spec * 0.55;
    blob += fres * 0.35;

    // Edge highlight
    float edge = smoothstep(0.12, 0.0, abs(d));
    blob += edge * vec3(0.12, 0.16, 0.22);

    // Soft shadow-ish
    float ao = 1.0 - smoothstep(-0.35, 0.45, d);
    blob *= 0.75 + 0.25*ao;

    // Composite
    vec3 col = mix(bg, blob, inside);

    // subtle grain + stars
    float grain = (hash(uv * uRes + t) - 0.5) * 0.03;
    col += grain;

    float stars = step(0.995, hash(uv * vec2(uRes.x/uRes.y, 1.0) * 520.0 + t*0.02));
    col += vec3(1.0) * stars * 0.18;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms })
);
scene.add(plane);

window.addEventListener("pointermove", (e) => {
  uniforms.uMouse.value.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
});

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  uniforms.uRes.value.set(w, h);
}
window.addEventListener("resize", resize);
resize();

const clock = new THREE.Clock();
function tick() {
  uniforms.uTime.value = clock.getElapsedTime();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();