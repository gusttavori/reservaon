import './Footer.css';
import { Link } from 'react-router-dom';
import logoImg from '../assets/reservaon.png'; // Importando a logo

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Coluna 1: Marca */}
          <div className="footer-brand">
            <Link to="/">
              <img src={logoImg} alt="ReservaON" className="footer-logo" />
            </Link>
            <p className="footer-desc">
              Simplificamos a gestão de pequenos e médios negócios com tecnologia e design.
            </p>
          </div>

          {/* Coluna 2: Produto */}
          <div className="footer-col">
            <h4>Produto</h4>
            <ul className="footer-links">
              {/* Ajustei para links internos onde faz sentido */}
              <li><Link to="/" className="footer-link">Funcionalidades</Link></li>
              <li><Link to="/plans" className="footer-link">Preços</Link></li>
              <li><Link to="/empresas" className="footer-link">Catálogo</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Legal */}
          <div className="footer-col">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><span className="footer-link disabled">Termos de Uso</span></li>
              <li><span className="footer-link disabled">Privacidade</span></li>
              <li><span className="footer-link disabled">LGPD</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {currentYear} ReservaON Tecnologia. Todos os direitos reservados.</span>
          <span className="footer-made-with">Direção • Inovação • Precisão</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;