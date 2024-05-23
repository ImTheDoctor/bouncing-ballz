"use strict";
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
function resizeCanvas() {
    canvas.width = 1400;
    canvas.height = 800;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
let gravity = 9.81;
const damping = 0.8;
const maxCircles = 15;
const circles = [];
let lastTime = 0;
const gravitySelect = document.getElementById('gravity');
gravitySelect.addEventListener('change', () => {
    gravity = parseFloat(gravitySelect.value);
});
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const radius = parseFloat(document.getElementById('radius').value);
    const color = document.getElementById('color').value;
    const velocityX = parseFloat(document.getElementById('velocityX').value);
    const velocityY = parseFloat(document.getElementById('velocityY').value);
    spawnCircle(x, y, radius, color, velocityX, velocityY);
});
function spawnCircle(x, y, radius = 20, color = '#ff0000', velocityX = 0, velocityY = 0) {
    if (circles.length >= maxCircles) {
        circles.shift();
    }
    circles.push({ x, y, radius, color, velocityX, velocityY });
}
function update(deltaTime) {
    circles.forEach(circle => {
        circle.velocityY += gravity * (deltaTime / 1000);
        circle.y += circle.velocityY;
        circle.x += circle.velocityX;
        // Check for collisions with other circles
        circles.forEach(otherCircle => {
            if (circle !== otherCircle) {
                const dx = circle.x - otherCircle.x;
                const dy = circle.y - otherCircle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < circle.radius + otherCircle.radius) {
                    // Collision detected, change velocities
                    const angle = Math.atan2(dy, dx);
                    const sin = Math.sin(angle);
                    const cos = Math.cos(angle);
                    // Rotate velocities
                    const velocityX1 = circle.velocityX * cos + circle.velocityY * sin;
                    const velocityY1 = circle.velocityY * cos - circle.velocityX * sin;
                    const velocityX2 = otherCircle.velocityX * cos + otherCircle.velocityY * sin;
                    const velocityY2 = otherCircle.velocityY * cos - otherCircle.velocityX * sin;
                    // Calculate final velocities
                    const finalVelocityX1 = ((circle.radius - otherCircle.radius) * velocityX1 + 2 * otherCircle.radius * velocityX2) / (circle.radius + otherCircle.radius);
                    const finalVelocityX2 = ((otherCircle.radius - circle.radius) * velocityX2 + 2 * circle.radius * velocityX1) / (circle.radius + otherCircle.radius);
                    // Update velocities
                    circle.velocityX = finalVelocityX1 * cos - velocityY1 * sin;
                    circle.velocityY = velocityY1 * cos + finalVelocityX1 * sin;
                    otherCircle.velocityX = finalVelocityX2 * cos - velocityY2 * sin;
                    otherCircle.velocityY = velocityY2 * cos + finalVelocityX2 * sin;
                    // Separate the circles to prevent sticking
                    const overlap = circle.radius + otherCircle.radius - distance;
                    circle.x += overlap * cos;
                    circle.y += overlap * sin;
                }
            }
        });
        // Boundary check for the bottom of the canvas
        if (circle.y + circle.radius > canvas.height) {
            circle.y = canvas.height - circle.radius;
            circle.velocityY *= -damping;
            if (Math.abs(circle.velocityY) < 1) {
                circle.velocityY = 0;
            }
        }
        // Boundary check for the top of the canvas
        if (circle.y - circle.radius < 0) {
            circle.y = circle.radius;
            circle.velocityY *= -damping;
            if (Math.abs(circle.velocityY) < 1) {
                circle.velocityY = 0;
            }
        }
        // Boundary check for the left and right of the canvas
        if (circle.x + circle.radius > canvas.width || circle.x - circle.radius < 0) {
            circle.velocityX *= -damping;
            if (circle.x + circle.radius > canvas.width) {
                circle.x = canvas.width - circle.radius;
            }
            else if (circle.x - circle.radius < 0) {
                circle.x = circle.radius;
            }
        }
    });
}
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach(circle => {
        context.beginPath();
        context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        context.fillStyle = circle.color;
        context.fill();
        context.closePath();
    });
}
function tick(currentTime) {
    const deltaTime = currentTime - lastTime;
    update(deltaTime);
    draw();
    lastTime = currentTime;
    requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
