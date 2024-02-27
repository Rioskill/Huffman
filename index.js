const canvasEl = document.getElementById('canvas');

const {width, height} = canvasEl.getBoundingClientRect();
canvasEl.width = width;
canvasEl.height = height;

const ctx = canvasEl.getContext('2d');

function line(x1, y1, x2, y2) {
    // console.log('line:', x1, y1, x2, y2)
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}

function text(str, x, y) {
    ctx.font = "24px serif";
    ctx.fillText(str, x - 24, y + 24);
}

function clear() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
}

class Node {
    constructor(symbol, weight=0, parent=null, left=null, right=null) {
        this.symbol = symbol;
        this.weight = weight;

        this.left = left;
        this.right = right;

        this.parent = parent;
    }
}

class FKG {
    constructor() {
        this.z = new Node('null')
        this.root = this.z;
        
        this.nodes = [];
        this.seen = Array(256).fill(null)
    }
    
    get_path(symbol, node, code='') {
        if (node.left === null && node.right === null) {
            return 
        } else {
            let path = '';

            if (node.left !== null) {
                path = get_path(symbol, node.left, code+'0');
            }
            if (temp === '' && node.right !== null) {
                path = get_path(symbol, node.right, code+'1');
            }

            return path;
        }
    }

    find_largest_node(weight) {
        for (const node of this.nodes.slice().reverse()) {
            // console.log(node)
            if (node.weight === weight) {
                return node;
            }
        }
    }

    swap_nodes(first_node, second_node) {
        const nodeIndex = node => this.nodes.findIndex(x => x === node)
        const first_index = nodeIndex(first_node);
        const second_index = nodeIndex(second_node);

        const tmp = this.nodes[first_index];
        this.nodes[first_index] = this.nodes[second_index];
        this.nodes[second_index] = tmp;

        const tmp_parent = first_node.parent;
        first_node.parent = second_node.parent;
        second_node.parent = tmp_parent;

        if (first_node.parent.left === second_node) {
            first_node.parent.left = first_node;
        } else {
            first_node.parent.right = first_node;
        }

        if (second_node.parent.left === first_node) {
            second_node.parent.left = second_node;
        } else {
            second_node.parent.right = second_node;
        }
    }

    insert(symbol) {
        console.log(symbol)
        const symbol_code = symbol.charCodeAt(0);

        let node = this.seen[symbol_code];

        if (node === null) {
            const spawn = new Node(symbol, 1);
            const internal = new Node('', 1, this.z.parent, this.z, spawn);
            spawn.parent = internal;

            this.z.parent = internal;

            if (internal.parent !== null) {
                internal.parent.left = internal;
            } else {
                this.root = internal;
            }
    
            this.nodes.unshift(internal);
            this.nodes.unshift(spawn);
    
            this.seen[symbol_code] = spawn;
            node = internal.parent;
        }

        while (node !== null) {
            const largest = this.find_largest_node(node.weight);

            if (largest &&
                node !== largest && 
                node !== largest.parent && 
                largest !== node.parent) {
                    this.swap_nodes(node, largest);
            }

            node.weight++;
            node = node.parent;
        }
    }
}

function draw(node, x, y, width, height) {
    if (node.symbol !== '') {
        ctx.fillStyle = 'black';
        text(`${node.weight}/${node.symbol}`, x, y);
        return;
    }

    ctx.fillStyle = 'red';
    text(node.weight, x + 24, y - 50);

    const half_width = width / 2;

    const next_y = y + height;

    if (node.left !== null) {
        const next_x = x - half_width
        line(x, y, next_x, next_y);
        draw(node.left, next_x, next_y, half_width, height);
    }

    if (node.right !== null) {
        const next_x = x + half_width;
        line(x, y, next_x, next_y);
        draw(node.right, next_x, next_y, half_width, height);
    }
}

function build(str) {
    const alg = new FKG();

    // const str = 'skvo';

    clear();
    
    [...str].forEach(symbol => alg.insert(symbol))
    
    draw(alg.root, width / 2, 100, width / 2, 50);
}

const btn = document.getElementById('btn');
const input = document.getElementById('string-input');

btn.addEventListener('click', () => build(input.value))
