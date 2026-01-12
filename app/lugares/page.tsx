'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, MapPin, Trash2, Check, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Lugar = {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  visitado: boolean
  prioridad: number
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
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    prioridad: 1
  })

  useEffect(() => {
    cargarLugares()
  }, [])

  const cargarLugares = async () => {
    try {
      const { data, error } = await supabase
        .from('lugares')
        .select('*')
        .order('prioridad', { ascending: false })
        .order('nombre', { ascending: true })
      
      if (error) throw error
      setLugares(data || [])
    } catch (error) {
      console.error('Error cargando lugares:', error)
    } finally {
      setLoading(false)
    }
  }

  const agregarLugar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('lugares')
        .insert([{
          ...formData,
          visitado: false
        }])
      
      if (error) throw error
      
      setFormData({ nombre: '', descripcion: '', categoria: '', prioridad: 1 })
      setShowForm(false)
      cargarLugares()
    } catch (error) {
      console.error('Error agregando lugar:', error)
      alert('Error al agregar el lugar. Verifica tu conexión con Supabase.')
    }
  }

  const toggleVisitado = async (lugar: Lugar) => {
    try {
      const { error } = await supabase
        .from('lugares')
        .update({ visitado: !lugar.visitado })
        .eq('id', lugar.id)
      
      if (error) throw error
      cargarLugares()
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

  const lugaresVisitados = lugares.filter(l => l.visitado).length
  const totalLugares = lugares.length
  const porcentajeVisitado = totalLugares > 0 ? (lugaresVisitados / totalLugares) * 100 : 0

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-sand-500 to-sand-700 pt-12 pb-24 px-6">
        <Link href="/" className="inline-flex items-center text-white mb-6 hover:text-sand-200 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Volver
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              Lugares
            </h1>
            <p className="text-sand-100 font-body">
              Sitios imperdibles de San Andrés
            </p>
          </div>
          <MapPin className="text-white/30" size={60} />
        </div>
      </div>

      <div className="px-6 -mt-16 max-w-4xl mx-auto">
        {/* Progreso */}
        <div className="glass rounded-3xl p-6 shadow-tropical mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-sand-700 font-medium mb-1">Visitados</p>
              <p className="font-display text-3xl font-bold text-sand-800">
                {lugaresVisitados} / {totalLugares}
              </p>
            </div>
            <div className="text-5xl">
              {porcentajeVisitado === 100 ? '🎉' : '🗺️'}
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sand-500 to-sand-600 transition-all duration-500"
              style={{ width: `${porcentajeVisitado}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {porcentajeVisitado.toFixed(0)}% completado
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar">
          <button
            onClick={() => setFiltroCategoria('todos')}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              filtroCategoria === 'todos'
                ? 'bg-sand-600 text-white shadow-lg'
                : 'bg-white text-sand-700 hover:bg-sand-50'
            }`}
          >
            Todos ({lugares.length})
          </button>
          {categorias.map(cat => {
            const count = lugares.filter(l => l.categoria === cat.value).length
            return (
              <button
                key={cat.value}
                onClick={() => setFiltroCategoria(cat.value)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  filtroCategoria === cat.value
                    ? `${cat.color} text-white shadow-lg`
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat.emoji} {cat.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Botón agregar */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full glass rounded-2xl p-4 shadow-tropical mb-6 flex items-center justify-center text-sand-600 hover:text-sand-700 font-medium transition-all hover:shadow-xl btn-wave"
        >
          <Plus size={24} className="mr-2" />
          Agregar lugar
        </button>

        {/* Formulario */}
        {showForm && (
          <div className="glass rounded-3xl p-6 shadow-tropical mb-6 animate-slide-up">
            <form onSubmit={agregarLugar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-caribbean-700 mb-2">
                  Nombre del lugar
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Johnny Cay"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-caribbean-200 focus:border-caribbean-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-caribbean-700 mb-2">
                  Categoría
                </label>
                <select
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-caribbean-200 focus:border-caribbean-500 focus:outline-none transition-colors"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-caribbean-700 mb-2">
                  Prioridad
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFormData({ ...formData, prioridad: n })}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        formData.prioridad === n
                          ? 'bg-gradient-to-r from-sand-500 to-sand-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Star size={16} className="inline mb-1" fill={formData.prioridad === n ? 'currentColor' : 'none'} />
                      <span className="ml-1">{n === 1 ? 'Baja' : n === 2 ? 'Media' : 'Alta'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-caribbean-700 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="¿Qué hace especial este lugar?"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-caribbean-200 focus:border-caribbean-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-sand-500 to-sand-600 text-white py-3 rounded-xl font-medium hover:from-sand-600 hover:to-sand-700 transition-all shadow-lg hover:shadow-xl btn-wave"
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

        {/* Lista de lugares */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-sand-200 border-t-sand-500 mx-auto"></div>
            <p className="text-sand-600 mt-4">Cargando...</p>
          </div>
        ) : lugaresFiltrados.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center shadow-tropical">
            <MapPin className="mx-auto text-sand-300 mb-4" size={60} />
            <p className="text-sand-600 font-body text-lg">
              {filtroCategoria === 'todos' 
                ? 'No hay lugares agregados'
                : 'No hay lugares en esta categoría'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lugaresFiltrados.map((lugar, index) => {
              const cat = categorias.find(c => c.value === lugar.categoria)
              return (
                <div
                  key={lugar.id}
                  className={`glass rounded-2xl p-5 shadow-tropical hover:shadow-xl transition-all animate-slide-up ${
                    lugar.visitado ? 'opacity-60' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleVisitado(lugar)}
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        lugar.visitado
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                      }`}
                    >
                      {lugar.visitado && <Check size={24} strokeWidth={3} />}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className={`font-display text-xl font-bold mb-1 ${
                            lugar.visitado ? 'line-through text-gray-500' : 'text-caribbean-800'
                          }`}>
                            {lugar.nombre}
                          </h3>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`px-3 py-1 rounded-full ${cat?.color} text-white font-medium`}>
                              {cat?.emoji} {cat?.label}
                            </span>
                            <div className="flex">
                              {[...Array(lugar.prioridad)].map((_, i) => (
                                <Star key={i} size={14} fill="currentColor" className="text-yellow-500" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => eliminarLugar(lugar.id)}
                          className="text-coral-500 hover:text-coral-600 p-2 hover:bg-coral-50 rounded-lg transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      {lugar.descripcion && (
                        <p className="text-caribbean-700 text-sm">
                          {lugar.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  )
}
