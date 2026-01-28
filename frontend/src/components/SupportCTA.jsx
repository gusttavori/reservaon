// src/components/SupportCTA.jsx
import { MessageCircleQuestion } from 'lucide-react';
import './SupportCTA.css';

const SupportCTA = () => {
  return (
    <section className="support-section">
      <div className="container support-content">
        <h2 className="support-title">Ainda tem dúvidas?</h2>
        <p className="support-text">
          A nossa equipe de especialistas está pronta para ajudar a configurar o seu negócio.
        </p>
        
        <a 
          href="https://wa.me/5577988838862" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-whatsapp"
        >
          <MessageCircleQuestion size={24} />
          Falar com Consultor
        </a>
      </div>
    </section>
  );
};

export default SupportCTA;