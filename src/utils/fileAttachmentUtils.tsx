import React from "react";
import { 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Image as ImageIcon, 
  Music, 
  Film, 
  Archive, 
  File, 
  Download, 
  ExternalLink, 
  X,
  Eye
} from "lucide-react";
import { AttachedFile } from "../types";

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileCategory(mimeType: string, filename: string): 
  "image" | "pdf" | "word" | "excel" | "powerpoint" | "code" | "archive" | "audio" | "video" | "text" | "generic" {
  const lowerName = filename.toLowerCase();
  const lowerMime = (mimeType || "").toLowerCase();

  if (lowerMime.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(lowerName)) {
    return "image";
  }
  if (lowerMime.includes("pdf") || lowerName.endsWith(".pdf")) {
    return "pdf";
  }
  if (lowerMime.includes("word") || lowerMime.includes("officedocument.wordprocessingml") || /\.(doc|docx|odt|rtf)$/i.test(lowerName)) {
    return "word";
  }
  if (lowerMime.includes("sheet") || lowerMime.includes("excel") || lowerMime.includes("csv") || /\.(xls|xlsx|csv|ods)$/i.test(lowerName)) {
    return "excel";
  }
  if (lowerMime.includes("presentation") || lowerMime.includes("powerpoint") || /\.(ppt|pptx|odp)$/i.test(lowerName)) {
    return "powerpoint";
  }
  if (lowerMime.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(lowerName)) {
    return "audio";
  }
  if (lowerMime.startsWith("video/") || /\.(mp4|webm|mov|avi|mkv)$/i.test(lowerName)) {
    return "video";
  }
  if (lowerMime.includes("zip") || lowerMime.includes("compressed") || lowerMime.includes("tar") || /\.(zip|rar|7z|tar|gz)$/i.test(lowerName)) {
    return "archive";
  }
  if (/\.(js|jsx|ts|tsx|py|html|css|json|java|c|cpp|cs|php|rb|go|rs|sql|sh)$/i.test(lowerName)) {
    return "code";
  }
  if (lowerMime.startsWith("text/") || /\.(txt|md|log|ini|env)$/i.test(lowerName)) {
    return "text";
  }

  return "generic";
}

export function getFileCategoryVisual(category: ReturnType<typeof getFileCategory>) {
  switch (category) {
    case "image":
      return { Icon: ImageIcon, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Imagen" };
    case "pdf":
      return { Icon: FileText, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", label: "PDF" };
    case "word":
      return { Icon: FileText, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "Documento" };
    case "excel":
      return { Icon: FileSpreadsheet, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", label: "Hoja de Cálculo" };
    case "powerpoint":
      return { Icon: FileText, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Presentación" };
    case "code":
      return { Icon: FileCode, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", label: "Código" };
    case "archive":
      return { Icon: Archive, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", label: "Archivo Comprimido" };
    case "audio":
      return { Icon: Music, color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200", label: "Audio" };
    case "video":
      return { Icon: Film, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", label: "Video" };
    case "text":
      return { Icon: FileText, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", label: "Texto" };
    default:
      return { Icon: File, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", label: "Archivo" };
  }
}

export async function readFileAsAttachedFile(file: File): Promise<AttachedFile> {
  const category = getFileCategory(file.type, file.name);
  
  // Read DataURL for binary / preview / download
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  let textContent: string | undefined = undefined;

  // Extract text content for text, markdown, json, csv, code, and small text files (up to 500KB)
  if (category === "text" || category === "code" || file.type.startsWith("text/") || /\.(txt|md|csv|json|py|js|ts|tsx|jsx|html|css|xml|sql)$/i.test(file.name)) {
    try {
      textContent = await new Promise<string>((resolve) => {
        const textReader = new FileReader();
        textReader.onload = () => resolve(String(textReader.result || ""));
        textReader.onerror = () => resolve("");
        textReader.readAsText(file);
      });
      // Cap textContent if too large
      if (textContent && textContent.length > 50000) {
        textContent = textContent.slice(0, 50000) + "\n\n...[Contenido truncado por longitud]";
      }
    } catch {
      // ignore
    }
  }

  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    dataUrl,
    textContent,
  };
}

export function downloadAttachedFile(file: AttachedFile) {
  if (!file.dataUrl) return;
  const link = document.createElement("a");
  link.href = file.dataUrl;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Visual List of Attached Files (for form input previews with remove button or read-only display)
interface AttachmentPreviewListProps {
  files: AttachedFile[];
  onRemove?: (id: string) => void;
  readOnly?: boolean;
  className?: string;
}

export const AttachmentPreviewList: React.FC<AttachmentPreviewListProps> = ({
  files,
  onRemove,
  readOnly = false,
  className = "",
}) => {
  if (!files || files.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 pt-1 pb-2 ${className}`}>
      {files.map((file) => {
        const category = getFileCategory(file.type, file.name);
        const { Icon, color, bg, border, label } = getFileCategoryVisual(category);
        const isImg = category === "image" && file.dataUrl;

        return (
          <div
            key={file.id}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${bg} ${border} shadow-2xs max-w-xs transition-all`}
          >
            {isImg ? (
              <img
                src={file.dataUrl}
                alt={file.name}
                className="w-7 h-7 object-cover rounded-lg shrink-0 border border-slate-200"
              />
            ) : (
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-white/80 border border-slate-200/60`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-800 truncate" title={file.name}>
                {file.name}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                <span>{label}</span>
                <span>•</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
            </div>

            {!readOnly && onRemove ? (
              <button
                type="button"
                onClick={() => onRemove(file.id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white/60 transition-colors cursor-pointer shrink-0"
                title="Eliminar archivo adjunto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => downloadAttachedFile(file)}
                className="p-1 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-white/60 transition-colors cursor-pointer shrink-0"
                title="Descargar o abrir archivo"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Visual Display of Attached Files inside a message or announcement card
interface AttachmentListDisplayProps {
  files?: AttachedFile[];
  compact?: boolean;
  className?: string;
}

export const AttachmentListDisplay: React.FC<AttachmentListDisplayProps> = ({
  files,
  compact = false,
  className = "",
}) => {
  if (!files || files.length === 0) return null;

  return (
    <div className={`space-y-1.5 mt-2 ${className}`}>
      <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
        <span>📎 Archivos adjuntos ({files.length}):</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {files.map((file) => {
          const category = getFileCategory(file.type, file.name);
          const { Icon, color, bg, border, label } = getFileCategoryVisual(category);
          const isImg = category === "image" && file.dataUrl;

          return (
            <div
              key={file.id}
              className={`flex items-center justify-between gap-2 p-2 rounded-xl border ${bg} ${border} bg-white/90 shadow-2xs hover:shadow-xs transition-shadow`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {isImg ? (
                  <a 
                    href={file.dataUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block shrink-0 cursor-pointer group"
                    title="Ver imagen completa"
                  >
                    <img
                      src={file.dataUrl}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 group-hover:opacity-90"
                    />
                  </a>
                ) : (
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg} border ${border}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                    {file.name}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>{label}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                </div>
              </div>

              {/* Download / Open button */}
              {file.dataUrl && (
                <button
                  type="button"
                  onClick={() => downloadAttachedFile(file)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 text-xs font-bold flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer transition-colors"
                  title={`Descargar ${file.name}`}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden xs:inline">Bajar</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
