$(document).ready(function() {
    // Declare canvas element and context
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Player variables
    let x = 100;
    let y = 800;
    const size = 50;
    let xv = 0;
    let yv = 0;
    const speed = 1;
    const friction = 0.9;
    let keys = {};
    let onPlatform = false;
    let gravity = 1;
    let jumpHeight = 15;
    let startTime = Date.now();

    let uri = window.location.href;
    let gui = uri.includes('?gui=true');
    
    // Objects and level
    let objects = [
        // level 1
        200, 750, 150, 250, 'safe',
        0, 900, 40, 40, 'safe',
        160, 800, 40, 40, 'safe',
        410, 800, 290, 150, 'die',
        850, 850, 150, 150, 'safe',
        1200, 800, 200, 200, 'safe',
        1400, 900, 200, 100, 'safe',
        700, 800, 150, 200, 'water',
        1000, 900, 200, 100, 'lava',
        1400, 850, 200, 50, 'lava',
        1550, 700, 50, 50, 'safe',
        1350, 600, 50, 50, 'safe',
        1550, 500, 50, 50, 'safe',
        1350, 400, 50, 50, 'safe',
        1550, 300, 50, 50, 'safe',
        350, 250, 1050, 50, 'safe',
        1300, 50, 50, 200, 'water',
        1100, 100, 150, 150, 'die',
        1000, 0, 350, 50, 'water',
        900, 0, 140, 200, 'die',
        // level 2
        // Platforms (safe)
        100, 900, 200, 20, 'safe',    // Platform at the bottom left
        300, 800, 200, 20, 'safe',    // Platform slightly higher
        500, 700, 200, 20, 'safe',    // Platform slightly higher
        700, 600, 200, 20, 'safe',    // Platform slightly higher
        900, 500, 200, 20, 'safe',    // Platform slightly higher
        1100, 400, 200, 20, 'safe',   // Platform slightly higher
        1300, 300, 200, 20, 'safe',   // High platform at the top right

        // Water (water)
        200, 950, 200, 50, 'water',   // Water at the bottom left
        400, 850, 200, 50, 'water',   // Water in the middle left
        600, 750, 200, 50, 'water',   // Water in the middle
        800, 650, 200, 50, 'water',   // Water in the middle
        1000, 550, 200, 50, 'water',  // Water in the middle
        1200, 450, 200, 50, 'water',  // Water in the middle

        // Deadly rectangles (die)
        150, 920, 50, 80, 'die',      // Deadly rectangle near the bottom left
        450, 820, 50, 80, 'die',      // Deadly rectangle in the middle left
        650, 720, 50, 80, 'die',      // Deadly rectangle in the middle
        850, 620, 50, 80, 'die',      // Deadly rectangle in the middle
        1050, 520, 50, 80, 'die',     // Deadly rectangle in the middle
        1250, 420, 50, 80, 'die'      // Deadly rectangle in the middle
    ];

    let levelLength = [20, 19]; // Correctly represent the number of platforms on each level (not the number of levels)
    let level = 1;

    let bottom, top, left, right;

    const restart = () => {
        x = 100;
        y = 800;
        xv = 0;
        yv = 0;
        onPlatform = false;
        startTime = Date.now();
    }

    const getSides = () => {
        bottom = y + size;
        top = y;
        left = x;
        right = x + size;
    }

    const isColliding = (objX, objY, objWidth, objHeight) => {
        getSides();
        let padding = 1;
        return !(left + padding > objX + objWidth || right - padding < objX || top - padding > objY + objHeight + 2 || bottom + padding < objY);
    }

    const resolveCol = () => {
        let rel = getRel();
        
        // console.log(rel);
        x += xv;
        for (let i = 0; i < levelLength[level - 1]; i++) {
            let newRel = rel + i * 5;
            // console.log(newRel)
            getSides();
            y -= 2;
            if (isColliding(objects[newRel], objects[newRel + 1], objects[newRel + 2], objects[newRel + 3])) {
                if (objects[newRel + 4] === 'safe') {
                    if (xv > 0) {
                        y += 2;
                        if (isColliding(objects[newRel], objects[newRel + 1], objects[newRel + 2], objects[newRel + 3])) {
                            x = objects[newRel] - size;
                        }
                        y -= 2;
                    } else if (xv < 0) {
                        y += 2;
                        if (isColliding(objects[newRel], objects[newRel + 1], objects[newRel + 2], objects[newRel + 3])) {
                            x = objects[newRel] + objects[newRel + 2];
                        }
                        y -= 2;
                    }
                    xv = 0;
                } else if (objects[newRel + 4] === 'die' || objects[newRel + 4] === 'lava') {
                    y += 7; if (isColliding(objects[newRel], objects[newRel + 1], objects[newRel + 2], objects[newRel + 3])) {
                        restart();
                        break;
                    } else {y -= 7}
                }
            }
            y += 2;
        }

        y -= yv;
        onPlatform = false;
        for (let i = 0; i < levelLength[level - 1]; i++) {
            let newRel = rel + i * 5;
            getSides();
            if (isColliding(objects[newRel], objects[newRel + 1], objects[newRel + 2], objects[newRel + 3])) {
                if (objects[newRel + 4] === 'safe') {
                    if (yv < 0) {
                        y = objects[newRel + 1] - size;
                        onPlatform = true;
                        yv = 0;
                    } else if (yv > 0) {
                        y = objects[newRel + 1] + objects[newRel + 3] + 4;
                        yv = -0.5 * yv;
                    }
                } else if (objects[newRel + 4] === 'die' || objects[newRel + 4] === 'lava') {
                    y += 5; if (isColliding(objects[newRel], objects[newRel + 1], objects[newRel + 2], objects[newRel + 3])) {
                        restart();
                        break;
                    } else {y -= 5}
                }
            }
        }

        y += 1;
        for (let i = 0; i < levelLength[level - 1]; i++) {
            let newRel = rel + i * 5;
            if (isColliding(objects[newRel], objects[newRel + 1], objects[newRel + 2], objects[newRel + 3])) {
                if (objects[newRel + 4] === 'safe') {
                    onPlatform = true;
                }
            }
        }
        y -= 1;
    }

    let waterCd = false;
    let paddleUp = true;
    let paddleDown = true;

    const calc = () => {

            // for testing purposes
        if (keys['c']) {
            yv += 2;
        }

        // Check for arrow keys
        xv += (keys['ArrowRight'] || keys['d'] ? (inWater() ? 0.5 * speed : speed) : 0) - (keys['ArrowLeft'] || keys['a'] ? (inWater() ? 0.5 * speed : speed) : 0);
        yv = ((keys['ArrowUp'] || keys['w']) && onGround() && !inWater()) ? jumpHeight : yv;

        const waterEnter = () => {
            yv *= 0.6;
            xv *= 0.6;
        }

        if (inWater()) {
            if (waterCd) {waterCd = false; waterEnter()}

            if (keys['ArrowUp'] || keys['w']) {
                if (paddleUp) {
                    yv += 10;
                    paddleUp = false;
                }
            } else {paddleUp = true}
            if (keys['ArrowDown'] || keys['s']) {
                if (paddleDown) {
                    yv -= 8;
                    paddleDown = false;
                } 
            } else {paddleDown = true}
        } else {waterCd = true}

        xv *= inWater() ? 0.95 : friction;

        if (inWater()) {
            yv *= 0.9;
            y -= size / 2;
            if (inWater()) {
                yv -= 0.05;
            }
            y += size / 2;
        } else {
            yv -= gravity;
        }

        // Collisions with platforms
        resolveCol();

        // Check for collisions with the canvas
        getSides();
        if (bottom >= canvas.height && yv <= 0) {
            yv = 0;
            y = canvas.height - size;
            yv = 0;
        } if (left <= 0) {
            xv = 0;
            x = 0;
        } if (top <= 0) {
            yv = 0;
            y = 0;
        } if (right >= canvas.width) {
            xv = 0;
            x = canvas.width - size
        }

        if (keys['r']) {
            restart()
        } 
    }

    const render = () => {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Create lava effect
        let effect = Math.sin(Date.now() / 1000) * 10;

        // Render the player
        ctx.fillStyle = 'red';
        ctx.fillRect(x, y, size, size);

        // Get relative
        let rel = getRel();

        // Render the objects
        for (let i = 0; i < levelLength[level - 1]; i++) {
            let newRel = rel + i * 5;
            if (objects[newRel + 4] === 'safe') {
                ctx.fillStyle = '#e1d3c1';
            } else if (objects[newRel + 4] === 'die' || objects[newRel + 4] === 'lava') {
                ctx.fillStyle = '#ff6464';
            } else if (objects[newRel + 4] === 'water') {
                ctx.fillStyle = 'rgba(50, 70, 120, 0.6)';
            } else {
                ctx.fillStyle = 'pink';
            }
            if (objects[newRel + 4] !== 'lava') {
            ctx.fillRect(objects[newRel], objects[newRel + 1], objects[newRel + 2], objects[newRel + 3]);
            } else {
                ctx.fillRect(objects[newRel], objects[newRel + 1] - effect, objects[newRel + 2], objects[newRel + 3] + effect);
            }
        }
    }

    const gameLoop = () => {
        // Get FPS
        updateFPS();

        // Perform game calculations
        calc();

        // Render game objects
        render();
        
        if (gui) {
            // Show the GUI if URL contains (?gui=true)
            renderGUI();
        }

        // Request the next frame
        requestAnimationFrame(gameLoop);
    }

    // Add keydown event listener
    document.addEventListener('keydown', function(event) {
        keys[event.key] = true;
    });

    // Add keyup event listener
    document.addEventListener('keyup', function(event) {
        keys[event.key] = false;
    });

    const onGround = () => {
        return (y + size + 3 >= canvas.height || onPlatform);
    }

    const inWater = () => {
        let rel = getRel();
        for (let i = 0; i < levelLength[level - 1]; i++) {
            let newRel = rel + i * 5;
            if (isColliding(objects[newRel], objects[newRel + 1], objects[newRel + 2], objects[newRel + 3])) {
                if (objects[newRel + 4] === 'water') {
                    return true;
                }
            }
        }
        return false;
    }

    const getRel = () => {
        let item = 0;
        for (let i = 1; i < level; i++) {
            item += levelLength[i - 1];
        }
        return item * 5;
    }

    let fps = 0;
    let lastTime = performance.now();
    let frameCount = 0;

    function updateFPS() {
        let currentTime = performance.now();
        let deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        fps = Math.round(1000 / deltaTime); // Calculate frames per second
    }

    function renderGUI() {
        let sv = xv.toFixed(2);
        let svt = yv.toFixed(2);
        let sx = x.toFixed(2); 
        let sy = y.toFixed(2);
        let time = Date.now() - startTime;
        time = time / 1000;
        time = time.toFixed(3);
        
        const keySize = 20;
        const paddingX = 100;
        const paddingY = 5;
        const inactiveColor = '#cccccc';
        const activeColor = '#007aff';

        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.textBaseline = 'middle'; // Set text baseline to middle
        ctx.textAlign = 'left'; // Align text to the left  
        ctx.fillText(`FPS: ${fps}`, 10, 20); // Render FPS on canvas
        ctx.fillText(`X: ${sv}p/f`, 10, 40);
        ctx.fillText(`Y: ${svt}p/f`, 10, 60);
        ctx.fillText(`x: ${sx}`, 10, 80);
        ctx.fillText(`y: ${sy}`, 10, 100);
        ctx.fillText(time, 10, 120);

        function drawKey(x, y, label, active) {
            ctx.fillStyle = active ? activeColor : inactiveColor;
            ctx.fillRect(x, y, keySize, keySize);
            ctx.fillStyle = 'black';
            ctx.font = '15px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x + keySize / 2, y + keySize / 2);
        }
    
        function renderKeys() {
            drawKey(paddingX, paddingY + keySize, '←', keys.ArrowLeft || keys.a);
            drawKey(paddingX + keySize, paddingY, '↑', keys.ArrowUp || keys.w);
            drawKey(paddingX + 2 * keySize, paddingY + keySize, '→', keys.ArrowRight || keys.d);
            drawKey(paddingX + keySize, paddingY + 2 * keySize, '↓', keys.ArrowDown || keys.s);
            drawKey(paddingX + keySize, paddingY + keySize, 'R', keys.r);
        }

        renderKeys()
    }

    // Start the game loop
    gameLoop();
});
