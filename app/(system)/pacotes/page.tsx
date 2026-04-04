'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { createStaffClient } from '@/lib/supabase/client';
import {
  getPlans, createPlan, updatePlan, deletePlan,
  type PlanData,
} from '@/lib/plans-data';

/* ─── helpers de preço ────────────────────────────────────── */
function fmtPriceInput(val: string): string {
  // Permite apenas dígitos e uma vírgula com no máximo 2 casas decimais
  const digits = val.replace(/[^\d,]/g, '');
  const parts  = digits.split(',');
  const int    = parts[0].slice(0, 7);               // até 9.999.999
  if (parts.length === 1) return int;
  return int + ',' + parts[1].slice(0, 2);           // até 2 casas
}

function parsePriceInput(val: string): number {
  return parseFloat(val.replace(',', '.')) || 0;
}

function priceNumToInput(n: number): string {
  // 599 → "599"   599.9 → "599,9"   599.90 → "599,9"
  return String(n).replace('.', ',');
}

/* ─── FeaturesEditor — fora do componente pai ─────────────── */
function FeaturesEditor({ list, set }: { list: string[]; set: (l: string[]) => void }) {
  return (
    <div className="pacote-features-editor">
      {list.map((feat, idx) => (
        <div key={idx} className="pacote-feature-input-row">
          <input
            className="na-input"
            value={feat}
            onChange={e => { const n = [...list]; n[idx] = e.target.value; set(n); }}
            placeholder={`Benefício ${idx + 1}`}
            maxLength={120}
          />
          {list.length > 1 && (
            <button
              className="staff-delete-btn"
              onClick={() => set(list.filter((_, i) => i !== idx))}
              type="button"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      ))}
      <button className="pacote-add-feature-btn" onClick={() => set([...list, ''])} type="button">
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Adicionar benefício
      </button>
    </div>
  );
}

type PacoteForm = { name: string; priceNum: string; description: string; popular: boolean };

/* ─── PacoteModal — fora do componente pai ────────────────── */
function PacoteModal({
  title, sub, form, setForm, features, setFeatures, error, saving, onSave, onClose,
}: {
  title: string; sub?: string;
  form: PacoteForm; setForm: (f: PacoteForm) => void;
  features: string[]; setFeatures: (l: string[]) => void;
  error: string; saving: boolean;
  onSave: () => void; onClose: () => void;
}) {
  return (
    <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="na-modal" style={{ maxWidth: 520 }}>
        <div className="na-modal-header">
          <div>
            <h2 className="na-modal-title">{title}</h2>
            {sub && <p className="na-modal-sub">{sub}</p>}
          </div>
          <button className="na-close" onClick={onClose}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="na-modal-body">
          <div className="na-grid">
            <div className="na-field">
              <label className="na-label">Nome do pacote *</label>
              <input
                className="na-input"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Premium"
                maxLength={80}
                autoFocus
              />
            </div>
            <div className="na-field">
              <label className="na-label">Preço mensal (R$) *</label>
              <input
                className="na-input"
                type="text"
                inputMode="decimal"
                value={form.priceNum}
                onChange={e => setForm({ ...form, priceNum: fmtPriceInput(e.target.value) })}
                placeholder="599,90"
              />
            </div>
            <div className="na-field na-field-full">
              <label className="na-label">Descrição</label>
              <input
                className="na-input"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Breve descrição do pacote"
                maxLength={200}
              />
            </div>
            <div className="na-field na-field-full">
              <label className="na-label">Benefícios *</label>
              <FeaturesEditor list={features} set={setFeatures} />
            </div>
            <div className="na-field na-field-full">
              <label className="pacote-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.popular}
                  onChange={e => setForm({ ...form, popular: e.target.checked })}
                  className="pacote-checkbox"
                />
                Marcar como mais popular
              </label>
            </div>
            {error && (
              <p className="na-error na-field-full">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </p>
            )}
          </div>
        </div>
        <div className="na-modal-footer">
          <button className="na-cancel" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="na-save" onClick={onSave} disabled={saving}>
            {saving
              ? <span className="login-spinner" style={{ width: 12, height: 12 }} />
              : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            }
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Página principal ─────────────────────────────────────── */
export default function PacotesPage() {
  const { user } = useAdminAuth();
  const [pacotes,  setPacotes]  = useState<PlanData[]>([]);
  const [loading,  setLoading]  = useState(true);
  const staffClient = useMemo(() => createStaffClient(), []);

  const [createOpen,     setCreateOpen]     = useState(false);
  const [createForm,     setCreateForm]     = useState<PacoteForm>({ name: '', priceNum: '', description: '', popular: false });
  const [createFeatures, setCreateFeatures] = useState<string[]>(['']);
  const [createError,    setCreateError]    = useState('');
  const [createSaving,   setCreateSaving]   = useState(false);

  const [editId,       setEditId]       = useState<string | null>(null);
  const [editForm,     setEditForm]     = useState<PacoteForm>({ name: '', priceNum: '', description: '', popular: false });
  const [editFeatures, setEditFeatures] = useState<string[]>(['']);
  const [editError,    setEditError]    = useState('');
  const [editSaving,   setEditSaving]   = useState(false);

  const [deleteId,     setDeleteId]     = useState<string | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleteError,  setDeleteError]  = useState('');

  useEffect(() => {
    getPlans(staffClient).then(data => {
      setPacotes(data);
      setLoading(false);
    });
  }, [staffClient]);

  if (user?.role !== 'admin') {
    return (
      <div className="sys-guard">
        <div className="sys-guard-inner">
          <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" className="sys-guard-icon">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <h2 className="sys-guard-title">Acesso restrito</h2>
          <p className="sys-guard-sub">Esta área é exclusiva para administradoras da clínica.</p>
        </div>
      </div>
    );
  }

  const deletingItem = pacotes.find(p => p.id === deleteId);

  function openCreate() {
    setCreateForm({ name: '', priceNum: '', description: '', popular: false });
    setCreateFeatures(['']);
    setCreateError('');
    setCreateOpen(true);
  }

  async function handleCreate() {
    if (!createForm.name.trim())     { setCreateError('Nome é obrigatório.'); return; }
    const num = parsePriceInput(createForm.priceNum);
    if (!num || num <= 0)             { setCreateError('Preço inválido.'); return; }
    const features = createFeatures.map(f => f.trim()).filter(Boolean);
    if (!features.length)             { setCreateError('Adicione pelo menos um benefício.'); return; }
    setCreateSaving(true);
    const result = await createPlan({
      name: createForm.name.trim(), priceNum: num,
      description: createForm.description.trim(),
      popular: createForm.popular, features,
      sortOrder: pacotes.length,
    });
    setCreateSaving(false);
    if (!result.ok) { setCreateError(result.error ?? 'Erro ao criar.'); return; }
    if (result.plan) {
      setPacotes(prev => [
        ...(result.plan!.popular ? prev.map(p => ({ ...p, popular: false })) : prev),
        result.plan!,
      ]);
    }
    setCreateOpen(false);
  }

  function openEdit(p: PlanData) {
    setEditId(p.id);
    setEditForm({
      name:        p.name,
      priceNum:    priceNumToInput(p.priceNum),
      description: p.description,
      popular:     p.popular,
    });
    setEditFeatures(p.features.length ? [...p.features] : ['']);
    setEditError('');
  }

  async function handleEdit() {
    if (!editId)                    return;
    if (!editForm.name.trim())       { setEditError('Nome é obrigatório.'); return; }
    const num = parsePriceInput(editForm.priceNum);
    if (!num || num <= 0)            { setEditError('Preço inválido.'); return; }
    const features = editFeatures.map(f => f.trim()).filter(Boolean);
    if (!features.length)            { setEditError('Adicione pelo menos um benefício.'); return; }
    setEditSaving(true);
    const result = await updatePlan(editId, {
      name: editForm.name.trim(), priceNum: num,
      description: editForm.description.trim(),
      popular: editForm.popular, features,
    });
    setEditSaving(false);
    if (!result.ok) { setEditError(result.error ?? 'Erro ao salvar.'); return; }
    const fmtPrice = (n: number) =>
      'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setPacotes(prev => prev.map(p => {
      if (p.id === editId) return { ...p, name: editForm.name.trim(), priceNum: num, price: fmtPrice(num), description: editForm.description.trim(), popular: editForm.popular, features };
      return editForm.popular ? { ...p, popular: false } : p;
    }));
    setEditId(null);
  }

  async function togglePopular(p: PlanData) {
    const next = !p.popular;
    setPacotes(prev => prev.map(x => ({ ...x, popular: x.id === p.id ? next : (next ? false : x.popular) })));
    const result = await updatePlan(p.id, { popular: next });
    if (!result.ok) setPacotes(prev => prev.map(x => ({ ...x, popular: x.id === p.id ? p.popular : x.popular })));
  }

  async function toggleActive(p: PlanData) {
    const next = !p.active;
    setPacotes(prev => prev.map(x => x.id === p.id ? { ...x, active: next } : x));
    const result = await updatePlan(p.id, { active: next });
    if (!result.ok) setPacotes(prev => prev.map(x => x.id === p.id ? { ...x, active: p.active } : x));
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteSaving(true); setDeleteError('');
    const result = await deletePlan(deleteId);
    setDeleteSaving(false);
    if (!result.ok) { setDeleteError(result.error ?? 'Erro ao excluir.'); return; }
    setPacotes(prev => prev.filter(p => p.id !== deleteId));
    setDeleteId(null);
  }

  return (
    <div className="admin-section">

      <div className="clientes-header">
        <div>
          <h2 className="admin-section-title">Pacotes</h2>
          <p className="admin-section-sub">
            {loading ? 'Carregando...' : `${pacotes.length} pacote${pacotes.length !== 1 ? 's' : ''} · ${pacotes.filter(p => p.active).length} ativo${pacotes.filter(p => p.active).length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button className="admin-new-btn" onClick={openCreate}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo pacote
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Carregando pacotes...</div>
      ) : pacotes.length === 0 ? (
        <div className="clientes-empty">
          <p>Nenhum pacote cadastrado. Clique em &quot;Novo pacote&quot; para começar.</p>
        </div>
      ) : (
        <div className="pacotes-grid">
          {pacotes.map(p => (
            <div key={p.id} className={`pacote-card${p.popular ? ' popular' : ''}${!p.active ? ' inactive' : ''}`}>
              {p.popular && <span className="pacote-popular-badge">Mais popular</span>}
              <div className="pacote-card-header">
                <h3 className="pacote-name">{p.name}</h3>
                {!p.active && <span className="pacote-inactive-badge">Inativo</span>}
              </div>
              <p className="pacote-price">{p.price}<span className="pacote-price-period">/mês</span></p>
              {p.description && <p className="pacote-desc">{p.description}</p>}
              <ul className="pacote-features">
                {p.features.map((f, i) => (
                  <li key={i} className="pacote-feature-item">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="pacote-actions">
                <button className="staff-edit-btn" onClick={() => openEdit(p)}>Editar</button>
                <button className="staff-edit-btn servico-toggle-btn" data-active={p.popular} onClick={() => togglePopular(p)}>
                  {p.popular ? 'Remover destaque' : 'Destacar'}
                </button>
                <button className="staff-edit-btn servico-toggle-btn" data-active={p.active} onClick={() => toggleActive(p)}>
                  {p.active ? 'Desativar' : 'Ativar'}
                </button>
                <button className="staff-delete-btn" onClick={() => { setDeleteError(''); setDeleteId(p.id); }} title="Excluir">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <PacoteModal
          title="Novo pacote" sub="Disponível para assinatura"
          form={createForm} setForm={setCreateForm}
          features={createFeatures} setFeatures={setCreateFeatures}
          error={createError} saving={createSaving}
          onSave={handleCreate} onClose={() => setCreateOpen(false)}
        />
      )}

      {editId && (
        <PacoteModal
          title="Editar pacote"
          form={editForm} setForm={setEditForm}
          features={editFeatures} setFeatures={setEditFeatures}
          error={editError} saving={editSaving}
          onSave={handleEdit} onClose={() => setEditId(null)}
        />
      )}

      {deleteId && deletingItem && (
        <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div className="na-modal" style={{ maxWidth: 400 }}>
            <div className="na-modal-header">
              <div>
                <h2 className="na-modal-title">Excluir pacote</h2>
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
                Tem certeza que deseja excluir o pacote <strong>{deletingItem.name}</strong>? Os benefícios também serão removidos.
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

    </div>
  );
}
