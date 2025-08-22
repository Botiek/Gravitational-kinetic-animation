// ТГ @SergBotie
const { Engine, Render, World, Bodies, Body, Composite, Mouse, MouseConstraint, Constraint, Vector } = Matter;
// инит движки
const engine = Engine.create();
const render = Render.create({
    element: document.getElementById('physics-container'),
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
    }
});

// Настройка физики 
engine.world.gravity.y = 0.8; 
const PHYSICS_CONFIG = {
    gravity: 0.8,
    restitution: 0.7,
    friction: 0.1,
    frictionAir: 0.005
};


let objects = [];
let mouseConstraint;

const svgFiles = [
    'img/1.svg', 'img/2.svg', 'img/3.svg', 'img/4.svg', 'img/5.svg',
    'img/6.svg', 'img/7.svg', 'img/8.svg', 'img/9.svg', 'img/10.svg',
    'img/11.svg', 'img/12.svg', 'img/13.svg', 'img/14.svg', 'img/15.svg',
    'img/16.svg', 'img/17.svg', 'img/18.svg', 'img/19.svg', 'img/20.svg',
    'img/21.svg', 'img/22.svg'
];

//Границы экрана пол, лево, право
const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 10, window.innerWidth * 2, 20, {
    isStatic: true,
    render: {
        visible: false 
    }
});

const leftWall = Bodies.rectangle(-10, window.innerHeight / 2, 20, window.innerHeight * 2, {
    isStatic: true,
    render: {
        visible: false 
    }
});

const rightWall = Bodies.rectangle(window.innerWidth + 10, window.innerHeight / 2, 20, window.innerHeight * 2, {
    isStatic: true,
    render: {
        visible: false 
    }
});

Composite.add(engine.world, [ground, leftWall, rightWall]);


function createSVGObject(svgPath, x, y) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            // Размеры иконок
            const imgWidth = img.naturalWidth || 100;
            const imgHeight = img.naturalHeight || 100;
            
            // угол, под каким падают - рандом
            const randomAngle = (Math.random() - 0.5) * 40 * (Math.PI / 180); 
            
            const body = Bodies.rectangle(x, y, imgWidth, imgHeight, {
                render: {
                    sprite: {
                        texture: svgPath,
                        xScale: 1.0,
                        yScale: 1.0
                    }
                },
                restitution: PHYSICS_CONFIG.restitution,
                friction: PHYSICS_CONFIG.friction,
                frictionAir: PHYSICS_CONFIG.frictionAir,
                angle: randomAngle
            });
            
            objects.push(body);
            Composite.add(engine.world, body);
            
            // клик
            body.clickHandler = () => {
                const force = Vector.create(
                    (Math.random() - 0.5) * 0.05,
                    -0.08
                );
                Body.applyForce(body, body.position, force);
            };
            
            resolve(body);
        };
        img.src = svgPath;
    });
}

// рандом
async function addRandomObjects(count = 5) {
    for (let i = 0; i < count; i++) {
        const randomSvg = svgFiles[Math.floor(Math.random() * svgFiles.length)];
        const x = Math.random() * (window.innerWidth - 120) + 60;
        const y = Math.random() * 200 + 50;
        await createSVGObject(randomSvg, x, y);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

function clearObjects() {
    objects.forEach(obj => {
        Composite.remove(engine.world, obj);
    });
    objects = [];
}

function resetPhysics() {
    clearObjects();
    addRandomObjects(22);
}

// ивент клика
render.canvas.addEventListener('click', (event) => {
    const rect = render.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    objects.forEach(obj => {
        const distance = Math.sqrt(
            Math.pow(obj.position.x - x, 2) + 
            Math.pow(obj.position.y - y, 2)
        );
        if (distance < 30 && obj.clickHandler) {
            obj.clickHandler();
        }
    });
});


const mouse = Mouse.create(render.canvas);
mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});

Composite.add(engine.world, mouseConstraint);
render.mouse = mouse;

window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 10 });
    Body.setPosition(leftWall, { x: -10, y: window.innerHeight / 2 });
    Body.setPosition(rightWall, { x: window.innerWidth + 10, y: window.innerHeight / 2 });
});

Engine.run(engine);
Render.run(render);

setTimeout(() => {
    addRandomObjects(5);
}, 500);

// Тайминги
let spawnInterval = setInterval(() => {
    if (objects.length < 22) {
        addRandomObjects(1);
    } else {
        clearInterval(spawnInterval);
    }
}, 227); 

render.canvas.addEventListener('click', (event) => {
    const rect = render.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    objects.forEach(obj => {
        const distance = Math.sqrt(
            Math.pow(obj.position.x - x, 2) + 
            Math.pow(obj.position.y - y, 2)
        );
        
        if (distance < 30 && obj.clickHandler) {
            obj.clickHandler();
        }
    });
});

