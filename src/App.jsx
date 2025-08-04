import React, { useState, useEffect, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation , useNavigate } from 'react-router-dom'
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
import { DetailsPage } from './components/ui/DetailsPage'
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './App.css'
import DetailsModal from './components/ui/DetailsModal'
import FilterablePage from './components/ui/FilterablePage'
import CheckoutForm from './components/ui/CheckoutForm'
import CheckoutWithPaymentElement from "./components/ui/CheckoutWithPaymentElement";
import ChatButton from './components/ui/ChatButton'
// Import data
import toursData from './data/tours.json'
import restaurantsData from './data/restaurants.json'
import themeParksData from './data/theme-parks.json'
import waterParksData from './data/water-parks.json'
import foodDrinksData from './data/food-drinks.json'
import nightlifeData from './data/nightlife.json'
import beyondParksData from './data/beyond-parks.json'



const stripePromise = loadStripe('pk_live_51Rj0y1L7b75eyCMpeUmRZv5XI71i6Pcnw02DOynfCnaAU4mYaakkEeuQmo76YE8EeY0CrGP5I9dByakfS3X3dr2V00blmzyW7t')
const WA_NUMBER = '5511999998888';



SwiperCore.use([Navigation, Pagination]);

function App() {
  const [modalItem, setModalItem] = useState(null)
  const showDetails = item => setModalItem(item)
  const hideDetails = () => setModalItem(null)
  
  const backgroundLocation = location.state?.backgroundLocation
  const [language, setLanguage] = useState('pt')
  const [cart, setCart] = useState([])
  const [isKioskMode, setIsKioskMode] = useState(false)
  const state = location.state 
  

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

  const getTotalPrice = () =>
  cart.reduce((sum, item) => {
    let price = 0;

    if (typeof item.price === 'number') {
      price = item.price;
    } else if (typeof item.price === 'string') {
      // remove qualquer caractere que não seja dígito, ponto ou hífen
      price = parseFloat(item.price.replace(/[^0-9.-]+/g, '')) || 0;
    }

    return sum + price * item.quantity;
  }, 0);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <Router location={backgroundLocation || location} >
        <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 ${isKioskMode ? 'kiosk-mode' : ''}`}>
          <Header cart={cart} />
          <Routes >
            <Route path="/" element={<HomePage />} />
            <Route path="/tours" element={<ToursPage addToCart={addToCart} onShowDetails={showDetails} />} />
            <Route path="/restaurants" element={<RestaurantsPage addToCart={addToCart} onShowDetails={showDetails} />} />
            <Route path="/theme-parks" element={<CategoryPage
                  data={themeParksData}
                  title="Parques Temáticos"
                  titleEn="Theme Parks"
                  addToCart={addToCart} onShowDetails={showDetails}
                />
              }
            />
            <Route path="/details/:id" element={<DetailsPage />} />
            <Route path="/water-parks" element={<CategoryPage data={waterParksData} title="Parques Aquáticos" titleEn="Water Parks" addToCart={addToCart} onShowDetails={showDetails} />} />
            <Route path="/nightlife" element={<CategoryPage data={nightlifeData} title="Vida Noturna" titleEn="Nightlife" addToCart={addToCart} onShowDetails={showDetails} />} />
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
            <Route 
            path="/details/:id" 
            element={<DetailsPage isModal onClose={() => window.history.back()} />} 
          />
          </Routes>
          
        </div>
        

      </Router>
      {console.log('ModalItem:', modalItem)}
        {modalItem && (
          <DetailsModal item={modalItem} onClose={hideDetails} />
        )}

         <ChatButton />
         {backgroundLocation && (
        <Routes>
          <Route path="/details/:id" element={<DetailsPage addToCart={addToCart} isModal />} />
        </Routes>
      )}

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
    
      <section className="video-hero relative w-full overflow-hidden rounded-lg shadow-lg">		
        <video
          className="video-hero__video"
          autoPlay
          muted
          loop
          playsInline
          poster="https://assets.simpleviewinc.com/simpleview/image/upload/q_60,w_1200/v1/clients/orlandofl-redesign/172099_the_wheel_nighttime_4_8c50349b-aa73-4d0f-956e-6dc7f667cc41.jpg" // substitua se quiser poster
        >
          <source src="https://visitorlando.widen.net/content/cexgwbjkgu/mp4/New-Leisure-Site-Homepage-Video_JAN2025_v2.mp4?quality=hd&amp;u=opascz&amp;use=u3ch" type="video/mp4" />
          
          {language === 'pt'
            ? 'Seu navegador não suporta vídeo.'
            : 'Your browser does not support video.'}
        </video>
        <div className="video-hero__overlay">
        <div className="video-hero__content">
          <h2 className="video-hero__title">
            {language === 'pt' ? 'Viva Orlando como nunca antes' : 'Experience Orlando like never before'}
          </h2>
          <p className="video-hero__subtitle">
            {language === 'pt'
              ? 'Planejamos sua viagem com os melhores passeios, restaurantes e entretenimento.'
              : "We craft your trip with the top tours, dining and entertainment."}
          </p>
          <button
            onClick={() => navigate('/tours')}
            className="video-hero__cta-transparent"
          >
            {language === 'pt' ? 'Começar Agora' : 'Start Now'}
          </button>
          </div>
        </div>
      </section>

      {/* Sobre Nós */}
      <section className="about-section bg-white rounded-lg shadow-md p-8">
        <div className="about-content max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
          <div className="about-text md:w-1/2">
            <h2 className="about-title text-3xl font-bold mb-4">
              {language === 'pt' ? 'Sobre Nós' : 'About Us'}
            </h2>
            <p className="about-paragraph text-gray-700 mb-3">
              {language === 'pt'
                ? 'A Experience Florida é sua porta de entrada para vivenciar o melhor de Orlando. Com seleção cuidadosa de tours, restaurantes e atrações, fazemos sua jornada mais simples, divertida e inesquecível.'
                : 'Experience Florida is your gateway to enjoying the best of Orlando. With curated tours, restaurants, and attractions, we make your journey easier, more fun, and unforgettable.'}
            </p>
            <p className="about-paragraph text-gray-700 mb-3">
              {language === 'pt'
                ? 'Nosso time conhece a cidade como ninguém e está comprometido em oferecer opções autênticas e personalizadas que combinam com o seu estilo de viagem.'
                : 'Our team knows the city inside out and is committed to delivering authentic, personalized experiences that match your travel style.'}
            </p>
            <p className="about-paragraph text-gray-700">
              {language === 'pt'
                ? 'Seja sua primeira visita ou um retorno, estamos aqui para transformar cada momento em uma memória incrível.'
                : 'Whether it’s your first visit or a return trip, we are here to turn every moment into an amazing memory.'}
            </p>
          </div>
         {/* <div className="md:w-1/2 flex items-center justify-center">
            
            <img
              src="/about-us-photo.jpg"
              alt="Sobre nós"
              className="rounded-lg object-cover w-full h-64 md:h-full"
            />
          </div>*/}
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
export function CategoryPage({ data, title, titleEn, addToCart, onShowDetails }) {
  const { language } = useContext(LanguageContext)
  const navigate = useNavigate()

  // estados
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filteredData, setFilteredData] = useState(data)

  // extrai categorias únicas pra dropdown
  const categories = [...new Set(data.map(item => item.category))]

  useEffect(() => {
    let filtered = data

    // filtro de busca livre
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      filtered = filtered.filter(item => {
        const name        = language === 'pt' ? item.name : item.name_en
        const description = language === 'pt'
          ? item.description
          : item.description_en
        return (
          name.toLowerCase().includes(lower) ||
          description.toLowerCase().includes(lower) ||
          item.location.toLowerCase().includes(lower)
        )
      })
    }

    // filtro de categoria
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    setFilteredData(filtered)
  }, [searchTerm, selectedCategory, data, language])

  return (
    <main className="page-container">
      <div className="page-header flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <h1 className="page-title text-2xl font-bold mb-4 md:mb-0">
          {language === 'pt' ? title : titleEn}
        </h1>
        <div className="search-filters flex space-x-2 w-full md:w-auto">
          <input
            type="text"
            placeholder={language === 'pt' ? 'Buscar...' : 'Search...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input flex-1 border rounded p-2"
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="filter-select border rounded p-2"
          >
            <option value="">
              {language === 'pt'
                ? 'Todas as categorias'
                : 'All categories'}
            </option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="items-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            addToCart={addToCart}
            onShowDetails={onShowDetails}
          />
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="no-results text-center mt-12">
          <p className="text-gray-600">
            {language === 'pt'
              ? 'Nenhum resultado encontrado para sua busca.'
              : 'No results found for your search.'}
          </p>
        </div>
      )}
    </main>
  )
}

// ------------------------------------------------------------------

export function ToursPage({ addToCart, onShowDetails }) {
  // basta delegar pro CategoryPage passando o dataset e os títulos certos
  return (
    <CategoryPage
      data={toursData}
      title="Tours em Orlando"
      titleEn="Tours in Orlando"
      addToCart={addToCart}
      onShowDetails={onShowDetails}
    />
  )
}

// Restaurants Page Component
 function RestaurantsPage({ addToCart, onShowDetails }) {
  const { language } = useContext(LanguageContext)
  const navigate = useNavigate()

  // Estado do filtro
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurantsData)

  // Lista de cozinhas pro dropdown
  const cuisines = [...new Set(restaurantsData.map(r => r.cuisine))]

  useEffect(() => {
    let filtered = restaurantsData

    // filtro de busca livre
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      filtered = filtered.filter(r => {
        const name        = language === 'pt' ? r.name : r.name_en
        const description = language === 'pt' ? r.description : r.description_en
        return (
          name.toLowerCase().includes(lower) ||
          description.toLowerCase().includes(lower) ||
          r.location.toLowerCase().includes(lower) ||
          r.cuisine.toLowerCase().includes(lower)
        )
      })
    }

    // filtro de cozinha
    if (selectedCuisine) {
      filtered = filtered.filter(r => r.cuisine === selectedCuisine)
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
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCuisine}
            onChange={e => setSelectedCuisine(e.target.value)}
            className="filter-select"
          >
            <option value="">
              {language === 'pt' ? 'Todas as cozinhas' : 'All cuisines'}
            </option>
            {cuisines.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de cards */}
      <div className="items-grid">
        {filteredRestaurants.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            addToCart={addToCart}
            onShowDetails={onShowDetails}
          />
        ))}
      </div>

      {/* Mensagem “nenhum resultado” */}
      {filteredRestaurants.length === 0 && (
        <div className="no-results text-center mt-12">
          <p className="text-gray-600">
            {language === 'pt'
              ? 'Nenhum restaurante encontrado para sua busca.'
              : 'No restaurants found for your search.'}
          </p>
        </div>
      )}
    </main>
  )
}

function ItemCard({ item, addToCart}) {
  const { language } = useContext(LanguageContext);

  const name = language === "pt" ? item.name : item.name_en;
  const description =language === "pt" ? item.description : item.description_en;
  const price = item.price || "0.00";
  const navigate = useNavigate()
  const location = useLocation()
  const id = item.id
  const bg = location.pathname + location.search
  const handleOpenModal = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/details/${item.id}`, {
      state: { backgroundLocation: location, language }
    })
  }

  const waText = encodeURIComponent(
    `${language === "pt" ? "Olá, tenho interesse em:" : "Hi, I’d like info on:"} ${name} – R$${price}`
  );
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${waText}`;

  const images = item.gallery?.length
    ? item.gallery
    : item.image
    ? [item.image]
    : [];

  return (
    <div onClick={handleOpenModal}>
    <Link
      to="/details"
      state={{ item }}
      className="modern-service-card flex flex-col border rounded-lg overflow-hidden shadow-sm"
    >
      {/* Carousel */}
      <div className="service-image-container">
        <Swiper
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
                    className="w-full h-48 object-cover"
                  />
                </SwiperSlide>
                
              ))
            : (
                <SwiperSlide>
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl font-bold">
                      {name.charAt(0)}
                    </span>
                  </div>
                </SwiperSlide>
              )}
        </Swiper>
      </div>
      

      {/* Conteúdo */}
      <div className="service-content">
        <div className="service-header">
          <h3 className="service-title">
            {name}
          </h3>
          <span className="rating-star">
            ⭐ {item.rating}
          </span>

          <p className="text-sm text-gray-700 mb-4 ">
            {description}
          </p>

          {item.hours && (
            <p className="service-duration">
              🕒 {item.hours}
            </p>
          )}
          
          <div className="service-price">
            R${price}
          </div>
        </div>

        {/* Botões */}
        <div className="mt-4 flex space-x-2">
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(item);
            }}
            className="service-add-button bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {language === "pt" ? "Adicionar ao Carrinho" : "Add to Cart"}
          </button>

          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              window.open(waUrl, "_blank", "noopener,noreferrer");
            }}
            className="service-whatsapp-button bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            {language === "pt"
              ? "Agendar via WhatsApp"
              : "Schedule via WhatsApp"}
          </button>
        </div>
      </div>
    </Link>
    </div>
  );

}
const API_BASE = import.meta.env.VITE_BACKEND_URL || '/api';

function CartPage({ cart, removeFromCart, updateQuantity}) {
  const { language } = useContext(LanguageContext)
  const navigate = useNavigate()
  const hasItems = cart.length > 0;

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  // Calcular totais e moeda
  const getTotalPrice = () =>
  cart.reduce((sum, item) => {
    let price = 0;

    if (typeof item.price === 'number') {
      price = item.price;
    } else if (typeof item.price === 'string') {
      // remove qualquer caractere que não seja dígito, ponto ou hífen
      price = parseFloat(item.price.replace(/[^0-9.-]+/g, '')) || 0;
    }

    return sum + price * item.quantity;
  }, 0);
  const subtotal = getTotalPrice()
  const serviceFee = subtotal * 0.05
  const total = subtotal + serviceFee
  const stripeCurrency = language === 'pt' ? 'brl' : 'usd'
  const locale = language === 'pt' ? 'pt-BR' : 'en-US'

  // Formulário de dados do cliente
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const isFormValid = form.name && form.email && form.phone

  // Estado do checkout e PaymentIntent
  const [step, setStep] = useState('form') // 'form' ou 'payment'
  const [clientSecret, setClientSecret] = useState(null)
  
  cart.reduce((sum, item) => sum + item.quantity, 0)


  // Enviar formulário e criar PaymentIntent
  const handleSendForm = async () => {
    if (!isFormValid) return
    try {
      const res = await fetch(`${API_BASE}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100), currency: stripeCurrency, form })
      })
      const { clientSecret: cs } = await res.json()
      setClientSecret(cs)
      setStep('payment')
    } catch (err) {
      console.error(err)
      alert(language === 'pt' ? 'Erro ao processar seu pedido.' : 'Error processing your order.')
    }
  }
  const waCartMessage = encodeURIComponent(
    (language==='pt'
      ? 'Olá, Quero fazer o agendamento para os seguintes locais:\n'
      : 'Hi, I would like to make a reservation for the following locations:\n'
    ) +
    cart.map(item => {
      const name = language === 'pt' ? item.name : item.name_en
      return `- ${name} x${item.quantity}`
    }).join('\n') +
    `\n${language==='pt' ? 'Total:' : 'Total:'} R$${total.toFixed(2)}`
  )
  const waCartUrl = `https://wa.me/${WA_NUMBER}?text=${waCartMessage}`

  // Se carrinho vazio, mostrar estado
  if (cart.length === 0) {
    return (
      <aside className="order-summary-section p-6 border rounded-lg space-y-4">
        <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">
          {language === 'pt' ? 'Seu carrinho está vazio' : 'Your cart is empty'}
        </h2>

        {/* Botão WhatsApp — só aparece / fica habilitado quando tiver itens */}
        <button
      type="button"
      onClick={() => window.open(waCartUrl, "_blank")}
      disabled={!hasItems}
      className={`
        whatsapp-button
        ${hasItems 
          ? "hover:bg-green-600" 
          : "cursor-not-allowed opacity-50"
        }
      `}
    >
      {language === 'pt'
        ? 'Enviar Pedido por WhatsApp'
        : 'Submit request via WhatsApp'}
    </button>


        <button
          onClick={() => navigate('/tours')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          {language === 'pt' ? 'Explorar Tours' : 'Explore Tours'}
        </button>
        
        </aside>
    )
  }
  

  return (
    <main className="cart-page">
      <div className="cart-container">
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
             <button 
              onClick={() => navigate('/')}
              className="continue-shopping-header-btn"
            >
              {language === 'pt' ? 'Continuar Comprando' : 'Continue Shopping'}
            </button>
          </div>
        </div>

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
                
                <div className="order-summary-content">
                  <div className="order-summary-row">
                    <span className="order-summary-label">
                      {language === 'pt' ? 'Subtotal' : 'Subtotal'}
                    </span>
                    <span className="order-summary-value">
                      ${getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="order-summary-row">
                    <span className="order-summary-label">
                      {language === 'pt' ? 'Taxa de Serviço' : 'Service Fee'}
                    </span>
                    <span className="order-summary-value">
                      ${(getTotalPrice() * 0.05).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="order-summary-divider"></div>
                  
                  <div className="order-summary-row order-summary-total">
                    <span className="order-summary-label">
                      {language === 'pt' ? 'Total' : 'Total'}
                    </span>
                    <span className="order-summary-value">
                      ${(getTotalPrice() * 1.05).toFixed(2)}
                    </span>
                  </div>
                </div>

              {step === 'form' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={language === 'pt' ? 'Nome' : 'Name'}
                    value={form.name}
                    onChange={e =>
                      setForm(f => ({ ...f, name: e.target.value }))
                    }
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={form.email}
                    onChange={e =>
                      setForm(f => ({ ...f, email: e.target.value }))
                    }
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="tel"
                    placeholder={language === 'pt' ? 'Telefone' : 'Phone'}
                    value={form.phone}
                    onChange={e =>
                      setForm(f => ({ ...f, phone: e.target.value }))
                    }
                    className="w-full p-2 border rounded"
                  />
                  <button
                    onClick={handleSendForm}
                    disabled={!isFormValid}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
                  >
                    {language === 'pt'
                      ? 'Prosseguir para pagamento'
                      : 'Proceed to payment'}
                  </button>
                </div>
              )}

              {step === 'payment' && clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret, locale }}
                >
                  <CheckoutWithPaymentElement />
                </Elements>
              )}

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
  );
}

// Cart Item Component
function CartItem({ item, removeFromCart, updateQuantity, language }) {
  const name = language === 'pt' ? item.name : item.name_en
  const description = language === 'pt' ? item.description : item.description_en

  // Normaliza item.price para string antes do replace, e garante que price seja número
  const rawPrice = typeof item.price === 'number'
    ? item.price
    : item.price ?? '0'
  const price = parseFloat(String(rawPrice).replace(/[^0-9.-]+/g, '')) || 0

  return (
    <div className="cart-item">
      <div className="cart-item-image">
         <img src={item.image} /> 
        <span className="cart-item-placeholder-text">{name.charAt(0)}</span>
      </div>

      <div className="cart-item-details">
        <div className="cart-item-header">
          <h3 className="cart-item-name">{name}</h3>
          <div className="cart-item-rating">
            <Star className="cart-item-star" />
            <span className="cart-item-rating-value">{item.rating}</span>
          </div>
        </div>

        <div className="cart-item-info">
          <div className="cart-item-location">
            <MapPin className="cart-item-location-icon" />
            <span>{item.location}</span>
          </div>
          {item.hours && (
            <div className="cart-item-hours">
              <Clock className="cart-item-hours-icon" />
              <span>{item.hours}</span>
            </div>
          )}
        </div>

        <p className="cart-item-description">{description}</p>

        <div className="cart-item-footer">
          <div className="cart-item-price">
            <span className="cart-item-price-label">
              {language === 'pt' ? 'Preço unitário:' : 'Unit price:'}
            </span>
            <span className="cart-item-price-value">${price.toFixed(2)}</span>
          </div>

          <div className="cart-item-actions">
            <div className="quantity-controls">
              <button 
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="quantity-btn quantity-btn-minus"
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="quantity-display">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="quantity-btn quantity-btn-plus"
              >
                +
              </button>
            </div>
            
            <button 
              onClick={() => removeFromCart(item.id)}
              className="remove-item-btn"
              title={language === 'pt' ? 'Remover item' : 'Remove item'}
            >
              <X className="remove-item-icon" />
            </button>
          </div>
        </div>

        <div className="cart-item-total">
          <span className="cart-item-total-label">
            {language === 'pt' ? 'Subtotal:' : 'Subtotal:'}
          </span>
          <span className="cart-item-total-value">
            ${(price * item.quantity).toFixed(2)}
          </span>
        </div>
        
      </div>
    </div>
  )
}






export default App
