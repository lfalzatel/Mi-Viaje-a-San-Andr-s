'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Package, Trash2, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type ItemEquipaje = {
  id: string
  item: string
  categoria: string
  empacado: boolean
}

const categorias = [
  { value: 'ropa', label: 'Ropa', emoji: '👕', color: 'bg-blue-400' },
  { value: 'playa', label: 'Playa', emoji: '🏖️', color: 'bg-cyan-400' },
  { value: 'higiene', label: 'Higiene', emoji: '🧴', color: 'bg-purple-400' },
  { value: 'electronica', label: 'Electrónica', emoji: '📱', color: 'bg-pink-400' },
  { value: 'documentos', label: 'Documentos', emoji: '📄', color: 'bg-orange-400' },
  { value: 'medicinas', label: 'Medicinas', emoji: '💊', color: 'bg-red-400' },
  { value: 'accesorios', label: 'Accesorios', emoji: '🕶️', color: 'bg-yellow-400' },
  { value: 'otro', label: 'Otro', emoji: '📦', color: 'bg-gray-400' },
]

const itemsSugeridos = {
  ropa: ['Trajes de baño', 'Camisetas', 'Shorts', 'Vestido playero', 'Sandalias', 'Gorra/Sombrero'],
  playa: ['Toalla de playa', 'Bloqueador solar', 'Snorkel y visor', 'Bolsa impermeable', 'Chanclas acuáticas'],
  higiene: ['Cepillo de dientes', 'Pasta dental', 'Champú', 'Jabón', 'Desodorante', 'Cepillo para cabello'],
  electronica: ['Cargador de celular', 'Cámara', 'Audífonos', 'Power bank', 'Adaptador de corriente'],
  documentos: ['Cédula', 'Tarjetas de crédito', 'Seguro de viaje', 'Reservas impresas', 'Pasaporte (si aplica)'],
  medicinas: ['Analgésicos', 'Antiácidos', 'Antialérgicos', 'Band-aids', 'Repelente de insectos'],
  accesorios: ['Lentes de sol', 'Reloj', 'Mochila pequeña', 'Riñonera', 'Bolsas plásticas'],
}

export default function EquipajePage() {
  const [items, setItems] = useState<ItemEquipaje[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [formData, setFormData] = useState({
    item: '',
    categoria: ''
  })

  useEffect(() => {
    cargarItems()
  }, [])

  const cargarItems = async () => {
    try {
      const { data, error } = await supabase
        .from('equipaje')
        .select('*')
        .order('categoria', { ascending: true })
        .order('item', { ascending: true })
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error cargando items:', error)
    } finally {
      setLoading(false)
    }
  }

  const agregarItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('equipaje')
        .insert([{
          ...formData,
          empacado: false
        }])
      
      if (error) throw error
      
      setFormData({ item: '', categoria: '' })
      setShowForm(false)
      cargarItems()
    } catch (error) {
      console.error('Error agregando item:', error)
      alert('Error al agregar el item. Verifica tu conexión con Supabase.')
    }
  }

  const agregarSugerido = async (item: string, categoria: string) => {
    try {
      const { error } = await supabase
        .from('equipaje')
        .insert([{
          item,
          categoria,
          empacado: false
        }])
      
      if (error) throw error
      cargarItems()
    } catch (error) {
      console.error('Error agregando item sugerido:', error)
    }
  }

  const toggleEmpacado = async (item: ItemEquipaje) => {
    try {
      const { error } = await supabase
        .from('equipaje')
        .update({ empacado: !item.empacado })
        .eq('id', item.id)
      
      if (error) throw error
      cargarItems()
    } catch (error) {
      console.error('Error actualizando item:', error)
    }
  }

  const eliminarItem = async (id: string) => {
    if (!confirm('¿Eliminar este item?')) return
    
    try {
      const { error } = await supabase
        .from('equipaje')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      cargarItems()
    } catch (error) {
      console.error('Error eliminando item:', error)
    }
  }

  const itemsFiltrados = items.filter(item => 
    filtroCategoria === 'todos' || item.categoria === filtroCategoria
  )

  const itemsEmpacados = items.filter(i => i.empacado).length
  const totalItems = items.length
  const porcentajeEmpacado = totalItems > 0 ? (itemsEmpacados / totalItems) * 100 : 0

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-caribbean-300 to-coral-400 pt-12 pb-24 px-6">
        <Link href="/" className="inline-flex items-center text-white mb-6 hover:text-caribbean-100 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Volver
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              Equipaje
            </h1>
            <p className="text-white/90 font-body">
              No olvides nada importante
            </p>
          </div>
          <Package className="text-white/30" size={60} />
        </div>
      </div>

      <div className="px-6 -mt-16 max-w-4xl mx-auto">
        {/* Progreso */}
        <div className="glass rounded-3xl p-6 shadow-tropical mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-caribbean-700 font-medium mb-1">Empacado</p>
              <p className="font-display text-3xl font-bold text-caribbean-800">
                {itemsEmpacados} / {totalItems}
              </p>
            </div>
            <div className="text-5xl">
              {porcentajeEmpacado === 100 ? '✈️' : '🎒'}
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-caribbean-400 to-coral-400 transition-all duration-500"
              style={{ width: `${porcentajeEmpacado}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {porcentajeEmpacado.toFixed(0)}% listo para viajar
          </p>
        </div>

        {/* Sugerencias */}
        <button
          onClick={() => setMostrarSugerencias(!mostrarSugerencias)}
          className="w-full glass rounded-2xl p-4 shadow-tropical mb-6 flex items-center justify-center text-caribbean-600 hover:text-caribbean-700 font-medium transition-all hover:shadow-xl"
        >
          💡 {mostrarSugerencias ? 'Ocultar' : 'Ver'} sugerencias de equipaje
        </button>

        {mostrarSugerencias && (
          <div className="glass rounded-3xl p-6 shadow-tropical mb-6 animate-slide-up">
            <h3 className="font-display text-xl font-bold text-caribbean-800 mb-4">
              Items sugeridos para tu viaje
            </h3>
            {categorias.slice(0, -1).map(cat => {
              const sugerencias = itemsSugeridos[cat.value as keyof typeof itemsSugeridos]
              if (!sugerencias) return null
              
              return (
                <div key={cat.value} className="mb-4 last:mb-0">
                  <h4 className="font-medium text-caribbean-700 mb-2 flex items-center">
                    <span className="text-xl mr-2">{cat.emoji}</span>
                    {cat.label}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sugerencias.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => agregarSugerido(item, cat.value)}
                        disabled={items.some(i => i.item.toLowerCase() === item.toLowerCase())}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          items.some(i => i.item.toLowerCase() === item.toLowerCase())
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-caribbean-700 hover:bg-caribbean-50 border border-caribbean-200'
                        }`}
                      >
                        + {item}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar">
          <button
            onClick={() => setFiltroCategoria('todos')}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              filtroCategoria === 'todos'
                ? 'bg-caribbean-600 text-white shadow-lg'
                : 'bg-white text-caribbean-700 hover:bg-caribbean-50'
            }`}
          >
            Todos ({items.length})
          </button>
          {categorias.map(cat => {
            const count = items.filter(i => i.categoria === cat.value).length
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
          className="w-full glass rounded-2xl p-4 shadow-tropical mb-6 flex items-center justify-center text-caribbean-600 hover:text-caribbean-700 font-medium transition-all hover:shadow-xl btn-wave"
        >
          <Plus size={24} className="mr-2" />
          Agregar item
        </button>

        {/* Formulario */}
        {showForm && (
          <div className="glass rounded-3xl p-6 shadow-tropical mb-6 animate-slide-up">
            <form onSubmit={agregarItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-caribbean-700 mb-2">
                  Item
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Camiseta blanca"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
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

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-caribbean-500 to-coral-400 text-white py-3 rounded-xl font-medium hover:from-caribbean-600 hover:to-coral-500 transition-all shadow-lg hover:shadow-xl btn-wave"
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

        {/* Lista de items */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-caribbean-200 border-t-caribbean-500 mx-auto"></div>
            <p className="text-caribbean-600 mt-4">Cargando...</p>
          </div>
        ) : itemsFiltrados.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center shadow-tropical">
            <Package className="mx-auto text-caribbean-300 mb-4" size={60} />
            <p className="text-caribbean-600 font-body text-lg">
              {filtroCategoria === 'todos' 
                ? 'No hay items en tu equipaje'
                : 'No hay items en esta categoría'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {itemsFiltrados.map((item, index) => {
              const cat = categorias.find(c => c.value === item.categoria)
              return (
                <div
                  key={item.id}
                  className={`glass rounded-2xl p-4 shadow-tropical hover:shadow-xl transition-all animate-slide-up ${
                    item.empacado ? 'opacity-60' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleEmpacado(item)}
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        item.empacado
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                      }`}
                    >
                      {item.empacado && <Check size={20} strokeWidth={3} />}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        item.empacado ? 'line-through text-gray-500' : 'text-caribbean-800'
                      }`}>
                        {item.item}
                      </h3>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${cat?.color} text-white font-medium`}>
                        {cat?.emoji} {cat?.label}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => eliminarItem(item.id)}
                      className="text-coral-500 hover:text-coral-600 p-2 hover:bg-coral-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
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
