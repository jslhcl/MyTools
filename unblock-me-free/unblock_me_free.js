// ---------->
// | (0,0)
// |
// x
// The coordinate origin is in up left. 
// Exit and each rectangle is represented as (up left x, up left y, down right x, down right y)
// Barriers are ordered by up left x, then up left y, then down right x, then down right y.
let board = {
    'w': 6,
    'h': 6,
    'exit': [6, 2, 6, 3],
    'target': [0, 2, 2, 3],
    'barriers': [[0, 0, 3, 1], [0, 3, 1, 5], [0, 5, 3, 6], [2, 1, 3, 4], [4, 3, 6, 4], [4, 4, 5, 6], [5, 0, 6, 3]],
};
//let board = {
//    'w': 6,
//    'h': 6,
//    'exit': [6, 2, 6, 3],
//    'target': [0, 2, 2, 3],
//    'barriers': [[0, 0, 3, 1]]
//};

class Pair {
    constructor(upper_left_x, upper_left_y, lower_right_x, lower_right_y) {
        this.x1 = upper_left_x;
        this.y1 = upper_left_y;
        this.x2 = lower_right_x;
        this.y2 = lower_right_y;
    }
}

class LogCollection {
    constructor(target, barriers, w, h) {
        this.target = target;
        this.barriers = barriers;
        this.parent = null;
        // area[x][y] == 1 means the square with top left point (x, y) and length of 1 is occupied by a log
        this.area = new Array(w).fill(0).map(() => new Array(h).fill(0));
        this.populate();
    }

    populateImpl(log) {
        for (let i = log.x1; i < log.x2; i++)
            for (let j = log.y1; j < log.y2; j++)
                this.area[i][j] = 1;
    }

    populate() {
        for (let i = 0; i < this.barriers.length; i++) this.populateImpl(this.barriers[i]);
        this.populateImpl(this.target);
    }

    getSnapshot() {
        let ret = '(' + this.target.x1 + ',' + this.target.y1 + ',' + this.target.x2 + ',' + this.target.y2 + ')';
        for (let i = 0; i < this.barriers.length; i++) {
            ret += '(' + this.barriers[i].x1 + ',' + this.barriers[i].y1 + ',' + this.barriers[i].x2 + ',' + this.barriers[i].y2 + ')';
        }
        return ret;
    }
}

function getNextMoves(logs, w, h) {
    let ret = [];
    if (logs.target.x2 - logs.target.x1 > logs.target.y2 - logs.target.y1) {
        if (logs.target.x1 > 0 && logs.area[logs.target.x1-1][logs.target.y1] == 0) {   // move left
            ret.push(new LogCollection(new Pair(logs.target.x1-1, logs.target.y1, logs.target.x2-1, logs.target.y2), logs.barriers, w, h));
        }
        if (logs.target.x2 < w && logs.area[logs.target.x2][logs.target.y1] == 0) {    // move right
            ret.push(new LogCollection(new Pair(logs.target.x1+1, logs.target.y1, logs.target.x2+1, logs.target.y2), logs.barriers, w, h));
        }
    } else if (logs.target.x2 - logs.target.x2 < logs.target.y1 - logs.target.y2) {
        if (logs.target.y2 < h && logs.area[logs.target.x1][logs.target.y2] == 0) {     // move down
            ret.push(new LogCollection(new Pair(logs.target.x1, logs.target.y1+1, logs.target.x2, logs.target.y2+1), logs.barriers, w, h));
        }
        if (logs.target.y1 > 0 && logs.area[logs.target.x1][logs.target.y1-1] == 0) {   // move up
            ret.push(new LogCollection(new Pair(logs.target.x1, logs.target.y1-1, logs.target.x2, logs.target.y2-1), logs.barriers, w, h));
        }
    } else throw new Error('Target is a square which is not expected!');

    for (let i = 0; i < logs.barriers.length; i++) {
        if (logs.barriers[i].x2 - logs.barriers[i].x1 > logs.barriers[i].y2 - logs.barriers[i].y1) {
            if (logs.barriers[i].x1 > 0 && logs.area[logs.barriers[i].x1-1][logs.barriers[i].y1] == 0) {    // move left
                let newBarriers = JSON.parse(JSON.stringify(logs.barriers));
                newBarriers[i].x1 -= 1;
                newBarriers[i].x2 -= 1;
                ret.push(new LogCollection(logs.target, newBarriers, w, h));
            }
            if (logs.barriers[i].x2 < w && logs.area[logs.barriers[i].x2][logs.barriers[i].y1] == 0) {   // move right
                let newBarriers = JSON.parse(JSON.stringify(logs.barriers));
                newBarriers[i].x1 += 1;
                newBarriers[i].x2 += 1;
                ret.push(new LogCollection(logs.target, newBarriers, w, h));
            }
        } else if (logs.barriers[i].x2 - logs.barriers[i].x1 < logs.barriers[i].y2 - logs.barriers[i].y1) {
            if (logs.barriers[i].y2 < h && logs.area[logs.barriers[i].x1][logs.barriers[i].y2] == 0 ) {    // move down
                let newBarriers = JSON.parse(JSON.stringify(logs.barriers));
                newBarriers[i].y1 += 1;
                newBarriers[i].y2 += 1;
                ret.push(new LogCollection(logs.target, newBarriers, w, h));
            }
            if (logs.barriers[i].y1 > 0 && logs.area[logs.barriers[i].x1][logs.barriers[i].y1-1] == 0) {    // move up
                let newBarriers = JSON.parse(JSON.stringify(logs.barriers));
                newBarriers[i].y1 -= 1;
                newBarriers[i].y2 -= 1;
                ret.push(new LogCollection(logs.target, newBarriers, w, h));
            }
        } else throw new Error('Barrier ' + i + ' is a square which is not expected!');
    }
    return ret;
}

class Board {
    constructor(board) {
        this.width = board.w;
        this.height = board.h;
        this.exit = new Pair(board.exit[0], board.exit[1], board.exit[2], board.exit[3]);
        let barriers = [];
        for (let i = 0; i < board.barriers.length; i++) barriers.push(new Pair(board.barriers[i][0], board.barriers[i][1], board.barriers[i][2], board.barriers[i][3]));
        this.logs = new LogCollection(new Pair(board.target[0], board.target[1], board.target[2], board.target[3]), barriers, board.w, board.h);
    }
}

function unblockMeFree(board) {
    let visited = new Set(), q = [];
    visited.add(board.logs.getSnapshot());
    q.push(board.logs);
    while (q.length > 0) {
        let logs = q.shift();
        let moves = getNextMoves(logs, board.width, board.height);
        for (let i = 0; i < moves.length; i++) {
            let move = moves[i];
            let ss = move.getSnapshot();
            if (!visited.has(ss)) {
                move.parent = logs;
                if (move.target.x2 == board.exit.x2 && move.target.y2 == board.exit.y2) return move;
                visited.add(ss);
                q.push(move);
            }
        }
    }
    return null;
}

let getCssForLog = function(barrier_idx, step, ulx, uly, brx, bry) {
    let ret = '.';
    if (barrier_idx < 0) ret += 'target_' + step + ' { background-color: #F00; ';
    else ret += 'barrier' + barrier_idx + '_' + step + ' { background-color: #F09B59; ';
    ret += ' width: ' + (brx-ulx) * 100 + 'px; height: ' + (bry-uly) * 100 + 'px; top: ' + uly*100 + 'px; left: ' + ulx*100 + 'px; ';
    ret += 'border: 1px solid #000; position: absolute; }';
    return ret;
}

let logLocations = new Map();

function printSolution(logs) {
    if (logs.parent != null) printSolution(logs.parent);

    let target_map = logLocations.get(-1);
    let target_key = logs.target.x1 + ',' + logs.target.y1;
    let target_css_index = -1;
    if (target_map.has(target_key)) {
        target_css_index = target_map.get(target_key);
    } else {
        target_css_index = target_map.size;
        target_map.set(target_key, target_css_index);
        document.styleSheets[0].insertRule(getCssForLog(-1, target_css_index, logs.target.x1, logs.target.y1, logs.target.x2, logs.target.y2));
    }
    let divElem = document.createElement('div');
    divElem.className = 'board'
    document.body.appendChild(divElem);
    let target_div = document.createElement('div');
    target_div.className = 'target_' + target_css_index;
    divElem.appendChild(target_div);

    for (let i = 0; i < logs.barriers.length; i++) {
        let barrier_map = logLocations.get(i);
        let barrier_key = logs.barriers[i].x1 + ',' + logs.barriers[i].y1;
        let barrier_css_index = -1;
        if (barrier_map.has(barrier_key)) barrier_css_index = barrier_map.get(barrier_key);
        else {
            barrier_css_index = barrier_map.size;
            barrier_map.set(barrier_key, barrier_css_index);
            document.styleSheets[0].insertRule(getCssForLog(i, barrier_css_index, logs.barriers[i].x1, logs.barriers[i].y1, logs.barriers[i].x2, logs.barriers[i].y2));
        }
        let barrier_div = document.createElement('div');
        barrier_div.className = 'barrier' + i + '_' + barrier_css_index;
        divElem.appendChild(barrier_div);
    }
}

function renderPuzzle() {
    let board_css = '.board { width: ' + board.w * 100 + 'px; height: ' + board.h * 100 + 'px; border: 1px solid #333; position: relative; }'
    document.styleSheets[0].insertRule(board_css);
    document.styleSheets[0].insertRule(getCssForLog(-1, 0, board.target[0], board.target[1], board.target[2], board.target[3]));
    for (let i = 0; i < board.barriers.length; i++) {
        document.styleSheets[0].insertRule(getCssForLog(i, 0, board.barriers[i][0], board.barriers[i][1], board.barriers[i][2], board.barriers[i][3]));
    }

    //document.styleSheets[0].insertRule(".class1 { background-color: #F00; width: 200px; height: 100px; }");
    let divElem = document.createElement('div');
    divElem.className = 'board';
    document.body.appendChild(divElem);
    let target0 = document.createElement('div');
    target0.className = 'target_0';
    divElem.appendChild(target0);
    for (let i = 0; i < board.barriers.length; i++) {
        let b = document.createElement('div');
        b.className = 'barrier' + i + '_0';
        divElem.appendChild(b);
    }

    const newButton = document.createElement('button');
    newButton.textContent = 'Solve it!';
    document.body.appendChild(newButton);
    newButton.addEventListener('click', () => {
        let target_map = new Map();
        target_map.set(board.target[0] + ',' + board.target[1], 0);
        logLocations.set(-1, target_map);
        for (let i = 0; i < board.barriers.length; i++) {
            let barrier_map = new Map();
            barrier_map.set(board.barriers[i][0] + ',' + board.barriers[i][1], 0);
            logLocations.set(i, barrier_map);
        }

        let b = new Board(board);
        let solution = unblockMeFree(b);
        if (solution) printSolution(solution);
        else alert('No solution!');
    });
}
