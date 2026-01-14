'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, MapPin, Trash2, CheckCircle2, Circle, Star, Edit2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import UserProfileButton from '@/components/UserProfileButton'

type Lugar = {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  visitado: boolean
  prioridad: number
  lat?: number
  lng?: number
}

const categorias = [
  { value: 'playa', label: 'Playa', emoji: '🏖️', color: 'bg-blue-400' },
  { value: 'restaurante', label: 'Restaurante', emoji: '🍽️', color: 'bg-orange-400' },
  { value: 'actividad', label: 'Actividad', emoji: '🤿', color: 'bg-purple-400' },
  { value: 'turistico', label: 'Turístico', emoji: '📸', color: 'bg-pink-400' },
  { value: 'naturaleza', label: 'Naturaleza', emoji: '🌴', color: 'bg-green-400' },
  { value: 'otro', label: 'Otro', emoji: '📍', color: 'bg-gray-400' },
]

export default function LugaresPage() {
  const [lugares, setLugares] = useState<Lugar[]>([])
  const [progreso, setProgreso] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const { user, role, isLoading: authLoading } = useAuth()
  const isAdmin = role === 'admin'
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'otro',
    prioridad: 1,
    visitado: false
  })

  useEffect(() => {
    if (!authLoading) {
      cargarLugares()
    }
  }, [user, authLoading])

  const cargarLugares = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      // 1. Cargar el catálogo maestro de lugares
      const { data: dataLugares, error: errorLugares } = await supabase
        .from('lugares')
        .select('*')
        .order('prioridad', { ascending: false })
        .order('nombre', { ascending: true })

      if (errorLugares) throw errorLugares

      // 2. Cargar el progreso personal del usuario
      const { data: dataProgreso, error: errorProgreso } = await supabase
        .from('lugares_progreso')
        .select('lugar_id, visitado')
        .eq('user_id', user.id)

      if (errorProgreso) throw errorProgreso

      const progresoMap: Record<string, boolean> = {}
      dataProgreso?.forEach(p => {
        progresoMap[p.lugar_id] = p.visitado
      })

      setProgreso(progresoMap)
      setLugares(dataLugares || [])
    } catch (error) {
      console.error('Error cargando lugares:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEdit = (lugar: Lugar) => {
    setFormData({
      nombre: lugar.nombre,
      descripcion: lugar.descripcion || '',
      categoria: lugar.categoria || 'otro',
      prioridad: lugar.prioridad || 1,
      visitado: lugar.visitado || false
    })
    setEditingId(lugar.id)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ nombre: '', descripcion: '', categoria: 'otro', prioridad: 1, visitado: false })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      if (editingId) {
        const { error } = await supabase
          .from('lugares')
          .update(formData)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('lugares')
          .insert([{ ...formData, user_id: user.id }])
        if (error) throw error
      }

      handleCloseForm()
      cargarLugares()
    } catch (error) {
      console.error('Error guardando lugar:', error)
      alert('Error al guardar el lugar. Verifica tu conexión.')
    }
  }

  const toggleVisitado = async (lugar: Lugar) => {
    if (!user) return
    const estadoActual = progreso[lugar.id] || false
    const nuevoEstado = !estadoActual

    try {
      const { error } = await supabase
        .from('lugares_progreso')
        .upsert({
          user_id: user.id,
          lugar_id: lugar.id,
          visitado: nuevoEstado
        }, { onConflict: 'user_id, lugar_id' })

      if (error) throw error

      // Actualizar estado local para feedback inmediato
      setProgreso(prev => ({ ...prev, [lugar.id]: nuevoEstado }))
    } catch (error) {
      console.error('Error actualizando lugar:', error)
    }
  }

  const eliminarLugar = async (id: string) => {
    if (!confirm('¿Eliminar este lugar?')) return

    try {
      const { error } = await supabase
        .from('lugares')
        .delete()
        .eq('id', id)

      if (error) throw error
      cargarLugares()
    } catch (error) {
      console.error('Error eliminando lugar:', error)
    }
  }

  const lugaresFiltrados = lugares.filter(lugar =>
    filtroCategoria === 'todos' || lugar.categoria === filtroCategoria
  )

  const lugaresVisitados = Object.values(progreso).filter(v => v).length
  const totalLugares = lugares.length
  const porcentajeVisitado = totalLugares > 0 ? (lugaresVisitados / totalLugares) * 100 : 0

  return (
    <main className="min-h-screen">
      {/* Header Premium Cinemático */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 pt-10 pb-20 px-6 overflow-hidden">
        {/* Elementos decorativos animados */}
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-caribbean-400/20 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-mint-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* User Profile Button */}
        <div className="absolute top-4 right-6 flex items-center gap-4 z-20">
          <UserProfileButton />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center text-white/60 mb-8 hover:text-white transition-all group">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all mr-3">
              <ArrowLeft size={18} />
            </div>
            <span className="font-display font-medium tracking-wide text-sm uppercase">Regresar</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="animate-slide-up">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                Exploración Tropical
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-4">
                Lugares
              </h1>
              <p className="text-white/40 font-medium text-lg md:text-xl max-w-md leading-relaxed">
                Descubre los rincones más mágicos y paradisíacos de la isla.
              </p>
            </div>

            <div className="animate-scale-in flex flex-col items-end">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl w-full sm:w-auto min-w-[280px]">
                <div className="flex justify-between items-start mb-4 gap-8">
                  <div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Lugares Visitados</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <MapPin size={20} />
                      </div>
                      <span className="font-display text-3xl md:text-4xl font-black text-white italic">
                        {lugaresVisitados} / {totalLugares}
                      </span>
                    </div>
                  </div>
                  <div className="text-5xl hidden sm:block">
                    {porcentajeVisitado === 100 ? '🎉' : '🗺️'}
                  </div>
                </div>

                {/* Progress bar inside glass card */}
                <div className="space-y-2">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)] ${porcentajeVisitado === 100 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                        }`}
                      style={{ width: `${porcentajeVisitado}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Exploración</span>
                    <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {porcentajeVisitado.toFixed(0)}% COMPLETADO
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Formulario (Fuera al z-index container) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-bold text-emerald-800">
                {editingId ? 'Editar Lugar' : 'Nuevo Lugar'}
              </h2>
              <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">
                    Nombre del lugar
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Johnny Cay"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-emerald-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.nombre + ' San Andrés')}`
                      window.open(url, '_blank')
                    }}
                    disabled={!formData.nombre}
                    className="p-3.5 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 disabled:opacity-50 transition-all shadow-sm"
                    title="Verificar en Google Maps"
                  >
                    <MapPin size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">
                  Categoría
                </label>
                <select
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-emerald-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all"
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">
                  Prioridad
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFormData({ ...formData, prioridad: n })}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${formData.prioridad === n
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg'
                        : 'bg-emerald-50 border-transparent text-emerald-400 hover:bg-emerald-100'
                        }`}
                    >
                      <Star size={16} className="inline mb-1" fill={formData.prioridad === n ? 'currentColor' : 'none'} />
                      <span className="ml-1">{n === 1 ? 'Baja' : n === 2 ? 'Media' : 'Alta'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="¿Qué hace especial este lugar?"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-emerald-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex flex-col gap-3 pb-12">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
                >
                  {editingId ? 'Actualizar Cambios' : 'Guardar Lugar'}
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

      <div className="px-6 -mt-8 max-w-4xl mx-auto relative z-20">

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 hide-scrollbar">
          <button
            onClick={() => setFiltroCategoria('todos')}
            className={`px-6 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all text-sm border-2 ${filtroCategoria === 'todos'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl translate-y-[-2px]'
              : 'bg-white border-white text-emerald-500'
              }`}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFiltroCategoria(cat.value)}
              className={`px-6 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all text-sm border-2 ${filtroCategoria === cat.value
                ? `${cat.color} border-white text-white shadow-xl translate-y-[-2px]`
                : 'bg-white border-white text-gray-500'
                }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Lista de lugares */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-500 mx-auto"></div>
            <p className="text-emerald-600 mt-4 font-medium">Buscando destinos...</p>
          </div>
        ) : lugaresFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-tropical border-2 border-dashed border-emerald-200">
            <MapPin className="mx-auto text-emerald-200 mb-4" size={64} />
            <p className="text-emerald-800 font-display text-xl font-bold">
              {filtroCategoria === 'todos' ? 'No hay lugares todavía' : 'Sin resultados para este filtro'}
            </p>
            <p className="text-emerald-500 text-sm mt-2 max-w-xs mx-auto">
              {filtroCategoria === 'todos' ? 'Agrega sitios imperdibles para tu viaje.' : 'Intenta con otra categoría.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lugaresFiltrados.map((lugar, index) => {
              const cat = categorias.find(c => c.value === lugar.categoria) || categorias[categorias.length - 1]
              return (
                <div
                  key={lugar.id}
                  className={`bg-white rounded-3xl p-5 shadow-tropical border-2 transition-all animate-slide-up group ${progreso[lugar.id] ? 'border-green-100 opacity-75' : 'border-transparent hover:border-emerald-100'
                    }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Toggle Visitado */}
                    <button
                      onClick={() => toggleVisitado(lugar)}
                      className={`mt-1 transition-all transform active:scale-90 ${progreso[lugar.id] ? 'text-green-500' : 'text-emerald-300 hover:text-emerald-500'
                        }`}
                    >
                      {progreso[lugar.id] ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${cat.color} text-white uppercase tracking-wider`}>
                            {cat.emoji} {cat.label}
                          </span>
                          <div className="flex gap-0.5">
                            {[...Array(lugar.prioridad)].map((_, i) => (
                              <Star key={i} size={10} fill="currentColor" className="text-amber-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]" />
                            ))}
                          </div>
                        </div>
                      </div>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar.nombre + ' San Andrés')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-block"
                      >
                        <h3 className={`font-display text-xl font-bold mb-1 transition-all ${progreso[lugar.id] ? 'text-gray-400 line-through' : 'text-emerald-900 group-hover/link:text-emerald-600'
                          }`}>
                          {lugar.nombre}
                          <span className="ml-2 opacity-0 group-hover/link:opacity-100 transition-opacity inline-block align-middle">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-caribbean-400" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </span>
                        </h3>
                      </a>

                      {lugar.descripcion && (
                        <p className={`text-sm leading-relaxed ${progreso[lugar.id] ? 'text-gray-400' : 'text-emerald-700'
                          }`}>
                          {lugar.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    {isAdmin && (
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(lugar)}
                          className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => eliminarLugar(lugar.id)}
                          className="p-2 text-coral-300 hover:text-coral-500 hover:bg-coral-50 rounded-xl transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* FAB de Lugares - Visible para todos */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        <button
          onClick={() => setShowForm(true)}
          className="pointer-events-auto p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full shadow-[0_8px_25px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_35px_rgba(16,185,129,0.5)] transition-all transform hover:scale-110 active:scale-90 group relative"
          title="Agregar Lugar"
        >
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-emerald-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Nuevo Destino
          </div>
          <Plus size={28} className="transition-transform group-hover:rotate-90 duration-300" />
        </button>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
      `}</style>
    </main>
  )
}
