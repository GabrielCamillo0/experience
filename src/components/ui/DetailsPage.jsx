import React, { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import toursData from '../../data/tours.json'
import restaurantsData from '../../data/restaurants.json'
import themeParksData from '../../data/theme-parks.json'
import { ShoppingCart } from 'lucide-react'

const WA_NUMBER = '5511999999999' // substitua pelo seu número

export function DetailsPage({ addToCart, isModal = false }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const stateItem = location.state?.item

  const backgroundLocation = location.state?.backgroundLocation

  const handleClose = () => {
    if (backgroundLocation) {
      navigate(backgroundLocation, { replace: true })
    } else {
      navigate(-1)
    }
  }

  const item = stateItem
    ?? toursData.find(i => i.id === id)
    ?? restaurantsData.find(i => i.id === id)
    ?? themeParksData.find(i => i.id === id)
   

  const { language = 'pt' } = { language: location.state?.language } // ajuste conforme seu contexto

  const [mainImage, setMainImage] = useState(item?.gallery?.[0] || item?.image)

  if (!item) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Item não encontrado</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded"
        >
          Voltar
        </button>
      </div>
    )
  }

  const name = language === 'pt' ? item.name : item.name_en
  const description = language === 'pt' ? item.description : item.description_en
  const price = typeof item.price === 'number' ? item.price.toFixed(2) : item.price
  const address = item.address || item.location
  const phone = item.phone
  const rating = item.rating

  // WhatsApp message
  const waText = encodeURIComponent(
    `${language === 'pt' ? 'Olá, quero agendar:' : 'Hi, I want to schedule:'} ${name} – R$${price}`
  )
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${waText}`

  // adicionar ao carrinho: aqui você pode tomar do contexto ou passar função via props (exemplo fictício)
  const handleAddToCart = () => {
    // supondo que exista função global ou via contexto
    // addToCart(item)
    console.log('Adicionar ao carrinho', item)
  }

  return (
    <div className={`details-overlay ${isModal ? 'modal-open' : ''}`}>
      <div className="details-card" style={{ maxWidth: '1200px', width: '100%' }}>
        <button className="details-close" onClick={handleClose}>×</button>

        <div className="flex flex-col lg:flex-row">
          {/* galeria/imagem */}
          <div className="flex-1">
            <div className="details-gallery">
              <div className="details-gallery-main">
                <img src={mainImage} alt={name} />
              </div>
              {item.gallery && (
                <div className="details-thumbs">
                  {item.gallery.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`${name} ${i+1}`}
                      className={mainImage === src ? 'selected' : ''}
                      onClick={() => setMainImage(src)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* conteúdo */}
          <div className="flex-1 details-content">
            <div>
              <h2 className="details-title">{name}</h2>
              <div className="details-meta">
                {rating && (
                  <div>
                    <span>⭐</span>
                    <span>{rating}</span>
                  </div>
                )}
                {address && (
                  <div>
                    <span>📍</span>
                    <span>{address}</span>
                  </div>
                )}
                {phone && (
                  <div>
                    <span>📞</span>
                    <span>{phone}</span>
                  </div>
                )}
              </div>
              <p className="details-description">{description}</p>

              {item.social && (
                <div className="details-social">
                  {item.social.instagram && (
                    <a href={`https://instagram.com/${item.social.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer">
                      Instagram: {item.social.instagram}
                    </a>
                  )}
                  {item.social.facebook && (
                    <a href={`https://facebook.com/${item.social.facebook}`} target="_blank" rel="noopener noreferrer">
                      Facebook: {item.social.facebook}
                    </a>
                  )}
                  {item.social.website && (
                    <a href={`https://${item.social.website}`} target="_blank" rel="noopener noreferrer">
                      Site: {item.social.website}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* footer de ação */}
        <div className="details-footer">
          <div className="price-box">
            {language === 'pt' ? 'Preço:' : 'Price:'} R${price}
          </div>
          <div className="flex gap-2 flex-1">
            <button
              onClick={handleAddToCart}
              className="btn-addcart"
              aria-label="Adicionar ao Carrinho"
            >
              {language === 'pt' ? 'Adicionar ao Carrinho' : 'Add to Cart'} <ShoppingCart className="inline-block ml-1" size={18}/>
            </button>
            <button
              onClick={() => window.open(waUrl, '_blank', 'noopener,noreferrer')}
              className="btn-whatsapp"
              aria-label="Agendar via WhatsApp"
            >
              {language === 'pt' ? 'Agendar via WhatsApp' : 'Schedule via WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
