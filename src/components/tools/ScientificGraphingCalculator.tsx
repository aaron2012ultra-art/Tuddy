import React, { useState, useEffect, useRef } from "react";
import { 
  Calculator, 
  TrendingUp, 
  RotateCcw, 
  Delete, 
  ZoomIn, 
  ZoomOut, 
  HelpCircle, 
  Sparkles,
  Maximize2,
  Check,
  ChevronRight
} from "lucide-react";
import { PetCustomization } from "../../types";
import { AnthropomorphicBunny } from "../AnthropomorphicBunny";
import { DEFAULT_PET } from "../../utils/storage";

interface ScientificGraphingCalculatorProps {
  pet?: PetCustomization;
}

export const ScientificGraphingCalculator: React.FC<ScientificGraphingCalculatorProps> = ({
  pet = DEFAULT_PET,
}) => {
  const [activeMode, setActiveMode] = useState<"calc" | "graph">("calc");
  
  // Calculator State
  const [calcInput, setCalcInput] = useState("0");
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [angleUnit, setAngleUnit] = useState<"deg" | "rad">("deg");
  const [lastAnswer, setLastAnswer] = useState<number>(0);

  // Grapher State
  const [graphFunc, setGraphFunc] = useState("sin(x)");
  const [secondaryFunc, setSecondaryFunc] = useState("");
  const [zoomScale, setZoomScale] = useState(30); // pixels per unit
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Tuddy Math Tip
  const [tuddyExplanation, setTuddyExplanation] = useState<string | null>(null);

  const handleButton = (val: string) => {
    if (calcInput === "0" && !["+", "-", "*", "/", "%", "^", "."].includes(val)) {
      setCalcInput(val);
      return;
    }
    setCalcInput((prev) => prev + val);
  };

  const handleClear = () => {
    setCalcInput("0");
    setTuddyExplanation(null);
  };

  const handleBackspace = () => {
    setCalcInput((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  };

  // Safe evaluation parser
  const evaluateExpression = (expr: string): number => {
    // Replace visual symbols
    let sanitized = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, `${Math.PI}`)
      .replace(/\be\b/g, `${Math.E}`)
      .replace(/Ans/g, `${lastAnswer}`);

    // Handle trigonometric functions with deg/rad
    const toRad = angleUnit === "deg" ? (Math.PI / 180) : 1;

    sanitized = sanitized.replace(/sin\(([^)]+)\)/g, (_, inner) => `Math.sin((${inner}) * ${toRad})`);
    sanitized = sanitized.replace(/cos\(([^)]+)\)/g, (_, inner) => `Math.cos((${inner}) * ${toRad})`);
    sanitized = sanitized.replace(/tan\(([^)]+)\)/g, (_, inner) => `Math.tan((${inner}) * ${toRad})`);
    sanitized = sanitized.replace(/sqrt\(([^)]+)\)/g, (_, inner) => `Math.sqrt(${inner})`);
    sanitized = sanitized.replace(/log\(([^)]+)\)/g, (_, inner) => `Math.log10(${inner})`);
    sanitized = sanitized.replace(/ln\(([^)]+)\)/g, (_, inner) => `Math.log(${inner})`);
    sanitized = sanitized.replace(/\^/g, "**");

    // Only allow safe math tokens
    if (!/^[0-9+\-*/().,MathPIE\s*]+$/.test(sanitized)) {
      throw new Error("Expresión no válida");
    }

    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${sanitized});`)();
    if (typeof result !== "number" || isNaN(result) || !isFinite(result)) {
      throw new Error("Resultado indefinido");
    }
    return result;
  };

  const handleCalculate = () => {
    try {
      const result = evaluateExpression(calcInput);
      const formatted = Math.abs(result) < 1e-10 ? 0 : Number(result.toFixed(8));
      setCalcHistory((prev) => [`${calcInput} = ${formatted}`, ...prev.slice(0, 9)]);
      setLastAnswer(formatted);
      setCalcInput(String(formatted));

      // Generate helpful Tuddy tip based on expression
      if (calcInput.includes("sin") || calcInput.includes("cos") || calcInput.includes("tan")) {
        setTuddyExplanation(`💡 Nota de Tuddy: Calculaste una función trigonométrica usando modo ${angleUnit.toUpperCase()}. Recuerda que en un triángulo rectángulo, seno es opuesto/hipotenusa y coseno es adyacente/hipotenusa.`);
      } else if (calcInput.includes("sqrt") || calcInput.includes("^")) {
        setTuddyExplanation(`🐰 ¡Gran cálculo de potencias/raíces! La raíz cuadrada es la operación inversa a elevar al cuadrado (x²).`);
      } else {
        setTuddyExplanation(null);
      }
    } catch {
      setCalcInput("Error");
    }
  };

  // Canvas function plotter
  useEffect(() => {
    if (activeMode !== "graph") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2 + offsetX;
    const centerY = height / 2 + offsetY;

    // Clear canvas
    ctx.fillStyle = "#0f172a"; // Deep slate background
    ctx.fillRect(0, 0, width, height);

    // Draw Grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#1e293b"; // subtle grid
    const step = zoomScale;

    for (let x = centerX % step; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = centerY % step; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Axes
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#475569";
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    for (let x = centerX + step; x < width; x += step * 2) {
      const val = Math.round((x - centerX) / zoomScale);
      ctx.fillText(`${val}`, x - 4, centerY + 14);
    }
    for (let x = centerX - step; x > 0; x -= step * 2) {
      const val = Math.round((x - centerX) / zoomScale);
      ctx.fillText(`${val}`, x - 8, centerY + 14);
    }
    for (let y = centerY - step; y > 0; y -= step * 2) {
      const val = Math.round((centerY - y) / zoomScale);
      ctx.fillText(`${val}`, centerX + 6, y + 4);
    }
    for (let y = centerY + step; y < height; y += step * 2) {
      const val = Math.round((centerY - y) / zoomScale);
      ctx.fillText(`${val}`, centerX + 6, y + 4);
    }

    // Helper to evaluate f(x)
    const compileFunc = (formula: string) => {
      try {
        let prepared = formula
          .replace(/sin/g, "Math.sin")
          .replace(/cos/g, "Math.cos")
          .replace(/tan/g, "Math.tan")
          .replace(/sqrt/g, "Math.sqrt")
          .replace(/abs/g, "Math.abs")
          .replace(/log/g, "Math.log10")
          .replace(/ln/g, "Math.log")
          .replace(/pi/g, "Math.PI")
          .replace(/\^/g, "**");

        // allow 2x -> 2*x
        prepared = prepared.replace(/([0-9])x/g, "$1*x");

        // eslint-disable-next-line no-new-func
        return new Function("x", `"use strict"; try { return (${prepared}); } catch(e) { return NaN; }`);
      } catch {
        return null;
      }
    };

    const drawCurve = (formula: string, color: string) => {
      const fn = compileFunc(formula);
      if (!fn) return;

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = color;

      let isDrawing = false;
      for (let px = 0; px < width; px += 2) {
        const mathX = (px - centerX) / zoomScale;
        const mathY = fn(mathX);

        if (typeof mathY === "number" && !isNaN(mathY) && isFinite(mathY)) {
          const py = centerY - mathY * zoomScale;
          if (py >= -height && py <= height * 2) {
            if (!isDrawing) {
              ctx.moveTo(px, py);
              isDrawing = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            isDrawing = false;
          }
        } else {
          isDrawing = false;
        }
      }
      ctx.stroke();
    };

    // Draw primary function
    if (graphFunc.trim()) {
      drawCurve(graphFunc, "#10b981"); // Emerald green
    }
    // Draw secondary function
    if (secondaryFunc.trim()) {
      drawCurve(secondaryFunc, "#38bdf8"); // Sky blue
    }
  }, [activeMode, graphFunc, secondaryFunc, zoomScale, offsetX, offsetY]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header with Mode Switch */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              Calculadora Científica & Graficadora Matemática
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-semibold border border-indigo-400/20">
                IA & Visual
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Resuelve operaciones complejas, trigonometría, álgebra y grafica curvas en tiempo real.
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveMode("calc")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === "calc"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Científica
          </button>
          <button
            onClick={() => setActiveMode("graph")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === "graph"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Graficadora 2D
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6">
        {activeMode === "calc" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Display and Keypad */}
            <div className="lg:col-span-2 space-y-4">
              {/* Screen */}
              <div className="bg-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAngleUnit(angleUnit === "deg" ? "rad" : "deg")}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold cursor-pointer text-[10px]"
                    >
                      {angleUnit.toUpperCase()}
                    </button>
                    {lastAnswer !== 0 && <span>Ans = {lastAnswer}</span>}
                  </div>
                  <span className="truncate max-w-[200px]">
                    {calcHistory[0] || "Listo para calcular"}
                  </span>
                </div>
                <div className="text-right text-2xl sm:text-3xl font-mono font-bold text-emerald-400 overflow-x-auto whitespace-nowrap py-1">
                  {calcInput}
                </div>
              </div>

              {/* Tuddy Tip banner if present */}
              {tuddyExplanation && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-900">
                  <div className="w-8 h-8 shrink-0">
                    <AnthropomorphicBunny pet={pet} mood="studying" size="sm" />
                  </div>
                  <p className="leading-relaxed pt-1">{tuddyExplanation}</p>
                </div>
              )}

              {/* Scientific Keypad */}
              <div className="grid grid-cols-5 gap-2 text-xs sm:text-sm font-semibold">
                {/* Row 1: Advanced Functions */}
                <button onClick={() => handleButton("sin(")} className="p-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer text-slate-700">sin</button>
                <button onClick={() => handleButton("cos(")} className="p-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer text-slate-700">cos</button>
                <button onClick={() => handleButton("tan(")} className="p-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer text-slate-700">tan</button>
                <button onClick={() => handleButton("sqrt(")} className="p-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer text-slate-700">√</button>
                <button onClick={() => handleButton("^")} className="p-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer text-slate-700">xʸ</button>

                {/* Row 2: Constants & Parentheses */}
                <button onClick={() => handleButton("log(")} className="p-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer text-slate-700">log</button>
                <button onClick={() => handleButton("ln(")} className="p-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer text-slate-700">ln</button>
                <button onClick={() => handleButton("(")} className="p-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer text-slate-700">(</button>
                <button onClick={() => handleButton(")")} className="p-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer text-slate-700">)</button>
                <button onClick={handleBackspace} className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer flex items-center justify-center"><Delete className="w-4 h-4" /></button>

                {/* Row 3: 7 8 9 ÷ AC */}
                <button onClick={() => handleButton("7")} className="p-3.5 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-xl font-bold cursor-pointer">7</button>
                <button onClick={() => handleButton("8")} className="p-3.5 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-xl font-bold cursor-pointer">8</button>
                <button onClick={() => handleButton("9")} className="p-3.5 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-xl font-bold cursor-pointer">9</button>
                <button onClick={() => handleButton(" / ")} className="p-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-black cursor-pointer">÷</button>
                <button onClick={handleClear} className="p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer">AC</button>

                {/* Row 4: 4 5 6 × π */}
                <button onClick={() => handleButton("4")} className="p-3.5 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-xl font-bold cursor-pointer">4</button>
                <button onClick={() => handleButton("5")} className="p-3.5 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-xl font-bold cursor-pointer">5</button>
                <button onClick={() => handleButton("6")} className="p-3.5 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-xl font-bold cursor-pointer">6</button>
                <button onClick={() => handleButton(" * ")} className="p-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-black cursor-pointer">×</button>
                <button onClick={() => handleButton("π")} className="p-3.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 rounded-xl font-bold cursor-pointer">π</button>

                {/* Row 5: 1 2 3 - e */}
                <button onClick={() => handleButton("1")} className="p-3.5 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-xl font-bold cursor-pointer">1</button>
                <button onClick={() => handleButton("2")} className="p-3.5 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-xl font-bold cursor-pointer">2</button>
                <button onClick={() => handleButton("3")} className="p-3.5 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-xl font-bold cursor-pointer">3</button>
                <button onClick={() => handleButton(" - ")} className="p-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-black cursor-pointer">−</button>
                <button onClick={() => handleButton("e")} className="p-3.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 rounded-xl font-bold cursor-pointer">e</button>

                {/* Row 6: 0 . Ans + = */}
                <button onClick={() => handleButton("0")} className="p-3.5 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-xl font-bold cursor-pointer">0</button>
                <button onClick={() => handleButton(".")} className="p-3.5 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-xl font-bold cursor-pointer">.</button>
                <button onClick={() => handleButton("Ans")} className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer">Ans</button>
                <button onClick={() => handleButton(" + ")} className="p-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-black cursor-pointer">+</button>
                <button onClick={handleCalculate} className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-base shadow-sm transition-all cursor-pointer">=</button>
              </div>
            </div>

            {/* Sidebar: History and Useful Formulas */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Historial Reciente</span>
                  {calcHistory.length > 0 && (
                    <button
                      onClick={() => setCalcHistory([])}
                      className="text-[10px] text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </h3>
                {calcHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Sin cálculos aún</p>
                ) : (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto text-xs font-mono">
                    {calcHistory.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          const val = item.split("=")[1]?.trim();
                          if (val) setCalcInput(val);
                        }}
                        className="p-1.5 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 text-slate-700 cursor-pointer truncate"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Formulas */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Atajos y Fórmulas
                </h3>
                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => setCalcInput("sqrt(3^2 + 4^2)")}
                    className="w-full text-left p-2 bg-white rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">Pitágoras (3, 4)</span>
                    <span className="text-[10px] text-indigo-600 font-mono">√(a²+b²)</span>
                  </button>
                  <button
                    onClick={() => setCalcInput("2 * π * 5")}
                    className="w-full text-left p-2 bg-white rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">Perímetro Círculo (r=5)</span>
                    <span className="text-[10px] text-indigo-600 font-mono">2πr</span>
                  </button>
                  <button
                    onClick={() => setCalcInput("π * 5^2")}
                    className="w-full text-left p-2 bg-white rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">Área Círculo (r=5)</span>
                    <span className="text-[10px] text-indigo-600 font-mono">πr²</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Grapher Mode */
          <div className="space-y-4">
            {/* Function inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-xs font-black text-emerald-700 font-mono">f(x) =</span>
                <input
                  type="text"
                  value={graphFunc}
                  onChange={(e) => setGraphFunc(e.target.value)}
                  placeholder="ej. sin(x), x^2 - 4, 2x + 1"
                  className="flex-1 bg-transparent text-xs font-bold text-slate-800 outline-none font-mono"
                />
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-sky-50 border border-sky-200 rounded-2xl">
                <span className="text-xs font-black text-sky-700 font-mono">g(x) =</span>
                <input
                  type="text"
                  value={secondaryFunc}
                  onChange={(e) => setSecondaryFunc(e.target.value)}
                  placeholder="ej. cos(x), x, abs(x)"
                  className="flex-1 bg-transparent text-xs font-bold text-slate-800 outline-none font-mono"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 font-bold self-center text-[11px]">Ejemplos:</span>
              <button onClick={() => { setGraphFunc("sin(x)"); setSecondaryFunc("cos(x)"); }} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono text-[11px] cursor-pointer">sin / cos</button>
              <button onClick={() => { setGraphFunc("x^2 - 4"); setSecondaryFunc("2*x"); }} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono text-[11px] cursor-pointer">Parábola x²-4</button>
              <button onClick={() => { setGraphFunc("1 / x"); setSecondaryFunc(""); }} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono text-[11px] cursor-pointer">Hipérbola 1/x</button>
              <button onClick={() => { setGraphFunc("sqrt(x)"); setSecondaryFunc("-sqrt(x)"); }} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono text-[11px] cursor-pointer">Raíz √x</button>
            </div>

            {/* Graph Canvas */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-md">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-[360px] block cursor-crosshair"
              />

              {/* Floating Graph Controls */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm p-1.5 rounded-xl border border-slate-700 text-white">
                <button
                  onClick={() => setZoomScale((prev) => Math.min(100, prev + 10))}
                  className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Acercar (Zoom In)"
                >
                  <ZoomIn className="w-4 h-4 text-slate-300" />
                </button>
                <button
                  onClick={() => setZoomScale((prev) => Math.max(10, prev - 10))}
                  className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Alejar (Zoom Out)"
                >
                  <ZoomOut className="w-4 h-4 text-slate-300" />
                </button>
                <button
                  onClick={() => {
                    setZoomScale(30);
                    setOffsetX(0);
                    setOffsetY(0);
                  }}
                  className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Centrar y reajustar ejes"
                >
                  <RotateCcw className="w-4 h-4 text-slate-300" />
                </button>
              </div>

              {/* Legend overlay */}
              <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-white">
                <div className="flex items-center gap-1.5 font-mono">
                  <div className="w-3 h-1 bg-emerald-500 rounded-full" />
                  <span>f(x): {graphFunc || "sin función"}</span>
                </div>
                {secondaryFunc && (
                  <div className="flex items-center gap-1.5 font-mono text-sky-400">
                    <div className="w-3 h-1 bg-sky-400 rounded-full" />
                    <span>g(x): {secondaryFunc}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
