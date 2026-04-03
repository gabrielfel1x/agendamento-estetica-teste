'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { getStaffProfiles, updateStaffProfile, deleteStaffProfile, createStaffUser, StaffProfile } from '@/lib/staff-data';
import { createStaffClient } from '@/lib/supabase/client';

function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, '');
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2)  return `(${d}`;
  if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

const STAFF_COLORS: Record<string, string> = { admin: '#0a0a0a', funcionario: '#b89840' };
const ROLE_LABEL:   Record<string, string> = { admin: 'Admin', funcionario: 'Funcionária' };

export default function EquipePage() {
  const { user } = useAdminAuth();
  const isAdmin = user?.role === 'admin';

  const [staff, setStaff]               = useState<StaffProfile[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);

  // Edit staff modal
  const [editingStaff, setEditingStaff] = useState<StaffProfile | null>(null);
  const [editSForm, setEditSForm]       = useState({ name: '', phone: '' });
  const [editSSaving, setEditSSaving]   = useState(false);
  const [editSError, setEditSError]     = useState('');

  // Create staff modal
  const [createOpen, setCreateOpen]       = useState(false);
  const [createForm, setCreateForm]       = useState({ email: '', password: '', confirmPassword: '', name: '', phone: '', role: 'funcionario' as 'admin' | 'funcionario' });
  const [createSaving, setCreateSaving]   = useState(false);
  const [createError, setCreateError]     = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Confirm-delete state
  const [confirmDeleteStaff, setConfirmDeleteStaff] = useState<StaffProfile | null>(null);
  const [deletingStaff, setDeletingStaff]           = useState(false);
  const [deleteStaffError, setDeleteStaffError]     = useState('');

  const staffClient = useMemo(() => createStaffClient(), []);

  useEffect(() => {
    setStaffLoading(true);
    getStaffProfiles(staffClient).then(data => {
      setStaff(data);
      setStaffLoading(false);
    });
  }, []);

  function openEditStaff(s: StaffProfile) {
    setEditingStaff(s);
    setEditSForm({ name: s.name, phone: s.phone ? formatPhone(s.phone) : '' });
    setEditSError('');
  }

  async function saveStaff() {
    if (!editingStaff) return;
    if (!editSForm.name.trim()) { setEditSError('Nome é obrigatório.'); return; }
    setEditSSaving(true);
    const cleanPhone = editSForm.phone.replace(/\D/g, '') || null;
    const ok = await updateStaffProfile(editingStaff.id, { name: editSForm.name.trim(), phone: cleanPhone }, staffClient);
    setEditSSaving(false);
    if (!ok) { setEditSError('Erro ao salvar. Tente novamente.'); return; }
    setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, name: editSForm.name.trim(), phone: cleanPhone } : s));
    setEditingStaff(null);
  }

  async function handleCreateStaff() {
    if (!createForm.name.trim())        { setCreateError('Nome é obrigatório.'); return; }
    if (!createForm.email.trim())       { setCreateError('E-mail é obrigatório.'); return; }
    if (createForm.password.length < 6) { setCreateError('Senha deve ter pelo menos 6 caracteres.'); return; }
    if (createForm.password !== createForm.confirmPassword) { setCreateError('Senhas não coincidem.'); return; }
    setCreateSaving(true);
    setCreateError('');
    const result = await createStaffUser(
      createForm.email.trim(), createForm.password,
      createForm.name.trim(), createForm.phone.replace(/\D/g, '') || null,
      createForm.role, staffClient,
    );
    setCreateSaving(false);
    if (!result.ok) { setCreateError(result.error ?? 'Erro ao criar funcionária.'); return; }
    setCreateSuccess(`${createForm.name} criada com sucesso!`);
    if (result.profile) setStaff(prev => [...prev, result.profile!].sort((a, b) => a.name.localeCompare(b.name)));
    setCreateForm({ email: '', password: '', confirmPassword: '', name: '', phone: '', role: 'funcionario' });
    setTimeout(() => { setCreateSuccess(''); setCreateOpen(false); }, 2500);
  }

  async function handleDeleteStaff() {
    if (!confirmDeleteStaff) return;
    setDeletingStaff(true);
    setDeleteStaffError('');
    const result = await deleteStaffProfile(confirmDeleteStaff.id, staffClient);
    setDeletingStaff(false);
    if (!result.ok) { setDeleteStaffError(result.error ?? 'Erro ao excluir.'); return; }
    setStaff(prev => prev.filter(s => s.id !== confirmDeleteStaff.id));
    setConfirmDeleteStaff(null);
  }

  if (!isAdmin) {
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

  return (
    <div className="admin-section clientes-page">
      {/* Header */}
      <div className="clientes-header">
        <div>
          <h2 className="admin-section-title">Equipe</h2>
          <p className="admin-section-sub">{staff.length} funcionária{staff.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="admin-new-btn" onClick={() => { setCreateError(''); setCreateSuccess(''); setCreateOpen(true); }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova funcionária
        </button>
      </div>

      {/* Staff list */}
      {staffLoading ? (
        <div className="admin-loading">Carregando equipe...</div>
      ) : staff.length === 0 ? (
        <div className="clientes-empty"><p>Nenhuma funcionária cadastrada.</p></div>
      ) : (
        <div className="staff-list">
          {staff.map(s => (
            <div key={s.id} className="staff-row">
              <div className="staff-avatar" style={{ background: STAFF_COLORS[s.role] ?? '#0a0a0a' }}>
                {getInitials(s.name)}
              </div>
              <div className="staff-info">
                <p className="staff-name">{s.name}</p>
                {s.phone && <p className="staff-phone">{formatPhone(s.phone)}</p>}
              </div>
              <span className={`staff-role-badge ${s.role}`}>{ROLE_LABEL[s.role] ?? s.role}</span>
              {s.id !== user?.id && (
                <>
                  <button className="staff-edit-btn" onClick={() => openEditStaff(s)}>Editar</button>
                  <button className="staff-delete-btn" onClick={() => { setDeleteStaffError(''); setConfirmDeleteStaff(s); }} title="Excluir">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Edit Staff */}
      {editingStaff && (
        <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) setEditingStaff(null); }}>
          <div className="na-modal" style={{ maxWidth: 440 }}>
            <div className="na-modal-header">
              <div>
                <h2 className="na-modal-title">Editar funcionária</h2>
                <p className="na-modal-sub">{editingStaff.name}</p>
              </div>
              <button className="na-close" onClick={() => setEditingStaff(null)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="na-modal-body">
              <div className="na-grid">
                <div className="na-field na-field-full">
                  <label className="na-label">Nome *</label>
                  <input className="na-input" value={editSForm.name} onChange={e => setEditSForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome completo" />
                </div>
                <div className="na-field na-field-full">
                  <label className="na-label">Telefone</label>
                  <input className="na-input" value={editSForm.phone} onChange={e => setEditSForm(f => ({ ...f, phone: maskPhone(e.target.value) }))} placeholder="(11) 99999-9999" inputMode="numeric" />
                </div>
                {editSError && (
                  <p className="na-error na-field-full">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {editSError}
                  </p>
                )}
              </div>
            </div>
            <div className="na-modal-footer">
              <button className="na-cancel" onClick={() => setEditingStaff(null)} disabled={editSSaving}>Cancelar</button>
              <button className="na-save" onClick={saveStaff} disabled={editSSaving}>
                {editSSaving
                  ? <span className="login-spinner" style={{ width: 12, height: 12 }} />
                  : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                }
                {editSSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Staff */}
      {createOpen && (
        <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) setCreateOpen(false); }}>
          <div className="na-modal" style={{ maxWidth: 480 }}>
            <div className="na-modal-header">
              <div>
                <h2 className="na-modal-title">Nova funcionária</h2>
                <p className="na-modal-sub">Criar acesso ao sistema</p>
              </div>
              <button className="na-close" onClick={() => setCreateOpen(false)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="na-modal-body">
              {createSuccess ? (
                <div className="cd-toast" style={{ margin: '8px 0' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {createSuccess}
                </div>
              ) : (
                <div className="na-grid">
                  <div className="na-field na-field-full">
                    <label className="na-label">Nome completo *</label>
                    <input className="na-input" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Ana Paula" />
                  </div>
                  <div className="na-field na-field-full">
                    <label className="na-label">E-mail *</label>
                    <input className="na-input" type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} placeholder="funcionaria@email.com" />
                  </div>
                  <div className="na-field">
                    <label className="na-label">Telefone</label>
                    <input className="na-input" value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: maskPhone(e.target.value) }))} placeholder="(11) 99999-9999" inputMode="numeric" />
                  </div>
                  <div className="na-field">
                    <label className="na-label">Função</label>
                    <div className="na-select-wrap">
                      <select className="na-select" value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value as 'admin' | 'funcionario' }))}>
                        <option value="funcionario">Funcionária</option>
                        <option value="admin">Administradora</option>
                      </select>
                    </div>
                  </div>
                  <div className="na-field">
                    <label className="na-label">Senha *</label>
                    <input className="na-input" type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} placeholder="Mínimo 6 caracteres" />
                  </div>
                  <div className="na-field">
                    <label className="na-label">Confirmar senha *</label>
                    <input className="na-input" type="password" value={createForm.confirmPassword} onChange={e => setCreateForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repita a senha" />
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
              )}
            </div>
            {!createSuccess && (
              <div className="na-modal-footer">
                <button className="na-cancel" onClick={() => setCreateOpen(false)} disabled={createSaving}>Cancelar</button>
                <button className="na-save" onClick={handleCreateStaff} disabled={createSaving}>
                  {createSaving
                    ? <span className="login-spinner" style={{ width: 12, height: 12 }} />
                    : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  }
                  {createSaving ? 'Criando...' : 'Criar funcionária'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Confirm Delete Staff */}
      {confirmDeleteStaff && (
        <div className="na-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmDeleteStaff(null); }}>
          <div className="na-modal" style={{ maxWidth: 400 }}>
            <div className="na-modal-header">
              <div>
                <h2 className="na-modal-title">Excluir funcionária</h2>
                <p className="na-modal-sub">{confirmDeleteStaff.name}</p>
              </div>
              <button className="na-close" onClick={() => setConfirmDeleteStaff(null)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="na-modal-body">
              <p style={{ fontSize: '.86rem', fontWeight: 300, color: 'var(--text-mid)', lineHeight: 1.6 }}>
                Tem certeza que deseja excluir <strong>{confirmDeleteStaff.name}</strong>? O acesso ao sistema será removido.
              </p>
              {deleteStaffError && (
                <p className="na-error" style={{ marginTop: 12 }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {deleteStaffError}
                </p>
              )}
            </div>
            <div className="na-modal-footer">
              <button className="na-cancel" onClick={() => setConfirmDeleteStaff(null)} disabled={deletingStaff}>Cancelar</button>
              <button className="na-save" style={{ background: '#b54a4a' }} onClick={handleDeleteStaff} disabled={deletingStaff}>
                {deletingStaff
                  ? <span className="login-spinner" style={{ width: 12, height: 12 }} />
                  : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                }
                {deletingStaff ? 'Excluindo...' : 'Confirmar exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
