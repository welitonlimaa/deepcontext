import InIcon from "../assets/in.svg";
import GithubIcon from "../assets/github.svg";

const footerLinks = {
  "Learn more": ["Blog", "Case studies", "Customer stories", "Best practices"],
  "Support": ["Contact", "Support", "Legal"],
};

const Footer = () => {
  return (
    <footer className="h-full px-6 md:px-10 py-12 md:py-16 bg-black/30">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-white font-black text-lg tracking-tight">DeepContext</p>
            <p className="text-white/50 text-sm mt-1 max-w-xs leading-relaxed">
              Iniciativa pessoal de apoio na construção de prompts eficientes para LLMs, focado em otimizar o contexto extraído de PDFs grandes.
            </p>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <a href="#" className="w-8 fill-white hover:fill-white/50 transition" aria-label="Instagram">
              <img 
                src={InIcon} 
                alt="LinkedIn" 
                className="w-8 fill-white hover:fill-white/50 transition"
              />
            </a>
            <a href="#" aria-label="GitHub">
              <img 
                src={GithubIcon} 
                alt="GitHub"
                className="w-8 fill-white hover:fill-white/50 transition"
              />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-16 md:gap-24">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="text-white font-bold text-sm mb-4">{section}</p>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/50 text-sm hover:text-white/80 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
