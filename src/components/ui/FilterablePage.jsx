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
      <div className="page-header mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="page-title text-2xl font-bold">
          {language === 'pt' ? titlePt : titleEn}
        </h1>
        <div className="search-filters flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          <input
            type="text"
            placeholder={language === 'pt' ? 'Buscar...' : 'Search...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input border p-2 rounded flex-1"
          />
          {filterKey && (
            <select
              value={selectedFilter}
              onChange={e => setSelectedFilter(e.target.value)}
              className="filter-select border p-2 rounded"
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

      <div className="items-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="no-results text-center py-10 text-gray-600">
          {language === 'pt'
            ? 'Nenhum resultado encontrado.'
            : 'No results found.'}
        </div>
      )}
    </main>
  )
}
