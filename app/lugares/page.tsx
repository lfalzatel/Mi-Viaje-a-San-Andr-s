'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, MapPin, Trash2, CheckCircle2, Circle, Star, Edit2, X } from 'lucide-react'
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
          .insert([formData])
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
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-sand-500 to-sand-700 pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <MapPin size={120} />
        </div>

        <Link href="/" className="inline-flex items-center text-white mb-6 hover:text-sand-100 transition-colors relative z-10">
          <ArrowLeft size={20} className="mr-2" />
          Inicio
        </Link>

        <div className="relative z-10">
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            Lugares
          </h1>
          <p className="text-sand-100 font-body">
            Sitios imperdibles de San Andrés
          </p>
        </div>
      </div>

      <div className="px-6 -mt-16 max-w-4xl mx-auto relative z-20">
        {/* Progreso */}
        <div className="bg-white rounded-3xl p-6 shadow-tropical mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-sand-500 uppercase tracking-wider mb-1">Tu Progreso</p>
              <p className="font-display text-3xl font-bold text-sand-800">
                {lugaresVisitados} <span className="text-sm font-medium text-gray-400 italic">de {totalLugares} lugares</span>
              </p>
            </div>
            <div className="text-5xl">
              {porcentajeVisitado === 100 ? '🎉' : '🗺️'}
            </div>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-100 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${porcentajeVisitado === 100 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-sand-400 to-sand-600'
                }`}
              style={{ width: `${porcentajeVisitado}%` }}
            />
          </div>
          <p className="text-right text-[10px] font-bold text-sand-600 mt-2 uppercase">
            {porcentajeVisitado.toFixed(0)}% Descubierto
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 hide-scrollbar">
          <button
            onClick={() => setFiltroCategoria('todos')}
            className={`px-6 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all text-sm border-2 ${filtroCategoria === 'todos'
              ? 'bg-sand-600 border-sand-600 text-white shadow-xl translate-y-[-2px]'
              : 'bg-white border-white text-sand-500'
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

        {/* Botón agregar */}
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-white rounded-2xl p-4 shadow-tropical mb-6 flex items-center justify-center text-sand-600 hover:text-sand-700 font-bold transition-all hover:scale-[1.02] border-2 border-sand-100"
        >
          <Plus size={24} className="mr-2" />
          Agregar nuevo lugar
        </button>

        {/* Modal Formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-2xl font-bold text-sand-800">
                  {editingId ? 'Editar Lugar' : 'Nuevo Lugar'}
                </h2>
                <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-sand-500 uppercase tracking-wider mb-1">
                    Nombre del lugar
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Johnny Cay"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-sand-50 border-2 border-transparent focus:border-sand-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-sand-500 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-sand-50 border-2 border-transparent focus:border-sand-400 focus:bg-white focus:outline-none transition-all"
                  >
                    {categorias.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-sand-500 uppercase tracking-wider mb-1">
                    Prioridad
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormData({ ...formData, prioridad: n })}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${formData.prioridad === n
                          ? 'bg-sand-600 border-sand-600 text-white shadow-lg'
                          : 'bg-sand-50 border-transparent text-sand-400 hover:bg-sand-100'
                          }`}
                      >
                        <Star size={16} className="inline mb-1" fill={formData.prioridad === n ? 'currentColor' : 'none'} />
                        <span className="ml-1">{n === 1 ? 'Baja' : n === 2 ? 'Media' : 'Alta'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-sand-500 uppercase tracking-wider mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    placeholder="¿Qué hace especial este lugar?"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-sand-50 border-2 border-transparent focus:border-sand-400 focus:bg-white focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-sand-500 to-sand-600 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
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

        {/* Lista de lugares */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-sand-200 border-t-sand-500 mx-auto"></div>
            <p className="text-sand-600 mt-4 font-medium">Buscando destinos...</p>
          </div>
        ) : lugaresFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-tropical border-2 border-dashed border-sand-200">
            <MapPin className="mx-auto text-sand-200 mb-4" size={64} />
            <p className="text-sand-800 font-display text-xl font-bold">
              {filtroCategoria === 'todos' ? 'No hay lugares todavía' : 'Sin resultados para este filtro'}
            </p>
            <p className="text-sand-500 text-sm mt-2 max-w-xs mx-auto">
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
                  className={`bg-white rounded-3xl p-5 shadow-tropical border-2 transition-all animate-slide-up group ${lugar.visitado ? 'border-green-100 opacity-75' : 'border-transparent hover:border-sand-100'
                    }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Toggle Visitado */}
                    <button
                      onClick={() => toggleVisitado(lugar)}
                      className={`mt-1 transition-all transform active:scale-90 ${lugar.visitado ? 'text-green-500' : 'text-sand-200 hover:text-sand-400'
                        }`}
                    >
                      {lugar.visitado ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${cat.color} text-white uppercase tracking-wider`}>
                            {cat.emoji} {cat.label}
                          </span>
                          <div className="flex gap-0.5">
                            {[...Array(lugar.prioridad)].map((_, i) => (
                              <Star key={i} size={10} fill="currentColor" className="text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>

                      <h3 className={`font-display text-xl font-bold mb-1 transition-all ${lugar.visitado ? 'text-gray-400 line-through' : 'text-sand-900'
                        }`}>
                        {lugar.nombre}
                      </h3>

                      {lugar.descripcion && (
                        <p className={`text-sm leading-relaxed ${lugar.visitado ? 'text-gray-400' : 'text-sand-700'
                          }`}>
                          {lugar.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(lugar)}
                        className="p-2 text-sand-400 hover:text-sand-600 hover:bg-sand-50 rounded-xl transition-all"
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
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
