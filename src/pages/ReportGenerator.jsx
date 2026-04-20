import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, RefreshCcw, Download, Sparkles, ChevronLeft, ChevronUp, ChevronDown, Trash2, Plus, PenTool, Share2, AlertTriangle, CheckCircle2, FileText, Search, ArrowLeft, ImagePlus } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useAppContext } from '../contexts/AppContext';
import { saveLaudo, getLaudo, deleteLaudo, saveClient } from '../services/firestore';
import { uploadAuditPhoto, deleteAuditPhoto } from '../services/storage';
import { db } from '../firebase';
import { doc, collection } from 'firebase/firestore';
// A chave da API Anthropic agora fica segura no servidor (api/generate-ai-note.js).
// O front-end apenas chama a rota /api/generate-ai-note via fetch.

const getBase64FromBlobUrl = async (url) => {
  const response = await fetch(url, { mode: 'cors' });
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 800;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64data = canvas.toDataURL('image/jpeg', 0.7);
        const b64 = base64data.split(',')[1];
        resolve({ b64, mime: 'image/jpeg' });
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const SignaturePadModal = ({ isOpen, onClose, onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [name, setName] = useState('');

  // Inicializa o canvas com fundo branco e configura o traço.
  // requestAnimationFrame garante que o DOM do canvas já esteja montado.
  useEffect(() => {
    if (!isOpen) return;
    const init = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1B3D2F';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };
    // Agenda a inicialização pro próximo frame para garantir que o <canvas> existe
    const raf = requestAnimationFrame(init);

    // Bloqueia scroll na tela enquanto o modal estiver aberto
    const preventScroll = (e) => e.preventDefault();
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Re-seta o estilo do traço em cada início de desenho (segurança)
    ctx.strokeStyle = '#1B3D2F';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !canvasRef.current) return;
    canvasRef.current.getContext('2d').closePath();
    setIsDrawing(false);
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    if (!name.trim()) return alert("Digite o nome ou cargo de quem está assinando.");
    const canvas = canvasRef.current;
    // Cria um canvas auxiliar com fundo branco GARANTIDO e copia o desenho por cima
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ectx = exportCanvas.getContext('2d');
    ectx.fillStyle = '#ffffff';
    ectx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ectx.drawImage(canvas, 0, 0);
    const base64 = exportCanvas.toDataURL('image/jpeg', 0.7);
    onSave({ name: name.trim(), imageObj: base64 });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column', padding: '20px', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-deep)', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>Coleta de Assinatura</h3>
        <input 
          type="text" 
          placeholder="Nome de quem está assinando..." 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-dim)', background: 'var(--bg-surface)', outline: 'none', color: 'var(--text-main)', boxSizing: 'border-box' }}
        />
        <div style={{ background: '#fff', borderRadius: '6px', border: '2px solid var(--border-dim)', overflow: 'hidden' }}>
          <canvas 
            ref={canvasRef}
            width={500} 
            height={250} 
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ display: 'block', width: '100%', touchAction: 'none', background: '#fff' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '10px' }}>
          <button onClick={clearPad} style={{ padding: '10px', flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, color: 'var(--text-main)' }}>Limpar</button>
          <div style={{ display: 'flex', gap: '10px', flex: 2 }}>
            <button onClick={onClose} style={{ padding: '10px', flex: 1, background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Cancelar</button>
            <button onClick={handleSave} className="btn btn-primary" style={{ padding: '10px', flex: 1, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, background: 'var(--primary)', color: '#fff' }}>Pronto</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OccurrenceBlock = ({ occurrence, index, total, categories, updateOccurrence, updateOccurrenceSilent, removeOccurrence, moveUp, moveDown, laudoId, ensureLaudoId }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    updateOccurrence(occurrence.id, { categoryId: catId, itemId: '', text: '' });
  };

  const selectedCategory = categories.find(c => c.id === occurrence.categoryId);
  const selectedItem = selectedCategory?.items.find(i => i.id === occurrence.itemId);

  const handleItemChange = (e) => {
    updateOccurrence(occurrence.id, { itemId: e.target.value });
  };

  const handlePhotoUpload = async (e) => {
    const rawFile = e.target.files[0];
    if (rawFile) {
      if (e.target) e.target.value = ''; // Reseta o input para permitir selecionar a mesma foto novamente
      
      setIsUploading(true);
      try {
        // --- Conversão HEIC/HEIF → JPEG (iPhone) ---
        let sourceFile = rawFile;
        const isHeic = /image\/heic|image\/heif/i.test(rawFile.type) || /\.(heic|heif)$/i.test(rawFile.name);
        if (isHeic) {
          try {
            const { default: heic2any } = await import('heic2any');
            const converted = await heic2any({ blob: rawFile, toType: 'image/jpeg', quality: 0.9 });
            const convertedBlob = Array.isArray(converted) ? converted[0] : converted;
            sourceFile = new File(
              [convertedBlob],
              rawFile.name.replace(/\.(heic|heif)$/i, '.jpg'),
              { type: 'image/jpeg' }
            );
          } catch (heicErr) {
            console.error('Falha ao converter HEIC:', heicErr);
            throw new Error('HEIC_CONVERSION_FAIL');
          }
        }

        // --- Algoritmo de Compressão e Conversão para JPEG ---
        const file = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(sourceFile);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const MAX_SIZE = 1200; // Resolução segura e nítida

              if (width > height) {
                if (width > MAX_SIZE) {
                  height *= MAX_SIZE / width;
                  width = MAX_SIZE;
                }
              } else {
                if (height > MAX_SIZE) {
                  width *= MAX_SIZE / height;
                  height = MAX_SIZE;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);

              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(new File([blob], sourceFile.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: "image/jpeg" }));
                } else {
                  reject(new Error('UNSUPPORTED_IMAGE'));
                }
              }, 'image/jpeg', 0.85); // Qualidade 85% otimizada
            };
            img.onerror = () => reject(new Error('UNSUPPORTED_IMAGE'));
          };
          reader.onerror = () => reject(new Error('READ_FAIL'));
        });
        // --- Fim da Compressão ---

        // Guarda a URL anterior para apagar DEPOIS do upload da nova dar certo
        const previousPhotoUrl = occurrence.photoUrl;

        // Garantir que temos um ID de laudo antes do upload para organizar a pasta
        const currentLaudoId = await ensureLaudoId();
        
        // Upload para o Firebase Storage
        const downloadURL = await uploadAuditPhoto(file, currentLaudoId, occurrence.id);
        
        if (downloadURL) {
          // Atualiza a ocorrência com a URL pública do Firebase (via silent para não perder estado de outras)
          updateOccurrenceSilent(occurrence.id, { photoUrl: downloadURL });
          // Limpa a foto anterior do Storage (evita lixo). Roda em background.
          if (previousPhotoUrl) deleteAuditPhoto(previousPhotoUrl);
        } else {
          throw new Error("Download URL inválida");
        }
      } catch (err) {
        console.error("Erro no upload:", err);
        if (err?.message === 'HEIC_CONVERSION_FAIL') {
          alert("Não foi possível converter a foto HEIC. Tente novamente ou mude o formato no iPhone para 'Mais compatível' em Ajustes > Câmera > Formatos.");
        } else if (err?.message === 'UNSUPPORTED_IMAGE' || err?.message === 'READ_FAIL') {
          alert("Formato de imagem não suportado pelo navegador. Tente outra foto (JPEG ou PNG).");
        } else {
          alert("Falha ao salvar imagem. Verifique a conexão ou tente outra foto.");
        }
      } finally {
        setIsUploading(false);
      }
    }
  };


  const callAnthropicAI = async () => {
    if (!selectedCategory || !selectedItem) {
      return alert("Selecione primeiro a Categoria e o Assunto para orientar a Inteligência Artificial.");
    }

    setIsGeneratingIA(true);
    
    try {
      let image = null;
      
      if (occurrence.photoUrl) {
         try {
           const { b64, mime } = await getBase64FromBlobUrl(occurrence.photoUrl);
           image = { b64, mime: mime || 'image/jpeg' };
         } catch (e) {
           console.warn("Falha ao converter imagem para base64", e);
         }
      }

      const res = await fetch('/api/generate-ai-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryLabel: selectedCategory.label,
          itemLabel: selectedItem.label,
          itemText: selectedItem.text,
          image,
          existingText: occurrence.text || '',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erro ${res.status}`);
      }

      const data = await res.json();
      updateOccurrenceSilent(occurrence.id, { text: data.text });
    } catch (err) {
      console.error("Erro na API da IA:", err);
      alert("Houve um erro ao se comunicar com a IA. Verifique sua conexão.");
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
             {occurrence.photoUrl && !isUploading ? (
               /* Já tem foto - mostra preview com opções para trocar */
               <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-dim)', background: '#1a1a1a' }}>
                 <img src={occurrence.photoUrl} alt="Evidência" style={{ width: '100%', height: '180px', objectFit: 'contain', display: 'block' }} />
                 <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.65)', padding: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                   <button onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.35rem 0.7rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', touchAction: 'manipulation' }}>
                     <Camera size={12} /> Trocar via Câmera
                   </button>
                   <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.35rem 0.7rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', touchAction: 'manipulation' }}>
                     <ImagePlus size={12} /> Trocar via Galeria
                   </button>
                 </div>
               </div>
             ) : (
               /* Sem foto - mostra área com 2 botões */
               <div style={{ 
                 height: '180px', 
                 border: '2px dashed var(--border-dim)', 
                 borderRadius: 'var(--radius-md)', 
                 background: 'var(--bg-deep)',
                 display: 'flex', 
                 flexDirection: 'column',
                 alignItems: 'center', 
                 justifyContent: 'center',
                 color: 'var(--text-muted)',
                 gap: '0.8rem'
               }}>
                 {isUploading ? (
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.7rem' }}>
                     <RefreshCcw size={32} className="spin" color="var(--primary)" />
                     <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>ENVIANDO...</span>
                   </div>
                 ) : (
                   <>
                     <span style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 700, padding: '0.2rem 0.5rem', border: '1px dashed var(--primary)', borderRadius: '4px' }}>Tire fotos na HORIZONTAL</span>
                     <div style={{ display: 'flex', gap: '0.75rem' }}>
                       <button onClick={() => cameraInputRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: '8px', padding: '0.7rem 1.2rem', cursor: 'pointer', color: 'var(--text-main)', touchAction: 'manipulation' }}>
                         <Camera size={24} color="var(--primary)" />
                         <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Câmera</span>
                       </button>
                       <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: '8px', padding: '0.7rem 1.2rem', cursor: 'pointer', color: 'var(--text-main)', touchAction: 'manipulation' }}>
                         <ImagePlus size={24} color="var(--secondary)" />
                         <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Galeria</span>
                       </button>
                     </div>
                   </>
                 )}
               </div>
             )}
             {/* Input CÂMERA (com capture) */}
             <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={isUploading} />
             {/* Input GALERIA (sem capture) */}
             <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={isUploading} />
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

const formatDateTime = (d) => {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return null; // Previne "NaN/NaN/NaN" se a data for inválida
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} · ${hh}:${min}`;
};

// Strip non-serializable bits or temporary blobs from occurrences before saving to Firestore.
// Firebase Storage URLs (https://firebasestorage...) are KEPT.
const sanitizeOccurrences = (occs) => (occs || []).map(({ file, photoUrl, ...rest }) => ({
  ...rest,
  photoUrl: photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('blob:') ? photoUrl : null
}));

const ReportGenerator = () => {
  const { categories: INSPECTION_CATEGORIES, profile, laudos } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const stateLaudoId = location.state?.laudoId || null;
  const stateVisitId = location.state?.visitId || null;
  const stateClient = location.state?.client || '';
  const stateClientId = location.state?.clientId || null;
  const hasEditorContext = !!(stateLaudoId || stateVisitId || stateClient);

  const [mode, setMode] = useState(hasEditorContext ? 'editor' : 'list');

  // Editor state
  const [laudoId, setLaudoId] = useState(stateLaudoId);
  const [visitId, setVisitId] = useState(stateVisitId);
  const [client, setClient] = useState(stateClient);
  const [occurrences, setOccurrences] = useState([]);
  const [signature, setSignature] = useState(null);
  const [clientSignatureImage, setClientSignatureImage] = useState(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [closedAt, setClosedAt] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [nutritionSvg, setNutritionSvg] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const isHydratingRef = useRef(true);
  const lastSummaryHashRef = useRef('');

  // Carrega o símbolo da nutrição inline (necessário para o html2canvas renderizar no PDF)
  useEffect(() => {
    fetch('/nutrition-symbol.svg')
      .then((r) => r.text())
      .then((text) => {
        const normalized = text.replace('<svg ', '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ');
        setNutritionSvg(normalized);
      })
      .catch((e) => console.error('Falha ao carregar símbolo da nutrição:', e));
  }, []);

  // Garante que o laudo tenha um ID no Firestore (necessário para uploads de fotos)
  const ensureLaudoId = async () => {
    if (laudoId && !laudoId.startsWith('_temp_')) return laudoId;
    const newRef = doc(collection(db, 'laudos'));
    const id = newRef.id;
    setLaudoId(id);
    return id;
  };

  // Hydrate editor state from Firestore / route state when entering editor mode.
  useEffect(() => {
    if (mode !== 'editor') return;
    let cancelled = false;
    isHydratingRef.current = true;

    const apply = (laudo) => {
      if (cancelled) return;
      setLaudoId(laudo.id);
      setVisitId(laudo.visitId || null);
      setClient(laudo.client || stateClient || '');
      setOccurrences(laudo.occurrences || []);
      setSignature(laudo.signature || null);
      setClientSignatureImage(laudo.clientSignatureImage || null);
      setAiSummary(laudo.aiSummary || '');
      setStartedAt(laudo.startedAt || new Date().toISOString());
      setClosedAt(laudo.closedAt || null);
      setIsReady(true);
      setTimeout(() => { isHydratingRef.current = false; }, 0);
    };

    const blank = () => {
      if (cancelled) return;
      setStartedAt(new Date().toISOString());
      setIsReady(true);
      setTimeout(() => { isHydratingRef.current = false; }, 0);
    };

    if (stateLaudoId) {
      getLaudo(stateLaudoId).then((laudo) => laudo ? apply(laudo) : blank());
    } else if (stateVisitId) {
      const existing = laudos.find((l) => l.visitId === stateVisitId);
      if (existing) apply(existing);
      else blank();
    } else {
      blank();
    }

    return () => { cancelled = true; };
    // Intentionally not depending on `laudos` — we only check it once at hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, stateLaudoId, stateVisitId]);

  // Auto-save to Firestore when relevant fields change (debounced).
  useEffect(() => {
    if (mode !== 'editor' || !isReady || isHydratingRef.current) return;
    // Skip save when nothing meaningful has been filled yet.
    if (!client && occurrences.length === 0 && !signature) return;

    setSaveStatus('saving');
    const timeout = setTimeout(async () => {
      try {
        const payload = {
          id: laudoId,
          visitId,
          client,
          occurrences: sanitizeOccurrences(occurrences),
          signature,
          clientSignatureImage,
          aiSummary,
          startedAt,
          closedAt,
          status: signature ? 'signed' : 'draft',
          professional: profile ? { name: profile.name || '', crm: profile.crm || '' } : null,
          dateKey: startedAt ? String(startedAt).slice(0, 10) : null
        };
        const newId = await saveLaudo(payload);
        if (!laudoId) setLaudoId(newId);
        setSaveStatus('saved');
      } catch (e) {
        console.error('Falha ao salvar laudo:', e);
        setSaveStatus('error');
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [mode, isReady, client, occurrences, signature, closedAt, laudoId, visitId, startedAt, profile, aiSummary]);

  // ─── Gerar sumário IA (chamado manualmente antes de gerar o PDF) ───
  const generateAISummary = async () => {
    const textsWithContent = occurrences.filter(o => o.text && o.text.trim().length > 10);
    if (textsWithContent.length === 0) return;

    const hash = textsWithContent.map(o => `${o.categoryId}|${o.itemId}|${o.text?.slice(0,50)}`).join(';;');
    if (hash === lastSummaryHashRef.current && aiSummary) return; // Já gerou para estas ocorrências

    lastSummaryHashRef.current = hash;
    setIsGeneratingSummary(true);
    try {
      const bulletPoints = textsWithContent.map((o, i) => {
        const cat = INSPECTION_CATEGORIES.find(c => c.id === o.categoryId);
        const item = cat?.items.find(it => it.id === o.itemId);
        return `${i+1}. [${cat?.label || 'Geral'} > ${item?.label || 'Item'}] ${o.text}`;
      }).join('\n');

      const res = await fetch('/api/generate-ai-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryLabel: 'Sumário Executivo',
          itemLabel: 'Resumo Geral da Auditoria',
          itemText: `Você é um nutricionista auditor. Escreva um PARÁGRAFO ÚNICO de sumário executivo (4 a 6 linhas) para a capa de um laudo técnico de auditoria sanitária do estabelecimento "${client || 'não informado'}". O sumário deve consolidar as seguintes ${textsWithContent.length} ocorrências encontradas durante a inspeção:\n\n${bulletPoints}\n\nO texto deve ser impessoal, formal e técnico. NÃO use listas, bullets, numeração ou saudações. Apenas o parágrafo corrido. Comece direto pelo resumo.`,
          maxTokens: 800,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) setAiSummary(data.text);
      }
    } catch (err) {
      console.warn('Falha ao gerar sumário IA:', err.message);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const invalidateSignature = () => {
    if (signature || clientSignatureImage) {
      setSignature(null);
      setClientSignatureImage(null);
      setClosedAt(null);
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
    setOccurrences(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
  };

  // Versão silenciosa (sem invalidar assinatura) para uploads async que não devem apagar assinatura
  const updateOccurrenceSilent = (id, data) => {
    setOccurrences(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
  };

  const removeOccurrence = (id) => {
    invalidateSignature();
    const target = occurrences.find(o => o.id === id);
    if (target?.photoUrl) deleteAuditPhoto(target.photoUrl);
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
    setPdfProgress(10);
    try {
      // Gera o sumário IA antes de renderizar o PDF (se ainda não existir)
      await generateAISummary();
      setPdfProgress(30);

      // Pequeno delay para o React renderizar o sumário no DOM oculto
      await new Promise(r => setTimeout(r, 300));
      setPdfProgress(40);

      const element = document.getElementById('pdf-report-content');
      const opt = {
        margin:       [10, 10, 10, 10],
        filename:     `Laudo_Auditoria_${client.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff', windowWidth: 720 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak:    { mode: ['css', 'legacy'], before: '.pdf-page-break' }
      };

      // Simula o avanço do navegador engasgado no screenshot
      let currentProgress = 40;
      const progressInterval = setInterval(() => {
        currentProgress += (90 - currentProgress) * 0.15;
        setPdfProgress(currentProgress);
      }, 500);

      await html2pdf().set(opt).from(element).save();
      
      clearInterval(progressInterval);
      setPdfProgress(100);
      
      // Delay final pra exibir 100%
      await new Promise(r => setTimeout(r, 600));

    } catch (e) {
      console.error('Falha ao gerar o PDF', e);
      alert('Houve uma falha ao renderizar o PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setPdfProgress(0), 400);
    }
  };

  const handleSign = () => {
    if (!client || occurrences.length === 0) return alert("O laudo precisa ser preenchido antes de ser assinado.");
    setIsSignatureModalOpen(true);
  };

  const handleSignatureSave = ({ name, imageObj }) => {
    setSignature(name);
    setClientSignatureImage(imageObj);
    setClosedAt(new Date());
    setIsSignatureModalOpen(false);
    // Dispara em background — não deve bloquear o fluxo de assinatura
    persistAuditFocusToClient().catch(err => console.warn('Falha ao persistir foco no cliente:', err));
  };

  // Gera um "foco de atenção" curto via IA e atualiza o cliente no Firestore.
  // Próximos agendamentos desse cliente mostrarão esses dados na Agenda.
  const persistAuditFocusToClient = async () => {
    if (!stateClientId) return; // laudo criado direto de /laudos sem cliente identificado
    const textsWithContent = occurrences.filter(o => o.text && o.text.trim().length > 10);
    const hoje = new Date().toISOString().slice(0, 10);
    const lastReportStatus = textsWithContent.length === 0 ? 'Conforme' : 'Atenção Necessária';

    let historicIssues = '';
    if (textsWithContent.length > 0) {
      try {
        const bulletPoints = textsWithContent.map((o, i) => {
          const cat = INSPECTION_CATEGORIES.find(c => c.id === o.categoryId);
          const item = cat?.items.find(it => it.id === o.itemId);
          return `${i+1}. [${cat?.label || 'Geral'} > ${item?.label || 'Item'}] ${o.text}`;
        }).join('\n');

        const res = await fetch('/api/generate-ai-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryLabel: 'Foco de Atenção',
            itemLabel: 'Alerta para Próxima Visita',
            itemText: `Você é um nutricionista auditor. Com base nas ocorrências abaixo da auditoria em "${client || 'estabelecimento'}", escreva 1 ou 2 frases curtas (máximo 30 palavras no total) destacando os pontos que o auditor da PRÓXIMA visita deve verificar primeiro. Tom direto e prático. NÃO use saudações, listas ou bullets. Comece direto pelo ponto.\n\nOcorrências:\n${bulletPoints}`,
            maxTokens: 150,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          historicIssues = (data.text || '').trim();
        }
      } catch (err) {
        console.warn('IA falhou para historicIssues, usando fallback:', err.message);
      }
      if (!historicIssues) {
        historicIssues = `${textsWithContent.length} ocorrência${textsWithContent.length !== 1 ? 's' : ''} registrada${textsWithContent.length !== 1 ? 's' : ''} na última auditoria — verificar reincidência.`;
      }
    } else {
      historicIssues = 'Última auditoria sem não-conformidades. Manter o padrão.';
    }

    await saveClient({
      id: stateClientId,
      lastVisitDate: hoje,
      lastReportStatus,
      historicIssues,
      hasRealAudit: true,
    });
  };

  const InfoField = ({ label, value, highlight }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: highlight || 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</span>
    </div>
  );

  if (mode === 'list') {
    return (
      <div className="laudos-list-page reveal-staggered" style={{ padding: '1rem' }}>
        <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Laudos Técnicos</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Gerencie seus relatórios de auditoria</p>
          </div>
          <button onClick={() => { setMode('editor'); setLaudoId(null); setVisitId(null); setClient(''); setOccurrences([]); setSignature(null); setStartedAt(new Date().toISOString()); setClosedAt(null); }} className="btn btn-primary" style={{ padding: '0.6rem 1rem' }}>
            <Plus size={16} /> Novo Laudo
          </button>
        </header>

        {laudos.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-dim)', marginTop: '1rem' }}>
             <FileText size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
             <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhum laudo encontrado</h3>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Os relatórios salvos aparecerão aqui.</p>
           </div>
        ) : (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
             {laudos.map(l => (
               <div key={l.id} className="card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid var(--border-dim)' }} onClick={() => navigate('/laudos', { state: { laudoId: l.id } })}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{l.client || 'Sem Estabelecimento'}</div>
                   {l.status === 'signed' ? (
                     <span style={{ fontSize: '0.6rem', background: 'rgba(0,255,136,0.1)', color: 'var(--primary)', padding: '0.3rem 0.6rem', borderRadius: '12px', fontWeight: 800 }}>ASSINADO</span>
                   ) : (
                     <span style={{ fontSize: '0.6rem', background: 'rgba(212,163,115,0.1)', color: 'var(--secondary)', padding: '0.3rem 0.6rem', borderRadius: '12px', fontWeight: 800 }}>RASCUNHO</span>
                   )}
                 </div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                   <span>{l.dateKey ? l.dateKey.split('-').reverse().join('/') : 'Data não registrada'}</span>
                   <span>{l.occurrences?.length || 0} ocorrência(s)</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <PenTool size={14} /> Abrir
                    </div>
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>
    );
  }

  return (
    <>
    <div className="laudo-editor-page reveal-staggered" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Header Toolbar */}
      <header className="laudo-editor-head" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-dim)', paddingBottom: '1rem' }}>
        <div className="flex-toolbar" style={{ gap: '1rem', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {!hasEditorContext && (
              <button onClick={() => setMode('list')} className="btn" style={{ padding: '0.4rem', border: '1px solid var(--border-dim)', background: 'var(--bg-deep)' }}>
                <ArrowLeft size={16} />
              </button>
            )}
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
               Laudo em Edição
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {saveStatus === 'saving' && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><RefreshCcw size={12} className="spin" /> Salvando...</span>}
            {saveStatus === 'saved' && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle2 size={14} /> Salvo</span>}
          </div>
        </div>
      </header>

      {/* Info Bar: Client + Professional + Timestamps */}
      <div className="laudo-info-bar" style={{ flexShrink: 0, background: 'var(--bg-surface)', padding: '1rem 1.25rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
         <InfoField label="Estabelecimento" value={client} />
         <InfoField label="Profissional" value={profile?.name ? `${profile.name}${profile.crm ? ` · CRN ${profile.crm}` : ''}` : 'Sem perfil cadastrado'} />
         <InfoField label="Início" value={formatDateTime(startedAt)} />
         <InfoField
           label="Encerramento"
           value={closedAt ? formatDateTime(closedAt) : 'Em aberto'}
           highlight={closedAt ? 'var(--primary)' : 'var(--secondary)'}
         />
      </div>

      {!stateClient && (
        <div style={{ marginBottom: '1rem', background: 'var(--bg-surface)', padding: '0.75rem 1rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Selecione o cliente:</span>
          <select
            value={client}
            onChange={(e) => setClient(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '0.5rem 0.8rem', border: '1px solid var(--border-dim)', borderRadius: '4px', background: 'var(--bg-deep)', outline: 'none', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}
          >
            <option value="">Selecione o Cliente Auditado...</option>
            <option value="Cozinha Industrial Matriz">Cozinha Industrial Matriz</option>
            <option value="Supermercado Nova Era">Supermercado Nova Era</option>
            <option value="Refeitório São João">Refeitório São João</option>
          </select>
        </div>
      )}

      {signature && (
        <div style={{ padding: '0.8rem 1rem', background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)', color: 'var(--primary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', flexShrink: 0 }}>
          <CheckCircle2 size={16} /> Documento validado e assinado eletronicamente por <strong>{signature}</strong>.
        </div>
      )}

      {/* CANVAS AREA (scrollable) */}
      <div className="laudo-canvas-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '0.25rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '1rem' }}>
          {occurrences.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border-dim)', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
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
              {occurrences.map((occ, index) => (
                <OccurrenceBlock
                  key={occ.id}
                  occurrence={occ}
                  index={index}
                  total={occurrences.length}
                  categories={INSPECTION_CATEGORIES}
                  updateOccurrence={updateOccurrence}
                  updateOccurrenceSilent={updateOccurrenceSilent}
                  removeOccurrence={() => removeOccurrence(occ.id)}
                  moveUp={() => moveUp(index)}
                  moveDown={() => moveDown(index)}
                  laudoId={laudoId}
                  ensureLaudoId={ensureLaudoId}
                />
              ))}
              <div style={{ padding: '1rem 0', display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button onClick={addOccurrence} className="btn" style={{ padding: '0.8rem 2rem', background: 'var(--bg-deep)', border: '1px dashed var(--border-dim)', width: '100%', maxWidth: '300px', justifyContent: 'center' }}>
                  <Plus size={16} /> Adicionar Nova Ocorrência
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Indicador de Sumário IA */}
      {isGeneratingSummary && (
        <div style={{ padding: '0.6rem 1rem', background: 'rgba(212,163,115,0.08)', border: '1px solid rgba(212,163,115,0.25)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#D4A373', flexShrink: 0 }}>
          <RefreshCcw size={14} className="spin" /> Gerando sumário executivo com IA...
        </div>
      )}

      {/* FOOTER ACTIONS (sticky at bottom) */}
      <div className="laudo-footer-actions" style={{ flexShrink: 0, marginTop: '1rem', padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem', touchAction: 'manipulation' }}>
         {isGenerating && (
           <div style={{ width: '100%', padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800 }}>
                 <span>PROCESSANDO ARQUIVO...</span>
                 <span>{Math.floor(pdfProgress)}%</span>
              </div>
              <div style={{ width: '100%', background: 'var(--border-dim)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                 <div style={{ width: `${pdfProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease-out' }} />
              </div>
           </div>
         )}
         <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
           <button onClick={handleSign} className="btn" style={{ flex: 1, minWidth: '160px', justifyContent: 'center', padding: '0.9rem', border: signature ? '1px solid var(--primary)' : '1px solid var(--border-dim)', color: signature ? 'var(--primary)' : 'var(--text-main)', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
             {signature ? <CheckCircle2 size={16} /> : <PenTool size={16} />}
             {signature ? 'ASSINADO' : 'ASSINAR'}
           </button>
           <button onClick={handleGeneratePDF} className="btn btn-primary" style={{ flex: 1, minWidth: '160px', justifyContent: 'center', padding: '0.9rem', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }} disabled={isGenerating}>
             {isGenerating ? <RefreshCcw size={14} className="spin" /> : <Download size={14} />}
             {isGenerating ? 'AGUARDE...' : 'GERAR PDF'}
           </button>
         </div>
      </div>

      {/* HIDDEN PDF TEMPLATE */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
         <div id="pdf-report-content" style={{ width: '720px', backgroundColor: '#fff', color: '#000', fontFamily: 'Arial, Helvetica, sans-serif', boxSizing: 'border-box' }}>

            {/* ========== PÁGINA 1 — CAPA / IDENTIFICAÇÃO ========== */}
            <div style={{ width: '720px', minHeight: '1020px', padding: '36px 32px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>

               {/* Faixa de título */}
               <div style={{ fontSize: '10px', color: '#1B3D2F', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Laudo Técnico · Auditoria de Conformidade Sanitária
               </div>

               {/* Container Relativo para o Cartão Verde e Símbolo */}
               <div style={{ position: 'relative', marginBottom: '40px', marginTop: '30px' }}>
                  {/* Cartão de visita do profissional */}
                  <div style={{ background: '#1B3D2F', color: '#fff', padding: '16px 24px', paddingRight: '230px', borderRadius: '10px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                     {/* Dados profissionais */}
                     <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.3px', lineHeight: 1.15, marginBottom: '2px', wordBreak: 'break-word' }}>
                           {profile?.name || 'Nome do Profissional'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#D4A373', fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                           Nutricionista{profile?.crm ? ` · ${profile.crm}` : ''}
                        </div>

                        {/* Contatos */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', color: '#e8eae2' }}>
                           {profile?.email && (
                              <div style={{ wordBreak: 'break-word' }}>
                                 <span style={{ color: '#D4A373', fontWeight: 'bold', letterSpacing: '0.5px' }}>E-MAIL</span>
                                 <span style={{ margin: '0 8px', color: '#D4A373' }}>·</span>
                                 {profile.email}
                              </div>
                           )}
                           {profile?.whatsapp && (
                              <div>
                                 <span style={{ color: '#D4A373', fontWeight: 'bold', letterSpacing: '0.5px' }}>WHATSAPP</span>
                                 <span style={{ margin: '0 8px', color: '#D4A373' }}>·</span>
                                 {profile.whatsapp}
                              </div>
                           )}
                        </div>

                        {/* Bio */}
                        {profile?.bio && (
                           <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', lineHeight: 1.5, marginTop: '10px', wordBreak: 'break-word', paddingTop: '8px', borderTop: '1px solid rgba(212, 163, 115, 0.25)' }}>
                              {profile.bio}
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Símbolo da nutrição (posicionado absolutamente sobre o cartão verde, vazando por cima e por baixo) */}
                  <div
                     aria-label="Símbolo da Nutrição"
                     style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '190px', height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
                     dangerouslySetInnerHTML={{ __html: nutritionSvg || '' }}
                  />
               </div>

               {/* Estabelecimento (linha de destaque) */}
               <div style={{ background: '#f4f4f2', border: '1px solid #e2e2de', borderLeft: '5px solid #1B3D2F', borderRadius: '6px', padding: '16px 20px', marginBottom: '16px', WebkitPrintColorAdjust: 'exact' }}>
                  <div style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold', marginBottom: '4px' }}>
                     Estabelecimento Auditado
                  </div>
                  <div style={{ fontSize: '20px', color: '#1B3D2F', fontWeight: 900, wordBreak: 'break-word' }}>
                     {client || '—'}
                  </div>
               </div>

               {/* Grid de datas */}
               <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ flex: 1, background: '#f8f8f8', border: '1px solid #e2e2de', borderRadius: '6px', padding: '14px 16px', boxSizing: 'border-box' }}>
                     <div style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold', marginBottom: '4px' }}>Início da Inspeção</div>
                     <div style={{ fontSize: '14px', color: '#222', fontWeight: 'bold', wordBreak: 'break-word' }}>{formatDateTime(startedAt) || '—'}</div>
                  </div>
                  <div style={{ flex: 1, background: '#f8f8f8', border: '1px solid #e2e2de', borderRadius: '6px', padding: '14px 16px', boxSizing: 'border-box' }}>
                     <div style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold', marginBottom: '4px' }}>Encerramento</div>
                     <div style={{ fontSize: '14px', color: closedAt ? '#1B3D2F' : '#D4A373', fontWeight: 'bold', wordBreak: 'break-word' }}>{closedAt ? formatDateTime(closedAt) : 'Em aberto'}</div>
                  </div>
               </div>

               {/* Sumário */}
               <div style={{ background: '#f8f8f8', borderLeft: '4px solid #D4A373', padding: '18px 20px', borderRadius: '4px', WebkitPrintColorAdjust: 'exact' }}>
                  <div style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold', marginBottom: '8px' }}>
                     Sumário da Auditoria
                  </div>
                  <div style={{ fontSize: '13px', color: '#222', lineHeight: 1.7, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                     {aiSummary || `Este documento consolida ${occurrences.length} ocorrência${occurrences.length !== 1 ? 's' : ''} técnica${occurrences.length !== 1 ? 's' : ''} identificada${occurrences.length !== 1 ? 's' : ''} durante a inspeção sanitária realizada em ${client || 'estabelecimento'}. Cada item é acompanhado de evidência fotográfica (quando aplicável) e da respectiva orientação corretiva para regularização.`}
                  </div>
               </div>

               {/* Rodapé capa */}
               <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #e2e2de', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#999' }}>
                  <span>NutriApp · Documento gerado eletronicamente</span>
                  <span>Capa</span>
               </div>
            </div>

            {/* ========== PÁGINAS DE OCORRÊNCIA ========== */}
            {occurrences.map((occ, i) => {
               const cat = INSPECTION_CATEGORIES.find(c => c.id === occ.categoryId);
               const item = cat?.items.find(it => it.id === occ.itemId);
               return (
                  <div key={occ.id} className="pdf-page-break" style={{ width: '720px', minHeight: '1020px', padding: '36px 32px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', pageBreakBefore: 'always' }}>

                     {/* Cabeçalho compacto da ocorrência */}
                     <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#1B3D2F', color: '#fff', padding: '16px 20px', borderRadius: '8px', marginBottom: '18px', WebkitPrintColorAdjust: 'exact' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '19px', background: '#D4A373', color: '#1B3D2F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px', flexShrink: 0 }}>
                           {i + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                           <div style={{ fontSize: '10px', color: '#D4A373', fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
                              Ocorrência {i + 1} de {occurrences.length}
                           </div>
                           <div style={{ fontSize: '15px', fontWeight: 'bold', wordBreak: 'break-word', lineHeight: 1.3 }}>
                              {cat ? cat.label : 'Não classificado'} — {item ? item.label : 'Não especificado'}
                           </div>
                        </div>
                     </div>

                     {/* Barra de identificação do laudo (contexto em cada página) */}
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#777', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', padding: '0 4px', marginBottom: '14px' }}>
                        <span style={{ wordBreak: 'break-word', maxWidth: '60%' }}>{client}</span>
                        <span>{formatDateTime(startedAt)?.split(' · ')[0] || ''}</span>
                     </div>

                     {/* Foto */}
                     {occ.photoUrl && (
                        <div style={{ background: '#f0f0ee', border: '1px solid #e2e2de', borderRadius: '8px', padding: '10px', marginBottom: '16px', textAlign: 'center' }}>
                           <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden' }}>
                              <img
                                 src={occ.photoUrl}
                                 crossOrigin="anonymous"
                                 alt="Evidência"
                                 style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
                              />
                           </div>
                           <div style={{ fontSize: '9px', color: '#999', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold', marginTop: '8px' }}>
                              Evidência Fotográfica
                           </div>
                        </div>
                     )}

                     {/* Texto da constatação */}
                     <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e2de', borderLeft: '4px solid #D4A373', borderRadius: '4px', padding: '18px 22px' }}>
                        <div style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold', marginBottom: '10px' }}>
                           Constatação e Orientação Técnica
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#222', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                           {occ.text || 'Nenhuma orientação descrita.'}
                        </div>
                     </div>

                     {/* Rodapé */}
                     <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e2e2de', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#999' }}>
                        <span style={{ wordBreak: 'break-word', maxWidth: '60%' }}>
                           {profile?.name ? `${profile.name}${profile.crm ? ` · CRN ${profile.crm}` : ''}` : 'NutriApp'}
                        </span>
                        <span>Página {i + 2}</span>
                     </div>
                  </div>
               );
            })}

            {/* ========== PÁGINA DE ASSINATURA ========== */}
            {signature && (
               <div className="pdf-page-break" style={{ width: '720px', minHeight: '1020px', padding: '36px 32px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', pageBreakBefore: 'always' }}>

                  {/* Cabeçalho da página */}
                  <div style={{ background: '#1B3D2F', color: '#fff', padding: '16px 20px', borderRadius: '8px', marginBottom: '40px', WebkitPrintColorAdjust: 'exact' }}>
                     <div style={{ fontSize: '10px', color: '#D4A373', fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Validação do Documento
                     </div>
                     <div style={{ fontSize: '15px', fontWeight: 'bold' }}>
                        Selo de Assinatura Eletrônica
                     </div>
                  </div>

                  {/* Bloco central */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                     <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: '#1B3D2F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', fontWeight: 900, marginBottom: '20px', WebkitPrintColorAdjust: 'exact' }}>
                        ✓
                     </div>
                     <div style={{ fontSize: '20px', color: '#1B3D2F', fontWeight: 900, marginBottom: '14px', letterSpacing: '0.5px', wordSpacing: '4px' }}>
                        Documento Validado Eletronicamente
                     </div>
                     <div style={{ fontSize: '13px', color: '#555', maxWidth: '520px', lineHeight: 1.7, marginBottom: '40px', wordBreak: 'break-word' }}>
                        Este laudo técnico foi atestado e assinado pelo representante legal do estabelecimento auditado, conferindo validade ao conteúdo aqui registrado em conformidade com as normas sanitárias vigentes.
                     </div>

                     {/* Linhas de assinatura */}
                     <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', minWidth: '360px', maxWidth: '640px', width: '100%', marginTop: '30px' }}>
                        
                        {/* Assinatura do Cliente */}
                        <div style={{ flex: 1, borderTop: '2px solid #1B3D2F', paddingTop: '10px' }}>
                           <div style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                             {clientSignatureImage ? (
                               <img src={clientSignatureImage} alt="Assinatura Cliente" style={{ height: '50px', maxWidth: '100%', objectFit: 'contain' }} />
                             ) : (
                               <span style={{ fontSize: '18px', color: '#222', fontWeight: 'bold', wordBreak: 'break-word', fontFamily: 'serif', fontStyle: 'italic' }}>{signature}</span>
                             )}
                           </div>
                           <div style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px', fontWeight: 'bold' }}>
                              Representante do Estabelecimento
                              {(signature && clientSignatureImage) && <div style={{ fontSize: '8px', color: '#999', marginTop: '2px', textTransform: 'none', letterSpacing: 'normal', fontStyle: 'italic' }}>{signature}</div>}
                           </div>
                        </div>

                        {/* Assinatura do Profissional */}
                        <div style={{ flex: 1, borderTop: '2px solid #1B3D2F', paddingTop: '10px' }}>
                           <div style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                             {profile?.signatureImage ? (
                               <img src={profile.signatureImage} crossOrigin="anonymous" alt="Assinatura Nutricionista" style={{ height: '50px', maxWidth: '100%', objectFit: 'contain' }} />
                             ) : (
                               <span style={{ fontSize: '16px', color: '#222', fontWeight: 800, wordBreak: 'break-word' }}>{profile?.name || 'Nutricionista'}</span>
                             )}
                           </div>
                           <div style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px', fontWeight: 'bold' }}>
                              Nutricionista Responsável {profile?.crm ? ` · ${profile.crm}` : ''}
                              {(profile?.name && profile?.signatureImage) && <div style={{ fontSize: '8px', color: '#999', marginTop: '2px', textTransform: 'none', letterSpacing: 'normal', fontStyle: 'italic' }}>{profile.name}</div>}
                           </div>
                        </div>
                     </div>

                     <div style={{ fontSize: '11px', color: '#999', marginTop: '32px' }}>
                        Assinado em {formatDateTime(closedAt) || formatDateTime(startedAt) || '—'}
                     </div>
                  </div>

                  {/* Rodapé */}
                  <div style={{ paddingTop: '24px', borderTop: '1px solid #e2e2de', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#999' }}>
                     <span>NutriApp · Documento gerado eletronicamente</span>
                     <span>Página {occurrences.length + 2}</span>
                  </div>
               </div>
            )}
         </div>
      </div>

    </div>
    <SignaturePadModal
      isOpen={isSignatureModalOpen}
      onClose={() => setIsSignatureModalOpen(false)}
      onSave={handleSignatureSave}
    />
    </>
  );
};

export default ReportGenerator;
