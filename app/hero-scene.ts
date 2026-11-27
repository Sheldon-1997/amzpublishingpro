// The homepage hero scene: a hardcover book rendered in WebGL with real
// lighting and shadows. Between covers the book lies back, opens, releases its
// pages into the air, and closes again as the next sample book.
//
// This module is loaded on demand by HeroBookStage so three.js never blocks
// the first paint. Everything is a pure function of the scene clock, which
// makes pause/resume exact.
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Euler,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Points,
  PointsMaterial,
  Quaternion,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// `aspect` is the cover's width divided by its height.
export type HeroSceneCover = { src: string; spine: string; aspect: number };

export type HeroSceneOptions = {
  canvas: HTMLCanvasElement;
  covers: readonly HeroSceneCover[];
  startIndex: number;
  onCoverChange: (index: number) => void;
  onReady: () => void;
  onLost: () => void;
};

export type HeroSceneHandle = {
  setRunning: (running: boolean) => void;
  setPointer: (x: number, y: number) => void;
  dispose: () => void;
};

// Book dimensions in scene units. Covers are 2:3.
const BOOK_W = 2;
const BOOK_H = 3;
const BOOK_T = 0.38;
const BOARD = 0.04;
const OVERHANG = 0.055;
const BLOCK_W = BOOK_W - OVERHANG - 0.03;
const BLOCK_H = BOOK_H - OVERHANG * 2;
const BLOCK_T = BOOK_T - BOARD * 2;

// Timeline, in seconds.
const HOLD = 3.9;
const MORPH = 4.8;
const CYCLE = HOLD + MORPH;
const SWAP_AT = 0.51;

const SHEETS = 22;
const DUST = 40;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const span = (value: number, from: number, to: number) => clamp01((value - from) / (to - from));
const easeInOut = (value: number) => (value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2);
const easeOut = (value: number) => 1 - (1 - value) ** 3;

// Small deterministic generator so every visit gets the same choreography.
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas is unavailable");
  return { canvas, context };
}

// A manuscript page: cream paper with grey lines standing in for text.
function paintPage() {
  const { canvas, context } = makeCanvas(384, 576);
  const random = seeded(7);
  context.fillStyle = "#fbf8f0";
  context.fillRect(0, 0, 384, 576);
  context.fillStyle = "#39404f";
  context.fillRect(118, 54, 148, 9);
  context.fillStyle = "rgba(57,64,79,.5)";
  let y = 96;
  while (y < 520) {
    const paragraphLines = 3 + Math.floor(random() * 5);
    for (let line = 0; line < paragraphLines && y < 520; line += 1) {
      const indent = line === 0 ? 22 : 0;
      const last = line === paragraphLines - 1;
      const width = last ? 120 + random() * 150 : 292 - indent;
      context.fillRect(46 + indent, y, width, 4);
      y += 13;
    }
    y += 9;
  }
  return canvas;
}

// The cut edge of a page block: many thin paper layers.
function paintPageEdge() {
  const { canvas, context } = makeCanvas(256, 16);
  const random = seeded(19);
  context.fillStyle = "#f4efe3";
  context.fillRect(0, 0, 256, 16);
  for (let x = 0; x < 256; x += 1) {
    const shade = 200 + Math.floor(random() * 44);
    context.fillStyle = `rgba(${shade},${shade - 8},${shade - 24},${0.35 + random() * 0.45})`;
    context.fillRect(x, 0, 1, 16);
  }
  return canvas;
}

function paintSpine(color: string) {
  const { canvas, context } = makeCanvas(96, 768);
  context.fillStyle = color;
  context.fillRect(0, 0, 96, 768);
  const foil = context.createLinearGradient(0, 0, 96, 0);
  foil.addColorStop(0, "#b8892f");
  foil.addColorStop(0.5, "#f3dc97");
  foil.addColorStop(1, "#b8892f");
  context.fillStyle = foil;
  [58, 70, 690, 702].forEach((y) => context.fillRect(10, y, 76, 3));
  context.fillRect(30, 250, 36, 3);
  context.fillRect(22, 262, 52, 3);
  context.fillRect(34, 274, 28, 3);
  context.beginPath();
  context.arc(48, 610, 9, 0, Math.PI * 2);
  context.fill();
  return canvas;
}

function paintDust() {
  const { canvas, context } = makeCanvas(48, 48);
  const glow = context.createRadialGradient(24, 24, 0, 24, 24, 24);
  glow.addColorStop(0, "rgba(255,236,170,1)");
  glow.addColorStop(0.35, "rgba(226,178,74,.85)");
  glow.addColorStop(1, "rgba(226,178,74,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 48, 48);
  return canvas;
}

export function createHeroScene(options: HeroSceneOptions): HeroSceneHandle | null {
  const { canvas, covers, onCoverChange, onReady, onLost } = options;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }

  const compact = window.matchMedia("(max-width: 820px)").matches;
  // A modest pixel ratio keeps the scene smooth on laptops and phones.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.42;

  const camera = new PerspectiveCamera(28, 1, 0.5, 60);
  const cameraHome = new Vector3(0, 3.5, 12.2);
  const cameraTarget = new Vector3(0, 2.02, 0);

  const key = new DirectionalLight(0xfff0d9, 2.6);
  key.position.set(-4.5, 9, 6.5);
  key.castShadow = true;
  key.shadow.mapSize.set(compact ? 512 : 1024, compact ? 512 : 1024);
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 7;
  key.shadow.camera.bottom = -5;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 30;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.025;
  key.shadow.radius = 5;
  scene.add(key);

  // Soft fill so the undersides of flying pages never go black.
  scene.add(new HemisphereLight(0xffffff, 0xe6d8c0, 0.7));

  const rim = new DirectionalLight(0x9db9ff, 1.1);
  rim.position.set(6, 4, -5);
  scene.add(rim);

  const floor = new Mesh(new PlaneGeometry(60, 60), new ShadowMaterial({ color: 0x14204a, opacity: 0.24 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // ---- Textures -----------------------------------------------------------
  const disposables: { dispose: () => void }[] = [environment, pmrem, floor.geometry, floor.material];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const canvasTexture = (source: HTMLCanvasElement) => {
    const texture = track(new CanvasTexture(source));
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = anisotropy;
    return texture;
  };

  const pageTexture = canvasTexture(paintPage());
  const edgeTexture = canvasTexture(paintPageEdge());
  const edgeTextureTurned = canvasTexture(paintPageEdge());
  edgeTextureTurned.center.set(0.5, 0.5);
  edgeTextureTurned.rotation = Math.PI / 2;
  const dustTexture = canvasTexture(paintDust());

  const loader = new TextureLoader();
  const coverTextures = new Map<number, Texture>();
  const coverRequests = new Set<number>();
  let disposed = false;
  const requestCover = (index: number, done?: () => void) => {
    if (coverTextures.has(index)) {
      done?.();
      return;
    }
    if (coverRequests.has(index)) return;
    coverRequests.add(index);
    loader.load(
      covers[index].src,
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = anisotropy;
        coverTextures.set(index, track(texture));
        done?.();
      },
      undefined,
      () => coverRequests.delete(index),
    );
  };

  // ---- Book ---------------------------------------------------------------
  const book = new Group();
  scene.add(book);

  const clothMaterial = track(new MeshPhysicalMaterial({ color: covers[options.startIndex].spine, roughness: 0.62, clearcoat: 0.25, clearcoatRoughness: 0.5 }));
  const endpaperMaterial = track(new MeshStandardMaterial({ color: 0xe4d6bb, roughness: 0.9 }));
  const coverMaterial = track(new MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.46, clearcoat: 0.45, clearcoatRoughness: 0.3 }));
  const spineMaterial = track(new MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.45, side: DoubleSide }));
  const pageMaterial = track(new MeshStandardMaterial({ map: pageTexture, color: 0xf4ecdc, roughness: 0.92 }));
  const edgeMaterial = track(new MeshStandardMaterial({ map: edgeTexture, roughness: 0.95 }));
  const edgeTurnedMaterial = track(new MeshStandardMaterial({ map: edgeTextureTurned, roughness: 0.95 }));

  const boardGeometry = track(new BoxGeometry(BOOK_W, BOOK_H, BOARD));

  // Box faces are ordered +x, -x, +y, -y, +z, -z.
  const backBoard = new Mesh(boardGeometry, [clothMaterial, clothMaterial, clothMaterial, clothMaterial, endpaperMaterial, clothMaterial]);
  backBoard.position.z = -BOOK_T / 2 + BOARD / 2;
  backBoard.castShadow = true;
  book.add(backBoard);

  const hinge = new Group();
  hinge.position.set(-BOOK_W / 2, 0, BOOK_T / 2 - BOARD / 2);
  book.add(hinge);
  const frontBoard = new Mesh(boardGeometry, [clothMaterial, clothMaterial, clothMaterial, clothMaterial, coverMaterial, endpaperMaterial]);
  frontBoard.position.x = BOOK_W / 2;
  frontBoard.castShadow = true;
  hinge.add(frontBoard);

  const spineGeometry = track(new CylinderGeometry(BOOK_T / 2, BOOK_T / 2, BOOK_H, 24, 1, true, Math.PI, Math.PI));
  const spine = new Mesh(spineGeometry, spineMaterial);
  spine.scale.x = 0.24;
  spine.position.x = -BOOK_W / 2 + 0.004;
  spine.castShadow = true;
  book.add(spine);

  const blockGeometry = track(new BoxGeometry(BLOCK_W, BLOCK_H, 1));
  const block = new Mesh(blockGeometry, [edgeMaterial, edgeMaterial, edgeTurnedMaterial, edgeTurnedMaterial, pageMaterial, pageMaterial]);
  block.position.x = -BOOK_W / 2 + 0.03 + BLOCK_W / 2;
  block.castShadow = true;
  block.receiveShadow = true;
  book.add(block);
  const blockBase = -BOOK_T / 2 + BOARD;

  let spineTexture: CanvasTexture | null = null;
  const dressBook = (index: number) => {
    const cover = covers[index];
    const texture = coverTextures.get(index);
    if (texture) {
      coverMaterial.map = texture;
      coverMaterial.needsUpdate = true;
    }
    // The book is modelled at 2:3; other trim sizes stretch its width.
    book.scale.x = MathUtils.clamp(cover.aspect / (BOOK_W / BOOK_H), 0.8, 1.3);
    clothMaterial.color.set(cover.spine);
    spineTexture?.dispose();
    spineTexture = new CanvasTexture(paintSpine(cover.spine));
    spineTexture.colorSpace = SRGBColorSpace;
    spineTexture.anisotropy = anisotropy;
    spineMaterial.map = spineTexture;
    spineMaterial.needsUpdate = true;
  };

  // ---- Loose pages --------------------------------------------------------
  // A sheet is a plane with a gentle curl baked in; scaling its z flattens it.
  const sheetGeometry = track(new PlaneGeometry(BLOCK_W, BLOCK_H, 12, 8));
  {
    const positions = sheetGeometry.attributes.position as BufferAttribute;
    for (let vertex = 0; vertex < positions.count; vertex += 1) {
      const x = positions.getX(vertex) / (BLOCK_W / 2);
      const y = positions.getY(vertex) / (BLOCK_H / 2);
      positions.setZ(vertex, 0.34 * x * x + 0.1 * y * x - 0.12);
    }
    sheetGeometry.computeVertexNormals();
  }
  const sheetMaterial = track(new MeshStandardMaterial({ map: pageTexture, color: 0xf2e8d6, roughness: 0.9, side: DoubleSide }));

  const random = seeded(2026);
  const sheets = Array.from({ length: SHEETS }, (_, order) => {
    const mesh = new Mesh(sheetGeometry, sheetMaterial);
    mesh.castShadow = true;
    mesh.visible = false;
    book.add(mesh);
    return {
      mesh,
      order: order / (SHEETS - 1),
      // Sheets ride a rising spiral: later sheets sit higher and wider.
      phase: (order / (SHEETS - 1)) * Math.PI * 4.6,
      radius: 1.05 + (order / (SHEETS - 1)) * 1.25 + random() * 0.18,
      height: 1.35 + (order / (SHEETS - 1)) * 2.45,
      wobble: random() * Math.PI * 2,
      flip: random() < 0.5 ? -1 : 1,
    };
  });

  // ---- Gold dust ----------------------------------------------------------
  const dustGeometry = track(new BufferGeometry());
  const dustSeeds = new Float32Array(DUST * 4);
  const dustPositions = new Float32Array(DUST * 3);
  for (let mote = 0; mote < DUST; mote += 1) {
    dustSeeds[mote * 4] = (random() - 0.5) * 8.5;
    dustSeeds[mote * 4 + 1] = random() * 5.2;
    dustSeeds[mote * 4 + 2] = (random() - 0.5) * 5;
    dustSeeds[mote * 4 + 3] = 0.12 + random() * 0.2;
  }
  dustGeometry.setAttribute("position", new BufferAttribute(dustPositions, 3));
  const dustMaterial = track(new PointsMaterial({ map: dustTexture, size: 0.085, transparent: true, opacity: 0.8, depthWrite: false, sizeAttenuation: true }));
  const dust = new Points(dustGeometry, dustMaterial);
  dust.frustumCulled = false;
  scene.add(dust);

  // ---- Poses --------------------------------------------------------------
  const presentPosition = new Vector3();
  const presentRotation = new Euler();
  const restPosition = new Vector3(1.02, 1.12, 0.35);
  const restQuaternion = new Quaternion().setFromEuler(new Euler(-0.98, 0.16, -0.05));
  const presentQuaternion = new Quaternion();
  const bookInverse = new Quaternion();
  const worldPoint = new Vector3();
  const worldQuaternion = new Quaternion();
  const flightEuler = new Euler();
  const pointer = { x: 0, y: 0, easedX: 0, easedY: 0 };

  const present = (seconds: number) => {
    presentPosition.set(0, 2.06 + Math.sin(seconds * 1.25) * 0.07, 0);
    presentRotation.set(-0.05 + Math.sin(seconds * 0.9) * 0.015, -0.5 + Math.sin(seconds * 0.62) * 0.2, -0.02);
  };

  let clock = 0;
  let shownIndex = options.startIndex;
  const cycleBase = options.startIndex;

  const frame = () => {
    const cycle = Math.floor(clock / CYCLE);
    const local = clock - cycle * CYCLE;
    const morph = local > HOLD ? (local - HOLD) / MORPH : 0;

    const currentIndex = (cycleBase + cycle) % covers.length;
    const nextIndex = (currentIndex + 1) % covers.length;
    const wantedIndex = morph >= SWAP_AT ? nextIndex : currentIndex;
    if (wantedIndex !== shownIndex && coverTextures.has(wantedIndex)) {
      shownIndex = wantedIndex;
      dressBook(shownIndex);
      onCoverChange(shownIndex);
      // Keep only the cover on the book and the one coming next in memory.
      const upcoming = (shownIndex + 1) % covers.length;
      for (const [index, texture] of coverTextures) {
        if (index === shownIndex || index === upcoming) continue;
        texture.dispose();
        coverTextures.delete(index);
        coverRequests.delete(index);
      }
    }

    // Lie back, then rise again with a full turn.
    const down = easeInOut(span(morph, 0, 0.2));
    const up = easeInOut(span(morph, 0.8, 1));
    const lying = down * (1 - up);
    present(morph < SWAP_AT ? Math.min(local, HOLD) : 0);
    presentQuaternion.setFromEuler(presentRotation);
    book.position.lerpVectors(presentPosition, restPosition, lying);
    book.quaternion.slerpQuaternions(presentQuaternion, restQuaternion, lying);
    if (up > 0 && up < 1) {
      book.rotateY(Math.PI * 2 * up);
      book.position.y += Math.sin(up * Math.PI) * 0.55;
    }
    book.rotateY(pointer.easedX * 0.22 * (1 - lying));
    book.rotateX(pointer.easedY * 0.1 * (1 - lying));

    const open = easeInOut(span(morph, 0.13, 0.29)) * (1 - easeInOut(span(morph, 0.72, 0.86)));
    hinge.rotation.y = -open * 2.82;

    // Pages leave from the top of the block and come back to it.
    const flight = span(morph, 0.24, 0.78);
    let airborne = 0;
    book.updateMatrixWorld(true);
    bookInverse.copy(book.quaternion).invert();
    for (const sheet of sheets) {
      const out = easeInOut(span(flight, sheet.order * 0.3, sheet.order * 0.3 + 0.2));
      const back = easeInOut(span(flight, 0.52 + sheet.order * 0.28, 0.72 + sheet.order * 0.28));
      const air = out * (1 - back);
      airborne += air;
      sheet.mesh.visible = air > 0.002;
      if (!sheet.mesh.visible) continue;

      const turn = sheet.phase + clock * 1.35;
      const sway = Math.sin(clock * 1.9 + sheet.wobble);
      worldPoint.set(
        Math.cos(turn) * sheet.radius,
        sheet.height + sway * 0.12,
        Math.sin(turn) * sheet.radius * 0.8 - 0.55,
      );
      book.worldToLocal(worldPoint);
      // Each sheet faces outward along the spiral and banks into the turn.
      flightEuler.set(-0.42 + sway * 0.16, -turn + Math.PI / 2, sheet.flip * 0.12 + sway * 0.1, "YXZ");
      worldQuaternion.setFromEuler(flightEuler).premultiply(bookInverse);

      sheet.mesh.position.set(
        block.position.x,
        0,
        block.position.z + block.scale.z / 2 + 0.006,
      ).lerp(worldPoint, air);
      sheet.mesh.position.z += Math.sin(air * Math.PI) * 0.7;
      sheet.mesh.quaternion.identity().slerp(worldQuaternion, easeOut(air));
      const size = MathUtils.lerp(1, 0.52, air);
      sheet.mesh.scale.set(size, size, Math.max(0.02, air * 0.8));
    }
    const fill = 1 - 0.86 * (airborne / SHEETS);
    block.scale.z = BLOCK_T * fill;
    block.position.z = blockBase + block.scale.z / 2;

    // Dust drifts upward and wraps.
    for (let mote = 0; mote < DUST; mote += 1) {
      const rise = dustSeeds[mote * 4 + 3];
      const y = (dustSeeds[mote * 4 + 1] + clock * rise) % 5.2;
      dustPositions[mote * 3] = dustSeeds[mote * 4] + Math.sin(clock * 0.4 + mote) * 0.22;
      dustPositions[mote * 3 + 1] = y + 0.2;
      dustPositions[mote * 3 + 2] = dustSeeds[mote * 4 + 2];
    }
    dustGeometry.attributes.position.needsUpdate = true;
    dustMaterial.opacity = 0.55 + 0.35 * Math.sin(Math.PI * clamp01(flight));

    pointer.easedX = MathUtils.lerp(pointer.easedX, pointer.x, 0.06);
    pointer.easedY = MathUtils.lerp(pointer.easedY, pointer.y, 0.06);
    const pullBack = easeInOut(span(morph, 0.02, 0.24)) * (1 - easeInOut(span(morph, 0.78, 1)));
    camera.position.set(
      cameraHome.x + pointer.easedX * 0.9,
      cameraHome.y - pointer.easedY * 0.45 + pullBack * 0.7,
      cameraHome.z * (0.84 + 0.2 * pullBack),
    );
    camera.lookAt(cameraTarget);

    renderer.render(scene, camera);

    // Fetch the next cover early so the swap never waits on the network.
    requestCover(nextIndex);
    return { morph, nextIndex };
  };

  // ---- Sizing -------------------------------------------------------------
  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    camera.aspect = aspect;
    // Keep the open book inside narrow frames by stepping the camera back.
    cameraHome.z = 12.2 * Math.max(1, 1.02 / aspect);
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (ready && !running) frame();
  });
  resizeObserver.observe(canvas);

  // ---- Loop ---------------------------------------------------------------
  let ready = false;
  let running = false;
  let wantRunning = false;
  let animationFrame = 0;
  let previous = 0;

  // Slow devices: watch the real gap between animation frames. If the scene
  // cannot keep up it first drops to a cheaper picture (no shadows, fewer
  // pixels) and, if that is still too slow, hands back to the still book.
  let lastTick = 0;
  let averageGap = 16;
  let judgeAfter = 0;
  let quality = 0;
  const lowerQuality = () => {
    quality += 1;
    if (quality === 1) {
      renderer.setPixelRatio(1);
      key.castShadow = false;
      floor.visible = false;
      resize();
      return;
    }
    stop();
    onLost();
  };

  const loop = (now: number) => {
    animationFrame = window.requestAnimationFrame(loop);
    const gap = now - lastTick;
    lastTick = now;
    if (gap > 0 && gap < 250) {
      averageGap += (gap - averageGap) * 0.06;
      if (now > judgeAfter && averageGap > 36) {
        averageGap = 16;
        judgeAfter = now + 2500;
        lowerQuality();
        if (!running) return;
      }
    }
    // While the book only turns slowly, every other frame is enough.
    const presenting = clock - Math.floor(clock / CYCLE) * CYCLE < HOLD;
    if (presenting && now - previous < 30) return;
    const delta = Math.min(0.1, (now - previous) / 1000);
    previous = now;
    const before = clock;
    clock += delta;
    // Hold at the swap point if the next cover has not arrived yet.
    const cycle = Math.floor(clock / CYCLE);
    const local = clock - cycle * CYCLE;
    const morph = local > HOLD ? (local - HOLD) / MORPH : 0;
    const nextIndex = (cycleBase + cycle + 1) % covers.length;
    if (morph >= SWAP_AT - 0.02 && morph < SWAP_AT + 0.02 && !coverTextures.has(nextIndex) && shownIndex !== nextIndex) {
      clock = before;
    }
    frame();
  };
  const start = () => {
    if (running || !ready || disposed) return;
    running = true;
    previous = performance.now();
    lastTick = previous;
    averageGap = 16;
    judgeAfter = previous + 2500;
    animationFrame = window.requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    window.cancelAnimationFrame(animationFrame);
  };

  const handleLost = (event: Event) => {
    event.preventDefault();
    stop();
    onLost();
  };
  canvas.addEventListener("webglcontextlost", handleLost);

  requestCover(options.startIndex, () => {
    if (disposed) return;
    dressBook(options.startIndex);
    resize();
    ready = true;
    frame();
    onReady();
    if (wantRunning) start();
  });

  return {
    setRunning(next) {
      wantRunning = next;
      if (next) start();
      else stop();
    },
    setPointer(x, y) {
      pointer.x = clamp01((x + 1) / 2) * 2 - 1;
      pointer.y = clamp01((y + 1) / 2) * 2 - 1;
    },
    dispose() {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", handleLost);
      spineTexture?.dispose();
      disposables.forEach((item) => item.dispose());
      room.dispose();
      renderer.dispose();
    },
  };
}
