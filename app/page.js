'use client'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    nama_lengkap: '', no_ktp: '', no_kk: '',
    pembayaran: 'cash', nama_motor: '',
    serial_produk: '', status_leasing: 'processed'
  })

  useEffect(() => { fetchCustomers() }, [])

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
    setCustomers(data || [])
  }

  async function handleSubmit() {
    if (editingId) {
      await supabase.from('customers').update(form).eq('id', editingId)
      setEditingId(null)
    } else {
      await supabase.from('customers').insert([form])
    }
    setForm({ nama_lengkap: '', no_ktp: '', no_kk: '', pembayaran: 'cash', nama_motor: '', serial_produk: '', status_leasing: 'processed' })
    setShowForm(false)
    fetchCustomers()
  }

  function handleEdit(c) {
    setForm({ nama_lengkap: c.nama_lengkap, no_ktp: c.no_ktp, no_kk: c.no_kk, pembayaran: c.pembayaran, nama_motor: c.nama_motor, serial_produk: c.serial_produk, status_leasing: c.status_leasing })
    setEditingId(c.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    if (!confirm('Delete this customer?')) return
    await supabase.from('customers').delete().eq('id', id)
    fetchCustomers()
  }

  const statusBadge = (s) => ({
    acc:       { bg: '#dcfce7', color: '#16a34a', label: 'ACC' },
    reject:    { bg: '#fee2e2', color: '#dc2626', label: 'Reject' },
    processed: { bg: '#fef9c3', color: '#ca8a04', label: 'Processed' },
  })[s]

  const fields = [
    ['nama_lengkap', 'Nama Lengkap', 'span 2'],
    ['no_ktp', 'No. KTP', 'span 1'],
    ['no_kk', 'No. KK', 'span 1'],
    ['nama_motor', 'Nama Motor', 'span 1'],
    ['serial_produk', 'Serial Produk', 'span 1'],
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #f5f5f7; font-family: 'Geist', sans-serif; color: #111; min-height: 100vh; }
        .mono { font-family: 'Geist Mono', monospace; }
        input, select {
          outline: none;
          background: #fff;
          border: 1px solid #e4e4e7;
          color: #111;
          border-radius: 8px;
          padding: 9px 12px;
          width: 100%;
          font-size: 13px;
          font-family: 'Geist', sans-serif;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        input::placeholder { color: #a1a1aa; }
        input:focus, select:focus { border-color: #111; box-shadow: 0 0 0 3px rgba(0,0,0,0.06); }
        select option { background: #fff; color: #111; }
        button { cursor: pointer; font-family: 'Geist', sans-serif; }
        label { font-size: 11px; font-weight: 500; color: #71717a; text-transform: uppercase; letter-spacing: 0.07em; display: block; margin-bottom: 5px; }
      `}</style>

      <main style={{ maxWidth: 700, margin: '0 auto', padding: '36px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626' }} />
              <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Honda Sinar Karya - Team Eep</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>Customer Records</h1>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ nama_lengkap: '', no_ktp: '', no_kk: '', pembayaran: 'cash', nama_motor: '', serial_produk: '', status_leasing: 'processed' }) }}
            style={{ background: showForm ? '#f4f4f5' : '#111', color: showForm ? '#71717a' : '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
            {showForm ? '✕ Cancel' : '+ New Customer'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Total', value: customers.length, color: '#111' },
            { label: 'Processed', value: customers.filter(c => c.status_leasing === 'processed').length, color: '#ca8a04' },
            { label: 'ACC', value: customers.filter(c => c.status_leasing === 'acc').length, color: '#16a34a' },
            { label: 'Reject', value: customers.filter(c => c.status_leasing === 'reject').length, color: '#dc2626' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, color: '#a1a1aa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#111', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {editingId ? '✏️ Edit Customer' : '➕ New Customer'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {fields.map(([key, lbl, col]) => (
                <div key={key} style={{ gridColumn: col }}>
                  <label>{lbl}</label>
                  <input placeholder={lbl} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label>Pembayaran</label>
                <select value={form.pembayaran} onChange={e => setForm({ ...form, pembayaran: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div>
                <label>Status Leasing</label>
                <select value={form.status_leasing} onChange={e => setForm({ ...form, status_leasing: e.target.value })}>
                  <option value="processed">Processed</option>
                  <option value="acc">ACC</option>
                  <option value="reject">Reject</option>
                </select>
              </div>
            </div>
            <button onClick={handleSubmit}
              style={{ marginTop: 14, width: '100%', background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
              {editingId ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        )}

        {/* Customer List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {customers.length === 0 && (
            <div style={{ textAlign: 'center', color: '#d4d4d8', padding: '48px 0', fontSize: 13 }}>No customers yet</div>
          )}
          {customers.map(c => {
            const badge = statusBadge(c.status_leasing)
            return (
              <div key={c.id} style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#111', letterSpacing: '-0.01em' }}>{c.nama_lengkap}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: badge.bg, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: '#f4f4f5', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {c.pembayaran}
                    </span>
                  </div>
                </div>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 16px', marginBottom: 12 }}>
                  {[
                    ['KTP', c.no_ktp],
                    ['KK', c.no_kk],
                    ['Motor', c.nama_motor],
                    ['Serial', c.serial_produk],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                      <span style={{ fontSize: 10, color: '#a1a1aa', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 36 }}>{lbl}</span>
                      <span style={{ fontSize: 12, color: '#3f3f46', fontFamily: 'Geist Mono, monospace' }}>{val || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, borderTop: '1px solid #f4f4f5', paddingTop: 10 }}>
                  <button onClick={() => handleEdit(c)}
                    style={{ flex: 1, background: '#f4f4f5', color: '#111', border: 'none', borderRadius: 7, padding: '7px', fontSize: 12, fontWeight: 500 }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    style={{ flex: 1, background: '#fff0f0', color: '#dc2626', border: 'none', borderRadius: 7, padding: '7px', fontSize: 12, fontWeight: 500 }}>
                    🗑️ Delete
                  </button>
                </div>

              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}