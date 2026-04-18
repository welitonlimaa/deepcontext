const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-6">
      <span className="text-gray-300 text-2xl font-black uppercase select-none">
        DeepContext
      </span>
      <div className="flex items-center gap-6">
        <a
          href="#"
          className="text-gray-300 text-base font-medium hover:opacity-70 transition-opacity"
        >
          Contact
        </a>
        <a
          href="#"
          className="text-gray-300 text-base font-medium hover:opacity-70 transition-opacity"
        >
          Download
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
