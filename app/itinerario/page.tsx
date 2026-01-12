'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Calendar, Clock, MapPin, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Evento = {
  id: string
  fecha: string
  titulo: string
  descripcion: string
  hora: string
  ubicacion: string
}

export default function ItinerarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    fecha: '',
    titulo: '',
    descripcion: '',
    hora: '',
    ubicacion: ''
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

  const agregarEvento = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('itinerario')
        .insert([formData])
      
      if (error) throw error
      
      setFormData({ fecha: '', titulo: '', descripcion: '', hora: '', ubicacion: '' })
      setShowForm(false)
      cargarEventos()
    } catch (error) {
      console.error('Error agregando evento:', error)
      alert('Error al agregar el evento. Verifica tu conexión con Supabase.')
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

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00')
    return new Intl.DateTimeFormat('es-CO', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }).format(date)
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-caribbean-400 to-caribbean-600 pt-12 pb-24 px-6">
        <Link href="/" className="inline-flex items-center text-white mb-6 hover:text-caribbean-100 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Volver
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              Itinerario
            </h1>
            <p className="text-caribbean-100 font-body">
              Planifica tu aventura día a día
            </p>
          </div>
          <Calendar className="text-white/30" size={60} />
        </div>
      </div>

      <div className="px-6 -mt-16 max-w-4xl mx-auto">
        {/* Botón agregar */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full glass rounded-2xl p-4 shadow-tropical mb-6 flex items-center justify-center text-caribbean-600 hover:text-caribbean-700 font-medium transition-all hover:shadow-xl btn-wave"
        >
          <Plus size={24} className="mr-2" />
          Agregar actividad
        </button>

        {/* Formulario */}
        {showForm && (
          <div className="glass rounded-3xl p-6 shadow-tropical mb-6 animate-slide-up">
            <form onSubmit={agregarEvento} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-caribbean-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-caribbean-200 focus:border-caribbean-500 focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-caribbean-700 mb-2">
                  Hora
                </label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-caribbean-200 focus:border-caribbean-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-caribbean-700 mb-2">
                  Actividad
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Snorkel en Johnny Cay"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-caribbean-200 focus:border-caribbean-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-caribbean-700 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Ej: Johnny Cay"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-caribbean-200 focus:border-caribbean-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-caribbean-700 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles adicionales..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-caribbean-200 focus:border-caribbean-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-caribbean-500 to-caribbean-600 text-white py-3 rounded-xl font-medium hover:from-caribbean-600 hover:to-caribbean-700 transition-all shadow-lg hover:shadow-xl btn-wave"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de eventos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-caribbean-200 border-t-caribbean-500 mx-auto"></div>
            <p className="text-caribbean-600 mt-4">Cargando...</p>
          </div>
        ) : eventos.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center shadow-tropical">
            <Calendar className="mx-auto text-caribbean-300 mb-4" size={60} />
            <p className="text-caribbean-600 font-body text-lg">
              No hay actividades planeadas aún
            </p>
            <p className="text-caribbean-400 text-sm mt-2">
              Agrega tu primera actividad para comenzar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {eventos.map((evento, index) => (
              <div
                key={evento.id}
                className="glass rounded-2xl p-5 shadow-tropical hover:shadow-xl transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-caribbean-600 text-sm mb-2">
                      <Calendar size={16} />
                      <span className="font-medium capitalize">
                        {formatearFecha(evento.fecha)}
                      </span>
                      {evento.hora && (
                        <>
                          <Clock size={16} className="ml-2" />
                          <span>{evento.hora}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-bold text-caribbean-800 mb-2">
                      {evento.titulo}
                    </h3>
                    {evento.ubicacion && (
                      <div className="flex items-center gap-2 text-caribbean-600 mb-2">
                        <MapPin size={16} />
                        <span className="text-sm">{evento.ubicacion}</span>
                      </div>
                    )}
                    {evento.descripcion && (
                      <p className="text-caribbean-700 text-sm">
                        {evento.descripcion}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => eliminarEvento(evento.id)}
                    className="text-coral-500 hover:text-coral-600 p-2 hover:bg-coral-50 rounded-lg transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
