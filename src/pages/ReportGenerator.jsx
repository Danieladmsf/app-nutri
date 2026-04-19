import React, { useState } from 'react';
import { Camera, RefreshCcw, Download, Sparkles, ChevronLeft, Layout, Share2, Tag, Trash2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const ReportGenerator = () => {
  const { categories: INSPECTION_CATEGORIES, profile } = useAppContext();
  const [client, setClient] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedShortcuts, setSelectedShortcuts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);

  const toggleShortcut = (item) => {
    if (selectedShortcuts.find(s => s.id === item.id)) {
      setSelectedShortcuts(selectedShortcuts.filter(s => s.id !== item.id));
    } else {
      setSelectedShortcuts([...selectedShortcuts, item]);
    }
  };

  const handleGenerate = () => {
    if (!notes && selectedShortcuts.length === 0) return;
    setIsGenerating(true);
    
    // Simulate IA processing based on shortcuts and notes
    setTimeout(() => {
      setReport({
        title: "RELATÓRIO DE CONFORMIDADE #042",
        date: "18 ABRIL 2026",
        auditor: profile.name || 'Auditor não identificado',
        crm: profile.crm || '—',
        diagnosis: `Identificadas ${selectedShortcuts.length} não conformidades críticas durante a auditoria operacional.`,
        recommendations: [
          ...selectedShortcuts.map(s => s.text),
          "Realizar treinamento de reciclagem com a equipe operante.",
          "Agendar re-inspeção em 7 dias."
        ],
        tips: notes || "A manutenção dos padrões higiênico-sanitários é vital para a segurança alimentar."
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="reveal-staggered" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      
      {/* Header Toolbar */}
      <header style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-dim)', paddingBottom: '1rem' }}>
        <div className="flex-toolbar" style={{ gap: '1rem', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
             Laudos
          </h1>
          {/* Pode ser adicionado status globals do laudo aqui */}
        </div>
      </header>

      {/* SaaS Editor Toolbar */}
      <div className="flex-toolbar" style={{ marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '1rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="full-width-mobile">
           <button className="btn desktop-only" style={{ padding: '0.4rem' }}><ChevronLeft size={16}/></button>
           <h2 style={{ fontSize: '0.9rem', fontWeight: 700 }}>AUDITORIA INDUSTRIAL</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }} className="full-width-mobile">
           <button className="btn desktop-only"><Share2 size={16} /> Compartilhar</button>
           <button className="btn btn-primary full-width-mobile" onClick={handleGenerate} disabled={isGenerating}>
             {isGenerating ? <RefreshCcw size={14} className="spin" /> : <Sparkles size={14} />}
             GERAR LAUDO
           </button>
        </div>
      </div>

      <div className="grid-editorial" style={{ flex: 1 }}>
        
        {/* Editor Side */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div>
              <label className="stat-label" style={{ marginBottom: '0.75rem', display: 'block' }}>ESTABELECIMENTO / CLIENTE</label>
              <select 
                value={client} 
                onChange={(e) => setClient(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-minimal)', background: 'var(--bg-deep)', outline: 'none', fontSize: '0.8rem' }}
              >
                <option value="">Selecione a unidade...</option>
                <option value="1">Cozinha Industrial Sul</option>
                <option value="2">Supermercado Matriz</option>
              </select>
           </div>

           {/* Inspection Shortcuts */}
           <div>
              <label className="stat-label" style={{ marginBottom: '1rem', display: 'block' }}>ATALHOS DE INSPEÇÃO (O QUE FOI ENCONTRADO?)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {INSPECTION_CATEGORIES.map(cat => (
                  <div key={cat.id}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>{cat.label}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {cat.items.map(item => {
                        const isSelected = selectedShortcuts.find(s => s.id === item.id);
                        return (
                          <button 
                            key={item.id}
                            onClick={() => toggleShortcut(item)}
                            style={{ 
                              padding: '0.5rem 0.8rem', 
                              fontSize: '0.75rem', 
                              borderRadius: '4px',
                              border: '1px solid',
                              borderColor: isSelected ? 'var(--primary)' : 'var(--border-dim)',
                              background: isSelected ? 'rgba(27, 61, 47, 0.1)' : 'var(--bg-deep)',
                              color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
              <label className="stat-label" style={{ marginBottom: '0.75rem', display: 'block' }}>OBSERVAÇÕES ADICIONAIS (I.A. EXPANDIRÁ)</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Problema específico no compressor da câmara 2..."
                style={{ 
                  flex: 1, minHeight: '150px', width: '100%', padding: '1.2rem', 
                  border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-minimal)', 
                  background: 'var(--bg-deep)', outline: 'none', fontSize: '0.85rem',
                  resize: 'none', lineHeight: '1.6'
                }}
              />
           </div>

           <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" style={{ flex: 1 }}><Camera size={16}/> Tirar Foto</button>
              {selectedShortcuts.length > 0 && (
                <button className="btn" onClick={() => setSelectedShortcuts([])}><Trash2 size={16} /> Limpar</button>
              )}
           </div>
        </section>

        {/* Preview Side */}
        <section className="card" style={{ background: report ? 'var(--bg-surface)' : 'var(--bg-deep)', position: 'relative', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {report ? (
            <div className="reveal-staggered">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                 <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>AUD</div>
                    <div>
                       <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{report.title}</h3>
                       <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>GERADO EM {report.date}</div>
                       <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, marginTop: '0.2rem' }}>
                         {report.auditor} • {report.crm}
                       </div>
                    </div>
                 </div>
                 <button className="btn" style={{ padding: '0.4rem' }}><Download size={16}/></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                   <h4 style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>SUMÁRIO DA INSPEÇÃO</h4>
                   <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)', borderLeft: '3px solid var(--primary)', paddingLeft: '1.2rem' }}>{report.diagnosis}</p>
                </div>

                <div>
                   <h4 style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '1rem' }}>ITENS DE AUDITORIA IDENTIFICADOS</h4>
                   <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {report.recommendations.map((rec, i) => (
                        <div key={i} style={{ padding: '0.75rem', background: 'var(--bg-deep)', border: '1px solid var(--border-dim)', fontSize: '0.8rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                           <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }}></div>
                           <span style={{ lineHeight: '1.4' }}>{rec}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="card" style={{ background: 'rgba(181, 141, 103, 0.05)', border: '1px dashed var(--secondary)', padding: '1rem' }}>
                   <h4 style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.5rem' }}>NOTAS DO CONSULTOR</h4>
                   <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--secondary)', lineHeight: '1.5' }}>{report.tips}</p>
                </div>
              </div>

              <div style={{ marginTop: '3rem', padding: '1rem 0', borderTop: '1px solid var(--border-dim)' }}>
                 <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>ENVIAR LAUDO</button>
              </div>
            </div>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.3, padding: '3rem' }}>
               <Layout size={48} style={{ marginBottom: '1.5rem', display: 'inline-block' }} />
               <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>PREVISUALIZAÇÃO DO LAUDO</div>
               <div style={{ fontSize: '0.7rem' }}>Use os atalhos ou notas para gerar</div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReportGenerator;
