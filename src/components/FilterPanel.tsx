import { FilterOptions } from '../types'
import { VideoCategory } from '../services/youtubeApi'
import './FilterPanel.css'

interface FilterPanelProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  viewMode: 'card' | 'table'
  onViewModeChange: (mode: 'card' | 'table') => void
  regionCode?: string
  onRegionChange: (regionCode?: string) => void
  categoryId?: string
  onCategoryChange: (categoryId?: string) => void
  categories: VideoCategory[]
  categoriesLoading: boolean
}

function FilterPanel({ 
  filters, 
  onFilterChange, 
  viewMode, 
  onViewModeChange,
  regionCode,
  onRegionChange,
  categoryId,
  onCategoryChange,
  categories,
  categoriesLoading
}: FilterPanelProps) {
  const handleDurationChange = (duration: FilterOptions['duration']) => {
    onFilterChange({ ...filters, duration })
  }

  const handlePeriodChange = (period: FilterOptions['period']) => {
    onFilterChange({ ...filters, period })
  }

  const handleRatioToggle = (level: number) => {
    const current = filters.viewSubscriberRatio
    const newRatios = current.includes(level)
      ? current.filter(r => r !== level)
      : [...current, level]
    onFilterChange({ ...filters, viewSubscriberRatio: newRatios })
  }

  // 주요 지역 코드 목록
  const regions = [
    { code: 'US', name: '미국' },
    { code: 'KR', name: '한국' },
    { code: 'JP', name: '일본' },
    { code: 'GB', name: '영국' },
    { code: 'CA', name: '캐나다' },
    { code: 'AU', name: '호주' },
    { code: 'DE', name: '독일' },
    { code: 'FR', name: '프랑스' },
    { code: 'CN', name: '중국' },
    { code: 'IN', name: '인도' }
  ]

  return (
    <div className="filter-panel">
      <div className="filter-section">
        <h3>지역 선택</h3>
        <select 
          value={regionCode || ''} 
          onChange={(e) => onRegionChange(e.target.value || undefined)}
          className="region-select"
        >
          <option value="">전체 지역</option>
          {regions.map(region => (
            <option key={region.code} value={region.code}>
              {region.name} ({region.code})
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <h3>카테고리 선택</h3>
        {categoriesLoading ? (
          <div className="loading-text">카테고리 로딩 중...</div>
        ) : categories.length === 0 ? (
          <div className="loading-text">카테고리를 불러올 수 없습니다.</div>
        ) : (
          <select 
            value={categoryId || ''} 
            onChange={(e) => onCategoryChange(e.target.value || undefined)}
            className="category-select"
          >
            <option value="">전체 카테고리</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="filter-section">
        <h3>길이 필터</h3>
        <div className="filter-buttons">
          <button
            className={filters.duration === 'all' ? 'active' : ''}
            onClick={() => handleDurationChange('all')}
          >
            전체
          </button>
          <button
            className={filters.duration === 'short' ? 'active' : ''}
            onClick={() => handleDurationChange('short')}
          >
            숏폼 (&lt;60초)
          </button>
          <button
            className={filters.duration === 'long' ? 'active' : ''}
            onClick={() => handleDurationChange('long')}
          >
            롱폼 (&ge;60초)
          </button>
        </div>
      </div>

      <div className="filter-section">
        <h3>기간 필터</h3>
        <div className="filter-buttons">
          <button
            className={filters.period === 'all' ? 'active' : ''}
            onClick={() => handlePeriodChange('all')}
          >
            전체
          </button>
          <button
            className={filters.period === '1month' ? 'active' : ''}
            onClick={() => handlePeriodChange('1month')}
          >
            1개월
          </button>
          <button
            className={filters.period === '2months' ? 'active' : ''}
            onClick={() => handlePeriodChange('2months')}
          >
            2개월
          </button>
          <button
            className={filters.period === '6months' ? 'active' : ''}
            onClick={() => handlePeriodChange('6months')}
          >
            6개월
          </button>
          <button
            className={filters.period === '1year' ? 'active' : ''}
            onClick={() => handlePeriodChange('1year')}
          >
            1년
          </button>
        </div>
      </div>

      <div className="filter-section">
        <h3>조회/구독 비율 필터 (다중선택)</h3>
        <div className="filter-buttons">
          {[1, 2, 3, 4, 5].map(level => (
            <button
              key={level}
              className={filters.viewSubscriberRatio.includes(level) ? 'active' : ''}
              onClick={() => handleRatioToggle(level)}
            >
              {level}단계
              {level === 1 && ' (&lt;0.2)'}
              {level === 2 && ' (0.2-0.6)'}
              {level === 3 && ' (0.6-1.4)'}
              {level === 4 && ' (1.4-3.0)'}
              {level === 5 && ' (&ge;3.0)'}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>보기 모드</h3>
        <div className="filter-buttons">
          <button
            className={viewMode === 'card' ? 'active' : ''}
            onClick={() => onViewModeChange('card')}
          >
            카드형
          </button>
          <button
            className={viewMode === 'table' ? 'active' : ''}
            onClick={() => onViewModeChange('table')}
          >
            테이블형
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterPanel

