'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, DollarSign, Trash2, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Gasto = {
  id: string
  categoria: string
  monto: number
  descripcion: string
  fecha: string
}

const categorias = [
  { value: 'transporte', label: 'Transporte', color: 'bg-blue-500' },
  { value: 'alojamiento', label: 'Alojamiento', color: 'bg-purple-500' },
  { value: 'comida', label: 'Comida', color: 'bg-green-500' },
  { value: 'actividades', label: 'Actividades', color: 'bg-orange-500' },
  { value: 'compras', label: 'Compras', color: 'bg-pink-500' },
  { value: 'otro', label: 'Otro', color: 'bg-gray-500' },
]

export default function PresupuestoPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [presupuestoTotal] = useState(3000000) // Presupuesto inicial
  const [formData, setFormData] = useState({
    categoria: '',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    cargarGastos()
  }, [])

  const cargarGastos = async () => {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .order('fecha', { ascending: false })
      
      if (error) throw error
      setGastos(data || [])
    } catch (error) {
      console.error('Error cargando gastos:', error)
    } finally {
      setLoading(false)
    }
  }

  const agregarGasto = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('gastos')
        .insert([{
          ...formData,
          monto: parseFloat(formData.monto)
        }])
      
      if (error) throw error
      
      setFormData({ categoria: '', monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0] })
      setShowForm(false)
      cargarGastos()
    } catch (error) {
      console.error('Error agregando gasto:', error)
      alert('Error al agregar el gasto. Verifica tu conexión con Supabase.')
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

  const totalGastado = gastos.reduce((sum, gasto) => sum + gasto.monto, 0)
  const porcentajeGastado = (totalGastado / presupuestoTotal) * 100
  const disponible = presupuestoTotal - totalGastado

  const gastosPorCategoria = categorias.map(cat => ({
    ...cat,
    total: gastos
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
    <main className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-coral-400 to-coral-600 pt-12 pb-24 px-6">
        <Link href="/" className="inline-flex items-center text-white mb-6 hover:text-coral-100 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Volver
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              Presupuesto
            </h1>
            <p className="text-coral-100 font-body">
              Controla tus gastos
            </p>
          </div>
          <DollarSign className="text-white/30" size={60} />
        </div>
      </div>

      <div className="px-6 -mt-16 max-w-4xl mx-auto">
        {/* Resumen del presupuesto */}
        <div className="glass rounded-3xl p-6 shadow-coral mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-coral-600 font-medium mb-1">Gastado</p>
              <p className="font-display text-3xl font-bold text-coral-700">
                {formatearMoneda(totalGastado)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-caribbean-600 font-medium mb-1">Disponible</p>
              <p className={`font-display text-3xl font-bold ${disponible < 0 ? 'text-red-600' : 'text-caribbean-700'}`}>
                {formatearMoneda(disponible)}
              </p>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Presupuesto total</span>
              <span>{porcentajeGastado.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  porcentajeGastado > 100 ? 'bg-red-500' : 
                  porcentajeGastado > 80 ? 'bg-orange-500' : 
                  'bg-gradient-to-r from-coral-400 to-coral-500'
                }`}
                style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
              />
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-600 mt-3">
            de {formatearMoneda(presupuestoTotal)}
          </p>
        </div>

        {/* Gastos por categoría */}
        <div className="glass rounded-3xl p-6 shadow-tropical mb-6">
          <h3 className="font-display text-xl font-bold text-caribbean-800 mb-4 flex items-center">
            <TrendingUp size={24} className="mr-2 text-coral-500" />
            Por categoría
          </h3>
          <div className="space-y-3">
            {gastosPorCategoria
              .filter(cat => cat.total > 0)
              .sort((a, b) => b.total - a.total)
              .map(cat => (
                <div key={cat.value} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${cat.color} mr-3`} />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                      <span className="text-sm font-bold text-gray-900">{formatearMoneda(cat.total)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full ${cat.color}`}
                        style={{ width: `${(cat.total / totalGastado) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Botón agregar */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full glass rounded-2xl p-4 shadow-tropical mb-6 flex items-center justify-center text-coral-600 hover:text-coral-700 font-medium transition-all hover:shadow-xl btn-wave"
        >
          <Plus size={24} className="mr-2" />
          Agregar gasto
        </button>

        {/* Formulario */}
        {showForm && (
          <div className="glass rounded-3xl p-6 shadow-tropical mb-6 animate-slide-up">
            <form onSubmit={agregarGasto} className="space-y-4">
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
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-caribbean-700 mb-2">
                  Monto (COP)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  placeholder="50000"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-caribbean-200 focus:border-caribbean-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-caribbean-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Tickets aéreos"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-caribbean-200 focus:border-caribbean-500 focus:outline-none transition-colors"
                />
              </div>

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

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-coral-500 to-coral-600 text-white py-3 rounded-xl font-medium hover:from-coral-600 hover:to-coral-700 transition-all shadow-lg hover:shadow-xl btn-wave"
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

        {/* Lista de gastos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-coral-200 border-t-coral-500 mx-auto"></div>
            <p className="text-coral-600 mt-4">Cargando...</p>
          </div>
        ) : gastos.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center shadow-tropical">
            <DollarSign className="mx-auto text-coral-300 mb-4" size={60} />
            <p className="text-coral-600 font-body text-lg">
              No hay gastos registrados
            </p>
            <p className="text-coral-400 text-sm mt-2">
              Agrega tu primer gasto para comenzar
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {gastos.map((gasto, index) => {
              const cat = categorias.find(c => c.value === gasto.categoria)
              return (
                <div
                  key={gasto.id}
                  className="glass rounded-2xl p-4 shadow-tropical hover:shadow-xl transition-all animate-slide-up flex items-center justify-between"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center flex-1">
                    <div className={`w-10 h-10 rounded-full ${cat?.color} flex items-center justify-center mr-3`}>
                      <DollarSign className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-caribbean-800">
                          {gasto.descripcion}
                        </h3>
                        <p className="font-display text-lg font-bold text-coral-600 ml-3">
                          {formatearMoneda(gasto.monto)}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">{cat?.label}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(gasto.fecha + 'T00:00:00').toLocaleDateString('es-CO')}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarGasto(gasto.id)}
                    className="text-coral-500 hover:text-coral-600 p-2 hover:bg-coral-50 rounded-lg transition-all ml-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
