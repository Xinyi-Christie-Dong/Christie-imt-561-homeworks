// Instance-mode sketch for tab 2
// HWK 4 Clock 1: Treadmill Calorie Food Clock
// LIGHT MODE — pixel art food icons + minute hand + second hand

registerSketch('sk2', function (p) {
  const CANVAS_SIZE = 800;
  const CX = 400, CY = 400;
  const DIAL_R = 215;

  // ── Palette ───────────────────────────────────────────────────
  const C = {
    bg:        [245, 247, 250],
    bgGrid:    [218, 222, 230],
    ring:      [55,  65,  85],
    tick:      [90,  100, 118],
    tickNum:   [35,  45,  65],
    textMain:  [20,  30,  50],
    textSub:   [100, 110, 130],
    handMin:   [220, 55,  55],   // minute hand when running
    handIdle:  [160, 168, 180],
    handSec:   [255, 130, 30],   // orange second hand
    accent:    [220, 55,  55],
    calEarned: [20,  30,  50],
    calMuted:  [148, 158, 172],
    border:    [200, 206, 218],
    dialFill:  [255, 255, 255],
  };

  let workoutStartTime = null;
  let isRunning = false;
  let totalSeconds = 0;

  const FOODS = [
    { name: 'Peanuts',      cal: 96,  minute: 5,  emoji: '🥜', glow: [210, 165, 80]  },
    { name: 'Boiled Egg',   cal: 78,  minute: 15, emoji: '🥚', glow: [240, 200, 100] },
    { name: 'Can of Coke',  cal: 140, minute: 25, emoji: '🥤', glow: [220, 70,  50]  },
    { name: 'Med Fries',    cal: 370, minute: 40, emoji: '🍟', glow: [240, 185, 30]  },
    { name: 'Cheeseburger', cal: 550, minute: 55, emoji: '🍔', glow: [195, 110, 40]  },
  ];

  // Returns index of the food the minute hand is currently at
  function getActiveIdx(minInCycle) {
    let active = -1;
    for (let i = 0; i < FOODS.length; i++) {
      if (minInCycle >= FOODS[i].minute) active = i;
    }
    return active;
  }

  function drawFoods(elapsedMin) {
    let minInCycle = elapsedMin % 60;
    let activeIdx  = getActiveIdx(minInCycle);

    for (let i = 0; i < FOODS.length; i++) {
      let f      = FOODS[i];
      let angle  = minuteToAngle(f.minute);
      let iconR  = DIAL_R + 62;
      let calR   = DIAL_R + 105;
      let fx     = CX + iconR * p.cos(angle);
      let fy     = CY + iconR * p.sin(angle);
      let active = (i === activeIdx);

      // Emoji icon — active: full size crisp, inactive: smaller + gray overlay
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(active ? 54 : 42);
      p.text(f.emoji, fx, fy);

      // Gray overlay for inactive foods
      if (!active) {
        p.noStroke();
        p.fill(220, 222, 228, 175);
        p.circle(fx, fy, 52);
      }

      // Calorie label
      let lx = CX + calR * p.cos(angle);
      let ly = CY + calR * p.sin(angle);
      p.noStroke();
      p.fill(active ? C.calEarned : C.calMuted);
      p.textSize(active ? 15 : 12);
      p.textStyle(active ? p.BOLD : p.NORMAL);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(f.cal + ' cal', lx, ly);
      p.textStyle(p.NORMAL);
    }
  }

  // ── Angle helpers ─────────────────────────────────────────────
  function minuteToAngle(min) {
    return p.map(min, 0, 60, -p.HALF_PI, p.HALF_PI * 3);
  }
  function secondToAngle(sec) {
    return p.map(sec % 60, 0, 60, -p.HALF_PI, p.HALF_PI * 3);
  }

  // ── Draw functions ────────────────────────────────────────────
  function drawBg() {
    p.background(...C.bg);
    p.stroke(...C.bgGrid);
    p.strokeWeight(0.6);
    for (let x = 0; x < CANVAS_SIZE; x += 32) p.line(x, 0, x, CANVAS_SIZE);
    for (let y = 0; y < CANVAS_SIZE; y += 32) p.line(0, y, CANVAS_SIZE, y);
  }

  function drawDial() {
    p.noStroke();
    p.fill(...C.dialFill);
    p.circle(CX, CY, DIAL_R * 2);
    p.noFill();
    p.stroke(...C.ring);
    p.strokeWeight(2.5);
    p.circle(CX, CY, DIAL_R * 2);
    for (let i = 0; i < 60; i += 5) {
      let angle = minuteToAngle(i);
      p.stroke(...C.tick);
      p.strokeWeight(2);
      p.line(
        CX + (DIAL_R - 16) * p.cos(angle), CY + (DIAL_R - 16) * p.sin(angle),
        CX + (DIAL_R - 1)  * p.cos(angle), CY + (DIAL_R - 1)  * p.sin(angle)
      );
      if (i > 0) {
        let tx = CX + (DIAL_R - 30) * p.cos(angle);
        let ty = CY + (DIAL_R - 30) * p.sin(angle);
        p.noStroke();
        p.fill(...C.tickNum);
        p.textSize(14);
        p.textStyle(p.BOLD);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(i, tx, ty);
        p.textStyle(p.NORMAL);
      }
    }
  }

  function drawMinuteHand(elapsedMin) {
    let angle = minuteToAngle(elapsedMin % 60);
    let tip   = DIAL_R - 22;
    p.stroke(0, 0, 0, 15);
    p.strokeWeight(6);
    p.line(CX + 2, CY + 2, CX + tip * p.cos(angle) + 2, CY + tip * p.sin(angle) + 2);
    let hc = isRunning ? C.handMin : C.handIdle;
    p.stroke(...hc);
    p.strokeWeight(4);
    p.line(CX, CY, CX + tip * p.cos(angle), CY + tip * p.sin(angle));
  }

  function drawSecondHand(elapsedSec) {
    let angle  = secondToAngle(elapsedSec);
    let tipF   = DIAL_R - 10;   // tip (forward)
    let tailB  = 30;             // tail (back)
    // thin shadow
    p.stroke(0, 0, 0, 12);
    p.strokeWeight(2);
    p.line(
      CX - tailB * p.cos(angle) + 1, CY - tailB * p.sin(angle) + 1,
      CX + tipF  * p.cos(angle) + 1, CY + tipF  * p.sin(angle) + 1
    );
    // orange hand
    p.stroke(...C.handSec);
    p.strokeWeight(1.5);
    p.line(
      CX - tailB * p.cos(angle), CY - tailB * p.sin(angle),
      CX + tipF  * p.cos(angle), CY + tipF  * p.sin(angle)
    );
    // center pin
    p.noStroke();
    p.fill(...C.handSec);
    p.circle(CX, CY, 7);
    // cover minute hand center
    p.fill(...C.dialFill);
    p.circle(CX, CY, 4);
  }

  function drawHourBadge(elapsedMin) {
    // Per-food count: how many times each food's minute mark has been passed
    let earned = FOODS.map(f => ({
      emoji: f.emoji,
      count: elapsedMin >= f.minute
        ? Math.floor((elapsedMin - f.minute) / 60) + 1
        : 0,
    })).filter(f => f.count > 0);

    if (earned.length === 0) return;

    let padX = 14, padY = 10, rowH = 28, w = 130;
    let h = padY * 2 + 16 + earned.length * rowH;
    let bx = CANVAS_SIZE - 14, by = 62;

    p.noStroke();
    p.fill(255, 255, 255, 230);
    p.rect(bx - w, by - padY, w, h, 12);
    p.stroke(...C.border);
    p.strokeWeight(1);
    p.rect(bx - w, by - padY, w, h, 12);

    p.noStroke();
    p.fill(...C.textSub);
    p.textSize(10);
    p.textStyle(p.BOLD);
    p.textAlign(p.LEFT, p.CENTER);
    p.text('LAPS BURNED', bx - w + padX, by - padY + 10);
    p.textStyle(p.NORMAL);

    for (let i = 0; i < earned.length; i++) {
      let ry = by + 8 + i * rowH;
      p.textSize(20);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(earned[i].emoji, bx - w + padX, ry);
      p.fill(...C.textMain);
      p.textSize(13);
      p.textStyle(p.BOLD);
      p.textAlign(p.LEFT, p.CENTER);
      p.text('×' + earned[i].count, bx - w + padX + 30, ry);
      p.textStyle(p.NORMAL);
    }
  }

  function drawTimeDisplay(elapsedMin, elapsedSec) {
    let display = p.nf(p.floor(elapsedMin), 2) + ':' + p.nf(p.floor((elapsedMin % 1) * 60), 2);
    let by = CY + DIAL_R + 96;
    p.noStroke();
    p.fill(255, 255, 255, 240);
    p.rect(CX - 96, by - 28, 192, 56, 14);
    p.stroke(...C.border);
    p.strokeWeight(1);
    p.rect(CX - 96, by - 28, 192, 56, 14);
    p.noStroke();
    p.fill(...C.textMain);
    p.textSize(34);
    p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(display, CX, by);
    p.textStyle(p.NORMAL);
    p.fill(...C.textSub);
    p.textSize(13);
    p.text('~' + p.floor(elapsedMin * 8) + ' kcal burned', CX, by + 40);
  }

  function drawStartScreen() {
    p.noStroke();
    p.fill(...C.textMain);
    p.textSize(20);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Press SPACE to start workout', CX, CY + 18);
    p.fill(...C.textSub);
    p.textSize(13);
    p.text('Food icons show calories burned on treadmill', CX, CY + 44);
    let pulse = p.sin(p.frameCount * 0.05) * 0.5 + 0.5;
    p.noFill();
    p.stroke(...C.accent, pulse * 140);
    p.strokeWeight(2);
    p.circle(CX, CY, 56 + pulse * 18);
  }

  function drawTitle() {
    p.noStroke();
    p.fill(...C.textMain);
    p.textSize(18);
    p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('🏃 TREADMILL CALORIE CLOCK', CX, 24);
    p.textStyle(p.NORMAL);
    p.fill(...C.textSub);
    p.textSize(12);
    p.text('Each food = calories burned at moderate pace (~8 cal/min)', CX, 44);
  }

  function drawStatus() {
    if (isRunning) {
      let pulse = p.sin(p.frameCount * 0.12) * 0.5 + 0.5;
      p.noStroke();
      p.fill(...C.accent, 180 + pulse * 75);
      p.circle(22, 22, 9);
      p.fill(...C.textMain);
      p.textSize(12);
      p.textStyle(p.BOLD);
      p.textAlign(p.LEFT, p.CENTER);
      p.text('RUNNING', 34, 22);
      p.textStyle(p.NORMAL);
    } else if (totalSeconds > 0) {
      p.noStroke();
      p.fill(...C.textSub);
      p.textSize(12);
      p.textAlign(p.LEFT, p.CENTER);
      p.text('⏸ PAUSED  (SPACE to resume)', 14, 22);
    }
  }

  // ── p5 lifecycle ──────────────────────────────────────────────

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.textFont('Georgia');
  };

  p.draw = function () {
    drawBg();

    let elapsedSec = totalSeconds;
    if (isRunning && workoutStartTime !== null) {
      elapsedSec += (p.millis() - workoutStartTime) / 1000;
    }
    let elapsedMin = elapsedSec; // TEST MODE: 1 second = 1 "minute"

    drawTitle();
    drawDial();
    drawFoods(elapsedMin % 60);
    drawMinuteHand(elapsedMin);
    drawSecondHand(elapsedSec);     // orange second hand
    drawHourBadge(elapsedMin);
    drawStatus();

    if (!isRunning && totalSeconds === 0) {
      drawStartScreen();
    } else {
      drawTimeDisplay(elapsedMin, elapsedSec);
    }

    p.noFill();
    p.stroke(...C.border);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  p.keyPressed = function () {
    if (p.key === ' ') {
      if (!isRunning && workoutStartTime === null) {
        workoutStartTime = p.millis(); isRunning = true;
      } else if (isRunning) {
        totalSeconds += (p.millis() - workoutStartTime) / 1000;
        workoutStartTime = null; isRunning = false;
      } else {
        workoutStartTime = p.millis(); isRunning = true;
      }
    }
    if (p.key === 'r' || p.key === 'R') {
      isRunning = false; workoutStartTime = null; totalSeconds = 0;
    }
  };

  p.windowResized = function () { p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE); };
});