import { useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff, Phone, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type Mode = 'login' | 'register'

export function AuthScreen({ onClose }: { onClose?: () => void }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Register fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (mode === 'login') {
      if (!email || !password) {
        setError('Preencha email e senha')
        return
      }
      try {
        setLoading(true)
        await login(email, password)
        setSuccess('Login realizado com sucesso!')
        setTimeout(() => onClose?.(), 1500)
      } catch (err: any) {
        setError(err.message || 'Erro ao fazer login')
      } finally {
        setLoading(false)
      }
    } else {
      if (!name || !email || !password || !confirmPassword) {
        setError('Preencha todos os campos')
        return
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem')
        return
      }
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres')
        return
      }
      try {
        setLoading(true)
        await register({ name, email, password, phone: phone || undefined })
        setSuccess('Conta criada com sucesso!')
        setTimeout(() => onClose?.(), 1500)
      } catch (err: any) {
        setError(err.message || 'Erro ao criar conta')
      } finally {
        setLoading(false)
      }
    }
  }

  const toggleMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError('')
    setSuccess('')
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Fechar">×</button>

        <div className="auth-header">
          <div className="auth-logo">🛒</div>
          <h2>{mode === 'login' ? 'Entrar' : 'Criar conta'}</h2>
          <p>{mode === 'login' ? 'Acesse sua conta CEASA' : 'Cadastre-se para comprar online'}</p>
        </div>

        {error && <div className="auth-alert error"><AlertCircle size={16} />{error}</div>}
        {success && <div className="auth-alert success"><CheckCircle size={16} />{success}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-field">
              <label>Nome completo</label>
              <div className="input-with-icon">
                <User size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete={mode === 'login' ? 'email' : 'email'}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label>Telefone (WhatsApp)</label>
              <div className="input-with-icon">
                <Phone size={18} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                  maxLength={15}
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Senha</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label>Confirmar senha</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'} {' '}
          <button type="button" className="auth-link" onClick={toggleMode}>
            {mode === 'login' ? 'Cadastre-se' : 'Faça login'}
          </button>
        </p>

        {mode === 'login' && (
          <button type="button" className="auth-forgot" onClick={() => setSuccess('Funcionalidade em desenvolvimento')}>
            Esqueci minha senha
          </button>
        )}
      </div>
    </div>
  )
}