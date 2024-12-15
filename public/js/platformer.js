const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to match the window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game variables
const gravity = 0.5;
let isJumping = false;
let animationFrame = 0;  // Frame counter for alternating walk/idle images

// Background image
const backgroundImage = new Image();
backgroundImage.src = 'images/background.png';  // Path to your background image

// Player object
const player = {
    x: 50,
    y: 300,
    width: 100,
    height: 100,
    velocityY: 0,
    speed: 5,
    direction: 'right',  // Track direction (left or right)
    image: new Image(),  // Image for the player
    images: {
        idle: {
            right: 'images/forward_idle.png', // Idle image facing right
            left: 'images/backward_idle.png'    // Idle image facing left
        },
        walk: {
            right: 'images/forward_walk.png', // Walking image facing right
            left: 'images/backward_walk.png'    // Walking image facing left
        },
        jump: {
            right: 'images/forward_jump.png', // Jumping image facing right
            left: 'images/backward_jump.png'    // Jumping image facing left
        }
    }
};

// Load the player images
player.image.src = player.images.idle.right;  // Default to idle image facing right

// Text platforms (positions and dimensions)
const platforms = [
    { x: 50, y: 500, width: 200, height: 30, text: 'Try clicking the WASD Keys', link: null },
    { x: 50, y: 75, width: 225, height: 30, text: 'Click Here for my Github', link: 'https://github.com/djmiramontes' },
    { x: 50, y: 175, width: 225, height: 30, text: 'Click Here for my LinkedIn', link: 'https://www.linkedin.com/in/diego-miramontes-b7164a2b0/' },
    { x: 850, y: 250, width: 200, height: 30, text: 'Future Projects:', link: null },
    { x: 750, y: 350, width: 400, height: 30, text: 'An online retail bot to purchase limited online items', link: null },
    { x: 750, y: 450, width: 300, height: 30, text: 'A custom Mini LLM for personal use', link: null },
    { x: 200, y: 275, width: 150, height: 20, text: '', velocityX: 2, velocityY: 0 }, // Moving platform
    { x: 0, y: canvas.height - 70, width: canvas.width, height: 10, text: '' } // Invisible bottom platform
];

// Track key states
const keys = {
    W: false,  // Up (jump)
    A: false,  // Left
    S: false,  // Down (optional, can be used for crouch or other functionality)
    D: false   // Right
};

// Event listeners for keydown and keyup
document.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key.toUpperCase())) {
        keys[event.key.toUpperCase()] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key.toUpperCase())) {
        keys[event.key.toUpperCase()] = false;
    }
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check if the mouse click is on a platform with a link
    platforms.forEach(platform => {
        if (
            mouseX >= platform.x &&
            mouseX <= platform.x + platform.width &&
            mouseY >= platform.y &&
            mouseY <= platform.y + platform.height &&
            platform.link // Ensure the platform has a link
        ) {
            window.open(platform.link, '_blank'); // Open the link in a new tab
        }
    });
});

// Update platform positions (including moving platform)
function updatePlatforms() {
    platforms.forEach(platform => {
        if (platform.velocityX || platform.velocityY) {
            platform.x += platform.velocityX || 0;
            platform.y += platform.velocityY || 0;

            // Reverse direction if the platform hits canvas boundaries
            if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
                platform.velocityX *= -1; // Reverse horizontal direction
            }
            if (platform.y <= 0 || platform.y + platform.height >= canvas.height) {
                platform.velocityY *= -1; // Reverse vertical direction
            }
        }
    });
}

// Game update function
function update() {
    // Apply horizontal movement
    if (keys.A) {
        player.x -= player.speed;
        player.direction = 'left';
        animationFrame++;
        if (animationFrame % 10 === 0) {
            player.image.src = player.image.src === player.images.walk.left ? player.images.idle.left : player.images.walk.left;
        }
    }
    if (keys.D) {
        player.x += player.speed;
        player.direction = 'right';
        animationFrame++;
        if (animationFrame % 10 === 0) {
            player.image.src = player.image.src === player.images.walk.right ? player.images.idle.right : player.images.walk.right;
        }
    }

    // Apply vertical movement (jump)
    if (keys.W && !isJumping) {
        isJumping = true;
        player.velocityY = -10;
        player.image.src = player.direction === 'right' ? player.images.jump.right : player.images.jump.left;
    }

    // Apply gravity
    player.velocityY += gravity;
    player.y += player.velocityY;

    // Update moving platforms
    updatePlatforms();

    // Check for collision with platforms
    platforms.forEach(platform => {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height < platform.y + platform.height &&
            player.y + player.height + player.velocityY >= platform.y
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            isJumping = false;
            player.image.src = player.direction === 'right' ? player.images.idle.right : player.images.idle.left;
        }
    });

    // Prevent player from falling off the canvas
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        isJumping = false;
        player.image.src = player.direction === 'right' ? player.images.idle.right : player.images.idle.left;
    }

    // Set idle image if not moving
    if (!keys.A && !keys.D && !isJumping) {
        player.image.src = player.direction === 'right' ? player.images.idle.right : player.images.idle.left;
    }
}

// Game draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);

    // Draw platforms
    platforms.forEach(platform => {
        ctx.fillStyle = 'White';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        if (platform.text) {
            ctx.fillStyle = 'Black';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(platform.text, platform.x + platform.width / 2, platform.y + platform.height / 2);
        }
    });
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
