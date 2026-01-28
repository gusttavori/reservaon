import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Save, Phone, Calendar, MapPin, FileText, Image, Upload, Trash2 } from 'lucide-react';
import './SettingsManager.css';

const SettingsManager = () => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const defaultSchedule = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    active: i > 0 && i < 6,
    start: '09:00',
    end: '18:00'
  }));

  const [settings, setSettings] = useState({
    whatsapp: '',
    address: '',
    description: '',
    logoUrl: '',
    workSchedule: defaultSchedule
  });

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/company/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSettings({
        whatsapp: res.data.whatsapp || '',
        address: res.data.address || '',
        description: res.data.description || '',
        logoUrl: res.data.logoUrl || '',
        workSchedule: res.data.workSchedule || defaultSchedule
      });
    } catch (error) {
      console.error("Erro ao carregar configs", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:3000/api/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSettings({ ...settings, logoUrl: res.data.url });
    } catch (error) {
      alert("Erro ao fazer upload da imagem.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:3000/api/company/settings', {
        ...settings,
        openingTime: settings.workSchedule[1].start,
        closingTime: settings.workSchedule[1].end,
        workDays: settings.workSchedule.filter(d => d.active).map(d => d.day).join(',')
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Configurações salvas com sucesso! ✅");
    } catch (error) {
      alert("Erro ao salvar.");
    }
  };

  const updateDay = (index, field, value) => {
    const newSchedule = [...settings.workSchedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSettings({ ...settings, workSchedule: newSchedule });
  };

  return (
    <div className="settings-container">
      <form onSubmit={handleSave}>
        
        <div className="settings-group">
          <label className="label-bold">Identidade do Negócio</label>
          
          <div className="logo-upload-section" style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '20px'}}>
            <div 
              className="logo-preview" 
              style={{
                width: '100px', height: '100px', borderRadius: '50%', 
                background: settings.logoUrl ? `url(${settings.logoUrl}) center/cover` : '#f1f5f9',
                border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {!settings.logoUrl && <Image size={30} color="#94a3b8"/>}
            </div>
            
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155'}}>Logotipo da Empresa</label>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                style={{display: 'none'}} 
                accept="image/*"
              />
              
              <div style={{display: 'flex', gap: '10px'}}>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                  className="btn-upload"
                  style={{
                    background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', 
                    borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    color: '#1e293b', fontWeight: '600'
                  }}
                >
                  <Upload size={16}/> {uploading ? 'Enviando...' : 'Carregar Imagem'}
                </button>

                {settings.logoUrl && (
                  <button 
                    type="button"
                    onClick={() => setSettings({...settings, logoUrl: ''})}
                    style={{
                      background: '#fee2e2', border: 'none', padding: '8px', 
                      borderRadius: '8px', cursor: 'pointer', color: '#ef4444'
                    }}
                    title="Remover Logo"
                  >
                    <Trash2 size={18}/>
                  </button>
                )}
              </div>
              <p className="help-text">Recomendado: JPG ou PNG quadrado (500x500px).</p>
            </div>
          </div>

          <div className="input-wrapper" style={{marginBottom: '1rem'}}>
            <MapPin size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="Endereço Completo (Rua, Número, Bairro)"
              value={settings.address}
              onChange={e => setSettings({...settings, address: e.target.value})}
              className="input-with-icon"
            />
          </div>

          <div className="input-wrapper">
            <FileText size={18} className="input-icon" style={{top: '20px'}} />
            <textarea 
              placeholder="Descrição curta (Ex: Especialistas em cortes clássicos e barba terapia...)"
              value={settings.description}
              onChange={e => setSettings({...settings, description: e.target.value})}
              className="input-with-icon"
              style={{height: '80px', paddingLeft: '40px', paddingTop: '10px', resize: 'vertical'}}
            />
          </div>
        </div>

        <hr className="divider" />

        <div className="settings-group">
          <label className="label-bold">Contato</label>
          <div className="input-wrapper">
            <Phone size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="WhatsApp (DDD + Número)"
              value={settings.whatsapp}
              onChange={e => setSettings({...settings, whatsapp: e.target.value})}
              className="input-with-icon"
            />
          </div>
        </div>

        <hr className="divider" />

        <div className="settings-group">
          <label className="label-bold" style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem'}}>
            <Calendar size={20} /> Horários de Atendimento
          </label>
          
          <div className="schedule-grid">
            {settings.workSchedule.map((day, index) => (
              <div key={day.day} className={`day-row ${day.active ? 'active' : 'inactive'}`}>
                <div className="day-check">
                  <input 
                    type="checkbox" 
                    id={`day-${index}`}
                    checked={day.active}
                    onChange={e => updateDay(index, 'active', e.target.checked)}
                  />
                  <label htmlFor={`day-${index}`}>{dayNames[day.day]}</label>
                </div>
                {day.active ? (
                  <div className="time-inputs">
                    <div className="time-field">
                      <span>Das</span>
                      <input type="time" value={day.start} onChange={e => updateDay(index, 'start', e.target.value)} />
                    </div>
                    <div className="time-field">
                      <span>Até</span>
                      <input type="time" value={day.end} onChange={e => updateDay(index, 'end', e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <span className="closed-badge">Fechado</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-save-settings">
          <Save size={18} /> Salvar Alterações
        </button>
      </form>
    </div>
  );
};

export default SettingsManager;