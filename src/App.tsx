import { useMemo, useState } from 'react'
import { Search, ShoppingBag, MapPin, ChevronRight, Plus, Minus, Leaf, Home, LayoutGrid, UserRound, ArrowRight, X, Check } from 'lucide-react'
import { categories, products, type Product } from './data/products'

type Cart = Record<number, number>
type Tab = 'Início' | 'Categorias' | 'Carrinho' | 'Perfil'
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function App() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<Cart>({})
  const [tab, setTab] = useState<Tab>('Início')
  const [notice, setNotice] = useState('')

  const cartCount = Object.values(cart).reduce((sum, n) => sum + n, 0)
  const cartTotal = products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0)
  const filtered = useMemo(() => products.filter(p =>
    (activeCategory === 'Todos' || p.category === activeCategory) &&
    p.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))
  ), [activeCategory, search])

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

  const goToCategory = (name: string) => { setActiveCategory(name); setTab('Categorias') }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark"><Leaf size={19} strokeWidth={2.2} /></div>
        <div className="brand-copy"><span>FRESCO TODO DIA</span><strong>Hortifruti selecionado</strong></div>
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
              <span className="eyebrow">DA FEIRA PARA SUA CASA</span>
              <h1>Frescor que<br /><em>faz bem.</em></h1>
              <p>Frutas, legumes e verduras selecionados para deixar sua rotina mais leve.</p>
              <button className="hero-cta" onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}>Explorar produtos <ArrowRight size={16} /></button>
            </div>
            <div className="hero-image" role="img" aria-label="Seleção de frutas e vegetais frescos" />
            <div className="hero-stamp"><span>SELEÇÃO</span><strong>FRESCA</strong><small>todos os dias</small></div>
          </section>

          <section className="trust-row">
            <div><span className="trust-icon">✳</span><p><strong>Seleção cuidadosa</strong><small>Qualidade em cada pedido</small></p></div>
            <div><span className="trust-icon">⌁</span><p><strong>Entrega programada</strong><small>Na sua melhor janela</small></p></div>
          </section>

          <section className="section-block">
            <div className="section-heading"><div><span className="eyebrow">ESCOLHA POR TIPO</span><h2>O que você procura?</h2></div><button className="text-link" onClick={() => setTab('Categorias')}>Ver tudo <ChevronRight size={15} /></button></div>
            <div className="category-strip">
              {categories.slice(1).map(c => <button key={c.name} className={`category-tile ${activeCategory === c.name ? 'selected' : ''}`} onClick={() => goToCategory(c.name)}><span>{c.icon}</span><strong>{c.name}</strong></button>)}
            </div>
          </section>

          <section className="section-block catalog" id="catalogo">
            <div className="section-heading"><div><span className="eyebrow">{activeCategory === 'Todos' ? 'FRESQUINHOS PARA VOCÊ' : 'CATEGORIA'}</span><h2>{activeCategory === 'Todos' ? 'Destaques da semana' : activeCategory}</h2></div><span className="item-count">{filtered.length} itens</span></div>
            <label className="search-box"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar frutas, legumes..." /><kbd>⌕</kbd></label>
            <div className="filter-pills">
              {categories.map(c => <button key={c.name} className={activeCategory === c.name ? 'active' : ''} onClick={() => setActiveCategory(c.name)}>{c.name}</button>)}
            </div>
            {filtered.length ? <div className="product-grid">
              {filtered.map(p => <article className="product-card" key={p.id}>
                <div className="product-photo"><img src={p.image} alt={p.name} loading="lazy" />{p.tag && <span className="product-tag">{p.tag}</span>}
                  {cart[p.id] ? <div className="quantity-control"><button aria-label="Diminuir quantidade" onClick={() => updateCart(p, -1)}><Minus size={14} /></button><b>{cart[p.id]}</b><button aria-label="Aumentar quantidade" onClick={() => updateCart(p, 1)}><Plus size={14} /></button></div> : <button className="add-button" aria-label={`Adicionar ${p.name}`} onClick={() => updateCart(p, 1)}><Plus size={18} /></button>}
                </div>
                <div className="product-info"><small>{p.category.toUpperCase()}</small><h3>{p.name}</h3><p>{p.description}</p><div className="price-line"><strong>{money(p.price)}</strong><span> / {p.unit}</span></div>{p.oldPrice && <del>{money(p.oldPrice)}</del>}</div>
              </article>)}
            </div> : <div className="empty-state">Não encontramos produtos com esse nome.</div>}
          </section>
        </> : null}

        {tab === 'Carrinho' && <section className="page-section"><span className="eyebrow">SEU PEDIDO</span><h1 className="page-title">Carrinho</h1>
          {cartCount === 0 ? <div className="empty-cart"><div className="empty-icon"><ShoppingBag size={30} /></div><h2>Seu carrinho está vazio</h2><p>Explore os produtos fresquinhos e monte seu pedido.</p><button className="primary-button" onClick={() => setTab('Início')}>Ver produtos <ArrowRight size={16} /></button></div> :
          <><div className="cart-list">{products.filter(p => cart[p.id]).map(p => <div className="cart-row" key={p.id}><img src={p.image} alt="" /><div className="cart-description"><strong>{p.name}</strong><small>{money(p.price)} / {p.unit}</small><div className="quantity-control inline"><button onClick={() => updateCart(p, -1)}><Minus size={13} /></button><b>{cart[p.id]}</b><button onClick={() => updateCart(p, 1)}><Plus size={13} /></button></div></div><strong className="line-total">{money(p.price * cart[p.id])}</strong></div>)}</div>
          <div className="cart-summary"><div><span>Subtotal estimado</span><strong>{money(cartTotal)}</strong></div><small>O valor final de itens vendidos por peso pode variar após a pesagem.</small><button className="primary-button full" onClick={() => setNotice('Checkout será conectado na próxima etapa.')}>Continuar <ArrowRight size={16} /></button></div></>}
        </section>}

        {tab === 'Perfil' && <section className="page-section"><span className="eyebrow">SUA CONTA</span><h1 className="page-title">Bem-vindo(a)</h1><div className="profile-card"><div className="profile-avatar"><UserRound /></div><h2>Área do cliente</h2><p>Em breve você poderá acessar seus dados, endereços e histórico de pedidos por aqui.</p><button className="primary-button" onClick={() => setNotice('Cadastro será implementado na próxima etapa.')}>Criar minha conta</button></div></section>}
      </main>

      {notice && <div className="toast"><Check size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Fechar"><X size={14} /></button></div>}

      <nav className="bottom-nav">
        <button className={tab === 'Início' ? 'current' : ''} onClick={() => setTab('Início')}><Home size={20} /><span>Início</span></button>
        <button className={tab === 'Categorias' ? 'current' : ''} onClick={() => setTab('Categorias')}><LayoutGrid size={20} /><span>Categorias</span></button>
        <button onClick={() => setTab('Carrinho')} className={`nav-cart ${tab === 'Carrinho' ? 'current' : ''}`}><span className="nav-cart-icon"><ShoppingBag size={20} />{cartCount > 0 && <i>{cartCount}</i>}</span><span>Carrinho</span></button>
        <button className={tab === 'Perfil' ? 'current' : ''} onClick={() => setTab('Perfil')}><UserRound size={20} /><span>Perfil</span></button>
      </nav>
    </div>
  )
}