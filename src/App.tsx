import { useMemo, useState } from 'react'
import { Search, ShoppingBag, MapPin, ChevronRight, Plus, Minus, Home, LayoutGrid, UserRound, ArrowRight, X, Check, Truck, Package } from 'lucide-react'
import { departments } from './data/departments'
import { products } from './data/products'
import type { Product } from './types/catalog'

type Cart = Record<string, number>
type Tab = 'Início' | 'Categorias' | 'Carrinho' | 'Perfil'
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const unitLabel: Record<Product['unit'], string> = { KG: 'kg', G: 'g', L: 'litro', ML: 'ml', UNIT: 'unidade', PACKAGE: 'pacote', BOX: 'caixa', BUNCH: 'maço' }

export default function App() {
  const [activeDepartment, setActiveDepartment] = useState('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<Cart>({})
  const [tab, setTab] = useState<Tab>('Início')
  const [notice, setNotice] = useState('')

  const activeProducts = products.filter(product => product.active)
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const cartTotal = activeProducts.reduce((sum, product) => sum + product.price * (cart[product.id] || 0), 0)
  const filtered = useMemo(() => activeProducts.filter(product =>
    (activeDepartment === 'all' || product.departmentId === activeDepartment) &&
    (product.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')) ||
      product.category.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))
  ), [activeDepartment, search])

  const deliveryGroups = useMemo(() => {
    const grouped = new Map<string, Product[]>()
    activeProducts.filter(product => cart[product.id]).forEach(product => {
      const current = grouped.get(product.supplierGroup) || []
      grouped.set(product.supplierGroup, [...current, product])
    })
    return Array.from(grouped.entries()).map(([key, items]) => ({
      id: key,
      title: items.length > 1 ? items[0].category === 'Frutas' ? 'Hortifrúti e frescos' : items[0].supplierGroup : items[0].category,
      items,
      total: items.reduce((sum, item) => sum + item.price * (cart[item.id] || 0), 0),
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
              {departments.filter(department => department.active).map(department => (
                <button key={department.id} className={`category-tile ${activeDepartment === department.id ? 'selected' : ''}`} onClick={() => selectDepartment(department.id)}>
                  <span>{department.icon}</span><strong>{department.name}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="section-block catalog" id="catalogo">
            <div className="section-heading"><div><span className="eyebrow">{activeDepartment === 'all' ? 'SELEÇÃO PARA SUA CASA' : 'DEPARTAMENTO'}</span><h2>{activeDepartment === 'all' ? 'Produtos em destaque' : departments.find(item => item.id === activeDepartment)?.name}</h2></div><span className="item-count">{filtered.length} itens</span></div>
            <label className="search-box"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar em todo o mercado..." /><kbd>⌕</kbd></label>
            <div className="filter-pills">
              <button className={activeDepartment === 'all' ? 'active' : ''} onClick={() => setActiveDepartment('all')}>Todos</button>
              {departments.map(department => <button key={department.id} className={activeDepartment === department.id ? 'active' : ''} onClick={() => setActiveDepartment(department.id)}>{department.name}</button>)}
            </div>
            {filtered.length ? <div className="product-grid">
              {filtered.map(product => <article className="product-card" key={product.id}>
                <div className="product-photo"><img src={product.image} alt={product.name} loading="lazy" />{product.badge && <span className="product-tag">{product.badge}</span>}
                  {cart[product.id] ? <div className="quantity-control"><button aria-label={`Diminuir ${product.name}`} onClick={() => updateCart(product, -1)}><Minus size={14} /></button><b>{cart[product.id]}</b><button aria-label={`Aumentar ${product.name}`} onClick={() => updateCart(product, 1)}><Plus size={14} /></button></div> : <button className="add-button" aria-label={`Adicionar ${product.name}`} onClick={() => updateCart(product, 1)}><Plus size={18} /></button>}
                </div>
                <div className="product-info"><small>{departments.find(item => item.id === product.departmentId)?.name.toUpperCase()}</small><h3>{product.name}</h3><p>{product.description}</p><div className="price-line"><strong>{money(product.price)}</strong><span> / {unitLabel[product.unit]}</span></div>{product.previousPrice && <del>{money(product.previousPrice)}</del>}{product.isWeighed && <small className="weighed-note">Preço estimado por peso</small>}</div>
              </article>)}
            </div> : <div className="empty-state">Não encontramos produtos com esses filtros.</div>}
          </section>
        </> : null}

        {tab === 'Carrinho' && <section className="page-section"><span className="eyebrow">SEU PEDIDO</span><h1 className="page-title">Carrinho</h1>
          {cartCount === 0 ? <div className="empty-cart"><div className="empty-icon"><ShoppingBag size={30} /></div><h2>Seu carrinho está vazio</h2><p>Explore os departamentos e monte sua compra.</p><button className="primary-button" onClick={() => setTab('Início')}>Ver mercado <ArrowRight size={16} /></button></div> :
          <>
            <div className="cart-list">{activeProducts.filter(product => cart[product.id]).map(product => <div className="cart-row" key={product.id}><img src={product.image} alt="" /><div className="cart-description"><strong>{product.name}</strong><small>{money(product.price)} / {unitLabel[product.unit]}</small><div className="quantity-control inline"><button aria-label={`Diminuir ${product.name}`} onClick={() => updateCart(product, -1)}><Minus size={13} /></button><b>{cart[product.id]}</b><button aria-label={`Aumentar ${product.name}`} onClick={() => updateCart(product, 1)}><Plus size={13} /></button></div></div><strong className="line-total">{money(product.price * cart[product.id])}</strong></div>)}</div>
            <section className="delivery-preview"><div className="section-heading"><div><span className="eyebrow">LOGÍSTICA DO PEDIDO</span><h2>Grupos de separação</h2></div><Package size={19} /></div><p>Seu pedido poderá ser organizado em mais de uma entrega. A divisão e os fretes serão confirmados no checkout.</p>
              {deliveryGroups.map(group => <div className="delivery-group" key={group.id}><div><strong>{group.title}</strong><small>{group.items.map(item => item.name).join(', ')}</small></div><b>{money(group.total)}</b></div>)}
              <small className="demo-note">Agrupamentos demonstrativos por origem operacional; não representam entregas confirmadas.</small>
            </section>
            <div className="cart-summary"><div><span>Subtotal estimado</span><strong>{money(cartTotal)}</strong></div><small>Frete ainda não calculado. O valor final dos itens pesáveis pode variar após a pesagem e validação.</small><button className="primary-button full" onClick={() => setNotice('Checkout será conectado à API na próxima etapa.')}>Continuar <ArrowRight size={16} /></button></div>
          </>}
        </section>}

        {tab === 'Perfil' && <section className="page-section"><span className="eyebrow">SUA CONTA</span><h1 className="page-title">Bem-vindo(a)</h1><div className="profile-card"><div className="profile-avatar"><UserRound /></div><h2>Área do cliente</h2><p>Em breve você poderá acessar seus dados, endereços e histórico de pedidos por aqui.</p><button className="primary-button" onClick={() => setNotice('Cadastro será implementado na próxima etapa.')}>Criar minha conta</button></div></section>}
      </main>

      {notice && <div className="toast"><Check size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Fechar"><X size={14} /></button></div>}

      <nav className="bottom-nav">
        <button className={tab === 'Início' ? 'current' : ''} onClick={() => setTab('Início')}><Home size={20} /><span>Início</span></button>
        <button className={tab === 'Categorias' ? 'current' : ''} onClick={() => { setActiveDepartment('all'); setTab('Categorias') }}><LayoutGrid size={20} /><span>Departamentos</span></button>
        <button onClick={() => setTab('Carrinho')} className={`nav-cart ${tab === 'Carrinho' ? 'current' : ''}`}><span className="nav-cart-icon"><ShoppingBag size={20} />{cartCount > 0 && <i>{cartCount}</i>}</span><span>Carrinho</span></button>
        <button className={tab === 'Perfil' ? 'current' : ''} onClick={() => setTab('Perfil')}><UserRound size={20} /><span>Perfil</span></button>
      </nav>
    </div>
  )
}
