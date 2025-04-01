<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let bumperImage: HTMLImageElement;

  let ball = { x: 385, y: 540, radius: 10, speedX: 0, speedY: 0, active: false };
  let gravity = 0.06;
  let charging = false;
  let charge = 0;
  let maxCharge = 60;
  let score = 0;
  let leftFlipperActive = false;
  let rightFlipperActive = false;

  const spring = { x: 370, y: 550, width: 20, height: 50 };

  const flippers = {
    left: { x: 70, y: 500, width: 140, height: 10, angle: -0.785 },
    right: { x: 210, y: 500, width: 140, height: 10, angle: -0.785 }
  };

  type Obstacle =
    | { x: number; y: number; width: number; height: number; type?: 'rect' }
    | { x: number; y: number; radius: number; startAngle: number; endAngle: number; type: 'arc-outline' }
    | { x: number; y: number; width: number; height: number; angle: number; type: 'sloped' };


    const obstacles: Obstacle[] = [
    { x: 360, y: 230, width: 5, height: 300 },
    { x: 395, y: 200, width: 5, height: 330 },
    { x: 0, y: 100, width: 20, height: 150 },
    { x: 0, y: 280, width: 20, height: 120 },
    { x: 360, y: 530, width: 5, height: 68 },
    { x: 395, y: 530, width: 5, height: 68 },
    { x: 400, y: 200, width: 5, height: 55, angle: 2.7, type: 'sloped' },
  ];

  function drawObstacles() {
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#ff6666');
    gradient.addColorStop(1, '#cc0000');
    ctx.strokeStyle = gradient;
    ctx.fillStyle = gradient;

    obstacles.forEach((o) => {
      if (o.type === 'arc-outline') {
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius, o.startAngle, o.endAngle);
        ctx.lineWidth = 5;
        ctx.stroke();
      } else if ((o as any).type === 'sloped') {
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.rotate((o as any).angle);
        ctx.fillRect(0, 0, o.width, o.height);
        ctx.restore();
      } else {
        ctx.fillRect(o.x, o.y, o.width, o.height);
      }
    });
  }

  const bumpers = Array.from({ length: 9 }, (_, i) => {
    const cols = 3;
    const spacingX = 100;
    const spacingY = 80;
    const offsetX = 100;
    const offsetY = 100;
    return {
      x: offsetX + (i % cols) * spacingX,
      y: offsetY + Math.floor(i / cols) * spacingY,
      radius: 15,
      color: '#00ffcc',
      hit: false
    };
  });

  const popups: { x: number; y: number; text: string; alpha: number }[] = [];

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4081';
    ctx.fill();
    ctx.closePath();
  }

  function drawSpring() {
    ctx.fillStyle = '#888';
    ctx.fillRect(spring.x, spring.y - charge, spring.width, spring.height + charge);
  }

  function drawBumpers() {
    bumpers.forEach(b => {
      const scale = 3;
      const size = b.radius * 2 * scale;

      if (bumperImage?.complete) {
        ctx.drawImage(bumperImage, b.x - size / 2, b.y - size / 2, size, size);
      } else {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.closePath();
      }

      if (b.hit) {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius + 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  function drawFlippers() {
    const draw = (f, isLeft) => {
      ctx.save();
      const pivotX = isLeft ? f.x : f.x + f.width;
      const pivotY = f.y;
      const angle = (isLeft ? -1 : 1) * f.angle;

      ctx.translate(pivotX, pivotY);
      ctx.rotate(angle);

      const baseRadius = 8;
      const flipperLength = f.width - baseRadius;
      const flipperHeight = f.height;

      ctx.beginPath();
      ctx.moveTo(0, -flipperHeight);
      ctx.lineTo((isLeft ? 1 : -1) * flipperLength, -flipperHeight / 2);
      ctx.lineTo((isLeft ? 1 : -1) * flipperLength, flipperHeight / 2);
      ctx.lineTo(0, flipperHeight);
      ctx.closePath();
      ctx.fillStyle = '#00e0ff';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00e0ff';
      ctx.stroke();

      ctx.restore();
    };

    draw(flippers.left, true);
    draw(flippers.right, false);
  }


  function drawPopups() {
    popups.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(p.text, p.x, p.y);
      ctx.globalAlpha = 1;
    });
    for (let i = popups.length - 1; i >= 0; i--) {
      popups[i].y -= 1;
      popups[i].alpha -= 0.02;
      if (popups[i].alpha <= 0) popups.splice(i, 1);
    }
  }

  function drawBoardOutline() {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();
  }

  function checkObstacleCollision() {
  obstacles
    .filter((o): o is { x: number; y: number; width: number; height: number; type?: 'rect' } => {
      return 'width' in o && 'height' in o && (o.type === undefined || o.type === 'rect');
    })
    .forEach(o => {
      const withinX = ball.x + ball.radius > o.x && ball.x - ball.radius < o.x + o.width;
      const withinY = ball.y + ball.radius > o.y && ball.y - ball.radius < o.y + o.height;

      if (withinX && withinY) {
        const prevX = ball.x - ball.speedX;
        const prevY = ball.y - ball.speedY;

        const hitFromLeftOrRight = prevY >= o.y && prevY <= o.y + o.height;
        const hitFromTopOrBottom = prevX >= o.x && prevX <= o.x + o.width;

        if (hitFromLeftOrRight) ball.speedX *= -1;
        if (hitFromTopOrBottom) ball.speedY *= -1;

        // Leicht verschieben, damit er nicht klebt
        ball.x += ball.speedX;
        ball.y += ball.speedY;
      }
    });
}



  function checkBumperCollision() {
    bumpers.forEach(b => {
      const dx = ball.x - b.x;
      const dy = ball.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isAbove = ball.y < b.y && ball.speedY > 0;
      if (dist < ball.radius + b.radius && isAbove) {
        const nx = dx / dist;
        const ny = dy / dist;
        const dot = ball.speedX * nx + ball.speedY * ny;
        ball.speedX -= 2 * dot * nx;
        ball.speedY -= 2 * dot * ny;
        ball.speedX *= 0.85;
        ball.speedY *= 0.85;
        score++;
        b.hit = true;
        popups.push({ x: b.x - 20, y: b.y - 20, text: '1 Punkt!', alpha: 1 });
        setTimeout(() => (b.hit = false), 150);
      }
    });
  }

  function checkFlipperCollision() {
  Object.entries(flippers).forEach(([key, f]) => {
    const isLeft = key === 'left';
    const angle = (isLeft ? -1 : 1) * f.angle;
    const pivot = { x: isLeft ? f.x : f.x + f.width, y: f.y };

    // Transformiere Ballposition ins Flipper-Koordinatensystem
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const relX = ball.x - pivot.x;
    const relY = ball.y - pivot.y;

    const localX = relX * cos + relY * sin;
    const localY = -relX * sin + relY * cos;

    const halfHeight = f.height / 2;

    if (
      localX >= (isLeft ? 0 : -f.width) - ball.radius &&
      localX <= (isLeft ? f.width : 0) + ball.radius &&
      localY >= -halfHeight - ball.radius &&
      localY <= halfHeight + ball.radius
    ) {
      // Reflektiere Ball normal zur Flipperfläche
      const normalX = -sin;
      const normalY = -cos;
      const dot = ball.speedX * normalX + ball.speedY * normalY;

      if (dot < 0) {
        ball.speedX -= 2 * dot * normalX;
        ball.speedY -= 2 * dot * normalY;

        if ((isLeft && leftFlipperActive) || (!isLeft && rightFlipperActive)) {
          ball.speedX *= 1.1;
          ball.speedY *= 1.1;
        }

        // Verschiebe Ball leicht nach außen, damit er nicht "klebt"
        ball.x += normalX * (ball.radius + 1);
        ball.y += normalY * (ball.radius + 1);
      }
    }
  });
}


  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (ball.active) {
      ball.speedY += gravity;
      ball.x += ball.speedX;
      ball.y += ball.speedY;
    }

    flippers.left.angle = leftFlipperActive ? 0.5 : -0.785;
    flippers.right.angle = rightFlipperActive ? 0.5 : -0.785;

    if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) ball.speedX *= -1;
    if (ball.y < ball.radius) ball.speedY *= -1;

    if (ball.y > canvas.height - ball.radius) {
      ball = { x: 385, y: 540, radius: 10, speedX: 0, speedY: 0, active: false };
    }

    drawBoardOutline();
    drawSpring();
    drawBumpers();
    drawFlippers();
    drawBall();
    drawPopups();
    drawObstacles();
    checkBumperCollision();
    checkFlipperCollision();
    checkObstacleCollision();


    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);

    requestAnimationFrame(update);
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    bumperImage = new Image();
    bumperImage.src = '/videos/the-internet-svgrepo-com.svg';
    bumperImage.onload = update;

    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !ball.active) charging = true;
      if (e.code === 'ArrowLeft') leftFlipperActive = true;
      if (e.code === 'ArrowRight') rightFlipperActive = true;
    };

    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space' && charging) {
        charging = false;
        ball.speedY = -charge / 2;
        ball.speedX = -charge / 6;
        ball.active = true;
        charge = 0;
      }
      if (e.code === 'ArrowLeft') leftFlipperActive = false;
      if (e.code === 'ArrowRight') rightFlipperActive = false;
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    const interval = setInterval(() => {
      if (charging && charge < maxCharge) charge += 2;
    }, 20);

    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      clearInterval(interval);
    };
  });
</script>


<style>
  :global(body) {
    margin: 0;
    background: #111;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  .game-wrapper {
    position: relative;
    width: 400px;
    height: 600px;
  }
  .bg-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 400px;
    height: 600px;
    object-fit: cover;
    z-index: 1;
    opacity: 0.2;
    pointer-events: none;
  }
  .pinball-canvas {
    width: 400px;
    height: 600px;
    border: 2px solid #444;
    border-radius: 12px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
  }

  .bunberImage {
    font-size: 100px;
  }
</style>

<div class="game-wrapper">
  <video autoplay muted loop playsinline class="bg-video">
    <source src="/videos/Unbenannt.mp4" type="video/mp4" />
    Dein Browser unterstützt kein HTML5-Video.
  </video>
  <canvas bind:this={canvas} class="pinball-canvas" width="400" height="600"></canvas>
</div>