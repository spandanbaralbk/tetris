const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

context.scale(20, 20);

const arena = createMatrix(12, 20);

const colors = [
    null,
    "#FF0D72",
    "#0DC2FF",
    "#0DFF72",
    "#F538FF",
    "#FF8E0D",
    "#FFE138",
    "#3877FF"
];

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0
};

function createMatrix(w, h) {
    const matrix = [];

    while (h--) {
        matrix.push(new Array(w).fill(0));
    }

    return matrix;
}

function createPiece(type) {
    if (type === "T") {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ];
    }

    if (type === "O") {
        return [
            [2, 2],
            [2, 2]
        ];
    }

    if (type === "L") {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ];
    }

    if (type === "J") {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ];
    }

    if (type === "I") {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ];
    }

    if (type === "S") {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
        ];
    }

    if (type === "Z") {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ];
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];

                context.fillRect(
                    x + offset.x,
                    y + offset.y,
                    1,
                    1
                );
            }
        });
    });
}

function draw() {
    context.fillStyle = "#222";

    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function collide(arena, player) {
    const matrix = player.matrix;
    const offset = player.pos;

    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {

            if (
                matrix[y][x] !== 0 &&
                (arena[y + offset.y] &&
                    arena[y + offset.y][x + offset.x]) !== 0
            ) {
                return true;
            }
        }
    }

    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {

            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }

        });
    });
}

function arenaSweep() {
    outer:
    for (let y = arena.length - 1; y > 0; y--) {

        for (let x = 0; x < arena[y].length; x++) {

            if (arena[y][x] === 0) {
                continue outer;
            }

        }

        arena.splice(y, 1);
        arena.unshift(new Array(12).fill(0));

        player.score += 10;

        updateScore();
    }
}

function rotate(matrix) {
    for (let y = 0; y < matrix.length; y++) {

        for (let x = 0; x < y; x++) {

            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                    matrix[y][x],
                    matrix[x][y]
                ];

        }
    }

    matrix.forEach(row => row.reverse());
}

function playerReset() {
    const pieces = "TJLOSZI";

    player.matrix =
        createPiece(
            pieces[Math.random() * pieces.length | 0]
        );

    player.pos.y = 0;

    player.pos.x =
        (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {

        arena.forEach(row => row.fill(0));

        player.score = 0;

        updateScore();
    }
}

function playerMove(direction) {
    player.pos.x += direction;

    if (collide(arena, player)) {
        player.pos.x -= direction;
    }
}

function playerDrop() {
    player.pos.y++;

    if (collide(arena, player)) {

        player.pos.y--;

        merge(arena, player);

        arenaSweep();

        playerReset();
    }
}

function playerRotate() {
    const position = player.pos.x;

    rotate(player.matrix);

    let offset = 1;

    while (collide(arena, player)) {

        player.pos.x += offset;

        offset = -(offset + (offset > 0 ? 1 : -1));

        if (offset > player.matrix[0].length) {

            rotate(player.matrix);

            player.pos.x = position;

            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 600;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;

    lastTime = time;

    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {

        playerDrop();

        dropCounter = 0;
    }

    draw();

    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById("score").innerText =
        player.score;

    let highScore =
        localStorage.getItem("hi") || 0;

    if (player.score > highScore) {

        highScore = player.score;

        localStorage.setItem("hi", highScore);
    }

    document.getElementById("hi-score").innerText =
        highScore;
}

document.addEventListener("keydown", event => {

    if (event.key === "ArrowLeft") {
        playerMove(-1);
    }

    else if (event.key === "ArrowRight") {
        playerMove(1);
    }

    else if (event.key === "ArrowDown") {
        playerDrop();
    }

    else if (event.key === "ArrowUp") {
        playerRotate();
    }

});

playerReset();
updateScore();
update();