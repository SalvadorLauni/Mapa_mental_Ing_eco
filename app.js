const INITIAL_MINDMAP_DATA = {
  "id": "root",
  "text": "Uso de la Hoja de Cálculo en Ingeniería Económica",
  "details": "Apéndice A: Guía práctica de hojas de cálculo, funciones financieras y análisis de decisiones.",
  "icon": "calculator",
  "color": "#0284c7",
  "children": [
    {
      "id": "a1",
      "text": "A.1 Introducción a Excel",
      "details": "Fundamentos de ejecución de fórmulas, referencias y herramientas de soporte.",
      "icon": "book-open",
      "color": "#ec4899",
      "children": [
        {
          "id": "a1-1",
          "text": "Fórmulas y Funciones",
          "details": "• Signo = estricto para ejecutar.\n• Ctrl + ` alterna mostrar/ocultar fórmulas.",
          "icon": "terminal",
          "color": "#f43f5e",
          "children": [
            {
              "id": "node_1",
              "text": "Ejemplos",
              "details": "- VP: =VP(5%, 12, 10)\n- VF: =VF(C3, C4, C5) con referencias",
              "icon": "circle-dot",
              "color": "#f43f5e"
            }
          ]
        },
        {
          "id": "a1-2",
          "text": "Referencias de Celdas",
          "details": "• Relativas: En excel (=A1)\n• Absolutas: En Excel (=$A$1)",
          "icon": "link",
          "color": "#fb7185",
          "children": [
            {
              "id": "node_2",
              "text": "Referencias Relativas",
              "details": "Cambia en relación con el movimiento (arrastrar o copiar) de la celda original.",
              "icon": "circle-dot",
              "color": "#fb7185"
            }
          ]
        }
      ]
    },
    {
      "id": "a2",
      "text": "A.2 Funciones Financieras",
      "details": "Uso de funciones clave: NPER, TASA, VA, VF, PAGO.",
      "icon": "coins",
      "color": "#10b981",
      "children": [
        {
          "id": "a2-1",
          "text": "Valor Presente y Futuro",
          "details": "• VA(tasa, nper, pago, [vf])\n• VF(tasa, nper, pago, [va])",
          "icon": "trending-up",
          "color": "#059669"
        },
        {
          "id": "a2-2",
          "text": "Anualidades y Pagos",
          "details": "• PAGO(tasa, nper, va, [vf])\n• TASA(nper, pago, va, [vf])",
          "icon": "dollar-sign",
          "color": "#047857"
        }
      ]
    },
    {
      "id": "a3",
      "text": "A.3 Evaluación de Proyectos",
      "details": "Criterios de rentabilidad financiera: VPN y TIR.",
      "icon": "pie-chart",
      "color": "#8b5cf6",
      "children": [
        {
          "id": "a3-1",
          "text": "Valor Presente Neto (VPN)",
          "details": "=VNA(tasa, flujo1, flujo2, ...) - Inversión",
          "icon": "bar-chart-3",
          "color": "#7c3aed"
        },
        {
          "id": "a3-2",
          "text": "Tasa Interna de Retorno (TIR)",
          "details": "=TIR(valores, [estimación])",
          "icon": "activity",
          "color": "#6d28d9"
        }
      ]
    }
  ]
};

// Global State
let data = JSON.parse(JSON.stringify(INITIAL_MINDMAP_DATA));
let panX = window.innerWidth / 2 - 150;
let panY = window.innerHeight / 2 - 100;
let scale = 1;
let isDragging = false;
let startX = 0;
let startY = 0;
let selectedNodeId = null;

const NODE_WIDTH = 280;
const NODE_HEIGHT = 100;
const LEVEL_GAP = 360;
const ROW_GAP = 120;

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    const appEl = document.getElementById("app");
    appEl.innerHTML = `
        <!-- Header Controls -->
        <header class="absolute top-4 left-4 right-4 z-50 flex flex-wrap items-center justify-between bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg border border-slate-200/80">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-sky-500 text-white rounded-xl shadow-md">
                    <i data-lucide="network" class="w-6 h-6"></i>
                </div>
                <div>
                    <h1 class="font-bold text-slate-800 text-lg leading-snug">Mapa Mental - Ingeniería Económica</h1>
                    <p class="text-xs text-slate-500">Apéndice A: Excel & Funciones Financieras</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button id="zoom-in" class="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition font-medium text-sm flex items-center gap-1 shadow-sm">
                    <i data-lucide="zoom-in" class="w-4 h-4"></i>
                </button>
                <button id="zoom-out" class="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition font-medium text-sm flex items-center gap-1 shadow-sm">
                    <i data-lucide="zoom-out" class="w-4 h-4"></i>
                </button>
                <button id="reset-view" class="p-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl transition font-medium text-sm flex items-center gap-1 shadow-sm border border-sky-200/60">
                    <i data-lucide="rotate-ccw" class="w-4 h-4"></i> Centrar
                </button>
            </div>
        </header>

        <!-- Canvas Container -->
        <div id="canvas-container" class="canvas-container">
            <div id="mindmap-viewport">
                <svg id="connections-layer"></svg>
                <div id="nodes-layer"></div>
            </div>
        </div>
    `;

    setupEvents();
    render();
}

function calculatePositions(node, depth = 0, currentY = 0) {
    node._depth = depth;
    let totalHeight = 0;

    if (!node.children || node.children.length === 0 || node.collapsed) {
        node._height = NODE_HEIGHT + ROW_GAP;
        return node._height;
    }

    let childY = 0;
    node.children.forEach(child => {
        const h = calculatePositions(child, depth + 1, childY);
        child._relativeY = childY + h / 2 - NODE_HEIGHT / 2;
        childY += h;
        totalHeight += h;
    });

    node._height = Math.max(NODE_HEIGHT + ROW_GAP, totalHeight);
    return node._height;
}

function setAbsoluteCoords(node, x = 0, y = 0) {
    node._x = x;
    node._y = y;

    if (node.children && node.children.length > 0 && !node.collapsed) {
        let currentChildY = y - node._height / 2 + NODE_HEIGHT / 2;
        node.children.forEach(child => {
            const h = child._height;
            const childY = currentChildY + h / 2;
            setAbsoluteCoords(child, x + LEVEL_GAP, childY);
            currentChildY += h;
        });
    }
}

function layoutTree(root) {
    calculatePositions(root, 0, 0);
    setAbsoluteCoords(root, 100, 0);
}

function render() {
    layoutTree(data);

    const viewport = document.getElementById("mindmap-viewport");
    const svgLayer = document.getElementById("connections-layer");
    const nodesLayer = document.getElementById("nodes-layer");

    viewport.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;

    svgLayer.innerHTML = "";
    nodesLayer.innerHTML = "";

    function drawNode(node) {
        // Node element
        const nodeDiv = document.createElement("div");
        nodeDiv.className = `mindmap-node ${node.id === selectedNodeId ? "selected" : ""}`;
        nodeDiv.style.left = `${node._x}px`;
        nodeDiv.style.top = `${node._y}px`;
        nodeDiv.style.borderColor = node.color || "#0284c7";

        const iconName = node.icon || "circle-dot";

        nodeDiv.innerHTML = `
            <div class="node-header">
                <div class="node-icon" style="background-color: ${node.color || '#0284c7'}">
                    <i data-lucide="${iconName}" class="w-4 h-4"></i>
                </div>
                <div class="text-slate-800 font-semibold flex-1 leading-snug">${node.text}</div>
            </div>
            ${node.details ? `<div class="node-details">${node.details}</div>` : ""}
        `;

        if (node.children && node.children.length > 0) {
            const toggleBtn = document.createElement("button");
            toggleBtn.className = "toggle-collapse-btn";
            toggleBtn.style.borderColor = node.color || "#0284c7";
            toggleBtn.style.color = node.color || "#0284c7";
            toggleBtn.innerHTML = node.collapsed ? "+" : "−";
            toggleBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                node.collapsed = !node.collapsed;
                render();
            });
            nodeDiv.appendChild(toggleBtn);
        }

        nodeDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            selectedNodeId = node.id;
            render();
        });

        nodesLayer.appendChild(nodeDiv);

        // Draw connections
        if (node.children && node.children.length > 0 && !node.collapsed) {
            node.children.forEach(child => {
                drawConnection(node, child);
                drawNode(child);
            });
        }
    }

    function drawConnection(parent, child) {
        const startX = parent._x + NODE_WIDTH;
        const startY = parent._y + 40;
        const endX = child._x;
        const endY = child._y + 40;

        const controlX1 = startX + (endX - startX) / 2;
        const controlY1 = startY;
        const controlX2 = startX + (endX - startX) / 2;
        const controlY2 = endY;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`);
        path.setAttribute("class", "connection-path");
        path.setAttribute("stroke", child.color || "#94a3b8");
        path.setAttribute("stroke-width", "3");
        path.setAttribute("opacity", "0.7");

        svgLayer.appendChild(path);
    }

    drawNode(data);

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function setupEvents() {
    const container = document.getElementById("canvas-container");

    container.addEventListener("mousedown", (e) => {
        if (e.target.closest(".mindmap-node")) return;
        isDragging = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        const viewport = document.getElementById("mindmap-viewport");
        if (viewport) {
            viewport.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        }
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    container.addEventListener("wheel", (e) => {
        e.preventDefault();
        const zoomFactor = 1.1;
        if (e.deltaY < 0) {
            scale = Math.min(scale * zoomFactor, 2.5);
        } else {
            scale = Math.max(scale / zoomFactor, 0.4);
        }
        render();
    }, { passive: false });

    document.getElementById("zoom-in").addEventListener("click", () => {
        scale = Math.min(scale * 1.2, 2.5);
        render();
    });

    document.getElementById("zoom-out").addEventListener("click", () => {
        scale = Math.max(scale / 1.2, 0.4);
        render();
    });

    document.getElementById("reset-view").addEventListener("click", () => {
        panX = window.innerWidth / 2 - 150;
        panY = window.innerHeight / 2 - 100;
        scale = 1;
        selectedNodeId = null;
        render();
    });
}
