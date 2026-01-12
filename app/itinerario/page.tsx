'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Calendar, Clock, MapPin, Trash2, CheckCircle2, Circle, Edit2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Evento = {
  id: string
  fecha: string
  titulo: string
  descripcion: string
  hora: string
  ubicacion: string
  completado: boolean
}

export default function ItinerarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fecha: '',
    titulo: '',
    descripcion: '',
    hora: '',
    ubicacion: '',
    completado: false
  })

  useEffect(() => {
    cargarEventos()
  }, [])

  const cargarEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('itinerario')
        .select('*')
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })

      if (error) throw error
      setEventos(data || [])
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
      completado: evento.completado || false
    })
    setEditingId(evento.id)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ fecha: '', titulo: '', descripcion: '', hora: '', ubicacion: '', completado: false })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        const { error } = await supabase
          .from('itinerario')
          .update(formData)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('itinerario')
          .insert([formData])
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
    try {
      const { error } = await supabase
        .from('itinerario')
        .update({ completado: !evento.completado })
        .eq('id', evento.id)

      if (error) throw error
      cargarEventos()
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

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-caribbean-400 to-caribbean-600 pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Calendar size={120} />
        </div>

        <Link href="/" className="inline-flex items-center text-white mb-6 hover:text-caribbean-100 transition-colors relative z-10">
          <ArrowLeft size={20} className="mr-2" />
          Inicio
        </Link>

        <div className="relative z-10">
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            Itinerario
          </h1>
          <p className="text-caribbean-100 font-body">
            Planifica tu aventura día a día
          </p>
        </div>
      </div>

      <div className="px-6 -mt-16 max-w-4xl mx-auto relative z-20">
        {/* Botón agregar */}
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-white rounded-2xl p-4 shadow-tropical mb-6 flex items-center justify-center text-caribbean-600 hover:text-caribbean-700 font-bold transition-all hover:scale-[1.02] border-2 border-caribbean-100"
        >
          <Plus size={24} className="mr-2" />
          Agregar actividad
        </button>

        {/* Modal Formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
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

                <div>
                  <label className="block text-xs font-bold text-caribbean-500 uppercase tracking-wider mb-1">
                    Actividad
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Snorkel en Johnny Cay"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-caribbean-50 border-2 border-transparent focus:border-caribbean-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
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

                <div className="pt-4 flex flex-col gap-3">
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
                className={`bg-white rounded-3xl p-5 shadow-tropical border-2 transition-all animate-slide-up group ${evento.completado ? 'border-green-100 opacity-75' : 'border-transparent hover:border-caribbean-100'
                  }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Toggle Completado */}
                  <button
                    onClick={() => toggleCompletado(evento)}
                    className={`mt-1 transition-all transform active:scale-90 ${evento.completado ? 'text-green-500' : 'text-caribbean-200 hover:text-caribbean-400'
                      }`}
                  >
                    {evento.completado ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 text-caribbean-500 text-xs font-bold uppercase tracking-wider mb-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatearFecha(evento.fecha)}
                      </span>
                      {evento.hora && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {evento.hora}
                        </span>
                      )}
                    </div>

                    <h3 className={`font-display text-xl font-bold mb-1 transition-all ${evento.completado ? 'text-gray-400 line-through' : 'text-caribbean-900'
                      }`}>
                      {evento.titulo}
                    </h3>

                    {evento.ubicacion && (
                      <div className="flex items-center gap-1.5 text-caribbean-600 mb-2">
                        <MapPin size={14} className="text-caribbean-400" />
                        <span className="text-sm font-medium">{evento.ubicacion}</span>
                      </div>
                    )}

                    {evento.descripcion && (
                      <p className={`text-sm leading-relaxed ${evento.completado ? 'text-gray-400' : 'text-caribbean-700'
                        }`}>
                        {evento.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
