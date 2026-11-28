import { useState, useEffect } from 'react'
import { User as UserIcon, Package, TrendingUp, Tag, Edit, Trash2, Plus, Clock, DollarSign, Award, AlertCircle, MapPin as MapPinIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { userApi, formatPrice } from '../services/api'
import type { User as UserType } from '../services/api'

type Tab = 'perfil' | 'enderecos' | 'pedidos' | 'perfil-consumo' | 'promocoes'

const tabConfig: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'perfil', label: 'Perfil', icon: <UserIcon size={18} /> },
  { id: 'enderecos', label: 'Endereços', icon: <MapPinIcon size={18} /> },
  { id: 'pedidos', label: 'Pedidos', icon: <Package size={18} /> },
  { id: 'perfil-consumo', label: 'Meu Perfil', icon: <TrendingUp size={18} /> },
  { id: 'promocoes', label: 'Promoções', icon: <Tag size={18} /> },
]

export function CustomerArea({ onClose }: { onClose?: () => void }) {
  const { user, token, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('perfil')
  const [error, setError] = useState('')

  // Profile
  interface ExtendedUser extends UserType {
    birthDate?: string
    gender?: string
    loyaltyPoints?: number
    loyaltyTier?: string
  }
  const [profile, setProfile] = useState<Partial<ExtendedUser>>({})
  const [editingProfile, setEditingProfile] = useState(false)

  // Addresses
  const [addresses, setAddresses] = useState<any[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any | null>(null)
  const [addressForm, setAddressForm] = useState({
    id: '',
    type: 'home',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false,
    reference: '',
  })

  // Orders
  const [orders, setOrders] = useState<any[]>([])
  const [ordersPage, setOrdersPage] = useState(1)

  // Consumption Profile
  const [consumptionProfile, setConsumptionProfile] = useState<any>(null)

  // Promotions
  const [promotions, setPromotions] = useState<any[]>([])
  const [promoCode, setPromoCode] = useState('')

  // Load data
  useEffect(() => {
    if (token) loadAllData()
  }, [token])

  const loadAllData = async () => {
    try {
      const [profileRes, addressesRes, ordersRes, consumptionRes, promotionsRes] = await Promise.allSettled([
        userApi.getProfile(token!),
        userApi.getAddresses(token!),
        userApi.getOrderHistory(token!, { page: 1, limit: 10 }),
        userApi.getConsumptionProfile(token!),
        userApi.getPersonalizedPromotions(token!),
      ])

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.user)
      if (addressesRes.status === 'fulfilled') setAddresses(addressesRes.value.addresses || [])
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.orders || [])
      if (consumptionRes.status === 'fulfilled') setConsumptionProfile(consumptionRes.value)
      if (promotionsRes.status === 'fulfilled') setPromotions(promotionsRes.value.promotions || [])
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await userApi.updateProfile(token!, profile)
      setEditingProfile(false)
      await refreshUser()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAddress) {
        await userApi.updateAddress(token!, editingAddress.id, addressForm)
      } else {
        await userApi.addAddress(token!, addressForm)
      }
      setShowAddressForm(false)
      setEditingAddress(null)
      resetAddressForm()
      await loadAllData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Excluir este endereço?')) return
    try {
      await userApi.deleteAddress(token!, id)
      await loadAllData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await userApi.setDefaultAddress(token!, id)
      await loadAllData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await userApi.applyPromotion(token!, promoCode.toUpperCase())
      setPromoCode('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const resetAddressForm = () => {
    setAddressForm({
      id: '', type: 'home', street: '', number: '', complement: '',
      neighborhood: '', city: '', state: '', zipCode: '',
      isDefault: false, reference: '',
    })
  }

  const editAddress = (addr: any) => {
    setEditingAddress(addr)
    setAddressForm({ ...addr })
    setShowAddressForm(true)
  }

  const newAddress = () => {
    setEditingAddress(null)
    resetAddressForm()
    setShowAddressForm(true)
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      cart: 'Carrinho', pending: 'Pagamento pendente', confirmed: 'Confirmado',
      preparing: 'Em separação', ready: 'Pronto para entrega', delivering: 'Saiu para entrega',
      delivered: 'Entregue', cancelled: 'Cancelado', returned: 'Devolvido'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      cart: '#8b9b8d', pending: '#f0ad4e', confirmed: '#234b3b',
      preparing: '#31708f', ready: '#5cb85c', delivering: '#0275d8',
      delivered: '#28a745', cancelled: '#c0392b', returned: '#8b9b8d'
    }
    return colors[status] || '#8b9b8d'
  }

  if (!user) return null

  return (
    <div className="customer-area-overlay" onClick={onClose}>
      <div className="customer-area" onClick={e => e.stopPropagation()}>
        <header className="customer-header">
          <button className="customer-back" onClick={onClose}>←</button>
          <h1>Minha Conta</h1>
          <div className="customer-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        </header>

        {error && <div className="customer-alert error"><AlertCircle size={16} />{error}</div>}

        <nav className="customer-tabs">
          {tabConfig.map(tab => (
            <button
              key={tab.id}
              className={`customer-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="customer-content">
          {/* PERFIL */}
          {activeTab === 'perfil' && (
            <div className="customer-section">
              {editingProfile ? (
                <form onSubmit={handleProfileSave} className="profile-form">
                  <div className="form-row">
                    <div className="form-field">
                      <label>Nome completo</label>
                      <input
                        type="text"
                        value={profile.name || ''}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Email</label>
                      <input
                        type="email"
                        value={profile.email || ''}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Telefone</label>
                      <input
                        type="tel"
                        value={profile.phone || ''}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Data de nascimento</label>
                      <input
                        type="date"
                        value={profile.birthDate || ''}
                        onChange={e => setProfile({ ...profile, birthDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Gênero</label>
                      <select value={profile.gender || ''} onChange={e => setProfile({ ...profile, gender: e.target.value })}>
                        <option value="">Não informar</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="O">Outro</option>
                        <option value="P">Prefiro não dizer</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => setEditingProfile(false)}>Cancelar</button>
                    <button type="submit" className="btn-primary">Salvar</button>
                  </div>
                </form>
              ) : (
                <div className="profile-view">
                  <div className="profile-avatar-large">{user.name?.charAt(0).toUpperCase()}</div>
                  <h2>{user.name}</h2>
                  <p className="profile-email">{user.email}</p>
                  {user.phone && <p className="profile-phone">📱 {user.phone}</p>}
                  {profile.birthDate && <p>🎂 {new Date(profile.birthDate).toLocaleDateString('pt-BR')}</p>}
                  {profile.gender && <p>⚥ {profile.gender === 'M' ? 'Masculino' : profile.gender === 'F' ? 'Feminino' : 'Outro'}</p>}
                  <div className="profile-stats">
                    <div className="stat"><span>{consumptionProfile?.loyalty?.points || user.loyaltyPoints || 0}</span>Pontos</div>
                    <div className="stat"><span>{(consumptionProfile?.loyalty?.tier || user.loyaltyTier || 'bronze').toUpperCase()}</span>Nível</div>
                  </div>
                  <button className="btn-edit" onClick={() => setEditingProfile(true)}>
                    <Edit size={16} /> Editar perfil
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ENDEREÇOS */}
          {activeTab === 'enderecos' && (
            <div className="customer-section">
              <div className="section-header">
                <h2>Meus Endereços</h2>
                <button className="btn-primary" onClick={newAddress}>
                  <Plus size={16} /> Novo endereço
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddressSave} className="address-form">
                  <h3>{editingAddress ? 'Editar endereço' : 'Novo endereço'}</h3>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Tipo</label>
                      <select value={addressForm.type} onChange={e => setAddressForm({ ...addressForm, type: e.target.value })}>
                        <option value="home">🏠 Residencial</option>
                        <option value="work">🏢 Trabalho</option>
                        <option value="other">📍 Outro</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>CEP</label>
                      <input type="text" value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} placeholder="00000-000" maxLength={9} />
                    </div>
                    <div className="form-field">
                      <label>Número</label>
                      <input type="text" value={addressForm.number} onChange={e => setAddressForm({ ...addressForm, number: e.target.value })} placeholder="123" />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Rua</label>
                    <input type="text" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} placeholder="Rua das Flores" required />
                  </div>
                  <div className="form-field">
                    <label>Complemento</label>
                    <input type="text" value={addressForm.complement} onChange={e => setAddressForm({ ...addressForm, complement: e.target.value })} placeholder="Apto 101, Bloco B" />
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Bairro</label>
                      <input type="text" value={addressForm.neighborhood} onChange={e => setAddressForm({ ...addressForm, neighborhood: e.target.value })} placeholder="Copacabana" required />
                    </div>
                    <div className="form-field">
                      <label>Cidade</label>
                      <input type="text" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="Rio de Janeiro" required />
                    </div>
                    <div className="form-field">
                      <label>Estado</label>
                      <input type="text" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="RJ" maxLength={2} required />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Referência</label>
                    <input type="text" value={addressForm.reference} onChange={e => setAddressForm({ ...addressForm, reference: e.target.value })} placeholder="Próximo ao metrô, portão azul" />
                  </div>
                  <label className="checkbox-field">
                    <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                    <span>Endereço padrão para entregas</span>
                  </label>
                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => { setShowAddressForm(false); setEditingAddress(null); resetAddressForm(); }}>Cancelar</button>
                    <button type="submit" className="btn-primary">{editingAddress ? 'Atualizar' : 'Adicionar'}</button>
                  </div>
                </form>
              )}

              <div className="address-list">
                {addresses.length === 0 ? (
                  <div className="empty-state">
                    <MapPinIcon size={48} />
                    <p>Nenhum endereço cadastrado</p>
                    <button className="btn-primary" onClick={newAddress}>Adicionar primeiro endereço</button>
                  </div>
                ) : (
                  addresses.map(addr => (
                    <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                      <div className="address-main">
                        <span className="address-type">{addr.type === 'home' ? '🏠' : addr.type === 'work' ? '🏢' : '📍'} {addr.type === 'home' ? 'Residencial' : addr.type === 'work' ? 'Trabalho' : 'Outro'}</span>
                        {addr.isDefault && <span className="default-badge">Padrão</span>}
                      </div>
                      <p className="address-street">{addr.street}, {addr.number}</p>
                      {addr.complement && <p className="address-complement">{addr.complement}</p>}
                      <p className="address-details">{addr.neighborhood}, {addr.city} - {addr.state} | CEP: {addr.zipCode}</p>
                      {addr.reference && <p className="address-reference">📍 Ref: {addr.reference}</p>}
                      <div className="address-actions">
                        {!addr.isDefault && <button onClick={() => handleSetDefaultAddress(addr.id)} className="btn-text">Definir padrão</button>}
                        <button onClick={() => editAddress(addr)} className="btn-text"><Edit size={14} /> Editar</button>
                        <button onClick={() => handleDeleteAddress(addr.id)} className="btn-text danger"><Trash2 size={14} /> Excluir</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div className="customer-section">
              <h2>Histórico de Pedidos</h2>
              {orders.length === 0 ? (
                <div className="empty-state">
                  <Package size={48} />
                  <p>Nenhum pedido realizado</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div>
                          <span className="order-id">#{order.id.slice(0, 8)}</span>
                          <span className="order-date">{formatDate(order.createdAt)}</span>
                        </div>
                        <span className="order-status" style={{ background: getStatusColor(order.status), color: '#fff' }}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="order-items-preview">
                        {order.items?.slice(0, 3).map((item: any) => (
                          <span key={item.id} className="order-item-tag">{item.productName} x{item.quantity}</span>
                        ))}
                        {(order.items?.length || 0) > 3 && <span className="order-item-tag">+{(order.items.length - 3)} itens</span>}
                      </div>
                      <div className="order-footer">
                        <strong>{formatPrice(order.total)}</strong>
                        <div className="order-actions">
                          <button className="btn-text" onClick={() => setActiveTab('pedidos')}>Ver detalhes</button>
                          {['delivered', 'confirmed'].includes(order.status) && (
                            <button className="btn-text" onClick={() => userApi.reorder(token!, order.id).then(() => loadAllData())}>
                              Comprar novamente
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pagination">
                    <button disabled={ordersPage <= 1} onClick={() => setOrdersPage(p => p - 1)}>Anterior</button>
                    <span>Página {ordersPage}</span>
                    <button onClick={() => setOrdersPage(p => p + 1)}>Próxima</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PERFIL DE CONSUMO */}
          {activeTab === 'perfil-consumo' && (
            <div className="customer-section">
              <h2>Meu Perfil de Consumo</h2>
              {consumptionProfile ? (
                <>
                  <div className="consumption-grid">
                    <div className="consumption-card">
                      <h3><DollarSign size={20} /> Gasto Total</h3>
                      <p className="big-value">{formatPrice(consumptionProfile.totalSpent || 0)}</p>
                    </div>
                    <div className="consumption-card">
                      <h3><Package size={20} /> Pedidos</h3>
                      <p className="big-value">{consumptionProfile.orderCount || 0}</p>
                    </div>
                    <div className="consumption-card">
                      <h3><TrendingUp size={20} /> Ticket Médio</h3>
                      <p className="big-value">{formatPrice(consumptionProfile.avgOrderValue || 0)}</p>
                    </div>
                    <div className="consumption-card">
                      <h3><Award size={20} /> Nível</h3>
                      <p className="big-value tier-{consumptionProfile?.loyalty?.tier || 'bronze'}">{(consumptionProfile?.loyalty?.tier || 'bronze').toUpperCase()}</p>
                      <p className="points">{consumptionProfile?.loyalty?.points || 0} pontos</p>
                    </div>
                  </div>

                  <div className="consumption-details">
                    <div className="detail-section">
                      <h3><Tag size={18} /> Categorias Favoritas</h3>
                      <div className="tags">
                        {(consumptionProfile.favoriteCategories || []).map((cat: string) => (
                          <span key={cat} className="tag">{cat}</span>
                        ))}
                      </div>
                    </div>
                    <div className="detail-section">
                      <h3><Award size={18} /> Marcas Favoritas</h3>
                      <div className="tags">
                        {(consumptionProfile.favoriteBrands || []).map((brand: string) => (
                          <span key={brand} className="tag">{brand}</span>
                        ))}
                      </div>
                    </div>
                    <div className="detail-section">
                      <h3><Clock size={18} /> Frequência</h3>
                      <p>{consumptionProfile.purchaseFrequency || 'new'}</p>
                    </div>
                    <div className="detail-section">
                      <h3><Package size={18} /> Tamanho da Cesta</h3>
                      <p>{consumptionProfile.basketSize || 'small'}</p>
                    </div>
                    <div className="detail-section">
                      <h3><TrendingUp size={18} /> Sensibilidade a Preço</h3>
                      <p>{consumptionProfile.priceElasticity || 'medium'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <TrendingUp size={48} />
                  <p>Faça seu primeiro pedido para ver seu perfil</p>
                </div>
              )}
            </div>
          )}

          {/* PROMOÇÕES */}
          {activeTab === 'promocoes' && (
            <div className="customer-section">
              <div className="section-header">
                <h2>Minhas Promoções</h2>
                <form onSubmit={handleApplyPromo} className="promo-apply-form">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="CÓDIGO DO CUPOM"
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button type="submit" className="btn-primary">Aplicar</button>
                </form>
              </div>

              {promotions.length === 0 ? (
                <div className="empty-state">
                  <Tag size={48} />
                  <p>Nenhuma promoção disponível no momento</p>
                  <p className="hint">Promoções personalizadas aparecem baseadas no seu perfil de compras</p>
                </div>
              ) : (
                <div className="promotions-list">
                  {promotions.map(promo => (
                    <div key={promo.id} className={`promo-card ${promo.canUse ? '' : 'used'}`}>
                      <div className="promo-header">
                        <div className="promo-type-badge">{promo.type.replace('_', ' ').toUpperCase()}</div>
                        <span className="promo-value">{promo.type.includes('percent') ? `${promo.value}% OFF` : promo.type.includes('fixed') ? formatPrice(promo.value) : promo.type === 'free_delivery' ? 'Frete Grátis' : 'Especial'}</span>
                      </div>
                      <h3>{promo.title}</h3>
                      <p>{promo.description}</p>
                      <div className="promo-meta">
                        <span>Válido até {promo.endsAt ? formatDate(promo.endsAt) : 'Indeterminado'}</span>
                        {promo.code && <span className="promo-code">Cupom: <strong>{promo.code}</strong></span>}
                      </div>
                      {promo.canUse ? (
                        <button className="btn-primary" onClick={() => { setPromoCode(promo.code); setActiveTab('promocoes'); }}>Usar este cupom</button>
                      ) : (
                        <button className="btn-secondary" disabled>Já utilizado</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}