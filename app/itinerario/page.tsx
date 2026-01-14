'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Calendar, Clock, MapPin, Trash2, CheckCircle2, Circle, Edit2, X, DollarSign } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import UserProfileButton from '@/components/UserProfileButton'

type Evento = {
  id: string
  fecha: string
  titulo: string
  descripcion: string
  hora: string
  ubicacion: string
  completado: boolean
  precio: number
  lat?: number
  lng?: number
}

export default function ItinerarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [progreso, setProgreso] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const { user, role, isLoading: authLoading } = useAuth()
  const isAdmin = role === 'admin'
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fecha: '',
    titulo: '',
    descripcion: '',
    hora: '',
    ubicacion: '',
    completado: false,
    precio: ''
  })

  useEffect(() => {
    if (!authLoading) {
      cargarEventos()
    }
  }, [user, authLoading])

  const cargarEventos = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      // 1. Cargar el plan maestro
      const { data: dataItinerario, error: errorItinerario } = await supabase
        .from('itinerario')
        .select('*')
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })

      if (errorItinerario) throw errorItinerario

      // 2. Cargar el progreso personal del usuario
      const { data: dataProgreso, error: errorProgreso } = await supabase
        .from('itinerario_progreso')
        .select('itinerario_id, completado')
        .eq('user_id', user.id)

      if (errorProgreso) throw errorProgreso

      // Crear un mapa de progreso para búsqueda rápida
      const progresoMap: Record<string, boolean> = {}
      dataProgreso?.forEach(p => {
        progresoMap[p.itinerario_id] = p.completado
      })

      setProgreso(progresoMap)
      setEventos(dataItinerario || [])
    } catch (error) {
      console.error('Error cargando eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEdit = (evento: Evento) => {
    setFormData({
      fecha: evento.fecha,
      titulo: evento.titulo,
      descripcion: evento.descripcion || '',
      hora: evento.hora || '',
      ubicacion: evento.ubicacion || '',
      completado: evento.completado || false,
      precio: (evento.precio || 0).toString()
    })
    setEditingId(evento.id)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ fecha: '', titulo: '', descripcion: '', hora: '', ubicacion: '', completado: false, precio: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        precio: parseFloat(formData.precio) || 0
      }

      if (editingId) {
        const { error } = await supabase
          .from('itinerario')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('itinerario')
          .insert([payload])
        if (error) throw error
      }

      handleCloseForm()
      cargarEventos()
    } catch (error) {
      console.error('Error guardando evento:', error)
      alert('Error al guardar el evento. Verifica tu conexión.')
    }
  }

  const toggleCompletado = async (evento: Evento) => {
    if (!user) return
    const estadoActual = progreso[evento.id] || false
    const nuevoEstado = !estadoActual

    try {
      const { error } = await supabase
        .from('itinerario_progreso')
        .upsert({
          user_id: user.id,
          itinerario_id: evento.id,
          completado: nuevoEstado
        }, { onConflict: 'user_id, itinerario_id' })

      if (error) throw error

      // Actualizar estado local para feedback inmediato
      setProgreso(prev => ({ ...prev, [evento.id]: nuevoEstado }))
    } catch (error) {
      console.error('Error actualizando estado:', error)
    }
  }

  const eliminarEvento = async (id: string) => {
    if (!confirm('¿Eliminar este evento?')) return

    try {
      const { error } = await supabase
        .from('itinerario')
        .delete()
        .eq('id', id)

      if (error) throw error
      cargarEventos()
    } catch (error) {
      console.error('Error eliminando evento:', error)
    }
  }

  const formatearFecha = (fechaStr: string) => {
    // Evitar desfase horario forzando la interpretación como UTC midnight
    const [year, month, day] = fechaStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date)
  }

  const totalActividades = eventos.length
  const actividadesCompletadas = Object.values(progreso).filter(v => v).length
  const porcentajeCompletado = totalActividades > 0 ? (actividadesCompletadas / totalActividades) * 100 : 0

  const gastoAcumulado = eventos
    .filter(e => progreso[e.id])
    .reduce((sum, e) => sum + (e.precio || 0), 0)

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
      {/* Header Premium Cinemático - Profundo y de Alto Contraste */}
      <div className="relative bg-gradient-to-b from-[#0a192f] via-[#001d3d] to-[#000814] pt-10 pb-20 px-6 overflow-hidden">
        {/* Elementos decorativos solo en la parte superior para evitar degradado al blanco abajo */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-caribbean-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }} />

        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center text-white/60 mb-8 hover:text-white transition-all group">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all mr-3">
              <ArrowLeft size={18} />
            </div>
            <span className="font-display font-medium tracking-wide text-sm uppercase">Regresar</span>
          </Link>

          {/* User Profile Button */}
          <div className="absolute top-4 right-6 flex items-center gap-4 z-20">
            <UserProfileButton />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="animate-slide-up">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-caribbean-500/20 border border-caribbean-500/30 text-caribbean-200 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                Hoja de Ruta del Viaje
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-4 italic">
                Itinerario
              </h1>
              <p className="text-white/40 font-medium text-lg md:text-xl max-w-md leading-relaxed">
                Tus planes día a día en el paraíso más hermoso del Caribe.
              </p>
            </div>

            <div className="animate-scale-in flex flex-col items-end">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl w-full sm:w-auto min-w-[280px]">
                <div className="flex justify-between items-start mb-4 gap-8">
                  <div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Tu Progreso</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-caribbean-500 flex items-center justify-center text-white shadow-lg shadow-caribbean-500/20">
                        <Calendar size={20} />
                      </div>
                      <span className="font-display text-3xl md:text-4xl font-black text-white italic">
                        {actividadesCompletadas} / {totalActividades}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Presupuesto</p>
                    <p className="font-display text-2xl md:text-3xl font-black text-coral-400 italic">
                      {formatearMoneda(gastoAcumulado)}
                    </p>
                  </div>
                </div>

                {/* Progress bar inside glass card */}
                <div className="space-y-2">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-caribbean-400 to-caribbean-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,160,230,0.5)]"
                      style={{ width: `${(actividadesCompletadas / totalActividades) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Aventura</span>
                    <span className="text-[9px] font-black text-caribbean-300 bg-caribbean-500/10 px-2 py-0.5 rounded-md">
                      {((actividadesCompletadas / totalActividades) * 100).toFixed(0)}% COMPLETADO
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Formulario (Fuera del z-index container) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-bold text-caribbean-800">
                {editingId ? 'Editar Actividad' : 'Nueva Actividad'}
              </h2>
              <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-caribbean-500 uppercase tracking-wider mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-caribbean-50 border-2 border-transparent focus:border-caribbean-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-caribbean-500 uppercase tracking-wider mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-caribbean-50 border-2 border-transparent focus:border-caribbean-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-caribbean-500 uppercase tracking-wider mb-1">
                    Actividad
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Snorkel..."
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-caribbean-50 border-2 border-transparent focus:border-caribbean-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-caribbean-500 uppercase tracking-wider mb-1">
                    Precio (COP)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-caribbean-50 border-2 border-transparent focus:border-caribbean-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-caribbean-500 uppercase tracking-wider mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Johnny Cay"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-caribbean-50 border-2 border-transparent focus:border-caribbean-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.ubicacion + ' San Andrés')}`
                      window.open(url, '_blank')
                    }}
                    disabled={!formData.ubicacion}
                    className="p-3.5 bg-caribbean-100 text-caribbean-600 rounded-xl hover:bg-caribbean-200 disabled:opacity-50 transition-all shadow-sm"
                    title="Verificar en Google Maps"
                  >
                    <MapPin size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-caribbean-500 uppercase tracking-wider mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles adicionales..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-caribbean-50 border-2 border-transparent focus:border-caribbean-400 focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex flex-col gap-3 pb-12">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-caribbean-500 to-caribbean-600 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
                >
                  {editingId ? 'Actualizar Cambios' : 'Guardar Actividad'}
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

      <div className="px-4 sm:px-6 -mt-8 max-w-4xl mx-auto relative z-20">

        {/* Lista de eventos */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-caribbean-200 border-t-caribbean-500 mx-auto"></div>
            <p className="text-caribbean-600 mt-4 font-medium">Cargando paraíso...</p>
          </div>
        ) : eventos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-tropical border-2 border-dashed border-caribbean-200">
            <Calendar className="mx-auto text-caribbean-200 mb-4" size={64} />
            <p className="text-caribbean-800 font-display text-xl font-bold">
              Nada planeado todavía
            </p>
            <p className="text-caribbean-500 text-sm mt-2 max-w-xs mx-auto">
              Empieza a organizar tu aventura agregando tu primera parada.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {eventos.map((evento, index) => (
              <div
                key={evento.id}
                className={`bg-white rounded-3xl p-5 shadow-tropical border-2 transition-all animate-slide-up group ${progreso[evento.id] ? 'border-green-100 opacity-75' : 'border-transparent hover:border-caribbean-100'
                  }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Toggle Completado */}
                  <button
                    onClick={() => toggleCompletado(evento)}
                    className={`mt-1 transition-all transform active:scale-90 ${progreso[evento.id] ? 'text-green-500' : 'text-caribbean-200 hover:text-caribbean-400'
                      }`}
                  >
                    {progreso[evento.id] ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                  </button>

                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className={`font-display text-lg sm:text-xl font-bold transition-all leading-tight ${progreso[evento.id] ? 'text-gray-400 line-through decoration-1' : 'text-caribbean-900'
                        }`}>
                        {evento.titulo}
                      </h3>
                      {evento.precio > 0 && (
                        <span className="flex items-center gap-1 text-coral-500 bg-coral-50 px-2.5 py-1 rounded-xl text-sm font-bold shrink-0">
                          <DollarSign size={14} />
                          {formatearMoneda(evento.precio)}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caribbean-500 text-[10px] font-bold uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatearFecha(evento.fecha)}
                      </span>
                      {evento.hora && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-caribbean-50 rounded-md">
                          <Clock size={12} />
                          {evento.hora}
                        </span>
                      )}
                    </div>

                    {evento.ubicacion && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evento.ubicacion + ' San Andrés')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-caribbean-600 mb-2 hover:text-caribbean-500 transition-colors group/link"
                      >
                        <MapPin size={14} className="text-caribbean-400 group-hover/link:text-caribbean-500" />
                        <span className="text-sm font-medium border-b border-transparent group-hover/link:border-caribbean-500 decoration-dotted">
                          {evento.ubicacion}
                        </span>
                        <div className="ml-1 opacity-0 group-hover/link:opacity-100 transition-opacity">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-caribbean-400" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </div>
                      </a>
                    )}

                    {evento.descripcion && (
                      <p className={`text-sm leading-relaxed ${progreso[evento.id] ? 'text-gray-400' : 'text-caribbean-700'
                        }`}>
                        {evento.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  {isAdmin && (
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(evento)}
                        className="p-2 text-caribbean-400 hover:text-caribbean-600 hover:bg-caribbean-50 rounded-xl transition-all"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => eliminarEvento(evento.id)}
                        className="p-2 text-coral-300 hover:text-coral-500 hover:bg-coral-50 rounded-xl transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón Flotante (FAB) Premium - Solo para Admins */}
      {isAdmin && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
          <button
            onClick={() => setShowForm(true)}
            className="pointer-events-auto p-4 bg-gradient-to-br from-caribbean-500 to-caribbean-600 text-white rounded-full shadow-[0_8px_25px_rgba(0,146,214,0.4)] hover:shadow-[0_12px_35px_rgba(0,146,214,0.5)] transition-all transform hover:scale-110 active:scale-90 group relative"
            title="Agregar Actividad"
          >
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-caribbean-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Agregar Actividad
            </div>
            <Plus size={28} className="transition-transform group-hover:rotate-90 duration-300" />
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
      `}</style>
    </main >
  )
}
