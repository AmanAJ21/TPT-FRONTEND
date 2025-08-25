"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  X,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  MapPin,
  User,
  Truck,
  Hash,
  Clock
} from "lucide-react"

interface SearchResult {
  id: string
  title: string
  description?: string
  category?: string
  metadata?: Record<string, any>
  href?: string
}

interface MobileSearchProps extends React.HTMLAttributes<HTMLDivElement> {
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  onSearch?: (query: string) => void
  results?: SearchResult[]
  isLoading?: boolean
  showFilters?: boolean
  filters?: {
    label: string
    value: string
    active: boolean
    onClick: () => void
  }[]
  recentSearches?: string[]
  onRecentSearchClick?: (search: string) => void
  onClearRecent?: () => void
  suggestions?: string[]
  maxResults?: number
}

const MobileSearch = React.forwardRef<HTMLDivElement, MobileSearchProps>(
  ({ 
    className,
    placeholder = "Search...",
    value = "",
    onValueChange,
    onSearch,
    results = [],
    isLoading = false,
    showFilters = false,
    filters = [],
    recentSearches = [],
    onRecentSearchClick,
    onClearRecent,
    suggestions = [],
    maxResults = 10,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState(value)
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      setInputValue(value)
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      onValueChange?.(newValue)
      setShowSuggestions(newValue.length > 0)
      
      // Auto-search after a delay
      const timeoutId = setTimeout(() => {
        if (newValue.trim()) {
          onSearch?.(newValue)
        }
      }, 300)

      return () => clearTimeout(timeoutId)
    }

    const handleSearch = () => {
      if (inputValue.trim()) {
        onSearch?.(inputValue)
        setIsOpen(true)
        setShowSuggestions(false)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSearch()
      } else if (e.key === 'Escape') {
        setIsOpen(false)
        setShowSuggestions(false)
        inputRef.current?.blur()
      }
    }

    const handleClear = () => {
      setInputValue("")
      onValueChange?.("")
      setIsOpen(false)
      setShowSuggestions(false)
      inputRef.current?.focus()
    }

    const handleSuggestionClick = (suggestion: string) => {
      setInputValue(suggestion)
      onValueChange?.(suggestion)
      onSearch?.(suggestion)
      setShowSuggestions(false)
      setIsOpen(true)
    }

    const handleRecentClick = (search: string) => {
      setInputValue(search)
      onValueChange?.(search)
      onRecentSearchClick?.(search)
      setShowSuggestions(false)
      setIsOpen(true)
    }

    const filteredSuggestions = suggestions
      .filter(s => s.toLowerCase().includes(inputValue.toLowerCase()))
      .slice(0, 5)

    const displayResults = results.slice(0, maxResults)

    return (
      <div ref={ref} className={cn("relative w-full", className)} {...props}>
        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (inputValue.length > 0) {
                  setShowSuggestions(true)
                }
              }}
              className="pl-10 pr-20 h-12 text-base"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {inputValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearch}
                className="h-8 w-8 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && filters.length > 0 && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            {filters.map((filter, index) => (
              <Badge
                key={index}
                variant={filter.active ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={filter.onClick}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && (filteredSuggestions.length > 0 || recentSearches.length > 0) && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
            <CardContent className="p-0">
              {/* Recent Searches */}
              {recentSearches.length > 0 && !inputValue && (
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Recent
                    </span>
                    {onClearRecent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearRecent}
                        className="h-6 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentClick(search)}
                        className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors flex items-center gap-2"
                      >
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {filteredSuggestions.length > 0 && (
                <div className="p-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    Suggestions
                  </span>
                  <div className="space-y-1">
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors flex items-center gap-2"
                      >
                        <Search className="h-3 w-3 text-muted-foreground" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {isOpen && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto mb-2" />
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              ) : displayResults.length > 0 ? (
                <div className="divide-y">
                  {displayResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-4 hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => {
                        if (result.href) {
                          window.location.href = result.href
                        }
                        setIsOpen(false)
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {result.title}
                          </h4>
                          {result.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          {result.metadata && (
                            <div className="flex items-center gap-2 mt-2">
                              {result.metadata.date && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {result.metadata.date}
                                </div>
                              )}
                              {result.metadata.location && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {result.metadata.location}
                                </div>
                              )}
                              {result.metadata.user && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  {result.metadata.user}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {result.category && (
                          <Badge variant="outline" className="text-xs">
                            {result.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {results.length > maxResults && (
                    <div className="p-3 text-center border-t">
                      <span className="text-xs text-muted-foreground">
                        Showing {maxResults} of {results.length} results
                      </span>
                    </div>
                  )}
                </div>
              ) : inputValue ? (
                <div className="p-6 text-center">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <span className="text-sm text-muted-foreground">
                    No results found for "{inputValue}"
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Backdrop */}
        {(isOpen || showSuggestions) && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false)
              setShowSuggestions(false)
            }}
          />
        )}
      </div>
    )
  }
)
MobileSearch.displayName = "MobileSearch"

// Compact search bar for headers
interface CompactSearchProps extends Omit<MobileSearchProps, 'results' | 'isLoading'> {
  onSubmit?: (query: string) => void
}

const CompactSearch = React.forwardRef<HTMLDivElement, CompactSearchProps>(
  ({ className, placeholder = "Search...", onSubmit, ...props }, ref) => {
    const [value, setValue] = React.useState("")

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (value.trim()) {
        onSubmit?.(value)
      }
    }

    return (
      <form onSubmit={handleSubmit} className={cn("relative", className)} ref={ref}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pl-10 h-10 text-sm"
          {...props}
        />
      </form>
    )
  }
)
CompactSearch.displayName = "CompactSearch"

export {
  MobileSearch,
  CompactSearch,
  type SearchResult,
}