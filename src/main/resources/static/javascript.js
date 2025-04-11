
(() => {
	// plugins
	Matter.use(MatterAttractors);

	// constants
	const PATHS = {
		DOME: '0 0 0 250 19 250 20 231.9 25.7 196.1 36.9 161.7 53.3 129.5 74.6 100.2 100.2 74.6 129.5 53.3 161.7 36.9 196.1 25.7 231.9 20 268.1 20 303.9 25.7 338.3 36.9 370.5 53.3 399.8 74.6 425.4 100.2 446.7 129.5 463.1 161.7 474.3 196.1 480 231.9 480 250 500 250 500 0 0 0',
		DROP_LEFT: '0 0 20 0 70 100 20 150 0 150 0 0',
		DROP_RIGHT: '50 0 68 0 68 150 50 150 0 100 50 0',
		APRON_LEFT: '0 0 180 120 0 120 0 0',
		APRON_RIGHT: '180 0 180 120 0 120 180 0'
	};
	const COLOR = {
		BACKGROUND: '#212529',
		OUTER: 'rgb(124, 124, 112, 0.6)',
		INNER: 'rgba(21, 170, 191, 0.5)',
		BUMPER: 'rgba(250, 189, 5, 0.3)',
		BUMPER_LIT: '#fff3bf',
		PADDLE: '#e6c149',
		PINBALL: '#dee2e6'
	};
	const GRAVITY = 0.75;
	const WIREFRAMES = false;
	const BUMPER_BOUNCE = 1.5;
	const PADDLE_PULL = 0.002;
	const MAX_VELOCITY = 50;

    let ws;
    const WS_SERVER_URL = "ws://192.168.58.230:8080/ws"; // ✨ Deine ESP32-IP anpassen


	// score elements
	let $currentScore = $('.current-score span');
	let $highScore = $('.high-score span');

	// shared variables
	let currentScore, highScore;
	let engine, world, render, pinball, stopperGroup;
	let leftPaddle, leftUpStopper, leftDownStopper, isLeftPaddleUp;
	let rightPaddle, rightUpStopper, rightDownStopper, isRightPaddleUp;

	function load() {
		init();
		createStaticBodies();
		createPaddles();
        initWebSocket();
		createPinball();
		createEvents();
        fetchHighscore();
	}

    function initWebSocket() {
        try {
            ws = new WebSocket(WS_SERVER_URL);
    
            ws.onopen = function () {
                console.log("✅ WebSocket verbunden mit ESP32");
            };
    
            ws.onclose = function () {
                console.log("🔌 Verbindung getrennt, versuche erneut...");
                setTimeout(initWebSocket, 2000);
            };
    
            ws.onerror = function (e) {
                console.error("⚠️ WebSocket Fehler:", e);
            };
    
            ws.onmessage = function (e) {
                const message = e.data;
                console.log("📨 Empfangen:", message);
    
                // 🎮 Steuerung Links
                if (message === 'left_pressed') {
                    isLeftPaddleUp = true;
                    animatePaddle('left', true);
                    console.log("⬅️ Linker Flipper gedrückt");
                } else if (message === 'left_released') {
                    isLeftPaddleUp = false;
                    animatePaddle('left', false);
                }
    
                // 🎮 Steuerung Rechts
                if (message === 'right_pressed') {
                    isRightPaddleUp = true;
                    animatePaddle('right', true);
                    console.log("➡️ Rechter Flipper gedrückt");
                } else if (message === 'right_released') {
                    isRightPaddleUp = false;
                    animatePaddle('right', false);
                }
            };
        } catch (error) {
            console.error("❌ WebSocket konnte nicht initialisiert werden:", error);
            setTimeout(initWebSocket, 2000); // 🕒 Bei Fehler erneut versuchen
        }
    }

	function init() {
	
		engine = Matter.Engine.create();

	
		world = engine.world;
		world.bounds = {
			min: { x: 0, y: 0},
			max: { x: 500, y: 800 }
		};
		world.gravity.y = GRAVITY; // simulate rolling on a slanted table

		
        
		render = Matter.Render.create({
			element: $('.pinball-wrapper')[0],
			engine: engine,
			options: {
				width: world.bounds.max.x,
				height: world.bounds.max.y,
				wireframes: WIREFRAMES,
				background: 'transparent'
			}
		});
		Matter.Render.run(render);

	
		let runner = Matter.Runner.create();
		Matter.Runner.run(runner, engine);

			stopperGroup = Matter.Body.nextGroup(true);

		currentScore = 0;
		highScore = 0;
		isLeftPaddleUp = false;
		isRightPaddleUp = false;
	}

	function createStaticBodies() {
		Matter.World.add(world, [
	
			boundary(250, -30, 500, 100),
			boundary(250, 830, 500, 100),
			boundary(-30, 400, 100, 800),
			boundary(530, 400, 100, 800),

			// dome
			path(251, 120, PATHS.DOME),

			// pegs (left, mid, right)
			wall(140, 140, 20, 40, COLOR.INNER),
			wall(225, 140, 20, 40, COLOR.INNER),
			wall(310, 140, 20, 40, COLOR.INNER),

			// top bumpers (left, mid, right)
			bumper(105, 250),
			bumper(225, 250),
			bumper(345, 250),

			// bottom bumpers (left, right)
			bumper(165, 340),
			bumper(285, 340),
            // Extra-Bumper (grüner Punkt)
          


			// shooter lane wall
			wall(440, 520, 20, 560, COLOR.OUTER),

			// drops (left, right)
			path(25, 360, PATHS.DROP_LEFT),
			path(425, 360, PATHS.DROP_RIGHT),

			// slingshots (left, right)
			wall(120, 510, 20, 120, COLOR.INNER),
			wall(330, 510, 20, 120, COLOR.INNER),

			// out lane walls (left, right)
			wall(60, 529, 20, 160, COLOR.INNER),
			wall(390, 529, 20, 160, COLOR.INNER),

			// flipper walls (left, right);
			wall(93, 624, 20, 98, COLOR.INNER, -0.96),
			wall(357, 624, 20, 98, COLOR.INNER, 0.96),

			// aprons (left, right)
			path(79, 740, PATHS.APRON_LEFT),
			path(371, 740, PATHS.APRON_RIGHT),

			// reset zones (center, right)
			reset(225, 50),
			reset(465, 30)
		]);

        world.bodies.forEach(body => {
            if (body.label === 'bumper') {
                const { x, y } = body.position;
                let iconPath = "assets/icon1.png"; // Standard
                let score = 10;
        
                if (x === 105 && y === 250) {
                    iconPath = "assets/kauflandIcon.png"; score = 10;
                } else if (x === 225 && y === 250) {
                    iconPath = "assets/lidlIcon.png"; score = 20;
                } else if (x === 345 && y === 250) {
                    iconPath = "assets/PreIcon.png"; score = 30;
                } else if (x === 165 && y === 340) {
                    iconPath = "assets/SchwarzProduktion.png"; score = 40;
                } else if (x === 285 && y === 340) {
                    iconPath = "assets/SDIcon.png"; score = 50;
                }
        
                body._points = score;
                addBumperIcon(body, iconPath);
            }
        });
        
        
	}

	function createPaddles() {
		// these bodies keep paddle swings contained, but allow the ball to pass through
		leftUpStopper = stopper(160, 591, 'left', 'up');
		leftDownStopper = stopper(140, 743, 'left', 'down');
		rightUpStopper = stopper(290, 591, 'right', 'up');
		rightDownStopper = stopper(310, 743, 'right', 'down');
		Matter.World.add(world, [leftUpStopper, leftDownStopper, rightUpStopper, rightDownStopper]);

		// this group lets paddle pieces overlap each other
		let paddleGroup = Matter.Body.nextGroup(true);

		// Left paddle mechanism
		let paddleLeft = {};
		paddleLeft.paddle = Matter.Bodies.trapezoid(170, 660, 20, 80, 0.33, {
			label: 'paddleLeft',
			angle: 1.57,
			chamfer: {},
			render: {
				fillStyle: COLOR.PADDLE
			}
		});
		paddleLeft.brick = Matter.Bodies.rectangle(172, 672, 40, 80, {
			angle: 1.62,
			chamfer: {},
			render: {
				visible: false
			}
		});
		paddleLeft.comp = Matter.Body.create({
			label: 'paddleLeftComp',
			parts: [paddleLeft.paddle, paddleLeft.brick]
		});
		paddleLeft.hinge = Matter.Bodies.circle(142, 660, 5, {
			isStatic: true,
			render: {
				visible: false
			}
		});
		Object.values(paddleLeft).forEach((piece) => {
			piece.collisionFilter.group = paddleGroup
		});
		paddleLeft.con = Matter.Constraint.create({
			bodyA: paddleLeft.comp,
			pointA: { x: -29.5, y: -8.5 },
			bodyB: paddleLeft.hinge,
			length: 0,
			stiffness: 0
		});
		Matter.World.add(world, [paddleLeft.comp, paddleLeft.hinge, paddleLeft.con]);
		Matter.Body.rotate(paddleLeft.comp, 0.57, { x: 142, y: 660 });

		// right paddle mechanism
		let paddleRight = {};
		paddleRight.paddle = Matter.Bodies.trapezoid(280, 660, 20, 80, 0.33, {
			label: 'paddleRight',
			angle: -1.57,
			chamfer: {},
			render: {
				fillStyle: COLOR.PADDLE
			}
		});
		paddleRight.brick = Matter.Bodies.rectangle(278, 672, 40, 80, {
			angle: -1.62,
			chamfer: {},
			render: {
				visible: false
			}
		});
		paddleRight.comp = Matter.Body.create({
			label: 'paddleRightComp',
			parts: [paddleRight.paddle, paddleRight.brick]
		});
		paddleRight.hinge = Matter.Bodies.circle(308, 660, 5, {
			isStatic: true,
			render: {
				visible: false
			}
		});
		Object.values(paddleRight).forEach((piece) => {
			piece.collisionFilter.group = paddleGroup
		});
		paddleRight.con = Matter.Constraint.create({
			bodyA: paddleRight.comp,
			pointA: { x: 29.5, y: -8.5 },
			bodyB: paddleRight.hinge,
			length: 0,
			stiffness: 0
		});
		Matter.World.add(world, [paddleRight.comp, paddleRight.hinge, paddleRight.con]);
		Matter.Body.rotate(paddleRight.comp, -0.57, { x: 308, y: 660 });
	}

    function startTypingEffect() {
        const textElement = document.getElementById("animated-text");
        const messages = [
          "Learn together and grow together",
          "Eat(). Code(). Sleep(). Repeat().",
          "Your future starts here! SchwarzIT"
        ];
      
        let messageIndex = 0;
        let charIndex = 0;
        let typing = true;
      
        function type() {
          const currentMessage = messages[messageIndex];
          if (typing) {
            if (charIndex < currentMessage.length) {
              textElement.textContent += currentMessage.charAt(charIndex);
              charIndex++;
              setTimeout(type, 70); // Buchstabe für Buchstabe erscheinen
            } else {
              typing = false;
              setTimeout(type, 2000); // Warten nach vollständigem Text
            }
          } else {
            if (charIndex > 0) {
              textElement.textContent = currentMessage.substring(0, charIndex - 1);
              charIndex--;
              setTimeout(type, 40); // Buchstabe für Buchstabe löschen
            } else {
              typing = true;
              messageIndex = (messageIndex + 1) % messages.length;
              setTimeout(type, 1000); // Pause vor neuer Zeile
            }
          }
        }
      
        type();
      }
      
      window.addEventListener("load", () => {
        startTypingEffect();
      });
      

	function createPinball() {
		// x/y are set to when pinball is launched
		pinball = Matter.Bodies.circle(0, 0, 14, {
			label: 'pinball',
			collisionFilter: {
				group: stopperGroup
			},
			render: {
				fillStyle: COLOR.PINBALL
			}
		});
		Matter.World.add(world, pinball);
		launchPinball();
	}

	function createEvents() {
		// events for when the pinball hits stuff
		Matter.Events.on(engine, 'collisionStart', function(event) {
			let pairs = event.pairs;
			pairs.forEach(function(pair) {
				if (pair.bodyB.label === 'pinball') {
					switch (pair.bodyA.label) {
						case 'reset':
                            handleGameOver();
							launchPinball();
							break;
						case 'bumper':
							pingBumper(pair.bodyA);
							break;
					}
				}
			});
		});

		// regulate pinball
		Matter.Events.on(engine, 'beforeUpdate', function(event) {
			// bumpers can quickly multiply velocity, so keep that in check
			Matter.Body.setVelocity(pinball, {
				x: Math.max(Math.min(pinball.velocity.x, MAX_VELOCITY), -MAX_VELOCITY),
				y: Math.max(Math.min(pinball.velocity.y, MAX_VELOCITY), -MAX_VELOCITY),
			});

			// cheap way to keep ball from going back down the shooter lane
			if (pinball.position.x > 450 && pinball.velocity.y > 0) {
				Matter.Body.setVelocity(pinball, { x: 0, y: -10 });
			}
		});

		// mouse drag (god mode for grabbing pinball)
		Matter.World.add(world, Matter.MouseConstraint.create(engine, {
			mouse: Matter.Mouse.create(render.canvas),
			constraint: {
				stiffness: 0.2,
				render: {
					visible: false
				}
			}
		}));

		// keyboard paddle events
		$('body').on('keydown', function(e) {
			if (e.which === 37) { // left arrow key
				isLeftPaddleUp = true;
			} else if (e.which === 39) { // right arrow key
				isRightPaddleUp = true;
			}
		});
		$('body').on('keyup', function(e) {
			if (e.which === 37) { // left arrow key
				isLeftPaddleUp = false;
			} else if (e.which === 39) { // right arrow key
				isRightPaddleUp = false;
			}
		});
// ⌨️ Tastatur-Steuerung (Fallback)
$('body').on('keydown', function (e) {
    if (e.which === 37) {
        isLeftPaddleUp = true;
        animatePaddle('left', true);
    } else if (e.which === 39) {
        isRightPaddleUp = true;
        animatePaddle('right', true);
    }
});

$('body').on('keyup', function (e) {
    if (e.which === 37) {
        isLeftPaddleUp = false;
        animatePaddle('left', false);
    } else if (e.which === 39) {
        isRightPaddleUp = false;
        animatePaddle('right', false);
    }
});

// 📱 Touch-Events für Buttons
$('.left-trigger')
    .on('mousedown touchstart', function () {
        isLeftPaddleUp = true;
        animatePaddle('left', true);
    })
    .on('mouseup touchend', function () {
        isLeftPaddleUp = false;
        animatePaddle('left', false);
    });

$('.right-trigger')
    .on('mousedown touchstart', function () {
        isRightPaddleUp = true;
        animatePaddle('right', true);
    })
    .on('mouseup touchend', function () {
        isRightPaddleUp = false;
        animatePaddle('right', false);
    });
	}

    function showGameOverOverlay() {
        const overlay = document.getElementById("game-over-overlay");
        overlay.classList.add("show");
    
        setTimeout(() => {
            overlay.classList.remove("show");
        }, 2000); // 2 Sekunden anzeigen
    }
    
    function handleGameOver() {
        if (currentScore > 0) {
            sendscore(currentScore);
        }
        showGameOverOverlay(); // 🟥 Overlay einblenden
    }
    

	function launchPinball() {
		updateScore(0);
		Matter.Body.setPosition(pinball, { x: 465, y: 765 });
		Matter.Body.setVelocity(pinball, { x: 0, y: -25 + rand(-2, 2) });
		Matter.Body.setAngularVelocity(pinball, 0);
	}
    
    function pingBumper(bumper) {
        const points = bumper._points || 10;
        updateScore(currentScore + points);
    
        bumper.render.fillStyle = COLOR.BUMPER_LIT;
        setTimeout(() => {
            bumper.render.fillStyle = COLOR.BUMPER;
        }, 100);
    
        showPopup("+" + points, bumper.position.x, bumper.position.y);
        showRadarEffect(bumper.position.x, bumper.position.y); // 🚀 Hier der Effekt
    
        if (bumper._iconElement) {
            bumper._iconElement.classList.add("flash");
            setTimeout(() => {
                bumper._iconElement.classList.remove("flash");
            }, 300);
        }
    }
    

	function updateScore(newCurrentScore) {
        currentScore = newCurrentScore;
        $currentScore.text(currentScore);
      
        // Highscore prüfen und ggf. senden
        if (currentScore > highScore) {
          highScore = currentScore;
          $highScore.text(highScore);
          sendscore(highScore); // hier wird gesendet!
        }
	}

    async function sendscore(scorevalue) {
        try {
          const response = await fetch('http://localhost:8080/api/v1/scores', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score: scorevalue }),
          });
      
          if (!response.ok) {
            throw new Error('Fehler beim Senden des Scores');
          }
      
          console.log('Highscore erfolgreich gesendet:', scorevalue);
        } catch (err) {
          console.error('Fehler beim Senden:', err.message);
        }
      }

      async function fetchHighscore() {
        try {
          const response = await fetch('http://localhost:8080/api/v1/scores');
      
          if (!response.ok) {
            throw new Error('Fehler beim Laden der Highscores');
          }
      
          const highscores = await response.json();
      
          // Maximalen Score ermitteln (falls Liste kommt)
          if (Array.isArray(highscores)) {
            const maxScore = Math.max(...highscores.map(h => h.score));
            highScore = maxScore;
          } else if (typeof highscores.score === 'number') {
            highScore = highscores.score; // falls nur ein Objekt mit score kommt
          } else {
            highScore = 0;
          }
      
          $highScore.text(highScore);
          console.log('Highscore geladen:', highScore);
      
        } catch (err) {
          console.error('Fehler beim Abrufen des Highscores:', err.message);
        }
      }
      
      

	// matter.js has a built in random range function, but it is deterministic
	function rand(min, max) {
		return Math.random() * (max - min) + min;
	}

	// outer edges of pinball table
	function boundary(x, y, width, height) {
		return Matter.Bodies.rectangle(x, y, width, height, {
			isStatic: true,
			render: {
				fillStyle: COLOR.OUTER
			}
		});
	}

	// wall segments
	function wall(x, y, width, height, color, angle = 0) {
		return Matter.Bodies.rectangle(x, y, width, height, {
			angle: angle,
			isStatic: true,
			chamfer: { radius: 10 },
			render: {
				fillStyle: color
			}
		});
	}

	// bodies created from SVG paths
	function path(x, y, path) {
		let vertices = Matter.Vertices.fromPath(path);
		return Matter.Bodies.fromVertices(x, y, vertices, {
			isStatic: true,
			render: {
				fillStyle: COLOR.OUTER,

				// add stroke and line width to fill in slight gaps between fragments
				strokeStyle: COLOR.OUTER,
				lineWidth: 1
			}
		});
	}

	// round bodies that repel pinball
	function bumper(x, y) {
		let bumper = Matter.Bodies.circle(x, y, 25, {
			label: 'bumper',
			isStatic: true,
			render: {
				fillStyle: COLOR.BUMPER
			}
		});

		// for some reason, restitution is reset unless it's set after body creation
		bumper.restitution = BUMPER_BOUNCE;

		return bumper;
	}

	// invisible bodies to constrict paddles
	function stopper(x, y, side, position) {
		// determine which paddle composite to interact with
		let attracteeLabel = (side === 'left') ? 'paddleLeftComp' : 'paddleRightComp';

		return Matter.Bodies.circle(x, y, 40, {
			isStatic: true,
			render: {
				visible: false,
			},
			collisionFilter: {
				group: stopperGroup
			},
			plugin: {
				attractors: [
					// stopper is always a, other body is b
					function(a, b) {
						if (b.label === attracteeLabel) {
							let isPaddleUp = (side === 'left') ? isLeftPaddleUp : isRightPaddleUp;
							let isPullingUp = (position === 'up' && isPaddleUp);
							let isPullingDown = (position === 'down' && !isPaddleUp);
							if (isPullingUp || isPullingDown) {
								return {
									x: (a.position.x - b.position.x) * PADDLE_PULL,
									y: (a.position.y - b.position.y) * PADDLE_PULL,
								};
							}
						}
					}
				]
			}
		});
	}

	// contact with these bodies causes pinball to be relaunched
	function reset(x, width) {
		return Matter.Bodies.rectangle(x, 781, width, 2, {
			label: 'reset',
			isStatic: true,
			render: {
				fillStyle: '#fff'
			}
		});
	}

	window.addEventListener('load', load, false);

    function showPopup(text, x, y) {
        const popup = document.createElement("div");
        popup.className = "popup";
        popup.textContent = text;
    
        // Position ins HTML umrechnen (Canvas-Koordinaten zu Pixel)
        const scale = render.options.width / render.canvas.width;
        const left = x / scale;
        const top = y / scale;
    
        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
    
        document.getElementById("popup-container").appendChild(popup);
    
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }

    function addBumperIcon(bumper, iconPath) {
        const icon = document.createElement("div");
        icon.className = "bumper-icon";
        icon.innerHTML = `<img src="${iconPath}" class="bumper-img" />`;
    
        const scale = render.options.width / render.canvas.width;
        const left = bumper.position.x / scale;
        const top = bumper.position.y / scale;
    
        icon.style.left = `${left}px`;
        icon.style.top = `${top}px`;
    
        bumper._iconElement = icon;
    
        document.getElementById("bumper-icons").appendChild(icon);
    }
    

    function showRadarEffect(x, y) {
        const ripple = document.createElement("div");
        ripple.className = "radar-effect";
    
        // Umrechnung Canvas → DOM-Position
        const scale = render.options.width / render.canvas.width;
        const left = x / scale;
        const top = y / scale;
    
        ripple.style.left = `${left - 10}px`; // -10 für Mitte des Effekts
        ripple.style.top = `${top - 10}px`;
    
        document.getElementById("popup-container").appendChild(ripple);
    
        setTimeout(() => ripple.remove(), 600);
    }
    
    
    
    
    
})();
