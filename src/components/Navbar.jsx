const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-6">
      <span className="text-gray-300 text-2xl font-black uppercase select-none">
        DeepContext
      </span>
      <div className="flex items-center gap-6">
        <a
          href="https://github.com/welitonlimaa/deepcontext-ocr-pipeline/blob/main/TUTORIALS.md"
          className="text-gray-300 text-base font-medium hover:opacity-70 transition-opacity"
          target="_blank"
          rel="noopener noreferrer"
        >
          Docs & Tutorials
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
