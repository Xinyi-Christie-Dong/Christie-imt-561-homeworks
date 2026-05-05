// Instance-mode sketch for tab 3
// HWK 4 Clock 2: Mario Planet Treadmill Clock
// LIGHT MODE — outdoor daytime sky aesthetic

registerSketch('sk3', function (p) {
  const CANVAS_SIZE = 800;
  const CX = 400, CY = 400;
  const PLANET_R = 160;
  const INNER_R = 160;

  // ── Light mode palette ────────────────────────────────────────
  const C = {
    skyTop:    [195, 225, 255],   // light sky blue top
    skyBot:    [235, 248, 255],   // near-white bottom
    textMain:  [25,  40,  70],
    textSub:   [90,  110, 140],
    legendBg:  [255, 255, 255],
    legendBrd: [200, 210, 225],
    statusBg:  [255, 255, 255],
    statusBrd: [200, 210, 225],
    border:    [185, 200, 220],
    markerMaj: [30,  50,  90],
    markerMin: [100, 120, 155],
    markerNum: [20,  40,  75],
    orbit:     [255, 120, 60],    // warm orange trail
    shuffleFl: [255, 220, 80],
  };

  const TERRAIN_TYPES = {
    plain:    { name: 'Plain',    speedMult: 1.0, color: [100, 190, 70],  label: '🌿 Plain',   desc: 'Normal pace' },
    mountain: { name: 'Mountain', speedMult: 0.5, color: [155, 125, 95],  label: '⛰️ Mountain', desc: 'Slow — steep climb' },
    ice:      { name: 'Ice',      speedMult: 2.0, color: [160, 220, 250], label: '🧊 Ice',      desc: 'Fast — slippery!' },
    desert:   { name: 'Desert',   speedMult: 0.7, color: [235, 200, 100], label: '🏜️ Desert',  desc: 'Draining heat' },
    boost:    { name: 'Boost',    speedMult: 3.0, color: [255, 150, 40],  label: '⚡ Boost',    desc: 'Warp speed!' },
  };

  let zones = buildZones([
    { type: 'plain',    realMin: 12 },
    { type: 'mountain', realMin: 10 },
    { type: 'ice',      realMin: 8  },
    { type: 'desert',   realMin: 15 },
    { type: 'plain',    realMin: 8  },
    { type: 'boost',    realMin: 4  },
    { type: 'mountain', realMin: 3  },
  ]);

  function buildZones(defs) {
    let totalReal   = defs.reduce((s, d) => s + d.realMin, 0);
    let totalVisual = defs.reduce((s, d) => s + d.realMin * TERRAIN_TYPES[d.type].speedMult, 0);
    let result = [], realCursor = 0, visualCursor = 0;
    for (let d of defs) {
      let t = TERRAIN_TYPES[d.type];
      let visualDeg = (d.realMin * t.speedMult / totalVisual) * 360;
      result.push({
        type: d.type, terrain: t,
        realStart:   (realCursor / totalReal) * 60,
        realEnd:     ((realCursor + d.realMin) / totalReal) * 60,
        visualStart: visualCursor,
        visualEnd:   visualCursor + visualDeg,
      });
      realCursor += d.realMin;
      visualCursor += visualDeg;
    }
    return result;
  }

  function realMinToAngle(realMin) {
    let clamped = p.constrain(realMin % 60, 0, 60);
    for (let z of zones) {
      if (clamped >= z.realStart && clamped <= z.realEnd) {
        let t = (clamped - z.realStart) / (z.realEnd - z.realStart);
        return p.radians(p.lerp(z.visualStart, z.visualEnd, t) - 90);
      }
    }
    return -p.HALF_PI;
  }

  let workoutStart = null;
  let isRunning = false;
  let savedSeconds = 0;
  let shuffleAnim = 0;

  function getElapsedMin() {
    let sec = savedSeconds;
    if (isRunning && workoutStart !== null) sec += (p.millis() - workoutStart) / 1000;
    return sec / 60;
  }

  function getCurrentZone(realMin) {
    let m = realMin % 60;
    for (let z of zones) { if (m >= z.realStart && m < z.realEnd) return z; }
    return zones[zones.length - 1];
  }

  // ── Background: gradient sky ──────────────────────────────────
  function drawBg() {
    for (let y = 0; y < CANVAS_SIZE; y++) {
      let t = y / CANVAS_SIZE;
      let r = p.lerp(C.skyTop[0], C.skyBot[0], t);
      let g = p.lerp(C.skyTop[1], C.skyBot[1], t);
      let b = p.lerp(C.skyTop[2], C.skyBot[2], t);
      p.stroke(r, g, b);
      p.line(0, y, CANVAS_SIZE, y);
    }

    // Soft clouds (static, seeded)
    p.randomSeed(99);
    p.noStroke();
    for (let i = 0; i < 8; i++) {
      let cx = p.random(CANVAS_SIZE);
      let cy = p.random(80, 300);
      let cw = p.random(60, 140);
      p.fill(255, 255, 255, p.random(60, 100));
      p.ellipse(cx, cy, cw, cw * 0.5);
      p.ellipse(cx + cw * 0.25, cy - cw * 0.1, cw * 0.6, cw * 0.35);
    }
  }

  // ── Planet ────────────────────────────────────────────────────
  function drawPlanet() {
    // Terrain ring (annular band)
    for (let z of zones) {
      let sa = p.radians(z.visualStart - 90);
      let ea = p.radians(z.visualEnd - 90);
      let c  = z.terrain.color;
      p.noStroke();
      p.fill(...c);
      p.beginShape();
      for (let a = sa; a <= ea; a += 0.02)
        p.vertex(CX + (PLANET_R + 22) * p.cos(a), CY + (PLANET_R + 22) * p.sin(a));
      for (let a = ea; a >= sa; a -= 0.02)
        p.vertex(CX + PLANET_R * p.cos(a), CY + PLANET_R * p.sin(a));
      p.endShape(p.CLOSE);

      // Terrain icon at midpoint
      let mid = p.radians((z.visualStart + z.visualEnd) / 2 - 90);
      let dx = CX + (PLANET_R + 11) * p.cos(mid);
      let dy = CY + (PLANET_R + 11) * p.sin(mid);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      const icons = { plain:'🌿', mountain:'⛰️', ice:'🧊', desert:'🌵', boost:'⚡' };
      p.text(icons[z.type], dx, dy);
    }

    // Planet body — fill exactly up to PLANET_R so no gap with terrain ring
    p.noStroke();
    for (let r = PLANET_R; r > 0; r -= 3) {
      let t = r / PLANET_R;
      p.fill(
        p.lerp(80, 45, t),
        p.lerp(155, 95, t),
        p.lerp(80, 45, t)
      );
      p.circle(CX, CY, r * 2);
    }

    // Surface ring highlight at the inner edge of terrain
    p.noFill();
    p.stroke(160, 210, 140, 140);
    p.strokeWeight(1.5);
    p.circle(CX, CY, PLANET_R * 2);

    // Small land features inside planet
    p.noStroke();
    p.fill(100, 175, 80, 140);
    let spots = [[CX-50,CY-30,26],[CX+40,CY+52,20],[CX-18,CY+42,16],[CX+62,CY-42,14]];
    for (let s of spots) p.circle(s[0], s[1], s[2]);
  }

  function drawMinuteMarkers() {
    for (let m of [0, 15, 30, 45]) {
      let angle = realMinToAngle(m === 0 ? 0.01 : m);
      let r1 = PLANET_R + 24;
      let r2 = PLANET_R + 40;
      p.stroke(...C.markerMaj);
      p.strokeWeight(2.5);
      p.line(CX + r1*p.cos(angle), CY + r1*p.sin(angle),
             CX + r2*p.cos(angle), CY + r2*p.sin(angle));
      let tx = CX + (r2 + 15) * p.cos(angle);
      let ty = CY + (r2 + 15) * p.sin(angle);
      p.noStroke();
      p.fill(...C.markerNum);
      p.textSize(12);
      p.textStyle(p.BOLD);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(m + 'min', tx, ty);
      p.textStyle(p.NORMAL);
    }
  }

  function drawOrbit(elapsedMin) {
    let angle = realMinToAngle(elapsedMin % 60);
    p.noFill();
    p.stroke(...C.orbit, 130);
    p.strokeWeight(3);
    p.arc(CX, CY, (PLANET_R + 1)*2, (PLANET_R + 1)*2, -p.HALF_PI, angle);
  }

  // ── Pixel Mario ───────────────────────────────────────────────
  const MARIO_FRAMES = [
    ['....RRRR....','...RRRRRR...','...KKSSS...','..KSSSWS...','..SSSSSS...','..BBSBBS....','.BBBBBBB....','B.BBB.B.....','..BBBBB.....','..SS.SS.....','..SK.KS.....','..KK.KK.....'],
    ['....RRRR....','...RRRRRR...','...KKSSS....','..KSSSWS....','..SSSSSS....','..BBSBBS....', '.BBBBBBB....', '.B.BBB.B....', '..SBBBS.....', '..SK..KK....', '..KK..SS....', '.......KK...'],
    ['....RRRR....','...RRRRRR...','...KKSSS....','..KSSSWS....','..SSSSSS....','..BBSBBS....', '.BBBBBBB....', '.B.BBB.B....', '..BBBBB.....', '..SS.SS.....', '.KS...SK....', '.KK...KK....'],
    ['....RRRR....','...RRRRRR...','...KKSSS....','..KSSSWS....','..SSSSSS....','..BBSBBS....', '.BBBBBBB....', '.B.BBB.B....', '.SBBBS......', '.KK..KS.....', '.SS..KK.....', '...KK.......'],
  ];
  const MARIO_IDLE = ['....RRRR....','...RRRRRR...','...KKSSS....','..KSSSWS....','..SSSSSS....','..BBSBBS....', '.BBBBBBB....', '.B.BBB.B....', '..BBBBB.....', '..SS.SS.....', '..SK.KS.....', '..KK.KK.....'];

  const COLOR_MAP = {
    'R':[220,50,30], 'S':[255,200,150], 'B':[60,100,220],
    'K':[120,70,30], 'W':[255,255,255], 'b':[20,20,20], '.':[0,0,0,0],
  };

  function drawPixelMario(frame, px, py, sc) {
    let cols = frame[0].length, rows = frame.length;
    let offX = -(cols/2)*sc, offY = -(rows/2)*sc;
    p.noStroke();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let c = COLOR_MAP[frame[row][col]];
        if (!c || c.length === 4) continue;
        p.fill(c[0], c[1], c[2]);
        p.rect(px + offX + col*sc, py + offY + row*sc, sc, sc);
      }
    }
  }

  function drawMario(elapsedMin) {
    let angle = realMinToAngle(elapsedMin % 60);
    let zone  = getCurrentZone(elapsedMin % 60);
    let marioR = PLANET_R + 18;
    let mx = CX + marioR * p.cos(angle);
    let my = CY + marioR * p.sin(angle);
    let bounce = isRunning ? p.sin(p.frameCount * 0.25 * zone.terrain.speedMult) * (zone.terrain.speedMult > 1.5 ? 5 : 3) : 0;

    p.push();
    p.translate(mx, my);
    p.rotate(angle + p.HALF_PI);
    p.translate(0, bounce);

    let frame;
    if (!isRunning) {
      frame = MARIO_IDLE;
    } else {
      let fr = p.floor(p.frameCount * zone.terrain.speedMult * 0.15) % MARIO_FRAMES.length;
      frame = MARIO_FRAMES[fr];
    }
    drawPixelMario(frame, 0, 0, 3);

    if (isRunning && zone.type === 'boost') {
      p.noStroke();
      for (let i = 1; i <= 3; i++) {
        p.fill(255, 180, 50, p.map(i, 1, 3, 160, 30));
        p.circle(-i*10, p.sin(p.frameCount*0.3+i)*4, p.map(i,1,3,8,18));
      }
    }
    if (isRunning && zone.type === 'mountain') {
      p.textSize(14); p.textAlign(p.CENTER, p.CENTER);
      p.text('💦', 14, -20);
    }
    p.pop();
  }

  // ── Legend ────────────────────────────────────────────────────
  function drawLegend() {
    let lx = 14, ly = 60;
    let h = zones.length * 22 + 52;
    p.noStroke();
    p.fill(255, 255, 255, 220);
    p.rect(lx, ly, 182, h, 10);
    p.stroke(...C.legendBrd);
    p.strokeWeight(1);
    p.rect(lx, ly, 182, h, 10);

    p.noStroke();
    p.fill(...C.textMain);
    p.textSize(11);
    p.textStyle(p.BOLD);
    p.textAlign(p.LEFT, p.CENTER);
    p.text('TERRAIN LEGEND', lx + 10, ly + 14);
    p.textStyle(p.NORMAL);
    p.fill(...C.textSub);
    p.textSize(10);
    p.text('Click to shuffle', lx + 10, ly + 30);

    for (let i = 0; i < zones.length; i++) {
      let z  = zones[i];
      let zy = ly + 50 + i * 22;
      p.noStroke();
      p.fill(...z.terrain.color);
      p.rect(lx + 10, zy - 7, 13, 13, 3);
      p.fill(...C.textMain);
      p.textSize(10);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(z.terrain.label + ' (' + z.realEnd.toFixed(0) + 'min)', lx + 30, zy);
    }
  }

  // ── Status bar ────────────────────────────────────────────────
  function drawStatus(elapsedMin) {
    let zone = getCurrentZone(elapsedMin % 60);
    let mins = p.floor(elapsedMin);
    let secs = p.floor((elapsedMin - mins) * 60);
    let laps = p.floor(elapsedMin / 60);
    let bx = CX, by = CANVAS_SIZE - 46;

    p.noStroke();
    p.fill(255, 255, 255, 220);
    p.rect(bx - 205, by - 26, 410, 52, 12);
    p.stroke(...C.statusBrd);
    p.strokeWeight(1);
    p.rect(bx - 205, by - 26, 410, 52, 12);

    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);

    if (!isRunning && workoutStart === null && savedSeconds === 0) {
      p.fill(...C.textMain);
      p.textSize(13);
      p.text('Press SPACE to start  •  Click to shuffle terrain', bx, by);
    } else {
      let timeStr = p.nf(mins, 2) + ':' + p.nf(secs, 2);
      let lapStr  = laps > 0 ? '  •  Lap ' + (laps + 1) : '';
      p.fill(...C.textMain);
      p.textSize(13);
      p.textStyle(p.BOLD);
      p.text(timeStr + '  •  ' + zone.terrain.label + lapStr, bx, by - 8);
      p.textStyle(p.NORMAL);
      p.fill(...C.textSub);
      p.textSize(11);
      p.text(zone.terrain.desc + (isRunning ? '' : '  ⏸ PAUSED'), bx, by + 10);
    }
  }

  // ── Title ─────────────────────────────────────────────────────
  function drawTitle() {
    p.noStroke();
    p.fill(...C.textMain);
    p.textSize(18);
    p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('🌍 MARIO PLANET TREADMILL CLOCK', CX, 24);
    p.textStyle(p.NORMAL);
    p.fill(...C.textSub);
    p.textSize(11);
    p.text('Time is non-linear — terrain warps where 30min falls on the ring', CX, 44);
  }

  function drawShuffle() {
    if (shuffleAnim > 0) {
      p.noStroke();
      p.fill(...C.shuffleFl, shuffleAnim * 1.5);
      p.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      shuffleAnim -= 4;
    }
  }

  // ── p5 lifecycle ──────────────────────────────────────────────

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.textFont('Georgia');
  };

  p.draw = function () {
    drawBg();
    let elapsedMin = getElapsedMin();
    drawPlanet();
    drawMinuteMarkers();
    drawOrbit(elapsedMin);
    drawMario(elapsedMin);
    drawLegend();
    drawTitle();
    drawStatus(elapsedMin);
    drawShuffle();

    p.noFill();
    p.stroke(...C.border);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  p.keyPressed = function () {
    if (p.key === ' ') {
      if (!isRunning && workoutStart === null) {
        workoutStart = p.millis(); isRunning = true;
      } else if (isRunning) {
        savedSeconds += (p.millis() - workoutStart) / 1000;
        workoutStart = null; isRunning = false;
      } else {
        workoutStart = p.millis(); isRunning = true;
      }
    }
    if (p.key === 'r' || p.key === 'R') {
      isRunning = false; workoutStart = null; savedSeconds = 0;
    }
  };

  p.mousePressed = function () {
    let types = ['plain', 'mountain', 'ice', 'desert', 'boost'];
    let realMins = [12, 10, 8, 8, 6, 10, 6];
    let shuffled = [...types].sort(() => p.random() - 0.5);
    zones = buildZones(realMins.map((m, i) => ({ type: shuffled[i % shuffled.length], realMin: m })));
    shuffleAnim = 80;
  };

  p.windowResized = function () { p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE); };
});