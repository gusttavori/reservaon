import { useState, useEffect } from 'react';
import api from '../services/api'; // Importando a API correta
import { Save, Upload, User, MapPin, Phone, Globe, Clock } from 'lucide-react';
import './SettingsManager.css';

const SettingsManager = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    address: '',
    whatsapp: '',
    openingTime: '09:00',
    closingTime: '18:00',
    logoUrl: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/api/company/me');
      setFormData({
        companyName: data.name || '',
        description: data.description || '',
        address: data.address || '',
        whatsapp: data.whatsapp || '',
        openingTime: data.openingTime || '09:00',
        closingTime: data.closingTime || '18:00',
        logoUrl: data.logoUrl || ''
      });
      if (data.logoUrl) setPreview(data.logoUrl);
    } catch (error) {
      console.error("Erro ao carregar configurações", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload da Logo (se houver nova)
      let currentLogoUrl = formData.logoUrl;

      if (logoFile) {
        const uploadData = new FormData();
        uploadData.append('file', logoFile);
        
        const uploadRes = await api.post('/api/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        currentLogoUrl = uploadRes.data.url;
      }

      // 2. Salvar dados da empresa
      const payload = {
        name: formData.companyName,
        description: formData.description,
        address: formData.address,
        whatsapp: formData.whatsapp,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        logoUrl: currentLogoUrl
      };

      const res = await api.put('/api/company/me', payload);
      
      // Atualiza o user no localStorage para refletir o novo nome/logo
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        user.company = res.data.name;
        user.logoUrl = res.data.logoUrl;
        localStorage.setItem('user', JSON.stringify(user));
      }

      alert("Configurações salvas com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar alterações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h3 className="section-subtitle">Configurações do Estabelecimento</h3>
      <form onSubmit={handleSave} className="settings-form">
        
        {/* LOGO UPLOAD */}
        <div className="logo-upload-section">
          <div className="logo-preview">
            {preview ? <img src={preview} alt="Logo" /> : <User size={40} color="#cbd5e1"/>}
          </div>
          <div className="upload-controls">
            <label className="btn-upload">
              <Upload size={18} /> Alterar Logo
              <input type="file" onChange={handleFileChange} accept="image/*" hidden />
            </label>
            <p className="upload-hint">Recomendado: 500x500px (JPG, PNG)</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label><User size={16}/> Nome do Negócio</label>
            <input 
              type="text" required 
              value={formData.companyName} 
              onChange={e => setFormData({...formData, companyName: e.target.value})}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label><Phone size={16}/> WhatsApp (com DDD)</label>
            <input 
              type="text" placeholder="(00) 00000-0000"
              value={formData.whatsapp} 
              onChange={e => setFormData({...formData, whatsapp: e.target.value})}
              className="input-field"
            />
          </div>

          <div className="form-group span-2">
            <label><MapPin size={16}/> Endereço Completo</label>
            <input 
              type="text" placeholder="Rua, Número, Bairro, Cidade..."
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="input-field"
            />
          </div>

          <div className="form-group span-2">
            <label><Globe size={16}/> Descrição Curta (Bio)</label>
            <textarea 
              rows="3" placeholder="Fale um pouco sobre seu negócio..."
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label><Clock size={16}/> Abertura</label>
            <input 
              type="time" required
              value={formData.openingTime} 
              onChange={e => setFormData({...formData, openingTime: e.target.value})}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label><Clock size={16}/> Fechamento</label>
            <input 
              type="time" required
              value={formData.closingTime} 
              onChange={e => setFormData({...formData, closingTime: e.target.value})}
              className="input-field"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? 'Salvando...' : <><Save size={18}/> Salvar Alterações</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManager;