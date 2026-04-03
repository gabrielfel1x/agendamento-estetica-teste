'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { getClientes, updateCliente, Cliente } from '@/lib/clientes-data';
import { getAllAppointments, AdminAppointment } from '@/lib/admin-data';
import { getStaffProfiles, updateStaffProfile, createStaffUser, StaffProfile } from '@/lib/staff-data';
import { createStaffClient } from '@/lib/supabase/client';

function waLink(phone: string, name: string) {
  const msg = encodeURIComponent(`Olá ${name}! Entrando em contato da Depill Plus.`);
  return `https://wa.me/55${phone.replace(/\D/g, '')}?text=${msg}`;
}

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

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return `${parseInt(d)} ${months[parseInt(m)-1]}. ${y}`;
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

const AVATAR_COLORS = [
  '#0a0a0a','#c9a84c','#333','#b89840','#8a7430',
  '#0a0a0a','#c9a84c','#333','#b89840','#8a7430','#0a0a0a','#c9a84c',
];
const STAFF_COLORS: Record<string, string> = { admin: '#0a0a0a', funcionario: '#b89840' };
const ROLE_LABEL:  Record<string, string> = { admin: 'Admin', funcionario: 'Funcionária' };

export default function ClientesPage() {
  const { user } = useAdminAuth();
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState<'clientes' | 'equipe'>('clientes');

  // ─── Clientes ───
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<Cliente | null>(null);
  const [clientes, setClientes]   = useState<Cliente[]>([]);
  const [allApts, setAllApts]     = useState<AdminAppointment[]>([]);
  const [loading, setLoading]     = useState(true);

  // Edit cliente (inline in panel)
  const [editingCliente, setEditingCliente] = useState(false);
  const [editCForm, setEditCForm]           = useState({ name: '', phone: '', email: '', notes: '' });
  const [editCSaving, setEditCSaving]       = useState(false);
  const [editCError, setEditCError]         = useState('');

  // ─── Staff ───
  const [staff, setStaff]               = useState<StaffProfile[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

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

  const staffClient = useMemo(() => createStaffClient(), []);

  useEffect(() => {
    Promise.all([
      getClientes(staffClient),
      getAllAppointments(staffClient),
    ]).then(([cls, apts]) => {
      setClientes(cls);
      setAllApts(apts);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (tab !== 'equipe' || !isAdmin) return;
    setStaffLoading(true);
    getStaffProfiles(staffClient).then(data => {
      setStaff(data);
      setStaffLoading(false);
    });
  }, [tab, isAdmin]);

  useEffect(() => {
    setEditingCliente(false);
    setEditCError('');
  }, [selected]);

  const statsMap = useMemo(() => {
    const map: Record<string, { total: number; last: string | null }> = {};
    for (const c of clientes) {
      const active = allApts.filter(a => a.phone === c.phone && a.status !== 'cancelado');
      const sorted = [...active].sort((a, b) => b.date.localeCompare(a.date));
      map[c.phone] = { total: active.length, last: sorted[0]?.procedure ?? null };
    }
    return map;
  }, [allApts, clientes]);

  const history = useMemo<AdminAppointment[]>(() => {
    if (!selected) return [];
    return allApts
      .filter(a => a.phone === selected.phone)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [selected, allApts]);

  const filtered = clientes.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  function openEditCliente() {
    if (!selected) return;
    setEditCForm({
      name:  selected.name,
      phone: formatPhone(selected.phone),
      email: selected.email ?? '',
      notes: selected.notes ?? '',
    });
    setEditCError('');
    setEditingCliente(true);
  }

  async function saveCliente() {
    if (!selected) return;
    if (!editCForm.name.trim())  { setEditCError('Nome é obrigatório.'); return; }
    if (!editCForm.phone.trim()) { setEditCError('Telefone é obrigatório.'); return; }
    setEditCSaving(true);
    const cleanPhone = editCForm.phone.replace(/\D/g, '');
    const ok = await updateCliente(selected.id, {
      name:  editCForm.name.trim(),
      phone: cleanPhone,
      email: editCForm.email.trim() || null,
      notes: editCForm.notes.trim() || null,
    }, staffClient);
    setEditCSaving(false);
    if (!ok) { setEditCError('Erro ao salvar. Tente novamente.'); return; }
    const updated: Cliente = { ...selected, name: editCForm.name.trim(), phone: cleanPhone, email: editCForm.email.trim() || null, notes: editCForm.notes.trim() || null };
    setClientes(prev => prev.map(c => c.id === selected.id ? updated : c));
    setSelected(updated);
    setEditingCliente(false);
  }

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

  return (
    <div className="admin-section clientes-page">
      {/* ── Header ── */}
      <div className="clientes-header">
        <div>
          <h2 className="admin-section-title">{tab === 'clientes' ? 'Clientes' : 'Equipe'}</h2>
          <p className="admin-section-sub">
            {tab === 'clientes' ? `${clientes.length} clientes cadastrados` : `${staff.length} funcionárias`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {tab === 'clientes' && (
            <div className="clientes-search-wrap">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="clientes-search-icon">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="clientes-search"
                placeholder="Buscar por nome ou telefone…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}
          {tab === 'equipe' && isAdmin && (
            <button className="admin-new-btn" onClick={() => { setCreateError(''); setCreateSuccess(''); setCreateOpen(true); }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nova funcionária
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs (admin only) ── */}
      {isAdmin && (
        <div className="admin-tabs">
          <button className={`admin-tab-btn${tab === 'clientes' ? ' active' : ''}`} onClick={() => { setTab('clientes'); setSelected(null); }}>
            Clientes
          </button>
          <button className={`admin-tab-btn${tab === 'equipe' ? ' active' : ''}`} onClick={() => setTab('equipe')}>
            Equipe
          </button>
        </div>
      )}

      {/* ══ CLIENTES TAB ══ */}
      {tab === 'clientes' && (
        loading ? (
          <div className="admin-loading">Carregando clientes...</div>
        ) : (
          <div className={`clientes-layout${selected ? ' has-panel' : ''}`}>
            {/* Cards */}
            <div className="clientes-grid">
              {filtered.map((c, i) => {
                const stats = statsMap[c.phone] ?? { total: 0, last: null };
                const isSelected = selected?.id === c.id;
                return (
                  <button
                    key={c.id}
                    className={`cliente-card${isSelected ? ' selected' : ''}`}
                    onClick={() => setSelected(prev => prev?.id === c.id ? null : c)}
                  >
                    <div className="cliente-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                      {getInitials(c.name)}
                    </div>
                    <div className="cliente-card-info">
                      <p className="cliente-name">{c.name}</p>
                      <p className="cliente-phone">{formatPhone(c.phone)}</p>
                      {stats.last && <p className="cliente-last">{stats.last}</p>}
                    </div>
                    <div className="cliente-card-stats">
                      <span className="cliente-stat-n">{stats.total}</span>
                      <span className="cliente-stat-l">visitas</span>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="clientes-empty"><p>Nenhum cliente encontrado.</p></div>
              )}
            </div>

            {/* Detail / Edit panel */}
            {selected && (
              <div className="cliente-panel">
                {editingCliente ? (
                  /* ── Edit mode ── */
                  <>
                    <div className="cliente-panel-header">
                      <div className="cliente-panel-avatar" style={{ background: AVATAR_COLORS[clientes.indexOf(selected) % AVATAR_COLORS.length] }}>
                        {getInitials(selected.name)}
                      </div>
                      <div>
                        <h3 className="cliente-panel-name">Editar cliente</h3>
                        <p className="cliente-panel-since">{selected.name}</p>
                      </div>
                      <button className="cliente-panel-close" style={{ marginLeft: 'auto' }} onClick={() => setEditingCliente(false)}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    <div className="cliente-edit-form">
                      <div className="na-field">
                        <label className="na-label">Nome *</label>
                        <input className="na-input" value={editCForm.name} onChange={e => setEditCForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome completo" />
                      </div>
                      <div className="na-field">
                        <label className="na-label">Telefone *</label>
                        <input className="na-input" value={editCForm.phone} onChange={e => setEditCForm(f => ({ ...f, phone: maskPhone(e.target.value) }))} inputMode="numeric" />
                      </div>
                      <div className="na-field">
                        <label className="na-label">E-mail</label>
                        <input className="na-input" type="email" value={editCForm.email} onChange={e => setEditCForm(f => ({ ...f, email: e.target.value }))} />
                      </div>
                      <div className="na-field">
                        <label className="na-label">Observações</label>
                        <textarea className="na-textarea" rows={2} value={editCForm.notes} onChange={e => setEditCForm(f => ({ ...f, notes: e.target.value }))} />
                      </div>
                      {editCError && (
                        <p className="na-error">
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          {editCError}
                        </p>
                      )}
                      <div className="cliente-edit-actions">
                        <button className="cliente-edit-cancel" onClick={() => setEditingCliente(false)} disabled={editCSaving}>Cancelar</button>
                        <button className="cliente-edit-save" onClick={saveCliente} disabled={editCSaving}>
                          {editCSaving
                            ? <span className="login-spinner" style={{ width: 12, height: 12 }} />
                            : <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                          }
                          {editCSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── View mode ── */
                  <>
                    <div className="cliente-panel-header">
                      <div className="cliente-panel-avatar" style={{ background: AVATAR_COLORS[clientes.indexOf(selected) % AVATAR_COLORS.length] }}>
                        {getInitials(selected.name)}
                      </div>
                      <div>
                        <h3 className="cliente-panel-name">{selected.name}</h3>
                        <p className="cliente-panel-since">cliente desde {formatDate(selected.since)}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                        {isAdmin && (
                          <button className="cliente-panel-edit" onClick={openEditCliente} title="Editar cliente">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        )}
                        <button className="cliente-panel-close" onClick={() => setSelected(null)}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="cliente-panel-contact">
                      <a href={`tel:+55${selected.phone}`} className="cliente-contact-item">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1.18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.09-1.09a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                        </svg>
                        {formatPhone(selected.phone)}
                      </a>
                      {selected.email && (
                        <a href={`mailto:${selected.email}`} className="cliente-contact-item">
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                          {selected.email}
                        </a>
                      )}
                      <a href={waLink(selected.phone, selected.name)} target="_blank" rel="noopener noreferrer" className="cliente-wa-btn">
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Falar no WhatsApp
                      </a>
                    </div>
                    <div className="cliente-panel-history">
                      <h4 className="cliente-panel-history-title">Histórico de agendamentos</h4>
                      {history.length === 0 ? (
                        <p className="cliente-history-empty">Nenhum agendamento encontrado.</p>
                      ) : (
                        <div className="cliente-history-list">
                          {history.map(a => (
                            <div key={a.id} className="cliente-history-row">
                              <div className="cliente-history-date">{formatDate(a.date)}</div>
                              <div className="cliente-history-info">
                                <p className="cliente-history-proc">{a.procedure}</p>
                                <p className="cliente-history-time">{a.time}</p>
                              </div>
                              <div className="cliente-history-right">
                                <span className="cliente-history-price">{a.price}</span>
                                <span className={`admin-day-badge ${a.status}`}>{a.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )
      )}

      {/* ══ EQUIPE TAB ══ */}
      {tab === 'equipe' && isAdmin && (
        staffLoading ? (
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
                  <button className="staff-edit-btn" onClick={() => openEditStaff(s)}>Editar</button>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ══ MODAL: Edit Staff ══ */}
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

      {/* ══ MODAL: Create Staff ══ */}
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
    </div>
  );
}
