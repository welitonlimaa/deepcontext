import { useRef, useState, useCallback } from "react";
import { useJobProcessor } from "../hooks/useJobProcessor";
import { motion, AnimatePresence } from "framer-motion";

const MAX_SIZE_MB = 20;
const MAX_PAGES = 150;

export default function Hero() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const { start, reset, status, progress, downloadUrl, loading } = useJobProcessor();

  const getErrorMessage = (err) => {
    const detail = err?.response?.data?.detail;

    if (err?.response?.status === 429) {
      return "Você atingiu o limite diário. Tente novamente amanhã.";
    }

    if (detail?.includes("Limite de requisições")) {
      return "Você atingiu o limite diário. Tente novamente amanhã.";
    }

    if (detail) return detail;

    return "Erro ao processar a requisição. Tente novamente.";
  };

  // -------- PDF VALIDATION (RESTORED) --------
  let pdfjsInstance = null;

  const getPdfJs = async () => {
    if (!pdfjsInstance) {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf");

      pdfjs.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

      pdfjsInstance = pdfjs;
    }

    return pdfjsInstance;
  };

  const validateFile = async (file) => {
    if (file.type !== "application/pdf") {
      throw new Error("O arquivo deve ser um PDF.");
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      throw new Error("O arquivo deve ter no máximo 20MB.");
    }

    const pdfjs = await getPdfJs();
    const buffer = await file.arrayBuffer();

    const doc = await pdfjs.getDocument({ data: buffer }).promise;

    if (doc.numPages > MAX_PAGES) {
      throw new Error("O PDF deve ter no máximo 150 páginas.");
    }
  };

  // -------- FILE HANDLING --------
  const onSelectFile = useCallback(async (f) => {
    try {
      setError("");
      setIsValidating(true);
      await validateFile(f);
      setFile(f);
    } catch (e) {
      setFile(null);
      setError(e.message);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const handleInput = (e) => {
    const f = e.target.files?.[0];
    if (f) onSelectFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onSelectFile(f);
  };

  const handleGenerate = async () => {
    if (!file) return;

    setError("");

    try {
      await start(file);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center">
        {/* HEADER */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white font-bold text-4xl md:text-5xl mb-4"
        >
          Menos tokens,
          <br /> mais contexto
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 mb-10"
        >
          Otimize PDFs para LLMs com um pipeline inteligente.
        </motion.p>

        {/* DROPZONE */}
        <motion.div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border p-8 transition backdrop-blur-xl
            ${dragActive ? "border-white bg-white/10" : "border-white/10 bg-white/5"}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleInput}
          />

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-gray-400"
              >
                <p className="text-lg font-medium text-white">
                  Arraste seu PDF ou clique
                </p>
                <p className="text-sm">até 20MB • máx 150 páginas</p>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between text-left"
              >
                <div>
                  <p className="text-white text-sm font-medium truncate max-w-[180px]">
                    {file.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setError("");
                    reset();
                  }}
                  className="text-red-500 text-base hover:underline hover:text-lg transition"
                >
                  Remover
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* VALIDATING */}
        {isValidating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-gray-400 text-sm"
          >
            Validando PDF...
          </motion.div>
        )}

        {/* ERROR */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-red-400 text-sm text-left"
          >
            {error}
          </motion.div>
        )}

        {/* ACTION */}
        {!status && (
          <motion.button
            onClick={handleGenerate}
            disabled={!file || loading || isValidating}
            whileTap={{ scale: 0.98 }}
            className="mt-6 w-full md:w-2/5 bg-emerald-500 border-2 border-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-emerald-600 hover:border-emerald-500 hover:text-lg transition"
          >
            {isValidating
              ? "Validando..."
              : loading
              ? "Processando..."
              : "Gerar"}
          </motion.button>
        )}

        {/* PROGRESS */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <p className="text-white/80 text-sm">{status}</p>
              <div className="w-full bg-white/10 h-3 rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="bg-white h-3"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-white/80 mt-1">
                {progress.toFixed(1)}%
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DOWNLOAD */}
        {downloadUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 underline hover:text-lg hover:text-white transition"
            >
              Baixar resultado
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
