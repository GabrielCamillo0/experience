import React, { useState, useEffect, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import { Checkbox } from "./components/ui/checkbox";
import { LanguageContext } from './LanguageContext'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { ShoppingCart, Star, Search, MapPin, Clock, DollarSign, Users, Globe, Menu, X } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper'
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './App.css'
import CheckoutForm from './components/ui/CheckoutForm'

// Import data
import toursData from './data/tours.json'
import restaurantsData from './data/restaurants.json'
import themeParksData from './data/theme-parks.json'
import waterParksData from './data/water-parks.json'
import foodDrinksData from './data/food-drinks.json'
import nightlifeData from './data/nightlife.json'
import beyondParksData from './data/beyond-parks.json'


const stripePromise = loadStripe('pk_test_51Rif0oFJf0gADv6KDCfdtHnUdMHqnAGd3pvXobHmGETvjuA3mVjOH3gJwPjnnacFcvlRXgyL2GO0r1lWpmlD4tdg00Bndbr7IO')


SwiperCore.use([Navigation, Pagination]);

function App() {
  const [language, setLanguage] = useState('pt')
  const [cart, setCart] = useState([])
  const [isKioskMode, setIsKioskMode] = useState(false)

 

  useEffect(() => {
    // Check if running in kiosk mode (fullscreen)
    const checkKioskMode = () => {
      setIsKioskMode(window.innerHeight === screen.height)
    }
    
    checkKioskMode()
    window.addEventListener('resize', checkKioskMode)
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered'))
        .catch(error => console.log('SW registration failed'))
    }

    return () => window.removeEventListener('resize', checkKioskMode)
  }, [])

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id)
      if (existing) {
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity === 0) {
      removeFromCart(id)
      return
    }
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price?.replace('$', '') || '0')
      return total + (price * item.quantity)
    }, 0)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <Router>
        <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 ${isKioskMode ? 'kiosk-mode' : ''}`}>
          <Header cart={cart} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tours" element={<ToursPage addToCart={addToCart} />} />
            <Route path="/restaurants" element={<RestaurantsPage addToCart={addToCart} />} />
            <Route path="/theme-parks" element={<CategoryPage
                  data={themeParksData}
                  title="Parques Temáticos"
                  titleEn="Theme Parks"
                  addToCart={addToCart}
                />
              }
            />
            <Route path="/water-parks" element={<CategoryPage data={waterParksData} title="Parques Aquáticos" titleEn="Water Parks" addToCart={addToCart} />} />
            <Route path="/nightlife" element={<CategoryPage data={nightlifeData} title="Vida Noturna" titleEn="Nightlife" addToCart={addToCart} />} />
            <Route
              path="/cart"
              element={
                <Elements stripe={stripePromise}>
                  <CartPage
                    cart={cart}
                    removeFromCart={removeFromCart}
                    updateQuantity={updateQuantity}
                  />
                </Elements>
              }
            />
          </Routes>
        </div>
      </Router>
    </LanguageContext.Provider>
  )
}

// Header Component
function Header({ cart }) {
  const { language, setLanguage } = useContext(LanguageContext)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <header className="modern-header">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="logo-text">
            Experience Florida
          </Link>
          
          <nav className="nav-menu">
            <Link to="/" className="nav-link">
              {language === 'pt' ? 'Início' : 'Home'}
            </Link>
            <Link to="/tours" className="nav-link">
              Tours
            </Link>
            <Link to="/restaurants" className="nav-link">
              {language === 'pt' ? 'Restaurantes' : 'Restaurants'}
            </Link>
            <Link to="/theme-parks" className="nav-link">
              {language === 'pt' ? 'Parques Temáticos' : 'Theme Parks'}
            </Link>
            <Link to="/water-parks" className="nav-link">
              {language === 'pt' ? 'Parques Aquáticos' : 'Water Parks'}
            </Link>
            <Link to="/nightlife" className="nav-link">
              {language === 'pt' ? 'Vida Noturna' : 'Nightlife'}
            </Link>
          </nav>

          <div className="header-actions">
            <Link 
              to="/cart" 
              className="cart-button"
              aria-label={`${language === 'pt' ? 'Carrinho' : 'Cart'} (${getTotalItems()} items)`}
            >
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="cart-badge">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
            <div className="language-switcher">
              <button
                className={`lang-btn ${language === 'pt' ? 'active' : ''}`}
                onClick={() => setLanguage('pt')}
              >
                PT
              </button>
              <button
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// HomePage Component
function HomePage() {
  const { language } = useContext(LanguageContext)
  const navigate = useNavigate()

  const categories = [
    {
      id: 'theme-parks',
      icon: '🎢',
      title: language === 'pt' ? 'Parques Temáticos' : 'Theme Parks',
      description: language === 'pt' ? 'Disney, Universal, SeaWorld e mais' : 'Disney, Universal, SeaWorld and more',
      path: '/theme-parks'
    },
    {
      id: 'water-parks',
      icon: '🏊',
      title: language === 'pt' ? 'Parques Aquáticos' : 'Water Parks',
      description: language === 'pt' ? 'Diversão aquática para toda família' : 'Aquatic fun for the whole family',
      path: '/water-parks'
    },
    {
      id: 'food-drinks',
      icon: '🍽️',
      title: language === 'pt' ? 'Comida e Bebidas' : 'Food & Drinks',
      description: language === 'pt' ? 'Restaurantes e experiências gastronômicas' : 'Restaurants and gastronomic experiences',
      path: '/food-drinks'
    },
    {
      id: 'nightlife',
      icon: '🌙',
      title: language === 'pt' ? 'Vida Noturna' : 'Nightlife',
      description: language === 'pt' ? 'Bares, pubs e entretenimento noturno' : 'Bars, pubs and nighttime entertainment',
      path: '/nightlife'
    },
    {
      id: 'beyond-parks',
      icon: '🌟',
      title: language === 'pt' ? 'Além dos Parques' : 'Beyond Parks',
      description: language === 'pt' ? 'Museus, shopping, natureza e tours' : 'Museums, shopping, nature and tours',
      path: '/beyond-parks'
    }
  ]

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="hero-section-enhanced">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            {language === 'pt' ? 'Orlando recebe você com alegria' : 'Orlando welcomes you with joy'}
          </h1>
          <p className="hero-subtitle">
            {language === 'pt' 
              ? 'Descubra experiências únicas na capital mundial da diversão'
              : 'Discover unique experiences in the world\'s entertainment capital'
            }
          </p>
          <button 
            className="hero-button"
            onClick={() => navigate('/tours')}
          >
            {language === 'pt' ? 'Busca Rápida' : 'Quick Search'}
          </button>
        </div>
      </section>

      {/* Quick Search Cards */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          {language === 'pt' ? 'Busca Rápida' : 'Quick Search'}
        </h2>
        <div className="grid-3">
          <div className="card-container smooth-transition cursor-pointer" onClick={() => navigate('/tours')}>
            <div className="text-center">
              <Search className="h-12 w-12 text-blue-600 mx-auto mb-4 floating" />
              <h3 className="text-xl font-semibold text-blue-600 mb-2">
                {language === 'pt' ? 'Buscar Tours' : 'Search Tours'}
              </h3>
              <p className="text-gray-600">
                {language === 'pt' 
                  ? 'Descubra os melhores tours e atrações de Orlando'
                  : 'Discover the best tours and attractions in Orlando'
                }
              </p>
            </div>
          </div>

          <div className="card-container smooth-transition cursor-pointer" onClick={() => navigate('/restaurants')}>
            <div className="text-center">
              <Search className="h-12 w-12 text-orange-600 mx-auto mb-4 floating" />
              <h3 className="text-xl font-semibold text-orange-600 mb-2">
                {language === 'pt' ? 'Buscar Restaurantes' : 'Search Restaurants'}
              </h3>
              <p className="text-gray-600">
                {language === 'pt' 
                  ? 'Encontre os melhores restaurantes da cidade'
                  : 'Find the best restaurants in the city'
                }
              </p>
            </div>
          </div>

          <div className="card-container smooth-transition cursor-pointer">
            <div className="text-center">
              <Search className="h-12 w-12 text-green-600 mx-auto mb-4 floating" />
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                {language === 'pt' ? 'Aluguel de Carros' : 'Car Rental'}
              </h3>
              <p className="text-gray-600">
                {language === 'pt' 
                  ? 'Alugue um carro para sua viagem'
                  : 'Rent a car for your trip'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Categories */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          {language === 'pt' ? 'Categorias de Experiências' : 'Experience Categories'}
        </h2>
        <div className="grid-2">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="card-container smooth-transition cursor-pointer"
              onClick={() => navigate(category.path)}
            >
              <div className="text-center">
                <div className="text-4xl mb-4 floating">{category.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="container mx-auto px-4 py-12">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-title">Experience Florida</h3>
              <p className="footer-text">
                {language === 'pt' 
                  ? 'Sua porta de entrada para as melhores experiências em Orlando'
                  : 'Your gateway to the best experiences in Orlando'
                }
              </p>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-subtitle">
                {language === 'pt' ? 'Navegação' : 'Navigation'}
              </h4>
              <ul className="footer-links">
                <li><Link to="/" className="footer-link">{language === 'pt' ? 'Início' : 'Home'}</Link></li>
                <li><Link to="/tours" className="footer-link">Tours</Link></li>
                <li><Link to="/restaurants" className="footer-link">{language === 'pt' ? 'Restaurantes' : 'Restaurants'}</Link></li>
                <li><Link to="/theme-parks" className="footer-link">{language === 'pt' ? 'Parques Temáticos' : 'Theme Parks'}</Link></li>
                <li><Link to="/water-parks" className="footer-link">{language === 'pt' ? 'Parques Aquaticos' : 'Water Parks'}</Link></li>
                <li><Link to="/nightlife" className="footer-link">{language === 'pt' ? 'Vida Noturna' : 'Night Life'}</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-subtitle">
                {language === 'pt' ? 'Contato' : 'Contact'}
              </h4>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">{language === 'pt' ? 'Sobre' : 'About'}</a></li>
                <li><a href="#" className="footer-link">{language === 'pt' ? 'Contato' : 'Contact'}</a></li>
                <li><a href="#" className="footer-link">{language === 'pt' ? 'Privacidade' : 'Privacy'}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2024 Experience Florida. {language === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

// Generic Category Page Component
function CategoryPage({ data, title, titleEn, addToCart }) {
  const { language } = useContext(LanguageContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredData, setFilteredData] = useState(data)

  useEffect(() => {
    const filtered = data.filter(item => {
      const name = language === 'pt' ? item.name : item.name_en
      const description = language === 'pt' ? item.description : item.description_en
      const searchLower = searchTerm.toLowerCase()
      
      return name.toLowerCase().includes(searchLower) || 
             description.toLowerCase().includes(searchLower) ||
             item.location.toLowerCase().includes(searchLower)
    })
    setFilteredData(filtered)
  }, [searchTerm, data, language])

  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {language === 'pt' ? title : titleEn}
        </h1>
        
        <div className="search-container">
          <input
            type="text"
            placeholder={language === 'pt' ? 'Buscar tours...' : 'Search tours...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="items-grid">
        {filteredData.map((item) => (
          <ItemCard key={item.id} item={item} addToCart={addToCart} />
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="no-results">
          <p>
            {language === 'pt' 
              ? 'Nenhum resultado encontrado para sua busca.'
              : 'No results found for your search.'
            }
          </p>
        </div>
      )}
    </main>
  )
}

// Tours Page Component
function ToursPage({ addToCart }) {
  const { language } = useContext(LanguageContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filteredTours, setFilteredTours] = useState(toursData)

  const categories = [...new Set(toursData.map(tour => tour.category))]

  useEffect(() => {
    let filtered = toursData

    if (searchTerm) {
      filtered = filtered.filter(tour => {
        const name = language === 'pt' ? tour.name : tour.name_en
        const description = language === 'pt' ? tour.description : tour.description_en
        const searchLower = searchTerm.toLowerCase()
        
        return name.toLowerCase().includes(searchLower) || 
               description.toLowerCase().includes(searchLower) ||
               tour.location.toLowerCase().includes(searchLower)
      })
    }

    if (selectedCategory) {
      filtered = filtered.filter(tour => tour.category === selectedCategory)
    }

    setFilteredTours(filtered)
  }, [searchTerm, selectedCategory, language])

  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {language === 'pt' ? 'Tours em Orlando' : 'Tours in Orlando'}
        </h1>
        
        <div className="search-filters">
          <input
            type="text"
            placeholder={language === 'pt' ? 'Buscar tours...' : 'Search tours...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
  value={selectedCategory}
  onChange={e => setSelectedCategory(e.target.value)}
  className="filter-select"
>
  <option key="all-categories" value="">
    {language === 'pt' ? 'Todas as categorias' : 'All categories'}
  </option>
  {categories.map(category => (
    <option key={category} value={category}>
      {category}
    </option>
  ))}
</select>

        </div>
      </div>

      <div className="items-grid">
        {filteredTours.map((tour) => (
          <ItemCard key={tour.id} item={tour} addToCart={addToCart} />
        ))}
      </div>

      {filteredTours.length === 0 && (
        <div className="no-results">
          <p>
            {language === 'pt' 
              ? 'Nenhum tour encontrado para sua busca.'
              : 'No tours found for your search.'
            }
          </p>
        </div>
      )}
    </main>
  )
}

// Restaurants Page Component
function RestaurantsPage({ addToCart }) {
  const { language } = useContext(LanguageContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurantsData)

  const cuisines = [...new Set(restaurantsData.map(restaurant => restaurant.cuisine))]

  useEffect(() => {
    let filtered = restaurantsData

    if (searchTerm) {
      filtered = filtered.filter(restaurant => {
        const name = language === 'pt' ? restaurant.name : restaurant.name_en
        const description = language === 'pt' ? restaurant.description : restaurant.description_en
        const searchLower = searchTerm.toLowerCase()
        
        return name.toLowerCase().includes(searchLower) || 
               description.toLowerCase().includes(searchLower) ||
               restaurant.location.toLowerCase().includes(searchLower) ||
               restaurant.cuisine.toLowerCase().includes(searchLower)
      })
    }

    if (selectedCuisine) {
      filtered = filtered.filter(restaurant => restaurant.cuisine === selectedCuisine)
    }

    setFilteredRestaurants(filtered)
  }, [searchTerm, selectedCuisine, language])

  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {language === 'pt' ? 'Restaurantes em Orlando' : 'Restaurants in Orlando'}
        </h1>
        
        <div className="search-filters">
          <input
            type="text"
            placeholder={language === 'pt' ? 'Buscar restaurantes...' : 'Search restaurants...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
  value={selectedCuisine}
  onChange={e => setSelectedCuisine(e.target.value)}
  className="filter-select"
>
  <option key="all-cuisines" value="">
    {language === 'pt' ? 'Todas as cozinhas' : 'All cuisines'}
  </option>
  {cuisines.map(cuisine => (
    <option key={cuisine} value={cuisine}>
      {cuisine}
    </option>
  ))}
</select>

        </div>
      </div>
      

      <div className="items-grid">
        {filteredRestaurants.map((restaurant) => (
          <ItemCard key={restaurant.id} item={restaurant} addToCart={addToCart} />
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="no-results">
          <p>
            {language === 'pt' 
              ? 'Nenhum restaurante encontrado para sua busca.'
              : 'No restaurants found for your search.'
            }
          </p>
        </div>
      )}
    </main>
  )
}

// Cart Page Component
function CartPage({ cart, removeFromCart, updateQuantity }) {
  const { language } = useContext(LanguageContext)
  const navigate = useNavigate()

  // calcula corretamente mesmo que price seja number ou string
  const getTotalPrice = () =>
    cart.reduce((sum, item) => {
      const price =
        typeof item.price === 'number'
          ? item.price
          : parseFloat(item.price) || 0
      return sum + price * item.quantity
    }, 0)

  const subtotal = getTotalPrice()
  const serviceFee = subtotal * 0.05
  const total = subtotal + serviceFee

  const getTotalItems = () =>
    cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <main className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-content">
            <div className="cart-title-section">
              <h1 className="cart-title">
                <ShoppingCart className="cart-title-icon" />
                {language === 'pt' ? 'Seu Carrinho' : 'Your Cart'}
              </h1>
              <div className="cart-items-count">
                {getTotalItems()} {language === 'pt' ? 'itens' : 'items'}
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-content">
              <div className="empty-cart-icon">🛒</div>
              <h2 className="empty-cart-title">
                {language === 'pt'
                  ? 'Seu carrinho está vazio'
                  : 'Your cart is empty'}
              </h2>
              <p className="empty-cart-text">
                {language === 'pt'
                  ? 'Adicione alguns itens incríveis para começar sua aventura em Orlando!'
                  : 'Add some amazing items to start your Orlando adventure!'}
              </p>
              <button
                onClick={() => navigate('/tours')}
                className="continue-shopping-btn"
              >
                {language === 'pt' ? 'Explorar Tours' : 'Explore Tours'}
              </button>
            </div>
          </div>
        ) : (
          /* Cart + Order Summary + Stripe Checkout */
          <div className="cart-content">
            <div className="cart-items-section">
              <h2 className="cart-section-title">
                {language === 'pt' ? 'Itens do Carrinho' : 'Cart Items'}
              </h2>
              <div className="cart-items-list">
                {cart.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    removeFromCart={removeFromCart}
                    updateQuantity={updateQuantity}
                    language={language}
                  />
                ))}
              </div>
            </div>

            <div className="order-summary-section">
              <div className="order-summary">
                <h2 className="order-summary-title">
                  {language === 'pt' ? 'Resumo do Pedido' : 'Order Summary'}
                </h2>

                <div className="summary-item">
                  <span>{language === 'pt' ? 'Subtotal:' : 'Subtotal:'}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>
                    {language === 'pt' ? 'Taxa de Serviço:' : 'Service Fee:'}
                  </span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="summary-total">
                  <span>{language === 'pt' ? 'Total:' : 'Total:'}</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {/* Stripe checkout form */}
                <CheckoutForm totalAmount={total} />

                <button
                  className="continue-shopping-button"
                  onClick={() => navigate('/')}
                >
                  {language === 'pt'
                    ? 'Continuar Comprando'
                    : 'Continue Shopping'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}




// Cart Item Component
function CartItem({ item, removeFromCart, updateQuantity }) {
  const { language } = useContext(LanguageContext) 
  const name = language === 'pt' ? item.name : item.name_en
  const description = language === 'pt' ? item.description : item.description_en
  const raw = item.price;
  const price = typeof raw === 'number'
  ? raw
    : parseFloat(String(raw).replace('$', '')) || 0;
  const imageUrl = item.image
  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {imageUrl
          ? <img
              src={imageUrl}
              alt={name}
              className="w-32 h-24 object-cover rounded"
            />
          : (
            <div className="cart-item-placeholder">
              <span className="block text-sm text-gray-600">
          {language === 'pt' ? 'Preço unitário:' : 'Unit price:'}
        </span>
        <span className="text-lg font-bold">${price.toFixed(2)}</span>
      </div>
          )
        }
      </div>

  

    {/* Detalhes do item */}
    <div className="cart-item-details flex-1 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">{name}</h3>
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star size={16} />
            <span>{item.rating}</span>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          <MapPin size={14} className="inline-block mr-1" />
          {item.location}
        </div>
        {item.hours && (
          <div className="text-sm text-gray-600 mb-2">
            <Clock size={14} className="inline-block mr-1" />
            {item.hours}
          </div>
        )}

        <p className="text-sm text-gray-700 mb-4">{description}</p>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <span className="block text-sm text-gray-600">
            {language === 'pt' ? 'Preço unitário:' : 'Unit price:'}
          </span>
          <span className="text-lg font-bold">${price.toFixed(2)}</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center ">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="quantity-btn"
            >−</button>
            <span className="quantity-controls">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="quantity-btn"
            >＋</button>
          </div>

          <button
            onClick={() => removeFromCart(item.id)}
            className="remove-item-btn"
            title={language === 'pt' ? 'Remover item' : 'Remove item'}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="mt-4 text-right">
        <span className="text-sm text-gray-600">
          {language === 'pt' ? 'Subtotal:' : 'Subtotal:'}
        </span>
        <span className="block text-lg font-semibold">
          ${(price * item.quantity).toFixed(2)}
        </span>
      </div>
    </div>
  </div>
)
}

// Item Card Component
function ItemCard({ item, addToCart }) {
  const { language } = useContext(LanguageContext)

  const name = language === 'pt' ? item.name : item.name_en
  const description = language === 'pt' ? item.description : item.description_en
  const price = item.price || '$0.00'

  // monta o array de imagens a partir de gallery ou image único
  const images = item.gallery?.length
  ? item.gallery
  : item.image
    ? [item.image]
    : [];

return (
  <div className="modern-service-card flex flex-col border rounded-lg overflow-hidden shadow-sm">
  {/* === CARROSSEL DE IMAGENS === */}
  <div className="service-image-container">
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      loop
    >
      {images.length > 0
        ? images.map((src, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={src}
                alt={`${name} ${idx + 1}`}
                className="w-full h-full"
              />
            </SwiperSlide>
          ))
        : (
            <SwiperSlide>
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-4xl font-bold">{name.charAt(0)}</span>
              </div>
            </SwiperSlide>
          )
      }
    </Swiper>
  

    {/* === CONTEÚDO DO CARD === */}
    <div className="service-content p-4 flex flex-col">
      {/* ... resto do card ... */}
    </div>
  </div>



      {/* === CONTEÚDO DO CARD === */}
      <div className="service-content flex-1 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-2">
          <h3 className="service-title text-lg font-semibold">{name}</h3>
          <span className="service-rating bg-yellow-400 text-white px-2 rounded">
            ⭐ {item.rating}
          </span>
        </div>

        <p className="text-sm text-gray-700 flex-1 mb-4">{description}</p>
        {item.hours && (
          <div className="service-duration text-sm text-gray-600 mb-4">
            🕒 {item.hours}
          </div>
        )}

        <div className="service-price text-lg font-bold mb-4">{price}</div>

        <button
          onClick={() => addToCart(item)}
          className="service-add-button bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {language === 'pt' ? 'Adicionar ao Carrinho' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
export default App
