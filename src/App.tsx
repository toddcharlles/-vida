import { useMemo, useState, useEffect } from 'react'
import { Search, ShoppingBag, MapPin, ChevronRight, Plus, Minus, Home, LayoutGrid, UserRound, ArrowRight, X, Check, Truck, Package, Loader2, AlertCircle, RefreshCw, User } from 'lucide-react'
import { productApi, categoryApi, type Product, type Category, formatPrice, getDisplayPrice } from './services/api'
import { useProductImages } from './utils/productImages'
import { useAuth } from './context/AuthContext'
import { AuthScreen } from './components/AuthScreen'
import { CustomerArea } from './components/CustomerArea'

type Cart = Record<string, number>
type Tab = 'Início' | 'Categorias' | 'Carrinho' | 'Perfil'

// Wrapper para compatibilidade com useProductImages (removido - não usado)

export default function App() {
  const { user } = useAuth()
  const [activeDepartment, setActiveDepartment] = useState('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<Cart>({})
  const [tab, setTab] = useState<Tab>('Início')
  const [notice, setNotice] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const [showCustomerArea, setShowCustomerArea] = useState(false)

  // API state
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Para o hook de imagens, adaptar produtos
  const productsForImages = products.map(p => ({ ...p, departmentId: p.categoryId, slug: p.id, active: p.available }))
  const { getImageUrl } = useProductImages(productsForImages as any)

  // Fetch data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [cats, prods] = await Promise.all([
        categoryApi.getAll(true),
        productApi.getAll({ available: true, limit: 200 }),
      ])
      setCategories(cats)
      setProducts(prods.products)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Falha ao conectar com o servidor. Usando dados locais.')
      // Fallback para dados mock se necessário
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    // Importação dinâmica dos dados mock
    import('./data/departments').then(({ departments }) => {
      setCategories(departments.map(d => ({
        id: d.id, name: d.name, slug: d.slug, icon: d.icon,
        description: d.description, order: d.sortOrder, active: d.active,
        createdAt: '', updatedAt: '',
      })))
    })
    import('./data/products').then(({ products: mockProducts }) => {
      const unitMap: Record<string, 'KG' | 'G' | 'L' | 'ML' | 'UN' | 'PACK' | 'BOX' | 'BUNCH'> = {
        'KG': 'KG', 'G': 'G', 'L': 'L', 'ML': 'ML',
        'UNIT': 'UN', 'PACKAGE': 'PACK', 'BOX': 'BOX', 'BUNCH': 'BUNCH',
      }
      setProducts(mockProducts.filter(p => p.active).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        salePrice: p.previousPrice && p.previousPrice > p.price ? p.price : undefined,
        pricePerKg: p.isWeighed ? p.price : undefined,
        barcode: p.barcode,
        unit: unitMap[p.unit] || 'UN',
        isWeighed: p.isWeighed,
        categoryId: p.departmentId,
        brand: undefined,
        image: p.image,
        supplierGroup: p.supplierGroup,
        available: p.active,
        featured: p.badge === 'Oferta',
        requiresRefrigeration: p.requiresRefrigeration,
        lastUpdateSource: 'mock',
        lastWhatsAppUpdate: undefined,
        lastOcrData: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })))
    })
  }

  const retry = () => loadData()

  const activeProducts = products.filter(p => p.available)
  const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0)
  const cartTotal = activeProducts.reduce((sum, p) => sum + (p.salePrice ?? p.price) * (cart[p.id] || 0), 0)

  const filtered = useMemo(() => activeProducts.filter(product =>
    (activeDepartment === 'all' || product.categoryId === activeDepartment) &&
    (product.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')) ||
      product.category?.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))
  ), [activeDepartment, search, activeProducts])

  const deliveryGroups = useMemo(() => {
    const grouped = new Map<string, Product[]>()
    activeProducts.filter(p => cart[p.id]).forEach(product => {
      const current = grouped.get(product.supplierGroup || product.categoryId) || []
      grouped.set(product.supplierGroup || product.categoryId, [...current, product])
    })
    return Array.from(grouped.entries()).map(([key, items]) => ({
      id: key,
      title: items.length > 1
        ? items[0].category?.name === 'Frutas' ? 'Hortifrúti e frescos' : items[0].supplierGroup || items[0].category?.name || 'Grupo'
        : items[0].category?.name || 'Item',
      items,
      total: items.reduce((sum, item) => sum + (item.salePrice ?? item.price) * (cart[item.id] || 0), 0),
    }))
  }, [cart, activeProducts])

  function updateCart(product: Product, delta: number) {
    setCart(current => {
      const next = { ...current, [product.id]: Math.max(0, (current[product.id] || 0) + delta) }
      if (!next[product.id]) delete next[product.id]
      return next
    })
    if (delta > 0) {
      setNotice(`${product.name} adicionado ao carrinho`)
      window.setTimeout(() => setNotice(''), 1800)
    }
  }

  const selectDepartment = (id: string) => {
    setActiveDepartment(id)
    setTab('Categorias')
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="app-shell">
        <header className="topbar">
          <div className="brand-mark"><ShoppingBag size={19} strokeWidth={2.2} /></div>
          <div className="brand-copy"><span>MERCADO COMPLETO</span><strong>Seu mercado, mais perto.</strong></div>
        </header>
        <main style={{ padding: '20px', textAlign: 'center' }}>
          <Loader2 size={40} className="spin" style={{ margin: '40px auto', color: '#1d493a' }} />
          <p style={{ color: '#63766a' }}>Carregando mercado...</p>
        </main>
      </div>
    )
  }

  // Error state com retry
  if (error && products.length === 0) {
    return (
      <div className="app-shell">
        <header className="topbar">
          <div className="brand-mark"><ShoppingBag size={19} strokeWidth={2.2} /></div>
          <div className="brand-copy"><span>MERCADO COMPLETO</span><strong>Seu mercado, mais perto.</strong></div>
        </header>
        <main style={{ padding: '20px', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: '#d77d51', marginBottom: '16px' }} />
          <h2 style={{ color: '#294638', marginBottom: '8px' }}>Não foi possível conectar</h2>
          <p style={{ color: '#63766a', marginBottom: '24px' }}>{error}</p>
          <button className="primary-button" onClick={retry}>
            <RefreshCw size={16} /> Tentar novamente
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark"><ShoppingBag size={19} strokeWidth={2.2} /></div>
        <div className="brand-copy"><span>MERCADO COMPLETO</span><strong>Seu mercado, mais perto.</strong></div>
        <button className="icon-button cart-top" aria-label="Abrir carrinho" onClick={() => setTab('Carrinho')}>
          <ShoppingBag size={21} /><i>{cartCount}</i>
        </button>
      </header>

      <main>
        {tab === 'Início' || tab === 'Categorias' ? <>
          <section className="delivery-line">
            <MapPin size={16} />
            <div><small>ENTREGAMOS EM</small><strong>Copacabana, Rio de Janeiro</strong></div>
            <ChevronRight size={17} className="muted" />
          </section>

          <section className="hero">
            <div className="hero-content">
              <span className="eyebrow">SEU MERCADO EM UM SÓ LUGAR</span>
              <h1>Do essencial<br /><em>ao especial.</em></h1>
              <p>Alimentos, frescos, limpeza, cuidados e muito mais para sua casa.</p>
              <button className="hero-cta" onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}>Explorar mercado <ArrowRight size={16} /></button>
            </div>
            <div className="hero-image" role="img" aria-label="Seleção de produtos de supermercado" />
            <div className="hero-stamp"><span>SEU</span><strong>MERCADO</strong><small>mais perto</small></div>
          </section>

          <section className="trust-row">
            <div><span className="trust-icon">✳</span><p><strong>Compra em um só lugar</strong><small>Diversos setores e categorias</small></p></div>
            <div><span className="trust-icon"><Truck size={16} /></span><p><strong>Entregas organizadas</strong><small>Acompanhe cada entrega</small></p></div>
          </section>

          <section className="section-block">
            <div className="section-heading"><div><span className="eyebrow">NAVEGUE PELO MERCADO</span><h2>Todos os departamentos</h2></div><button className="text-link" onClick={() => { setActiveDepartment('all'); setTab('Categorias') }}>Ver tudo <ChevronRight size={15} /></button></div>
            <div className="department-grid">
              {categories.filter(c => c.active).map(department => (
                <button key={department.id} className={`category-tile ${activeDepartment === department.id ? 'selected' : ''}`} onClick={() => selectDepartment(department.id)}>
                  <span>{department.icon}</span><strong>{department.name}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="section-block catalog" id="catalogo">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{activeDepartment === 'all' ? 'SELEÇÃO PARA SUA CASA' : 'DEPARTAMENTO'}</span>
                <h2>{activeDepartment === 'all' ? 'Produtos em destaque' : categories.find(c => c.id === activeDepartment)?.name}</h2>
              </div>
              <span className="item-count">{filtered.length} itens</span>
            </div>
            <label className="search-box"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar em todo o mercado..." /><kbd>⌕</kbd></label>
            <div className="filter-pills">
              <button className={activeDepartment === 'all' ? 'active' : ''} onClick={() => setActiveDepartment('all')}>Todos</button>
              {categories.map(department => <button key={department.id} className={activeDepartment === department.id ? 'active' : ''} onClick={() => setActiveDepartment(department.id)}>{department.name}</button>)}
            </div>
            {filtered.length ? (
              <div className="product-grid">
                {filtered.map(product => {
                  const display = getDisplayPrice(product)
                  return (
                    <article className="product-card" key={product.id}>
                      <div className="product-photo">
                        <img src={getImageUrl(product)} alt={product.name} loading="lazy" />
                        {product.salePrice && product.salePrice < product.price && <span className="product-tag">Oferta</span>}
                        {cart[product.id] ? (
                          <div className="quantity-control">
                            <button aria-label={`Diminuir ${product.name}`} onClick={() => updateCart(product, -1)}><Minus size={14} /></button>
                            <b>{cart[product.id]}</b>
                            <button aria-label={`Aumentar ${product.name}`} onClick={() => updateCart(product, 1)}><Plus size={14} /></button>
                          </div>
                        ) : (
                          <button className="add-button" aria-label={`Adicionar ${product.name}`} onClick={() => updateCart(product, 1)}><Plus size={18} /></button>
                        )}
                      </div>
                      <div className="product-info">
                        <small>{product.category?.name.toUpperCase()}</small>
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <div className="price-line">
                          <strong>{display.price}</strong>
                          <span>{display.unit}</span>
                        </div>
                        {product.salePrice && product.salePrice < product.price && (
                          <del style={{ fontSize: '8px', color: '#a8b1a8' }}>{formatPrice(product.price)}</del>
                        )}
                        {product.isWeighed && <small className="weighed-note">Preço por kg • Valor final varia na pesagem</small>}
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">Não encontramos produtos com esses filtros.</div>
            )}
          </section>
        </> : null}

        {tab === 'Carrinho' && (
          <section className="page-section">
            <span className="eyebrow">SEU PEDIDO</span>
            <h1 className="page-title">Carrinho</h1>
            {cartCount === 0 ? (
              <div className="empty-cart">
                <div className="empty-icon"><ShoppingBag size={30} /></div>
                <h2>Seu carrinho está vazio</h2>
                <p>Explore os departamentos e monte sua compra.</p>
                <button className="primary-button" onClick={() => setTab('Início')}>Ver mercado <ArrowRight size={16} /></button>
              </div>
            ) : (
              <>
                <div className="cart-list">
                  {activeProducts.filter(p => cart[p.id]).map(product => {
                    const display = getDisplayPrice(product)
                    const qty = cart[product.id]
                    const lineTotal = (product.salePrice ?? product.price) * qty
                    return (
                      <div className="cart-row" key={product.id}>
                        <img src={getImageUrl(product)} alt="" />
                        <div className="cart-description">
                          <strong>{product.name}</strong>
                          <small>{display.price} {display.unit}</small>
                          <div className="quantity-control inline">
                            <button aria-label={`Diminuir ${product.name}`} onClick={() => updateCart(product, -1)}><Minus size={13} /></button>
                            <b>{qty}</b>
                            <button aria-label={`Aumentar ${product.name}`} onClick={() => updateCart(product, 1)}><Plus size={13} /></button>
                          </div>
                        </div>
                        <strong className="line-total">{formatPrice(lineTotal)}</strong>
                      </div>
                    )
                  })}
                </div>
                <section className="delivery-preview">
                  <div className="section-heading">
                    <div><span className="eyebrow">LOGÍSTICA DO PEDIDO</span><h2>Grupos de separação</h2></div>
                    <Package size={19} />
                  </div>
                  <p>Seu pedido poderá ser organizado em mais de uma entrega. A divisão e os fretes serão confirmados no checkout.</p>
                  {deliveryGroups.map(group => (
                    <div className="delivery-group" key={group.id}>
                      <div><strong>{group.title}</strong><small>{group.items.map(i => i.name).join(', ')}</small></div>
                      <b>{formatPrice(group.total)}</b>
                    </div>
                  ))}
                  <small className="demo-note">Agrupamentos demonstrativos por origem operacional; não representam entregas confirmadas.</small>
                </section>
                <div className="cart-summary">
                  <div><span>Subtotal estimado</span><strong>{formatPrice(cartTotal)}</strong></div>
                  <small>Frete ainda não calculado. O valor final dos itens pesáveis pode variar após a pesagem e validação.</small>
                  <button className="primary-button full" onClick={() => setNotice('Checkout será conectado à API na próxima etapa.')}>Continuar <ArrowRight size={16} /></button>
                </div>
              </>
            )}
          </section>
        )}

        {tab === 'Perfil' && (
          user ? (
            <CustomerArea onClose={() => { setTab('Início'); setShowCustomerArea(false); }} />
          ) : (
            <section className="page-section">
              <span className="eyebrow">SUA CONTA</span>
              <h1 className="page-title">Bem-vindo(a)</h1>
              <div className="profile-card">
                <div className="profile-avatar"><UserRound /></div>
                <h2>Área do cliente</h2>
                <p>Faça login ou crie sua conta para acessar pedidos, endereços e promoções personalizadas.</p>
                <button className="primary-button" onClick={() => setShowAuth(true)}>Entrar / Cadastrar</button>
              </div>
            </section>
          )
        )}
      </main>

      {notice && (
        <div className="toast">
          <Check size={16} />{notice}
          <button onClick={() => setNotice('')} aria-label="Fechar"><X size={14} /></button>
        </div>
      )}

      {showAuth && <AuthScreen onClose={() => setShowAuth(false)} />}

      <nav className="bottom-nav">
        <button className={tab === 'Início' ? 'current' : ''} onClick={() => setTab('Início')}><Home size={20} /><span>Início</span></button>
        <button className={tab === 'Categorias' ? 'current' : ''} onClick={() => { setActiveDepartment('all'); setTab('Categorias') }}><LayoutGrid size={20} /><span>Departamentos</span></button>
        <button onClick={() => setTab('Carrinho')} className={`nav-cart ${tab === 'Carrinho' ? 'current' : ''}`}><span className="nav-cart-icon"><ShoppingBag size={20} />{cartCount > 0 && <i>{cartCount}</i>}</span><span>Carrinho</span></button>
        <button className={tab === 'Perfil' ? 'current' : ''} onClick={() => { setTab('Perfil'); setShowCustomerArea(true); }}><User size={20} /><span>Perfil</span></button>
      </nav>

      {showCustomerArea && user && <CustomerArea onClose={() => { setShowCustomerArea(false); setTab('Início'); }} />}
    </div>
  )
}