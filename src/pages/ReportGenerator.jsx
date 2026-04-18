import React, { useState } from 'react';
import { Camera, Send, FileCheck, RefreshCcw, Download, Sparkles, ChevronLeft, Layout, Share2, MoreHorizontal } from 'lucide-react';

const ReportGenerator = () => {
  const [client, setClient] = useState('');
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);

  const handleGenerate = () => {
    if (!notes) return;
    setIsGenerating(true);
    setTimeout(() => {
      setReport({
        title: "RELATÓRIO DE EVOLUÇÃO #042",
        date: "18 ABRIL 2026",
        diagnosis: "Disbiose intestinal identificada com baixa absorção de micronutrientes.",
        recommendations: [
          "Protocolo de Reparação Intestinal (5 R's)",
          "Suplementação de L-Glutamina",
          "Dieta baixa em FODMAPS por 15 dias"
        ],
        tips: "Ajustar o ciclo circadiano para melhorar a regeneração tecidual."
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="reveal-staggered" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      
      {/* SaaS Editor Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '1rem 1.5rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <button className="btn" style={{ padding: '0.4rem' }}><ChevronLeft size={16}/></button>
           <h2 style={{ fontSize: '0.9rem', fontWeight: 700 }}>GERADOR DE LAUDOS INTELIGENTE</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
           <button className="btn"><Share2 size={16} /> Compartilhar</button>
           <button className="btn btn-primary" onClick={handleGenerate} disabled={isGenerating}>
             {isGenerating ? <RefreshCcw size={14} className="spin" /> : <Sparkles size={14} />}
             GERAR COM IA
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        
        {/* Editor Side */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
           <div>
              <label className="stat-label" style={{ marginBottom: '0.75rem', display: 'block' }}>PACIENTE</label>
              <select 
                value={client} 
                onChange={(e) => setClient(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-minimal)', background: 'var(--bg-deep)', outline: 'none', fontSize: '0.8rem' }}
              >
                <option value="">Selecione um cliente...</option>
                <option value="1">João Silva</option>
                <option value="2">Maria Oliveira</option>
              </select>
           </div>

           <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="stat-label" style={{ marginBottom: '0.75rem', display: 'block' }}>NOTAS DA VISITA</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Insira as observações coletadas durante a visita para processamento da IA..."
                style={{ 
                  flex: 1, width: '100%', padding: '1.2rem', 
                  border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-minimal)', 
                  background: 'var(--bg-deep)', outline: 'none', fontSize: '0.85rem',
                  resize: 'none', lineHeight: '1.6'
                }}
              />
           </div>

           <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" style={{ flex: 1 }}><Camera size={16}/> Anexar Foto</button>
           </div>
        </section>

        {/* Preview Side */}
        <section className="card" style={{ background: report ? 'var(--bg-surface)' : 'var(--bg-deep)', position: 'relative', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {report ? (
            <div className="reveal-staggered">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                 <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>N</div>
                    <div>
                       <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{report.title}</h3>
                       <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>EMITIDO EM {report.date}</div>
                    </div>
                 </div>
                 <button className="btn" style={{ padding: '0.4rem' }}><Download size={16}/></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '0 1rem' }}>
                <div>
                   <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>SUMÁRIO EXECUTIVO</h4>
                   <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)', borderLeft: '2px solid var(--primary)', paddingLeft: '1.5rem' }}>{report.diagnosis}</p>
                </div>

                <div>
                   <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '1rem' }}>PLANO DE AÇÃO PROPOSTO</h4>
                   <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {report.recommendations.map((rec, i) => (
                        <div key={i} style={{ padding: '0.75rem 1rem', background: 'var(--bg-deep)', border: '1px solid var(--border-dim)', fontSize: '0.8rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                           <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                           {rec}
                        </div>
                      ))}
                   </div>
                </div>

                <div className="card" style={{ background: 'rgba(181, 141, 103, 0.05)', border: '1px dashed var(--secondary)' }}>
                   <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.5rem' }}>NOTA CLÍNICA</h4>
                   <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--secondary)' }}>{report.tips}</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.3 }}>
               <Layout size={48} style={{ marginBottom: '1.5rem' }} />
               <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>PREVISUALIZAÇÃO DO DOCUMENTO</div>
               <div style={{ fontSize: '0.7rem' }}>Preencha os dados à esquerda e clique em Gerar</div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReportGenerator;
