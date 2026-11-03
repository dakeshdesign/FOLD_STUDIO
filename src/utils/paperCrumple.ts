/**
 * ============================================================================
 * FOLD STUDIO — PAPER CRUMPLE TRANSITION
 * ============================================================================
 *
 * Turns any on-screen panel into a sheet of paper that unfolds out of a
 * crumpled ball, or crushes back into one (WebGL2, no dependencies).
 *
 * 1. snapshotElement() paints the panel's current look onto a canvas.
 * 2. playPaper() uses that canvas as the paper texture and runs the animation
 *    on a full-screen overlay canvas, then removes it.
 */

export type PaperMode = 'unfold' | 'crumple';

interface PlayOptions {
  rect: DOMRect;
  texture: HTMLCanvasElement;
  mode: PaperMode;
  /** Where the ball comes from when unfolding (e.g. the clicked button). */
  origin?: { x: number; y: number } | null;
  onDone?: () => void;
}

/* ---------------------------------------------------------------------------
 * Last pointer position — the ball flies out of whatever was clicked.
 * ------------------------------------------------------------------------- */
let lastPointer: { x: number; y: number; t: number } | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    (e) => {
      lastPointer = { x: e.clientX, y: e.clientY, t: performance.now() };
    },
    true
  );
}
export const getLastPointer = () =>
  lastPointer && performance.now() - lastPointer.t < 1500 ? lastPointer : null;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------------------
 * DOM → canvas snapshot (backgrounds, borders, text, form values).
 * Drawn by hand so the canvas never gets tainted (Safari blocks foreignObject).
 * ------------------------------------------------------------------------- */
const isVisibleColor = (c: string) => !!c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c);

export function snapshotElement(root: HTMLElement): HTMLCanvasElement {
  const box = root.getBoundingClientRect();
  const scale = Math.min(2, Math.max(1.5, window.devicePixelRatio || 1));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(box.width * scale));
  canvas.height = Math.max(1, Math.round(box.height * scale));
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  const rootStyle = getComputedStyle(root);
  ctx.fillStyle = isVisibleColor(rootStyle.backgroundColor) ? rootStyle.backgroundColor : '#F5F3EE';
  ctx.fillRect(0, 0, box.width, box.height);
  ctx.beginPath();
  ctx.rect(0, 0, box.width, box.height);
  ctx.clip();

  const range = document.createRange();
  const setFont = (cs: CSSStyleDeclaration) => {
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if ('letterSpacing' in ctx) (ctx as any).letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
  };
  const transform = (t: string, cs: CSSStyleDeclaration) =>
    cs.textTransform === 'uppercase' ? t.toUpperCase() : cs.textTransform === 'lowercase' ? t.toLowerCase() : t;

  const drawBorders = (r: DOMRect, cs: CSSStyleDeclaration) => {
    const x = r.left - box.left, y = r.top - box.top;
    const sides: [string, number, number, number, number][] = [
      ['Top', x, y, r.width, parseFloat(cs.borderTopWidth)],
      ['Bottom', x, y + r.height - parseFloat(cs.borderBottomWidth), r.width, parseFloat(cs.borderBottomWidth)],
      ['Left', x, y, parseFloat(cs.borderLeftWidth), r.height],
      ['Right', x + r.width - parseFloat(cs.borderRightWidth), y, parseFloat(cs.borderRightWidth), r.height],
    ];
    for (const [side, sx, sy, w, h] of sides) {
      const width = parseFloat((cs as any)[`border${side}Width`]);
      const color = (cs as any)[`border${side}Color`];
      if (width > 0 && isVisibleColor(color) && (cs as any)[`border${side}Style`] !== 'none') {
        ctx.fillStyle = color;
        ctx.fillRect(sx, sy, w, h);
      }
    }
  };

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (!text.trim()) return;
      const cs = getComputedStyle(node.parentElement!);
      setFont(cs);
      ctx.fillStyle = cs.color;
      ctx.textBaseline = 'middle';
      const re = /\S+/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        range.setStart(node, m.index);
        range.setEnd(node, m.index + m[0].length);
        const r = range.getClientRects()[0];
        if (!r || !r.width) continue;
        ctx.fillText(transform(m[0], cs), r.left - box.left, r.top - box.top + r.height / 2);
      }
      return;
    }
    if (!(node instanceof HTMLElement || node instanceof SVGElement)) return;
    const el = node as HTMLElement;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || (el !== root && cs.opacity === '0')) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < box.top || r.top > box.bottom) return;

    if (el !== root) {
      if (isVisibleColor(cs.backgroundColor)) {
        ctx.fillStyle = cs.backgroundColor;
        ctx.fillRect(r.left - box.left, r.top - box.top, r.width, r.height);
      }
      drawBorders(r, cs);
    }

    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      if (el instanceof HTMLInputElement && (el.type === 'hidden' || el.type === 'checkbox' || el.type === 'radio')) return;
      const value = el.value || el.placeholder;
      if (value) {
        setFont(cs);
        ctx.fillStyle = cs.color;
        ctx.globalAlpha = el.value ? 1 : 0.45;
        ctx.textBaseline = 'middle';
        const px = r.left - box.left + parseFloat(cs.paddingLeft);
        const py = el instanceof HTMLTextAreaElement
          ? r.top - box.top + parseFloat(cs.paddingTop) + parseFloat(cs.fontSize) * 0.7
          : r.top - box.top + r.height / 2;
        ctx.fillText(value.split('\n')[0], px, py, r.width - parseFloat(cs.paddingLeft) * 2);
        ctx.globalAlpha = 1;
      }
      return;
    }
    if (el instanceof SVGElement) return; // icons are left out of the paper print
    el.childNodes.forEach(walk);
  };

  walk(root);
  drawBorders(box, rootStyle);
  return canvas;
}

/* ---------------------------------------------------------------------------
 * WebGL paper
 * ------------------------------------------------------------------------- */
const VERT = `#version 300 es
precision highp float;
in vec2 aQ;                 // sheet coords, -0.5..0.5 (y down)
uniform vec2 uSize;         // sheet size in px
uniform vec2 uCenter;       // sheet center in viewport px
uniform vec2 uView;         // viewport size
uniform float uC;           // 0 = flat, 1 = crushed ball
uniform float uScale;
uniform vec3 uRot;          // euler radians
uniform float uSeed;
out vec2 vUv;
out vec3 vPos;
out float vCrease;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32+uSeed); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float ridged(vec2 p){ return 1.0 - abs(noise(p)*2.0 - 1.0); }
// Straight fold lines (mountain / valley) summed together: flat facets with sharp creases, like real paper
float folds(vec2 q, float salt){
  float z = 0.0;
  for (int i = 0; i < 18; i++){
    float fi = float(i) + salt;
    vec2 p = vec2(hash(vec2(fi, 1.3)), hash(vec2(fi, 7.7))) - 0.5;
    float a = hash(vec2(fi, 3.1)) * 6.2832;
    float d = dot(q - p, vec2(cos(a), sin(a)));
    float amp = mix(0.035, 0.09, hash(vec2(fi, 5.9)));
    float freq = mix(1.4, 4.2, hash(vec2(fi, 2.2)));
    float sgn = hash(vec2(fi, 9.4)) > 0.5 ? 1.0 : -1.0;
    z += sgn * amp * (abs(fract(d * freq + hash(vec2(fi, 4.4))) - 0.5) * 2.0 - 0.5);
  }
  return z;
}
mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1,0,0, 0,c,s, 0,-s,c); }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0,-s, 0,1,0, s,0,c); }
mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,s,0, -s,c,0, 0,0,1); }

void main(){
  vUv = aQ + 0.5;
  float m = max(uSize.x, uSize.y);
  vec2 qa = aQ * uSize / m;                       // aspect-correct sheet coords

  // 1. wrinkles: sharp ridges at two scales, growing as the sheet is crushed
  float cw = smoothstep(0.0, 0.55, uC);
  float f1 = folds(qa, 0.0);
  float f2 = folds(qa * 2.3, 40.0);
  float crease = f1 + 0.45 * f2 + (ridged(qa*3.0 + uSeed*7.0) - 0.5) * 0.12;
  vec3 sheet = vec3(aQ * uSize * (1.0 - 0.22*cw), 0.0);
  sheet.z = crease * cw * m * 0.8;
  sheet.xy += (vec2(noise(qa*4.0+1.7), noise(qa*4.0+9.1)) - 0.5) * cw * m * 0.08;

  // 2. ball: wrap the sheet around a lumpy sphere, edges tucked behind
  float r = length(qa) * 2.0;
  float th = min(r * 2.05, 3.08);
  float ph = atan(qa.y, qa.x);
  float R = m * 0.15 * (1.0 + 0.5*folds(qa*1.6, 80.0) + 0.22*folds(qa*3.2, 120.0));
  vec3 ball = vec3(sin(th)*cos(ph), sin(th)*sin(ph), cos(th)) * R;

  float cb = smoothstep(0.18, 1.0, uC);
  vec3 p = mix(sheet, ball, cb*cb*(3.0-2.0*cb));
  p = rotZ(uRot.z) * rotY(uRot.y) * rotX(uRot.x) * p * uScale;

  vPos = p;
  vCrease = abs(crease) * cw;

  // perspective about the viewport center, y down in screen space
  float F = 1600.0;
  float s = F / (F - p.z);
  vec2 screen = uView*0.5 + (uCenter + p.xy - uView*0.5) * s;
  gl_Position = vec4(screen.x / uView.x * 2.0 - 1.0, 1.0 - screen.y / uView.y * 2.0, -p.z / (m*2.0), 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
in vec3 vPos;
in float vCrease;
uniform sampler2D uTex;
uniform float uC;
uniform float uAlpha;
out vec4 outColor;
void main(){
  vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
  if (n.z < 0.0) n = -n;
  vec3 L = normalize(vec3(-0.45, -0.55, 0.85));
  float flat0 = L.z;
  float lambert = dot(n, L) / flat0;
  float k = smoothstep(0.0, 0.25, uC);
  float shade = mix(1.0, clamp(lambert, 0.45, 1.12), k);
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, H), 0.0), 60.0) * 0.08 * k;
  vec3 base = gl_FrontFacing ? texture(uTex, vUv).rgb : vec3(0.91, 0.895, 0.86);
  vec3 col = base * shade + spec;
  outColor = vec4(col * uAlpha, uAlpha);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
  return s;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeOutBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/**
 * Plays the transition on a temporary overlay canvas.
 * Returns false (and calls nothing) when WebGL2 is unavailable, so callers can fall back.
 */
export function playPaper({ rect, texture, mode, origin, onDone }: PlayOptions): boolean {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: true, alpha: true });
  if (!gl) return false;

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const vw = window.innerWidth, vh = window.innerHeight;
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: vw + 'px', height: vh + 'px',
    zIndex: '9600', pointerEvents: 'none',
  });
  document.body.appendChild(canvas);

  let prog: WebGLProgram;
  try {
    prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
  } catch (err) {
    console.warn('Paper transition unavailable:', err);
    canvas.remove();
    return false;
  }
  gl.useProgram(prog);

  // grid mesh
  const cols = 72, rows = Math.max(24, Math.round(72 * (rect.height / rect.width)));
  const verts = new Float32Array((cols + 1) * (rows + 1) * 2);
  let k = 0;
  for (let y = 0; y <= rows; y++) for (let x = 0; x <= cols; x++) { verts[k++] = x / cols - 0.5; verts[k++] = y / rows - 0.5; }
  const idx = new Uint32Array(cols * rows * 6);
  k = 0;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const a = y * (cols + 1) + x, b = a + 1, c = a + cols + 1, d = c + 1;
    idx.set([a, c, b, b, c, d], k); k += 6;
  }
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aQ'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const ibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const U = (n: string) => gl.getUniformLocation(prog, n);
  const uSize = U('uSize'), uCenter = U('uCenter'), uView = U('uView'), uC = U('uC'), uScale = U('uScale'),
    uRot = U('uRot'), uSeed = U('uSeed'), uAlpha = U('uAlpha');

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.uniform2f(uSize, rect.width, rect.height);
  gl.uniform2f(uView, vw, vh);
  gl.uniform1f(uSeed, Math.random() * 10);

  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const from = origin ?? { x: cx, y: cy + vh * 0.15 };
  const spin = Math.random() < 0.5 ? -1 : 1;
  const duration = mode === 'unfold' ? 650 : 560;
  const t0 = performance.now();

  const frame = (now: number) => {
    const t = Math.min(1, (now - t0) / duration);
    let c: number, scale: number, x: number, y: number, rx: number, ry: number, rz: number, alpha = 1;

    if (mode === 'unfold') {
      // ball pops out of the click point, flies to center, then opens flat
      // ball pops straight out of the click, opening while it travels, then snaps flat
      const fly = easeOutCubic(seg(t, 0, 0.32));
      const open = easeOutQuart(seg(t, 0.1, 1));
      const settle = Math.sin(seg(t, 0.55, 1) * Math.PI * 2) * (1 - seg(t, 0.55, 1)) * 0.05;
      c = 1 - open;
      scale = 0.3 + 0.7 * easeOutBack(seg(t, 0, 0.32));
      x = from.x + (cx - from.x) * fly;
      y = from.y + (cy - from.y) * fly;
      rz = spin * (1 - open) * 1.4;
      rx = (1 - open) * 0.8 + settle;
      ry = spin * ((1 - open) * -0.6 + settle);
      alpha = seg(t, 0, 0.04);
    } else {
      // sheet crushes into a ball, then shrinks away like the reference
      const crush = easeOutCubic(seg(t, 0, 0.55));
      const away = easeInCubic(seg(t, 0.45, 1));
      c = crush;
      scale = 1 - 0.12 * crush - 0.88 * away;
      x = cx;
      y = cy + away * 40;
      rz = spin * (crush * 1.2 + away * 2.2);
      rx = crush * 0.8;
      ry = spin * crush * -0.6;
      alpha = 1 - seg(t, 0.9, 1);
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(uC, c);
    gl.uniform1f(uScale, Math.max(0.0001, scale));
    gl.uniform2f(uCenter, x, y);
    gl.uniform3f(uRot, rx, ry, rz);
    gl.uniform1f(uAlpha, alpha);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_INT, 0);

    if (t < 1) requestAnimationFrame(frame);
    else {
      onDone?.();
      // keep the last frame two extra ticks so the DOM can take over without a flash
      requestAnimationFrame(() => requestAnimationFrame(() => {
        canvas.remove();
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }));
    }
  };
  requestAnimationFrame(frame);
  return true;
}
