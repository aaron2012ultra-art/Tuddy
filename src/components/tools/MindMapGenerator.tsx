import React, { useState } from "react";
import { 
  Network, 
  Plus, 
  Trash2, 
  Download, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw,
  Edit2,
  ZoomIn,
  ZoomOut
} from "lucide-react";

interface MindNode {
  id: string;
  text: string;
  color: string;
  children: MindNode[];
}

const PRESET_MAPS: Record<string, MindNode> = {
  fotosintesis: {
    id: "root-1",
    text: "Fotosíntesis",
    color: "#059669",
    children: [
      {
        id: "f-1",
        text: "Insumos",
        color: "#10b981",
        children: [
          { id: "f-1-1", text: "Luz solar (Fotones)", color: "#34d399", children: [] },
          { id: "f-1-2", text: "Agua (H2O por raíces)", color: "#34d399", children: [] },
          { id: "f-1-3", text: "Dióxido de carbono (CO2)", color: "#34d399", children: [] },
        ],
      },
      {
        id: "f-2",
        text: "Fases",
        color: "#0284c7",
        children: [
          { id: "f-2-1", text: "Fase Luminosa (Tilacoides)", color: "#38bdf8", children: [] },
          { id: "f-2-2", text: "Ciclo de Calvin (Estroma)", color: "#38bdf8", children: [] },
        ],
      },
      {
        id: "f-3",
        text: "Productos",
        color: "#d97706",
        children: [
          { id: "f-3-1", text: "Glucosa (Energía química)", color: "#fbbf24", children: [] },
          { id: "f-3-2", text: "Oxígeno (O2 liberado)", color: "#fbbf24", children: [] },
        ],
      },
    ],
  },
  ia: {
    id: "root-2",
    text: "Inteligencia Artificial",
    color: "#7c3aed",
    children: [
      {
        id: "ia-1",
        text: "Machine Learning",
        color: "#8b5cf6",
        children: [
          { id: "ia-1-1", text: "Supervisado (Clasificación)", color: "#a78bfa", children: [] },
          { id: "ia-1-2", text: "No supervisado (Clustering)", color: "#a78bfa", children: [] },
        ],
      },
      {
        id: "ia-2",
        text: "Deep Learning",
        color: "#ec4899",
        children: [
          { id: "ia-2-1", text: "Redes Neuronales Convolucionales (Visión)", color: "#f472b6", children: [] },
          { id: "ia-2-2", text: "Transformers & LLMs (Lenguaje)", color: "#f472b6", children: [] },
        ],
      },
      {
        id: "ia-3",
        text: "Aplicaciones",
        color: "#059669",
        children: [
          { id: "ia-3-1", text: "Tuddy (Tutor interactivo)", color: "#10b981", children: [] },
          { id: "ia-3-2", text: "Diagnóstico médico & Robótica", color: "#10b981", children: [] },
        ],
      },
    ],
  },
};

export const MindMapGenerator: React.FC = () => {
  const [rootNode, setRootNode] = useState<MindNode>(PRESET_MAPS.fotosintesis);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("root-1");
  const [newNodeText, setNewNodeText] = useState("");
  const [copied, setCopied] = useState(false);

  // Helper to add child node recursively
  const addChildNode = (node: MindNode, targetId: string, text: string): MindNode => {
    if (node.id === targetId) {
      const childColor = node.color;
      return {
        ...node,
        children: [
          ...node.children,
          {
            id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            text,
            color: childColor,
            children: [],
          },
        ],
      };
    }
    return {
      ...node,
      children: node.children.map((child) => addChildNode(child, targetId, text)),
    };
  };

  // Helper to delete node recursively
  const deleteNode = (node: MindNode, targetId: string): MindNode | null => {
    if (node.id === targetId) return null;
    return {
      ...node,
      children: node.children
        .map((child) => deleteNode(child, targetId))
        .filter(Boolean) as MindNode[],
    };
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeText.trim()) return;
    setRootNode((prev) => addChildNode(prev, selectedNodeId, newNodeText.trim()));
    setNewNodeText("");
  };

  const handleDeleteNode = (id: string) => {
    if (id === rootNode.id) {
      alert("No puedes eliminar el nodo raíz central.");
      return;
    }
    const updated = deleteNode(rootNode, id);
    if (updated) setRootNode(updated);
  };

  const handleCopyOutline = () => {
    const buildOutline = (n: MindNode, depth = 0): string => {
      const indent = "  ".repeat(depth);
      const line = `${indent}- ${n.text}\n`;
      return line + n.children.map((c) => buildOutline(c, depth + 1)).join("");
    };
    navigator.clipboard.writeText(buildOutline(rootNode));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
            <Network className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              Generador de Mapas Mentales & Conceptuales
              <span className="text-[10px] bg-teal-500/30 text-teal-300 px-2 py-0.5 rounded-full font-semibold border border-teal-400/20">
                Visual
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Estructura ideas jerárquicamente, ramifica conceptos clave y repasa visualmente para tus exámenes.
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRootNode(PRESET_MAPS.fotosintesis)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            🌱 Fotosíntesis
          </button>
          <button
            onClick={() => setRootNode(PRESET_MAPS.ia)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            🤖 Inteligencia Artificial
          </button>
          <button
            onClick={handleCopyOutline}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "¡Copiado!" : "Copiar Esquema"}</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Node Addition Form */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-700 font-semibold flex items-center gap-2">
            <span>Nodo seleccionado para ramificar:</span>
            <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 font-bold border border-teal-200">
              {rootNode.id === selectedNodeId ? rootNode.text : "Rama seleccionada"}
            </span>
          </div>

          <form onSubmit={handleAddChild} className="flex gap-2 flex-1 max-w-md">
            <input
              type="text"
              placeholder="Nueva idea o sub-concepto..."
              value={newNodeText}
              onChange={(e) => setNewNodeText(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir Rama
            </button>
          </form>
        </div>

        {/* Tree Render Canvas / Visual Map */}
        <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 min-h-[380px] overflow-x-auto">
          <div className="flex items-center justify-start min-w-[700px] py-6">
            {/* Root Node */}
            <div className="flex items-center">
              <div
                onClick={() => setSelectedNodeId(rootNode.id)}
                className={`px-5 py-3 rounded-2xl font-black text-sm text-white shadow-lg cursor-pointer transition-all border-2 ${
                  selectedNodeId === rootNode.id
                    ? "ring-4 ring-white/50 scale-105"
                    : "hover:scale-102"
                }`}
                style={{ backgroundColor: rootNode.color, borderColor: "#ffffff" }}
              >
                {rootNode.text}
              </div>

              {/* Connecting line to primary branches */}
              {rootNode.children.length > 0 && (
                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-slate-600" />
                  <div className="flex flex-col space-y-6 border-l-2 border-slate-600 pl-4 py-2">
                    {rootNode.children.map((branch) => (
                      <div key={branch.id} className="flex items-center space-x-3">
                        <div
                          onClick={() => setSelectedNodeId(branch.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition-all border ${
                            selectedNodeId === branch.id
                              ? "ring-2 ring-white scale-105"
                              : "hover:scale-102"
                          }`}
                          style={{ backgroundColor: branch.color, borderColor: "rgba(255,255,255,0.3)" }}
                        >
                          <div className="flex items-center gap-2">
                            <span>{branch.text}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNode(branch.id);
                              }}
                              className="text-white/70 hover:text-rose-200 text-xs cursor-pointer ml-1"
                              title="Eliminar rama"
                            >
                              ×
                            </button>
                          </div>
                        </div>

                        {/* Sub children */}
                        {branch.children.length > 0 && (
                          <div className="flex items-center">
                            <div className="w-6 h-0.5 bg-slate-700" />
                            <div className="flex flex-col space-y-2 border-l border-slate-700 pl-3 py-1">
                              {branch.children.map((leaf) => (
                                <div
                                  key={leaf.id}
                                  onClick={() => setSelectedNodeId(leaf.id)}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-200 bg-slate-800/90 border border-slate-700 hover:border-teal-400 cursor-pointer flex items-center gap-2"
                                >
                                  <span>{leaf.text}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNode(leaf.id);
                                    }}
                                    className="text-slate-400 hover:text-rose-400 cursor-pointer"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
