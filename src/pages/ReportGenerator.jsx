import React, { useState, useRef } from 'react';
import { Camera, RefreshCcw, Download, Sparkles, ChevronLeft, ChevronUp, ChevronDown, Trash2, Plus, PenTool, Share2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useAppContext } from '../contexts/AppContext';
import Anthropic from '@anthropic-ai/sdk';

// Configuração do Anthropic SDK (Uso em navegador habilitado explicitamente para esta prova de conceito)
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

const getBase64FromBlobUrl = async (blobUrl) => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      const b64 = base64data.split(',')[1];
      const mime = base64data.substring(base64data.indexOf(':') + 1, base64data.indexOf(';'));
      resolve({ b64, mime });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const OccurrenceBlock = ({ occurrence, index, total, categories, updateOccurrence, removeOccurrence, moveUp, moveDown }) => {
  const fileInputRef = useRef(null);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    updateOccurrence(occurrence.id, { categoryId: catId, itemId: '', text: '' });
  };

  const selectedCategory = categories.find(c => c.id === occurrence.categoryId);
  const selectedItem = selectedCategory?.items.find(i => i.id === occurrence.itemId);

  const handleItemChange = (e) => {
    updateOccurrence(occurrence.id, { itemId: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateOccurrence(occurrence.id, { photoUrl: url, file }); // salvamos o blob tbm
    }
  };

  const callAnthropicAI = async () => {
    if (!selectedCategory || !selectedItem) {
      return alert("Selecione primeiro a Categoria e o Assunto para orientar a Inteligência Artificial.");
    }

    setIsGeneratingIA(true);
    
    try {
      let contentArray = [];
      
      if (occurrence.photoUrl) {
         try {
           const { b64, mime } = await getBase64FromBlobUrl(occurrence.photoUrl);
           contentArray.push({
             type: "image",
             source: {
               type: "base64",
               media_type: mime || "image/jpeg",
               data: b64,
             }
           });
         } catch (e) {
           console.warn("Falha ao converter imagem para base64", e);
         }
      }

      contentArray.push({
        type: "text",
        text: `Atue como um Nutricionista Auditor rigoroso inspecionando uma cozinha industrial. Categoria do problema: ${selectedCategory.label}. Assunto Específico: ${selectedItem.label}. Descrição padrão do problema: ${selectedItem.text}. \n\n${occurrence.photoUrl ? "Analise a imagem anexada sobre este quesito." : ""}\nEscreva de forma técnica, impessoal e direta, APENAS A CONSTATAÇÃO DO FATO E A ORIENTAÇÃO TÉCNICA/AÇÃO CORRETIVA para regularizar a situação. Máximo de 4 linhas. Não use saudações.`
      });

      const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 250,
        temperature: 0.2,
        messages: [
          { role: "user", content: contentArray }
        ]
      });

      const responseText = msg.content[0].text;
      updateOccurrence(occurrence.id, { text: responseText });
    } catch (err) {
      console.error("Erro na API da IA:", err);
      alert("Houve um erro ao se comunicar com a IA. Verifique sua conexão e a chave de API.");
    } finally {
       setIsGeneratingIA(false);
    }
  };

  return (
    <div className="card reveal-staggered" style={{ padding: 0, marginBottom: '1.5rem', border: '1px solid var(--border-dim)', overflow: 'hidden' }}>
      
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-deep)', padding: '0.8rem 1rem', borderBottom: '1px solid var(--border-dim)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
            {index + 1}
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ocorrência</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={moveUp} disabled={index === 0} style={{ background: 'none', border: '1px solid var(--border-dim)', borderRadius: '4px', padding: '0.3rem', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}>
            <ChevronUp size={16} color="var(--text-main)" />
          </button>
          <button onClick={moveDown} disabled={index === total - 1} style={{ background: 'none', border: '1px solid var(--border-dim)', borderRadius: '4px', padding: '0.3rem', cursor: index === total - 1 ? 'not-allowed' : 'pointer', opacity: index === total - 1 ? 0.3 : 1 }}>
            <ChevronDown size={16} color="var(--text-main)" />
          </button>
          <button onClick={removeOccurrence} style={{ background: 'none', border: '1px solid rgba(212, 163, 115, 0.3)', borderRadius: '4px', padding: '0.3rem', cursor: 'pointer', color: 'var(--secondary)', marginLeft: '0.5rem' }}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        
        {/* Context Selectors */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Categoria / Setor</label>
            <select value={occurrence.categoryId || ''} onChange={handleCategoryChange} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-dim)', borderRadius: '4px', background: 'var(--bg-deep)', outline: 'none', fontSize: '0.8rem', color: 'var(--text-main)' }}>
              <option value="">Selecione...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Assunto Específico</label>
            <select value={occurrence.itemId || ''} onChange={handleItemChange} disabled={!occurrence.categoryId} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-dim)', borderRadius: '4px', background: 'var(--bg-deep)', outline: 'none', fontSize: '0.8rem', color: 'var(--text-main)', opacity: !occurrence.categoryId ? 0.5 : 1 }}>
              <option value="">Selecione o detalhe...</option>
              {selectedCategory?.items.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
            </select>
          </div>
        </div>

        {/* Media & Text Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="agenda-hero-layout">
           
           {/* Photo Area */}
           <div style={{ flexShrink: 0, width: '100%' }}>
             <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Evidência (Opcional)</label>
             <div 
               onClick={() => fileInputRef.current?.click()}
               style={{ 
                 height: '180px', 
                 border: '2px dashed var(--border-dim)', 
                 borderRadius: 'var(--radius-md)', 
                 background: occurrence.photoUrl ? `url(${occurrence.photoUrl}) center/cover` : 'var(--bg-deep)',
                 display: 'flex', 
                 flexDirection: 'column',
                 alignItems: 'center', 
                 justifyContent: 'center',
                 cursor: 'pointer',
                 color: 'var(--text-muted)',
                 position: 'relative',
                 overflow: 'hidden'
               }}
             >
               {!occurrence.photoUrl && (
                 <>
                   <Camera size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                   <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Câmera / Galeria</span>
                 </>
               )}
               {occurrence.photoUrl && (
                 <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.6)', padding: '0.5rem', textAlign: 'center', color: '#fff', fontSize: '0.7rem' }}>
                   Trocar Imagem
                 </div>
               )}
               <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: 'none' }} />
             </div>
           </div>

           {/* AI Text Area */}
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
               <label className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                 <Sparkles size={14} color={occurrence.text ? 'var(--primary)' : 'var(--text-muted)'} /> ORIENTAÇÃO TÉCNICA
               </label>
               <button 
                 onClick={callAnthropicAI} 
                 disabled={isGeneratingIA || !occurrence.categoryId || !occurrence.itemId}
                 style={{ 
                   display: 'flex', alignItems: 'center', gap: '0.4rem', 
                   background: 'rgba(0,255,136,0.1)', border: '1px solid var(--primary)', 
                   color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '4px', 
                   fontSize: '0.7rem', fontWeight: 800, cursor: (isGeneratingIA || !occurrence.categoryId || !occurrence.itemId) ? 'not-allowed' : 'pointer',
                   opacity: (isGeneratingIA || !occurrence.categoryId || !occurrence.itemId) ? 0.5 : 1
                 }}
               >
                 {isGeneratingIA ? <RefreshCcw size={12} className="spin" /> : <Sparkles size={12} />}
                 {isGeneratingIA ? 'ANALISANDO...' : 'GERAR TEXTO COM IA'}
               </button>
             </div>
             
             <textarea 
               value={occurrence.text || ''}
               onChange={(e) => updateOccurrence(occurrence.id, { text: e.target.value })}
               placeholder="Clique em 'Gerar Texto com IA' ou digite manualmente a constatação e as correções necessárias..."
               style={{ 
                 width: '100%', 
                 flex: 1,
                 minHeight: '130px',
                 padding: '1rem', 
                 border: '1px solid var(--border-dim)', 
                 borderRadius: '4px', 
                 background: 'var(--bg-surface)', 
                 outline: 'none', 
                 fontSize: '0.85rem', 
                 lineHeight: '1.6',
                 color: 'var(--text-main)',
                 resize: 'vertical',
                 fontFamily: 'inherit'
               }}

             />
           </div>
        </div>

      </div>
    </div>
  );
};

const ReportGenerator = () => {
  const { categories: INSPECTION_CATEGORIES } = useAppContext();
  const [client, setClient] = useState('');
  const [occurrences, setOccurrences] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [signature, setSignature] = useState(null);

  const invalidateSignature = () => {
    if (signature) {
      setSignature(null);
      alert('Atenção: Como você fez uma edição no laudo, a assinatura anterior do cliente foi removida. Será necessária uma nova assinatura.');
    }
  };

  const addOccurrence = () => {
    invalidateSignature();
    const newBlock = { id: Date.now().toString(), categoryId: '', itemId: '', text: '', photoUrl: null };
    setOccurrences([...occurrences, newBlock]);
  };

  const updateOccurrence = (id, data) => {
    invalidateSignature();
    setOccurrences(occurrences.map(o => o.id === id ? { ...o, ...data } : o));
  };

  const removeOccurrence = (id) => {
    invalidateSignature();
    setOccurrences(occurrences.filter(o => o.id !== id));
  };

  const moveUp = (index) => {
    if (index === 0) return;
    invalidateSignature();
    const newArr = [...occurrences];
    const temp = newArr[index - 1];
    newArr[index - 1] = newArr[index];
    newArr[index] = temp;
    setOccurrences(newArr);
  };

  const moveDown = (index) => {
    if (index === occurrences.length - 1) return;
    invalidateSignature();
    const newArr = [...occurrences];
    const temp = newArr[index + 1];
    newArr[index + 1] = newArr[index];
    newArr[index] = temp;
    setOccurrences(newArr);
  };

  const handleGeneratePDF = async () => {
    if (!client) return alert("Selecione o Cliente / Estabelecimento primeiro.");
    if (occurrences.length === 0) return alert("Adicione pelo menos uma ocorrência ao Canvas antes de gerar o PDF.");
    
    setIsGenerating(true);
    try {
      const element = document.getElementById('pdf-report-content');
      const opt = {
        margin:       15,
        filename:     `Laudo_Auditoria_${client.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error('Falha ao gerar o PDF', e);
      alert('Houve uma falha ao renderizar o PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSign = () => {
    if (!client || occurrences.length === 0) return alert("O laudo precisa ser preenchido antes de ser assinado.");
    const signName = prompt("Assinatura do Cliente (Digite o nome para simular assintura digital):");
    if (signName) {
      setSignature(signName);
    }
  };

  return (
    <div className="reveal-staggered" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: '3rem' }}>
      
      {/* Header Toolbar */}
      <header style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-dim)', paddingBottom: '1rem' }}>
        <div className="flex-toolbar" style={{ gap: '1rem', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
             Laudos
          </h1>
        </div>
      </header>

      {/* Editor Main Top-Bar */}
      <div className="flex-toolbar" style={{ marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '1rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }} className="full-width-mobile">
           <select 
             value={client} 
             onChange={(e) => setClient(e.target.value)}
             style={{ width: '100%', maxWidth: '300px', padding: '0.6rem 1rem', border: '1px solid var(--border-dim)', borderRadius: '4px', background: 'var(--bg-deep)', outline: 'none', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}
           >
             <option value="">Selecione o Cliente Auditado...</option>
             <option value="Cozinha Industrial Matriz">Cozinha Industrial Matriz</option>
             <option value="Supermercado Nova Era">Supermercado Nova Era</option>
             <option value="Refeitório São João">Refeitório São João</option>
           </select>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }} className="full-width-mobile">
           <button onClick={handleSign} className="btn" style={{ flex: 1, justifyContent: 'center', border: signature ? '1px solid var(--primary)' : '1px solid var(--border-dim)', color: signature ? 'var(--primary)' : 'var(--text-main)' }}>
             {signature ? <CheckCircle2 size={16} /> : <PenTool size={16} />}
             {signature ? 'ASSINADO' : 'ASSINAR'}
           </button>
           <button onClick={handleGeneratePDF} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={isGenerating}>
             {isGenerating ? <RefreshCcw size={14} className="spin" /> : <Download size={14} />}
             GERAR PDF
           </button>
        </div>
      </div>

      {signature && (
        <div style={{ padding: '0.8rem 1rem', background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)', color: 'var(--primary)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <CheckCircle2 size={16} /> Documento validado e assinado eletronicamente por <strong>{signature}</strong>.
        </div>
      )}

      {/* CANVAS AREA */}
      <div style={{ flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%' }}>
         
         {occurrences.length === 0 ? (
           <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border-dim)', borderRadius: 'var(--radius-md)', marginTop: '2rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '32px', background: 'rgba(27,61,47,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                 <Sparkles size={28} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Canvas em Branco</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', maxWidth: '400px', margin: '0 auto 2rem' }}>
                Comece a construir seu laudo técnico. Adicione a primeira ocorrência, a IA cuidará dos textos normativos.
              </p>
              <button onClick={addOccurrence} className="btn btn-primary" style={{ padding: '0.8rem 2rem', margin: '0 auto' }}>
                <Plus size={18} /> INICIAR AUDITORIA
              </button>
           </div>
         ) : (
           <>
             {/* List of Occurrence Blocks */}
             {occurrences.map((occ, index) => (
               <OccurrenceBlock 
                 key={occ.id} 
                 occurrence={occ} 
                 index={index}
                 total={occurrences.length}
                 categories={INSPECTION_CATEGORIES}
                 updateOccurrence={updateOccurrence}
                 removeOccurrence={() => removeOccurrence(occ.id)}
                 moveUp={() => moveUp(index)}
                 moveDown={() => moveDown(index)}
               />
             ))}

             {/* Add Button at the bottom */}
             <div style={{ padding: '1rem 0', display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
               <button onClick={addOccurrence} className="btn" style={{ padding: '0.8rem 2rem', background: 'var(--bg-deep)', border: '1px dashed var(--border-dim)', width: '100%', maxWidth: '300px', justifyContent: 'center' }}>
                 <Plus size={16} /> Adicionar Nova Ocorrência
               </button>
             </div>
           </>
         )}

      </div>

      {/* HIDDEN PDF TEMPLATE */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
         <div id="pdf-report-content" style={{ width: '800px', backgroundColor: '#fff', padding: '40px', color: '#000', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #ccc', paddingBottom: '20px', marginBottom: '30px' }}>
               <h1 style={{ fontSize: '26px', margin: 0, color: '#1B3D2F', fontWeight: 'bold' }}>LAUDO TÉCNICO DE AUDITORIA</h1>
               <p style={{ fontSize: '18px', color: '#333', marginTop: '15px' }}>Cliente Auditado: <strong>{client}</strong></p>
               <p style={{ fontSize: '16px', color: '#666', marginTop: '5px' }}>Data da Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            {occurrences.map((occ, i) => {
               const cat = INSPECTION_CATEGORIES.find(c => c.id === occ.categoryId);
               const item = cat?.items.find(it => it.id === occ.itemId);
               return (
                 <div key={occ.id} style={{ marginBottom: '40px', borderBottom: '1px solid #eee', paddingBottom: '25px', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '15px', background: '#1B3D2F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{i + 1}</div>
                      <h3 style={{ fontSize: '20px', color: '#1B3D2F', margin: 0 }}>{cat ? cat.label : 'Não classificado'} - {item ? item.label : 'Não especificado'}</h3>
                    </div>
                    
                    {occ.photoUrl && (
                      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <img src={occ.photoUrl} alt="Evidência Fotográfica" style={{ maxWidth: '400px', maxHeight: '300px', borderRadius: '8px', border: '1px solid #ccc' }} />
                      </div>
                    )}

                    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #D4A373' }}>
                      <h4 style={{ fontSize: '16px', color: '#333', marginBottom: '10px', marginTop: 0 }}>Orientação Técnica e Procedimentos:</h4>
                      <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#444', margin: 0, whiteSpace: 'pre-wrap' }}>{occ.text || 'Nenhuma orientação descrita para esta ocorrência.'}</p>
                    </div>
                 </div>
               )
            })}

            {signature && (
               <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '2px dashed #ccc', textAlign: 'center', pageBreakInside: 'avoid' }}>
                   <p style={{ fontSize: '18px', color: '#1B3D2F', fontWeight: 'bold', margin: '0 0 15px 0' }}>✓ Selo de Validação Eletrônica</p>
                   <p style={{ fontSize: '16px', color: '#333', margin: 0 }}>Este laudo técnico foi atestado e assinado pelo representante da unidade:</p>
                   <p style={{ fontSize: '20px', color: '#000', margin: '15px 0 0 0', fontWeight: 'bold' }}>{signature}</p>
               </div>
            )}
         </div>
      </div>

    </div>
  );
};

export default ReportGenerator;
