'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, DollarSign, Trash2, TrendingUp, Edit2, X, Wallet, Users, User, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Gasto = {
  id: string
  categoria: string
  monto: number
  descripcion: string
  fecha: string
  tipo: string
  esItinerario?: boolean
}

const categorias = [
  { value: 'transporte', label: 'Transporte', color: 'bg-blue-500', icon: '✈️' },
  { value: 'alojamiento', label: 'Alojamiento', color: 'bg-purple-500', icon: '🏨' },
  { value: 'comida', label: 'Comida', color: 'bg-green-500', icon: '🍱' },
  { value: 'actividades', label: 'Actividades', color: 'bg-orange-500', icon: '🏄' },
  { value: 'compras', label: 'Compras', color: 'bg-pink-500', icon: '🛍️' },
  { value: 'otro', label: 'Otro', color: 'bg-gray-500', icon: '🏷️' },
]

export default function PresupuestoPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [subTab, setSubTab] = useState<'personal' | 'grupal'>('personal')
  const [numPersonas, setNumPersonas] = useState(4)
  const [presupuestoTotal] = useState(3000000)

  const [formData, setFormData] = useState({
    categoria: 'otro',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    cargarGastos()
  }, [])

  const cargarGastos = async () => {
    try {
      // Cargar gastos manuales
      const { data: gastosData, error: gastosError } = await supabase
        .from('gastos')
        .select('*')
        .order('fecha', { ascending: false })

      if (gastosError) throw gastosError

      // Cargar items del itinerario con precio
      const { data: itinerarioData, error: itinerarioError } = await supabase
        .from('itinerario')
        .select('*')
        .gt('precio', 0)

      if (itinerarioError) throw itinerarioError

      // Mapear items del itinerario a formato Gasto
      const gastosItinerario: Gasto[] = (itinerarioData || []).map(item => {
        let categoria = 'actividades'
        const titulo = item.titulo.toLowerCase()
        const desc = (item.descripcion || '').toLowerCase()

        if (titulo.includes('vuelo') || titulo.includes('traslado') || titulo.includes('bus') || titulo.includes('taxi') || titulo.includes('transporte')) {
          categoria = 'transporte'
        } else if (titulo.includes('hotel') || titulo.includes('alojamiento') || titulo.includes('reserva') || desc.includes('hotel')) {
          categoria = 'alojamiento'
        } else if (titulo.includes('cena') || titulo.includes('almuerzo') || titulo.includes('desayuno') || titulo.includes('comida') || titulo.includes('restaurante')) {
          categoria = 'comida'
        } else if (titulo.includes('souvenir') || titulo.includes('compras') || titulo.includes('regalo')) {
          categoria = 'compras'
        }

        return {
          id: item.id,
          categoria,
          monto: item.precio,
          descripcion: item.titulo,
          fecha: item.fecha,
          tipo: 'personal', // Siempre personal por ahora
          esItinerario: true
        }
      })

      // Combinar y ordenar
      const todosLosGastos = [...(gastosData || []), ...gastosItinerario]
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

      setGastos(todosLosGastos)
    } catch (error) {
      console.error('Error cargando datos financieros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEdit = (gasto: Gasto) => {
    setFormData({
      categoria: gasto.categoria || 'otro',
      monto: gasto.monto.toString(),
      descripcion: gasto.descripcion || '',
      fecha: gasto.fecha
    })
    setEditingId(gasto.id)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      categoria: 'otro',
      monto: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        monto: parseFloat(formData.monto),
        tipo: subTab
      }

      if (editingId) {
        const { error } = await supabase
          .from('gastos')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('gastos')
          .insert([payload])
        if (error) throw error
      }

      handleCloseForm()
      cargarGastos()
    } catch (error) {
      console.error('Error guardando gasto:', error)
      alert('Error al guardar el gasto. Verifica tu conexión.')
    }
  }

  const eliminarGasto = async (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return

    try {
      const { error } = await supabase
        .from('gastos')
        .delete()
        .eq('id', id)

      if (error) throw error
      cargarGastos()
    } catch (error) {
      console.error('Error eliminando gasto:', error)
    }
  }

  const gastosFiltrados = gastos.filter(g => (g.tipo || 'personal') === subTab)
  const totalGastado = gastosFiltrados.reduce((sum, gasto) => sum + gasto.monto, 0)
  const porcentajeGastado = (totalGastado / presupuestoTotal) * 100
  const disponible = presupuestoTotal - totalGastado

  const gastosPorCategoria = categorias.map(cat => ({
    ...cat,
    total: gastosFiltrados
      .filter(g => g.categoria === cat.value)
      .reduce((sum, g) => sum + g.monto, 0)
  }))

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor)
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-coral-400 to-coral-600 pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet size={120} />
        </div>

        <Link href="/" className="inline-flex items-center text-white mb-6 hover:text-coral-100 transition-colors relative z-10">
          <ArrowLeft size={20} className="mr-2" />
          Inicio
        </Link>

        <div className="relative z-10">
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            Presupuesto
          </h1>
          <p className="text-coral-100 font-body">
            {subTab === 'personal' ? 'Tus gastos individuales' : 'Gastos compartidos del grupo'}
          </p>
        </div>
      </div>

      {/* Modal Formulario (Fuera del z-index container) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-bold text-coral-800">
                {editingId ? 'Editar Gasto' : `Nuevo Gasto ${subTab === 'personal' ? 'Personal' : 'Grupal'}`}
              </h2>
              <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-coral-500 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-coral-50 border-2 border-transparent focus:border-coral-400 focus:bg-white focus:outline-none transition-all"
                  >
                    {categorias.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-coral-500 uppercase tracking-wider mb-1">
                    Monto {subTab === 'grupal' ? 'Total' : '(COP)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    placeholder="50000"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-coral-50 border-2 border-transparent focus:border-coral-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-coral-500 uppercase tracking-wider mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  required
                  placeholder={subTab === 'personal' ? "Ej: Regalo para mi" : "Ej: Cena para todos"}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-coral-50 border-2 border-transparent focus:border-coral-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-coral-500 uppercase tracking-wider mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-coral-50 border-2 border-transparent focus:border-coral-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="pt-4 flex flex-col gap-3 pb-12">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-coral-500 to-coral-600 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
                >
                  {editingId ? 'Actualizar Gasto' : 'Guardar Gasto'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="px-6 -mt-16 max-w-4xl mx-auto relative z-20">
        {/* Selector de Sub-pestañas */}
        <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-2xl mb-6 flex gap-1 border border-white/30">
          <button
            onClick={() => setSubTab('personal')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${subTab === 'personal' ? 'bg-white text-coral-600 shadow-lg' : 'text-white hover:bg-white/10'
              }`}
          >
            <User size={18} />
            Personales
          </button>
          <button
            onClick={() => setSubTab('grupal')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${subTab === 'grupal' ? 'bg-white text-coral-600 shadow-lg' : 'text-white hover:bg-white/10'
              }`}
          >
            <Users size={18} />
            Grupales
          </button>
        </div>

        {/* Resumen del presupuesto */}
        <div className="bg-white rounded-3xl p-6 shadow-tropical mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-coral-500 uppercase tracking-wider mb-1">
                {subTab === 'personal' ? 'Total Gastado' : 'Total Grupo'}
              </p>
              <p className="font-display text-3xl font-bold text-coral-700">
                {formatearMoneda(totalGastado)}
              </p>
            </div>
            {subTab === 'grupal' && (
              <div className="text-right">
                <p className="text-xs font-bold text-caribbean-500 uppercase tracking-wider mb-1">Por Persona</p>
                <p className="font-display text-3xl font-bold text-caribbean-700 font-mono">
                  {formatearMoneda(totalGastado / numPersonas)}
                </p>
              </div>
            )}
            {subTab === 'personal' && (
              <div className="text-right">
                <p className="text-xs font-bold text-caribbean-500 uppercase tracking-wider mb-1">Caja</p>
                <p className={`font-display text-3xl font-bold ${disponible < 0 ? 'text-red-600' : 'text-caribbean-700'}`}>
                  {formatearMoneda(disponible)}
                </p>
              </div>
            )}
          </div>

          {subTab === 'grupal' && (
            <div className="mb-6 p-4 bg-coral-50 rounded-2xl flex items-center justify-between border border-coral-100">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-coral-500" />
                <span className="text-xs font-bold text-coral-700 uppercase">Divisor</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setNumPersonas(Math.max(1, numPersonas - 1))}
                  className="w-8 h-8 rounded-full bg-white border-2 border-coral-200 flex items-center justify-center text-coral-600 font-black hover:border-coral-400"
                >-</button>
                <span className="font-display font-bold text-xl text-coral-800 w-6 text-center">{numPersonas}</span>
                <button
                  onClick={() => setNumPersonas(numPersonas + 1)}
                  className="w-8 h-8 rounded-full bg-white border-2 border-coral-200 flex items-center justify-center text-coral-600 font-black hover:border-coral-400"
                >+</button>
              </div>
            </div>
          )}

          {/* Barra de progreso (Solo para personales, o como global) */}
          {subTab === 'personal' && (
            <>
              <div className="mb-2">
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-100 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${porcentajeGastado > 100 ? 'bg-red-500' :
                      porcentajeGastado > 80 ? 'bg-orange-500' :
                        'bg-gradient-to-r from-coral-400 to-coral-500'
                      }`}
                    style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Meta: {formatearMoneda(presupuestoTotal)}
                </p>
                <p className="text-[10px] font-bold text-coral-600 uppercase">
                  {porcentajeGastado.toFixed(1)}% Usado
                </p>
              </div>
            </>
          )}
        </div>

        {/* Distribución */}
        {totalGastado > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-tropical mb-6 border-2 border-transparent hover:border-coral-50 transition-all">
            <h3 className="font-display text-lg font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2 text-coral-500" />
              Distribución {subTab === 'personal' ? 'Personal' : 'Grupal'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gastosPorCategoria
                .filter(cat => cat.total > 0)
                .sort((a, b) => b.total - a.total)
                .map(cat => (
                  <div key={cat.value} className="flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-500 uppercase">{cat.icon} {cat.label}</span>
                      <span className="text-xs font-bold text-gray-800">{formatearMoneda(cat.total)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className={`h-full rounded-full ${cat.color}`}
                        style={{ width: `${(cat.total / totalGastado) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Botón agregar */}
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-white rounded-2xl p-4 shadow-tropical mb-6 flex items-center justify-center text-coral-600 hover:text-coral-700 font-bold transition-all hover:scale-[1.02] border-2 border-coral-50"
        >
          <Plus size={24} className="mr-2" />
          Registrar {subTab === 'personal' ? 'mi gasto' : 'gasto grupal'}
        </button>

        {/* Lista de gastos */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-coral-200 border-t-coral-500 mx-auto"></div>
            <p className="text-coral-600 mt-4 font-medium">Contando billetes...</p>
          </div>
        ) : gastosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-tropical border-2 border-dashed border-coral-200">
            <DollarSign className="mx-auto text-coral-200 mb-4" size={64} />
            <p className="text-coral-800 font-display text-xl font-bold">
              Sin gastos en esta pestaña
            </p>
            <p className="text-coral-50 text-sm mt-2 max-w-xs mx-auto">
              Aún no has registrado ningún gasto {subTab === 'personal' ? 'personal' : 'grupal'}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {gastosFiltrados.map((gasto, index) => {
              const cat = categorias.find(c => c.value === gasto.categoria) || categorias[categorias.length - 1]
              return (
                <div
                  key={gasto.id}
                  className="bg-white rounded-3xl p-5 shadow-tropical border-2 border-transparent hover:border-coral-100 transition-all animate-slide-up group flex items-center gap-4"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center text-white shadow-lg flex-shrink-0 relative`}>
                    <span className="text-xl">{cat.icon}</span>
                    {gasto.esItinerario && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-coral-200">
                        <Calendar size={10} className="text-coral-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="font-display font-bold text-gray-900 truncate pr-2">
                        {gasto.descripcion}
                      </h3>
                      <div className="text-right">
                        <p className="font-display font-bold text-coral-600 whitespace-nowrap">
                          {formatearMoneda(gasto.monto)}
                        </p>
                        {subTab === 'grupal' && (
                          <p className="text-[10px] font-black text-caribbean-500">
                            {formatearMoneda(gasto.monto / numPersonas)} pp
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      <span>{cat.label}</span>
                      <span className="mx-2 font-normal text-gray-300">•</span>
                      <span>{new Date(gasto.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  {!gasto.esItinerario ? (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(gasto)}
                        className="p-2 text-coral-300 hover:text-coral-500 hover:bg-coral-50 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => eliminarGasto(gasto.id)}
                        className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-coral-50 text-coral-500 text-[8px] font-black px-2 py-1 rounded-lg border border-coral-100 whitespace-nowrap uppercase tracking-tighter">
                        Itinerario
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {subTab === 'personal' && (
          <p className="mt-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest px-10">
            * Los precios del itinerario se sincronizan automáticamente aquí. Edítalos en la pestaña de itinerario.
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
      `}</style>
    </main>
  )
}
