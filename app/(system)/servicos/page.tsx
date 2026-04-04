'use client';

import { useState, useEffect, useMemo } from 'react';
import { createStaffClient } from '@/lib/supabase/client';
import {
  getServicos, createServico, updateServico, deleteServico,
  getCategories, createCategory, updateCategory, deleteCategory,
  type Servico, type ServiceCategory,
} from '@/lib/services-data';

function fmtPrice(n: number) {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPriceInput(val: string): string {
  const digits = val.replace(/[^\d,]/g, '');
  const parts  = digits.split(',');
  const int    = parts[0].slice(0, 7);
  if (parts.length === 1) return int;
  return int + ',' + parts[1].slice(0, 2);
}

function parsePriceInput(val: string): number {
  return parseFloat(val.replace(',', '.')) || 0;
}

type Tab = 'servicos' | 'categorias';

export default function ServicosPage() {
  const [tab,           setTab]           = useState<Tab>('servicos');
  const [search,        setSearch]        = useState('');
  const [filterCatId,   setFilterCatId]   = useState('');

  const [servicos,    setServicos]    = useState<Servico[]>([]);
  const [categories,  setCategories]  = useState<ServiceCategory[]>([]);
  const [loading,     setLoading]     = useState(true);
  const staffClient = useMemo(() => createStaffClient(), []);

  // ── Serviço: Create ──
  const [createOpen,     setCreateOpen]     = useState(false);
  const [createName,     setCreateName]     = useState('');
  const [createPrice,    setCreatePrice]    = useState('');
  const [createCatId,    setCreateCatId]    = useState('');
  const [createError,    setCreateError]    = useState('');
  const [createSaving,   setCreateSaving]   = useState(false);

  // ── Serviço: Edit ──
  const [editId,         setEditId]         = useState<string | null>(null);
  const [editName,       setEditName]        = useState('');
  const [editPrice,      setEditPrice]       = useState('');
  const [editCatId,      setEditCatId]       = useState('');
  const [editError,      setEditError]       = useState('');
  const [editSaving,     setEditSaving]      = useState(false);

  // ── Serviço: Delete ──
  const [deleteId,       setDeleteId]        = useState<string | null>(null);
  const [deleteSaving,   setDeleteSaving]    = useState(false);
  const [deleteError,    setDeleteError]     = useState('');

  // ── Categoria: Create ──
  const [catCreateOpen,  setCatCreateOpen]  = useState(false);
  const [catCreateName,  setCatCreateName]  = useState('');
  const [catCreateError, setCatCreateError] = useState('');
  const [catCreateSaving,setCatCreateSaving]= useState(false);

  // ── Categoria: Edit ──
  const [catEditId,      setCatEditId]      = useState<string | null>(null);
  const [catEditName,    setCatEditName]    = useState('');
  const [catEditError,   setCatEditError]   = useState('');
  const [catEditSaving,  setCatEditSaving]  = useState(false);

  // ── Categoria: Delete ──
  const [catDeleteId,    setCatDeleteId]    = useState<string | null>(null);
  const [catDeleteSaving,setCatDeleteSaving]= useState(false);
  const [catDeleteError, setCatDeleteError] = useState('');

  useEffect(() => {
    Promise.all([
      getServicos(staffClient),
      getCategories(staffClient),
    ]).then(([s, c]) => {
      setServicos(s);
      setCategories(c);
      setLoading(false);
    });
  }, [staffClient]);

  const activeServicos   = servicos.filter(s => s.active).length;
  const activeCategories = categories.filter(c => c.active).length;
  const deletingItem     = servicos.find(s => s.id === deleteId);
  const deletingCat      = categories.find(c => c.id === catDeleteId);

  // ── Serviço handlers ──
  function openCreate() {
    setCreateName(''); setCreatePrice(''); setCreateCatId(''); setCreateError('');
    setCreateOpen(true);
  }

  async function handleCreate() {
    if (!createName.trim())               { setCreateError('Nome é obrigatório.'); return; }
    const num = parsePriceInput(createPrice);
    if (!num || num <= 0)                  { setCreateError('Preço inválido.'); return; }
    if (!createCatId)                      { setCreateError('Selecione uma categoria.'); return; }
    setCreateSaving(true);
    const result = await createServico({
      name: createName.trim(), priceNum: num,
      sortOrder: servicos.length,
      categoryId: createCatId || null,
    });
    setCreateSaving(false);
    if (!result.ok) { setCreateError(result.error ?? 'Erro ao criar.'); return; }
    if (result.servico) {
      const cat = categories.find(c => c.id === createCatId);
      setServicos(prev => [...prev, { ...result.servico!, categoryName: cat?.name ?? null }]);
    }
    setCreateOpen(false);
  }

  function openEdit(s: Servico) {
    setEditId(s.id); setEditName(s.name); setEditPrice(String(s.priceNum).replace('.', ','));
    setEditCatId(s.categoryId ?? ''); setEditError('');
  }

  async function handleEdit() {
    if (!editId)           return;
    if (!editName.trim())  { setEditError('Nome é obrigatório.'); return; }
    const num = parsePriceInput(editPrice);
    if (!num || num <= 0)  { setEditError('Preço inválido.'); return; }
    if (!editCatId)        { setEditError('Selecione uma categoria.'); return; }
    setEditSaving(true);
    const result = await updateServico(editId, {
      name: editName.trim(), priceNum: num, categoryId: editCatId || null,
    });
    setEditSaving(false);
    if (!result.ok) { setEditError(result.error ?? 'Erro ao salvar.'); return; }
    const cat = categories.find(c => c.id === editCatId);
    setServicos(prev => prev.map(s => s.id === editId
      ? { ...s, name: editName.trim(), priceNum: num, price: fmtPrice(num),
          categoryId: editCatId || null, categoryName: cat?.name ?? null }
      : s
    ));
    setEditId(null);
  }

  async function toggleActive(s: Servico) {
    const next = !s.active;
    setServicos(prev => prev.map(x => x.id === s.id ? { ...x, active: next } : x));
    const result = await updateServico(s.id, { active: next });
    if (!result.ok) setServicos(prev => prev.map(x => x.id === s.id ? { ...x, active: s.active } : x));
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteSaving(true); setDeleteError('');
    const result = await deleteServico(deleteId);
    setDeleteSaving(false);
    if (!result.ok) { setDeleteError(result.error ?? 'Erro ao excluir.'); return; }
    setServicos(prev => prev.filter(s => s.id !== deleteId));
    setDeleteId(null);
  }

  // ── Categoria handlers ──
  function openCatCreate() {
    setCatCreateName(''); setCatCreateError(''); setCatCreateOpen(true);
  }

  async function handleCatCreate() {
    if (!catCreateName.trim()) { setCatCreateError('Nome é obrigatório.'); return; }
    setCatCreateSaving(true);
    const result = await createCategory({ name: catCreateName.trim(), sortOrder: categories.length });
    setCatCreateSaving(false);
    if (!result.ok) { setCatCreateError(result.error ?? 'Erro ao criar.'); return; }
    if (result.category) setCategories(prev => [...prev, result.category!]);
    setCatCreateOpen(false);
  }

  function openCatEdit(c: ServiceCategory) {
    setCatEditId(c.id); setCatEditName(c.name); setCatEditError('');
  }

  async function handleCatEdit() {
    if (!catEditId)             return;
    if (!catEditName.trim())    { setCatEditError('Nome é obrigatório.'); return; }
    setCatEditSaving(true);
    const result = await updateCategory(catEditId, { name: catEditName.trim() });
    setCatEditSaving(false);
    if (!result.ok) { setCatEditError(result.error ?? 'Erro ao salvar.'); return; }
    setCategories(prev => prev.map(c => c.id === catEditId ? { ...c, name: catEditName.trim() } : c));
    // Atualiza categoryName nos serviços que usam essa categoria
    setServicos(prev => prev.map(s => s.categoryId === catEditId
      ? { ...s, categoryName: catEditName.trim() } : s));
    setCatEditId(null);
  }

  async function toggleCatActive(c: ServiceCategory) {
    const next = !c.active;
    setCategories(prev => prev.map(x => x.id === c.id ? { ...x, active: next } : x));
    const result = await updateCategory(c.id, { active: next });
    if (!result.ok) setCategories(prev => prev.map(x => x.id === c.id ? { ...x, active: c.active } : x));
  }

  async function handleCatDelete() {
    if (!catDeleteId) return;
    setCatDeleteSaving(true); setCatDeleteError('');
    const result = await deleteCategory(catDeleteId);
    setCatDeleteSaving(false);
    if (!result.ok) { setCatDeleteError(result.error ?? 'Erro ao excluir.'); return; }
    setCategories(prev => prev.filter(c => c.id !== catDeleteId));
    // Remove categoria dos serviços afetados
    setServicos(prev => prev.map(s => s.categoryId === catDeleteId
      ? { ...s, categoryId: null, categoryName: null } : s));
    setCatDeleteId(null);
  }

  return (
    <div className="admin-section">

      {/* Header */}
      <div className="clientes-header">
        <div>
          <h2 className="admin-section-title">Serviços</h2>
          <p className="admin-section-sub">
            {loading ? 'Carregando...' : (
              tab === 'servicos'
                ? `${servicos.length} serviço${servicos.length !== 1 ? 's' : ''} · ${activeServicos} ativo${activeServicos !== 1 ? 's' : ''}`
                : `${categories.length} categoria${categories.length !== 1 ? 's' : ''} · ${activeCategories} ativa${activeCategories !== 1 ? 's' : ''}`
            )}
          </p>
        </div>
        <button
          className="admin-new-btn"
          onClick={tab === 'servicos' ? openCreate : openCatCreate}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {tab === 'servicos' ? 'Novo serviço' : 'Nova categoria'}
        </button>
      </div>

      {/* Tabs */}
      <div className="servicos-tabs">
        <button
          className={`servicos-tab${tab === 'servicos' ? ' active' : ''}`}
          onClick={() => setTab('servicos')}
        >Serviços</button>
        <button
          className={`servicos-tab${tab === 'categorias' ? ' active' : ''}`}
          onClick={() => setTab('categorias')}
        >Categorias</button>
      </div>

      {loading ? (
        <div className="admin-loading">Carregando...</div>
      ) : tab === 'servicos' ? (
        /* ── Lista de Serviços ── */
        servicos.length === 0 ? (
          <div className="clientes-empty">
            <p>Nenhum serviço cadastrado. Clique em &quot;Novo serviço&quot; para começar.</p>
          </div>
        ) : (
          <>
            <div className="servicos-filters">
              <div className="servicos-search-wrap">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  className="servicos-search"
                  type="text"
                  placeholder="Pesquisar serviço..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="servicos-search-clear" onClick={() => setSearch('')}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              <select
                className="servicos-cat-filter"
                value={filterCatId}
                onChange={e => setFilterCatId(e.target.value)}
              >
                <option value="">Todas as categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {(() => {
              const q = search.toLowerCase().trim();
              const visible = servicos.filter(s =>
                (!q || s.name.toLowerCase().includes(q)) &&
                (!filterCatId || s.categoryId === filterCatId)
              );
              if (visible.length === 0) return (
                <div className="clientes-empty">
                  <p>Nenhum serviço encontrado{q ? ` para "${search}"` : ''}{filterCatId ? ' nesta categoria' : ''}.</p>
                </div>
              );
              return (
          <div className="servicos-list">
            {visible.map(s => (
              <div key={s.id} className={`servico-row${!s.active ? ' inactive' : ''}`}>
                <div className="servico-info">
                  <p className="servico-name">{s.name}</p>
                  {s.categoryName && <span className="servico-cat-badge">{s.categoryName}</span>}
                </div>
                <span className="servico-price">{s.price}</span>
                <span className={`servico-status-badge ${s.active ? 'ativo' : 'inativo'}`}>
                  {s.active ? 'Ativo' : 'Inativo'}
                </span>
                <button className="staff-edit-btn" onClick={() => openEdit(s)}>Editar</button>
                <button
                  className="staff-edit-btn servico-toggle-btn"
                  data-active={s.active}
                  onClick={() => toggleActive(s)}
                >{s.active ? 'Desativar' : 'Ativar'}</button>
                <button
                  className="staff-delete-btn"
                  onClick={() => { setDeleteError(''); setDeleteId(s.id); }}
                  title="Excluir"
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
              );
            })()}
          </>
        )
      ) : (
        /* ── Lista de Categorias ── */
        categories.length === 0 ? (
          <div className="clientes-empty">
            <p>Nenhuma categoria cadastrada. Clique em &quot;Nova categoria&quot; para começar.</p>
          </div>
        ) : (
          <div className="servicos-list">
            {categories.map(c => {
              const count = servicos.filter(s => s.categoryId === c.id).length;
              return (
                <div key={c.id} className={`servico-row${!c.active ? ' inactive' : ''}`}>
                  <div className="servico-info">
                    <p className="servico-name">{c.name}</p>
                    <span className="servico-cat-badge">{count} serviço{count !== 1 ? 's' : ''}</span>
                  </div>
                  <span className={`servico-status-badge ${c.active ? 'ativo' : 'inativo'}`}>
                    {c.active ? 'Ativa' : 'Inativa'}
                  </span>
                  <button className="staff-edit-btn" onClick={() => openCatEdit(c)}>Editar</button>
                  <button
                    className="staff-edit-btn servico-toggle-btn"
                    data-active={c.active}
                    onClick={() => toggleCatActive(c)}
                  >{c.active ? 'Desativar' : 'Ativar'}</button>
                  <button
                    className="staff-delete-btn"
                    onClick={() => { setCatDeleteError(''); setCatDeleteId(c.id); }}
                    title="Excluir"
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ═══ MODAIS: SERVIÇOS ═══ */}

      {/* Criar serviço */}
      {createOpen && (
        <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) setCreateOpen(false); }}>
          <div className="na-modal" style={{ maxWidth: 440 }}>
            <div className="na-modal-header">
              <div>
                <h2 className="na-modal-title">Novo serviço</h2>
                <p className="na-modal-sub">Adicionar ao catálogo</p>
              </div>
              <button className="na-close" onClick={() => setCreateOpen(false)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="na-modal-body">
              <div className="na-grid">
                <div className="na-field na-field-full">
                  <label className="na-label">Nome do serviço *</label>
                  <input className="na-input" value={createName} onChange={e => setCreateName(e.target.value)} placeholder="Ex: Limpeza de pele" autoFocus />
                </div>
                <div className="na-field na-field-full">
                  <label className="na-label">Preço (R$) *</label>
                  <input className="na-input" type="text" inputMode="decimal" value={createPrice} onChange={e => setCreatePrice(fmtPriceInput(e.target.value))} placeholder="120,00" />
                </div>
                <div className="na-field na-field-full">
                  <label className="na-label">Categoria *</label>
                  <select className="na-input" value={createCatId} onChange={e => setCreateCatId(e.target.value)}>
                    <option value="">Selecione uma categoria</option>
                    {categories.filter(c => c.active).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {createError && (
                  <p className="na-error na-field-full">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {createError}
                  </p>
                )}
              </div>
            </div>
            <div className="na-modal-footer">
              <button className="na-cancel" onClick={() => setCreateOpen(false)} disabled={createSaving}>Cancelar</button>
              <button className="na-save" onClick={handleCreate} disabled={createSaving}>
                {createSaving
                  ? <span className="login-spinner" style={{ width: 12, height: 12 }} />
                  : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                }
                {createSaving ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editar serviço */}
      {editId && (
        <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) setEditId(null); }}>
          <div className="na-modal" style={{ maxWidth: 440 }}>
            <div className="na-modal-header">
              <div><h2 className="na-modal-title">Editar serviço</h2></div>
              <button className="na-close" onClick={() => setEditId(null)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="na-modal-body">
              <div className="na-grid">
                <div className="na-field na-field-full">
                  <label className="na-label">Nome do serviço *</label>
                  <input className="na-input" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
                </div>
                <div className="na-field na-field-full">
                  <label className="na-label">Preço (R$) *</label>
                  <input className="na-input" type="text" inputMode="decimal" value={editPrice} onChange={e => setEditPrice(fmtPriceInput(e.target.value))} placeholder="120,00" />
                </div>
                <div className="na-field na-field-full">
                  <label className="na-label">Categoria *</label>
                  <select className="na-input" value={editCatId} onChange={e => setEditCatId(e.target.value)}>
                    <option value="">Selecione uma categoria</option>
                    {categories.filter(c => c.active).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {editError && (
                  <p className="na-error na-field-full">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {editError}
                  </p>
                )}
              </div>
            </div>
            <div className="na-modal-footer">
              <button className="na-cancel" onClick={() => setEditId(null)} disabled={editSaving}>Cancelar</button>
              <button className="na-save" onClick={handleEdit} disabled={editSaving}>
                {editSaving
                  ? <span className="login-spinner" style={{ width: 12, height: 12 }} />
                  : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                }
                {editSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excluir serviço */}
      {deleteId && deletingItem && (
        <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div className="na-modal" style={{ maxWidth: 400 }}>
            <div className="na-modal-header">
              <div>
                <h2 className="na-modal-title">Excluir serviço</h2>
                <p className="na-modal-sub">{deletingItem.name}</p>
              </div>
              <button className="na-close" onClick={() => setDeleteId(null)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="na-modal-body">
              <p style={{ fontSize: '.86rem', fontWeight: 300, color: 'var(--text-mid)', lineHeight: 1.6 }}>
                Tem certeza que deseja excluir <strong>{deletingItem.name}</strong>?
              </p>
              {deleteError && (
                <p className="na-error" style={{ marginTop: 12 }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {deleteError}
                </p>
              )}
            </div>
            <div className="na-modal-footer">
              <button className="na-cancel" onClick={() => setDeleteId(null)} disabled={deleteSaving}>Cancelar</button>
              <button className="na-save" style={{ background: '#b54a4a' }} onClick={handleDelete} disabled={deleteSaving}>
                {deleteSaving
                  ? <span className="login-spinner" style={{ width: 12, height: 12 }} />
                  : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                }
                {deleteSaving ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAIS: CATEGORIAS ═══ */}

      {/* Criar categoria */}
      {catCreateOpen && (
        <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) setCatCreateOpen(false); }}>
          <div className="na-modal" style={{ maxWidth: 400 }}>
            <div className="na-modal-header">
              <div>
                <h2 className="na-modal-title">Nova categoria</h2>
                <p className="na-modal-sub">Organizar serviços por área</p>
              </div>
              <button className="na-close" onClick={() => setCatCreateOpen(false)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="na-modal-body">
              <div className="na-grid">
                <div className="na-field na-field-full">
                  <label className="na-label">Nome da categoria *</label>
                  <input className="na-input" value={catCreateName} onChange={e => setCatCreateName(e.target.value)} placeholder="Ex: Facial, Corporal, Capilar" autoFocus />
                </div>
                {catCreateError && (
                  <p className="na-error na-field-full">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {catCreateError}
                  </p>
                )}
              </div>
            </div>
            <div className="na-modal-footer">
              <button className="na-cancel" onClick={() => setCatCreateOpen(false)} disabled={catCreateSaving}>Cancelar</button>
              <button className="na-save" onClick={handleCatCreate} disabled={catCreateSaving}>
                {catCreateSaving
                  ? <span className="login-spinner" style={{ width: 12, height: 12 }} />
                  : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                }
                {catCreateSaving ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editar categoria */}
      {catEditId && (
        <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) setCatEditId(null); }}>
          <div className="na-modal" style={{ maxWidth: 400 }}>
            <div className="na-modal-header">
              <div><h2 className="na-modal-title">Editar categoria</h2></div>
              <button className="na-close" onClick={() => setCatEditId(null)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="na-modal-body">
              <div className="na-grid">
                <div className="na-field na-field-full">
                  <label className="na-label">Nome da categoria *</label>
                  <input className="na-input" value={catEditName} onChange={e => setCatEditName(e.target.value)} autoFocus />
                </div>
                {catEditError && (
                  <p className="na-error na-field-full">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {catEditError}
                  </p>
                )}
              </div>
            </div>
            <div className="na-modal-footer">
              <button className="na-cancel" onClick={() => setCatEditId(null)} disabled={catEditSaving}>Cancelar</button>
              <button className="na-save" onClick={handleCatEdit} disabled={catEditSaving}>
                {catEditSaving
                  ? <span className="login-spinner" style={{ width: 12, height: 12 }} />
                  : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                }
                {catEditSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excluir categoria */}
      {catDeleteId && deletingCat && (
        <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) setCatDeleteId(null); }}>
          <div className="na-modal" style={{ maxWidth: 400 }}>
            <div className="na-modal-header">
              <div>
                <h2 className="na-modal-title">Excluir categoria</h2>
                <p className="na-modal-sub">{deletingCat.name}</p>
              </div>
              <button className="na-close" onClick={() => setCatDeleteId(null)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="na-modal-body">
              <p style={{ fontSize: '.86rem', fontWeight: 300, color: 'var(--text-mid)', lineHeight: 1.6 }}>
                Tem certeza que deseja excluir <strong>{deletingCat.name}</strong>? Os serviços desta categoria ficarão sem categoria.
              </p>
              {catDeleteError && (
                <p className="na-error" style={{ marginTop: 12 }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {catDeleteError}
                </p>
              )}
            </div>
            <div className="na-modal-footer">
              <button className="na-cancel" onClick={() => setCatDeleteId(null)} disabled={catDeleteSaving}>Cancelar</button>
              <button className="na-save" style={{ background: '#b54a4a' }} onClick={handleCatDelete} disabled={catDeleteSaving}>
                {catDeleteSaving
                  ? <span className="login-spinner" style={{ width: 12, height: 12 }} />
                  : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                }
                {catDeleteSaving ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
