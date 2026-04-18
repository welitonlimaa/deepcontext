import { useRef, useState } from "react";
import { useJobProcessor } from "../hooks/useJobProcessor";

const MAX_SIZE_MB = 20;
const MAX_PAGES = 150;

const Hero = () => {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const {
    start,
    status,
    progress,
    downloadUrl,
    loading,
  } = useJobProcessor();

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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError("");

    try {
      setIsValidating(true);
      await validateFile(selected);
      setFile(selected);
    } catch (err) {
      setFile(null);
      setError(err.message);
    } finally {
      setIsValidating(false);
    }
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
    <section className="w-full h-screen justify-center flex">
      <div className="w-2/3 md:mt-40 p-4 mt-12">
        <h1 className="w-full text-gray-300 font-black text-4xl md:text-5xl lg:text-6xl leading-tight mb-2">
          Menos tokens,
          <br />
          mais contexto.
        </h1>

        <p className="text-gray-300 text-base md:text-lg mb-10 max-w-md leading-relaxed">
          Transforme PDFs grandes em inputs eficientes para IA. Extraia, comprima e estruture contexto antes de enviar para o LLM
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />

          <button
            onClick={handleFileClick}
            className="border-2 border-gray text-gray-300 font-semibold text-sm px-8 py-4 rounded-full hover:bg-white/40 hover:text-white transition-colors w-full sm:w-auto disabled:opacity-50"
          >
            {file ? "ARQUIVO SELECIONADO" : "ANEXAR ARQUIVO"}
          </button>

          <button
            onClick={handleGenerate}
            disabled={loading || !file || isValidating}
            className="bg-gray-800/90 border-2 border-gray-800 text-white font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-full hover:bg-gray-300/50 hover:border-3 hover:border-gray-300 transition-colors w-full sm:w-auto"
          >
            {isValidating ? "Validando..." : loading ? "Enviando..." : "Gerar"}
          </button>
        </div>

        {file && (
          <div className="md:w-2/5 w-full mt-4 p-4 rounded-xl border-1 border-gray-200 bg-gray-50/80 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <button
              onClick={() => setFile(null)}
              className="text-red-500 text-sm hover:underline"
            >
              Remover
            </button>
          </div>
        )}

        {/* erro */}
        {error && (
          <div className="md:w-2/5 w-full mt-4 text-red-600 text-sm bg-white/70 p-2 rounded">
            {error}
          </div>
        )}

        {status && (
          <div className="mt-6 text-base text-gray-300/90">
            <p className="mb-1">Status: {status}</p>

            <div className="w-2/5 bg-gray-300/10 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gray-300 h-4 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-1">{progress.toFixed(1)}%</p>
          </div>
        )}

        {downloadUrl && (
          <div className="mt-6">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold underline"
            >
              Baixar resultado
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;