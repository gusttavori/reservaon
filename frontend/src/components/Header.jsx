import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoImg from '../assets/reservaon.png'; // Certifique-se que o caminho está certo
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="header">
      <div className="container header-content">
        {/* LOGO AGORA É IMAGEM */}
        <Link to="/" className="logo-link">
          <img src={logoImg} alt="ReservaON" className="header-logo" />
        </Link>

        <nav className="nav-desktop">
          <ul className="nav-links">
            <li><a href="#funcionalidades" className="nav-link">Funcionalidades</a></li>
            <li><Link to="/plans" className="nav-link">Planos</Link></li>
            <li><Link to="/empresas" className="nav-link">Empresas</Link></li>
          </ul>
          
          <div className="auth-buttons">
            <Link to="/login" className="btn-login">Entrar</Link>
          </div>
        </nav>

        <button className="mobile-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <a href="#funcionalidades" onClick={toggleMenu} className="nav-link">Funcionalidades</a>
        <Link to="/plans" onClick={toggleMenu} className="nav-link">Planos</Link>
        <Link to="/empresas" onClick={toggleMenu} className="nav-link">Empresas</Link>
        <hr style={{border: '0', borderTop: '1px solid var(--color-gray-200)'}}/>
        <Link to="/login" onClick={toggleMenu} className="nav-link">Entrar</Link>
      </div>
    </header>
  );
};

export default Header;