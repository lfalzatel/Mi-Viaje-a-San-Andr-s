'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Package, Trash2, CheckCircle2, Circle, Edit2, X, Briefcase } from 'lucide-react'
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')

  const [formData, setFormData] = useState({
    item: '',
    categoria: 'otro',
    empacado: false
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

  const handleOpenEdit = (item: ItemEquipaje) => {
    setFormData({
      item: item.item,
      categoria: item.categoria || 'otro',
      empacado: item.empacado || false
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ item: '', categoria: 'otro', empacado: false })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        const { error } = await supabase
          .from('equipaje')
          .update(formData)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('equipaje')
          .insert([formData])
        if (error) throw error
      }

      handleCloseForm()
      cargarItems()
    } catch (error) {
      console.error('Error guardando item:', error)
      alert('Error al guardar el item. Verifica tu conexión.')
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
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-caribbean-400 to-coral-400 pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Briefcase size={120} />
        </div>

        <Link href="/" className="inline-flex items-center text-white mb-6 hover:text-caribbean-100 transition-colors relative z-10">
          <ArrowLeft size={20} className="mr-2" />
          Inicio
        </Link>

        <div className="relative z-10">
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            Equipaje
          </h1>
          <p className="text-white/90 font-body">
            Que no se te olvide el bloqueador
          </p>
        </div>
      </div>

      <div className="px-6 -mt-16 max-w-4xl mx-auto relative z-20">
        {/* Progreso */}
        <div className="bg-white rounded-3xl p-6 shadow-tropical mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-caribbean-500 uppercase tracking-wider mb-1">Maleta lista</p>
              <p className="font-display text-3xl font-bold text-caribbean-800">
                {itemsEmpacados} <span className="text-sm font-medium text-gray-400 italic">de {totalItems} items</span>
              </p>
            </div>
            <div className="text-5xl">
              {porcentajeEmpacado === 100 ? '✈️' : '🎒'}
            </div>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-100 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${porcentajeEmpacado === 100 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-caribbean-400 to-coral-400'
                }`}
              style={{ width: `${porcentajeEmpacado}%` }}
            />
          </div>
          <p className="text-right text-[10px] font-bold text-caribbean-600 mt-2 uppercase">
            {porcentajeEmpacado.toFixed(0)}% Empacado
          </p>
        </div>

        {/* Sugerencias Toggle */}
        <button
          onClick={() => setMostrarSugerencias(!mostrarSugerencias)}
          className="w-full bg-caribbean-50/50 backdrop-blur-sm rounded-2xl p-4 mb-4 flex items-center justify-between text-caribbean-700 font-bold border border-caribbean-100 transition-all active:scale-95"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <span className="text-sm uppercase tracking-wider">Ideas para empacar</span>
          </div>
          <span className="text-xs text-caribbean-400">{mostrarSugerencias ? 'CERRAR' : 'VER'}</span>
        </button>

        {mostrarSugerencias && (
          <div className="bg-white rounded-3xl p-6 shadow-tropical mb-6 animate-scale-in border-2 border-caribbean-50">
            <div className="space-y-6">
              {Object.entries(itemsSugeridos).map(([catValue, sugerencias]) => {
                const cat = categorias.find(c => c.value === catValue)
                return (
                  <div key={catValue}>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <span className="w-1 h-3 bg-caribbean-300 rounded-full" />
                      {cat?.label}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {sugerencias.map((item, idx) => {
                        const yaExiste = items.some(i => i.item.toLowerCase() === item.toLowerCase())
                        return (
                          <button
                            key={idx}
                            onClick={async () => {
                              try {
                                const { error } = await supabase.from('equipaje').insert([{ item, categoria: catValue, empacado: false }])
                                if (error) throw error
                                cargarItems()
                              } catch (e) { console.error(e) }
                            }}
                            disabled={yaExiste}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 ${yaExiste
                              ? 'bg-gray-50 border-gray-50 text-gray-300 cursor-not-allowed'
                              : 'bg-white border-caribbean-50 text-caribbean-600 hover:border-caribbean-200'
                              }`}
                          >
                            + {item}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 hide-scrollbar">
          <button
            onClick={() => setFiltroCategoria('todos')}
            className={`px-6 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all text-sm border-2 ${filtroCategoria === 'todos'
              ? 'bg-caribbean-600 border-caribbean-600 text-white shadow-xl'
              : 'bg-white border-white text-caribbean-500'
              }`}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFiltroCategoria(cat.value)}
              className={`px-6 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all text-sm border-2 ${filtroCategoria === cat.value
                ? `${cat.color} border-white text-white shadow-xl`
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
          className="w-full bg-white rounded-2xl p-4 shadow-tropical mb-6 flex items-center justify-center text-caribbean-600 hover:text-caribbean-700 font-bold transition-all hover:scale-[1.02] border-2 border-caribbean-50"
        >
          <Plus size={24} className="mr-2" />
          Nuevo ítem de equipaje
        </button>

        {/* Modal Formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-2xl font-bold text-caribbean-800">
                  {editingId ? 'Editar Ítem' : 'Nuevo Ítem'}
                </h2>
                <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-caribbean-500 uppercase tracking-wider mb-1">
                    Nombre del ítem
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Camiseta blanca"
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-caribbean-50 border-2 border-transparent focus:border-caribbean-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-caribbean-500 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-caribbean-50 border-2 border-transparent focus:border-caribbean-400 focus:bg-white focus:outline-none transition-all"
                  >
                    {categorias.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-caribbean-500 to-coral-400 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
                  >
                    {editingId ? 'Actualizar Ítem' : 'Guardar Ítem'}
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

        {/* Lista de items */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-caribbean-200 border-t-caribbean-500 mx-auto"></div>
            <p className="text-caribbean-600 mt-4 font-medium">Revisando la maleta...</p>
          </div>
        ) : itemsFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-tropical border-2 border-dashed border-caribbean-200">
            <Package className="mx-auto text-caribbean-200 mb-4" size={64} />
            <p className="text-caribbean-800 font-display text-xl font-bold">
              Maleta vacía
            </p>
            <p className="text-caribbean-500 text-sm mt-2 max-w-xs mx-auto">
              No dejes nada atrás. Empieza a agregar los items que llevarás.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {itemsFiltrados.map((item, index) => {
              const cat = categorias.find(c => c.value === item.categoria) || categorias[categorias.length - 1]
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-5 shadow-tropical border-2 transition-all animate-slide-up group ${item.empacado ? 'border-green-100 opacity-75' : 'border-transparent hover:border-caribbean-100'
                    }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Toggle Empacado */}
                    <button
                      onClick={() => toggleEmpacado(item)}
                      className={`transition-all transform active:scale-90 ${item.empacado ? 'text-green-500' : 'text-caribbean-200 hover:text-caribbean-400'
                        }`}
                    >
                      {item.empacado ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${cat.color} text-white uppercase tracking-wider`}>
                          {cat.emoji} {cat.label}
                        </span>
                      </div>

                      <h3 className={`font-display font-bold mb-0 transition-all ${item.empacado ? 'text-gray-400 line-through' : 'text-caribbean-900'
                        }`}>
                        {item.item}
                      </h3>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 text-caribbean-300 hover:text-caribbean-500 hover:bg-caribbean-50 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => eliminarItem(item.id)}
                        className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
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
