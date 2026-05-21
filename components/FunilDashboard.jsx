import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Edit2, Trash2 } from 'lucide-react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STATUSES = [
  { id: 'assinado', label: '✅ Assinado', color: '#16a34a' },
  { id: 'fechamento', label: '🟡 Fechamento', color: '#ca8a04' },
  { id: 'franqueado', label: '🤝 Franqueado', color: '#2563eb' },
  { id: 'conversando', label: '💬 Conversando', color: '#9333ea' },
  { id: 'follow', label: '📞 Follow', color: '#dc2626' },
  { id: 'decreto', label: '📍 Decreto', color: '#ea580c' }
];

export default function FunilDashboard() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadDeals();
    const subscription = supabase
      .channel('deals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => {
        loadDeals();
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const loadDeals = async () => {
    const { data, error } = await supabase.from('deals').select('*').order('status');
    if (!error) setDeals(data || []);
    setLoading(false);
  };

  const filteredDeals = deals.filter(d =>
    (d.empresa + ' ' + d.local + ' ' + (d.contato || '')).toLowerCase().includes(search.toLowerCase())
  );

  const stats = STATUSES.map(status => {
    const items = filteredDeals.filter(d => d.status === status.id);
    const mrr = items.reduce((a, d) => a + (d.mrr || 0), 0);
    const escolas = items.reduce((a, d) => a + (d.escolas || d.escolas_municipais || 0), 0);
    return { ...status, count: items.length, mrr, escolas };
  });

  const handleEdit = (deal) => {
    setEditingId(deal.id);
    setEditData({ ...deal });
  };

  const handleSave = async () => {
    if (!editingId) return;
    const { error } = await supabase
      .from('deals')
      .update(editData)
      .eq('id', editingId);
    if (!error) {
      setEditingId(null);
      loadDeals();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (!error) loadDeals();
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from('deals')
      .update({ status: newStatus })
      .eq('id', id);
    if (!error) loadDeals();
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-white">🎯 FUNIL BIOMOVEMENT</h1>
          <input
            type="text"
            placeholder="Buscar empresa, município ou contato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map(stat => (
            <div key={stat.id} className="bg-slate-800 rounded-lg p-4 border-l-4" style={{ borderColor: stat.color }}>
              <div className="text-xs text-slate-400 mb-2 uppercase">{stat.label}</div>
              <div className="text-2xl font-bold mb-1">{stat.count}</div>
              <div className="text-xs text-slate-400">
                {stat.escolas > 0 ? `${stat.escolas.toLocaleString()} esc` : '–'}
                {stat.mrr > 0 ? ` | R$ ${(stat.mrr / 1000).toFixed(1)}k` : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Grid de Deal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map(deal => {
            const isEditing = editingId === deal.id;
            const status = STATUSES.find(s => s.id === deal.status);

            return (
              <div key={deal.id} className="bg-slate-800 rounded-lg p-4 border-l-4" style={{ borderColor: status?.color }}>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editData.empresa}
                      onChange={(e) => setEditData({ ...editData, empresa: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-700 rounded text-sm text-white"
                      placeholder="Empresa"
                    />
                    <input
                      type="text"
                      value={editData.local}
                      onChange={(e) => setEditData({ ...editData, local: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-700 rounded text-sm text-white"
                      placeholder="Local"
                    />
                    <input
                      type="number"
                      value={editData.escolas || 0}
                      onChange={(e) => setEditData({ ...editData, escolas: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 bg-slate-700 rounded text-sm text-white"
                      placeholder="Escolas"
                    />
                    <input
                      type="number"
                      value={editData.mrr || 0}
                      onChange={(e) => setEditData({ ...editData, mrr: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 bg-slate-700 rounded text-sm text-white"
                      placeholder="MRR"
                    />
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-700 rounded text-sm text-white"
                    >
                      {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="flex-1 bg-green-600 px-3 py-1 rounded text-sm font-bold">Salvar</button>
                      <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-700 px-3 py-1 rounded text-sm">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-bold text-sm mb-1">{deal.empresa}</div>
                    <div className="text-xs text-slate-400 mb-2">{deal.local}</div>

                    {deal.escolas_municipais ? (
                      <div className="text-sm text-blue-400 font-bold mb-1">🏫 {deal.escolas_municipais.toLocaleString()} escolas</div>
                    ) : null}

                    {deal.escolas && deal.escolas > 0 ? (
                      <div className="text-sm text-green-400 font-bold mb-1">{deal.escolas} escolas</div>
                    ) : null}

                    {deal.mrr && deal.mrr > 0 ? (
                      <div className="text-sm text-green-400 mb-1">R$ {deal.mrr.toLocaleString()}/mês</div>
                    ) : null}

                    {deal.contato ? (
                      <div className="text-xs text-slate-400 mb-2">{deal.contato}</div>
                    ) : null}

                    {deal.acao ? (
                      <div className="text-xs bg-purple-900 text-purple-200 inline-block px-2 py-1 rounded mb-3">→ {deal.acao}</div>
                    ) : null}

                    <select
                      value={deal.status}
                      onChange={(e) => handleStatusChange(deal.id, e.target.value)}
                      className="w-full mb-2 px-2 py-1 bg-slate-700 rounded text-xs text-white"
                    >
                      {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>

                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(deal)} className="flex-1 bg-blue-600 text-xs py-1 rounded flex items-center justify-center gap-1">
                        <Edit2 size={14} /> Editar
                      </button>
                      <button onClick={() => handleDelete(deal.id)} className="flex-1 bg-red-600 text-xs py-1 rounded flex items-center justify-center gap-1">
                        <Trash2 size={14} /> Deletar
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        button { cursor: pointer; font-family: inherit; border: none; }
        input, select { font-family: inherit; }
      `}</style>
    </div>
  );
}
