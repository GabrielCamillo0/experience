import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../../LanguageContext";     
import ItemCard from "/src/App.jsx";                 
export default function FilterablePage({
  data,
  titlePt,
  titleEn,
  filterKey,          // ex: 'category' ou 'cuisine'; se vazio, não renderiza o dropdown
  filterLabelPt,      // ex: 'Categoria', 'Cozinha'
  filterLabelEn,      // ex: 'Category', 'Cuisine'
  addToCart,
  onShowDetails
}) {
  const { language } = useContext(LanguageContext)
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm]       = useState('')
  const [selectedFilter, setSelectedFilter] = useState('')
  const [filteredData, setFilteredData]   = useState(data)

  // extrai opções únicas de filtro (se tiver filterKey)
  const filterOptions = filterKey
    ? [...new Set(data.map(item => item[filterKey]))]
    : []

  useEffect(() => {
    let tmp = data.filter(item => {
      const name = language === 'pt' ? item.name : item.name_en
      const desc = language === 'pt' ? item.description : item.description_en
      const lower = searchTerm.toLowerCase()

      return (
        name.toLowerCase().includes(lower) ||
        desc.toLowerCase().includes(lower) ||
        item.location.toLowerCase().includes(lower)
      )
    })

    if (filterKey && selectedFilter) {
      tmp = tmp.filter(item => item[filterKey] === selectedFilter)
    }

    setFilteredData(tmp)
  }, [searchTerm, selectedFilter, language, data, filterKey])

  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {language === 'pt' ? titlePt : titleEn}
        </h1>
        <div className="search-filters">
          <input
            type="text"
            placeholder={language === 'pt' ? 'Buscar...' : 'Search...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {filterKey && (
            <select
              value={selectedFilter}
              onChange={e => setSelectedFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">
                {language === 'pt' ? filterLabelPt : filterLabelEn}
              </option>
              {filterOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="items-grid">
        {filteredData.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            addToCart={addToCart}
            {...(onShowDetails ? { onShowDetails } : {})}
          />
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="no-results">
          {language === 'pt'
            ? 'Nenhum resultado encontrado.'
            : 'No results found.'}
        </div>
      )}
    </main>
  )
}
