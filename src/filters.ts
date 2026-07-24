// Filtering logic for Xbox POST Error Codes table

export interface ErrorRow {
    console: string | string[];
    type: string;
    code: string;
    bitmask: number | null;
    isError: boolean;
    name: string;
    description: string;
}

export interface Filters {
    console: string;
    type: string;
    error: string;
    search: string;
}

export let filters: Filters = {
    console: '',
    type: '',
    error: 'all',
    search: ''
};

export const CONSOLE_NAMES: Record<string, string> = {
    'XOP': 'Xbox One Phat',
    'XOS': 'Xbox One S',
    'XOX': 'Xbox One X',
    'XSS': 'Xbox Series S',
    'XSX': 'Xbox Series X',
    'ALL': 'All'
};

function refresh(onFilterChange: () => void): void {
    updateActiveFilters(onFilterChange);
    onFilterChange();
}

export function setupFilters(errorData: ErrorRow[], onFilterChange: () => void): void {
    // Get unique values for console and type
    const consoles = [...new Set(errorData.flatMap(row =>
        Array.isArray(row.console) ? row.console : [row.console]
    ))].sort();
    const types = [...new Set(errorData.map(row => row.type))].sort();

    // Setup search functionality
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const searchClear = document.querySelector('.search-clear') as HTMLElement;

    searchInput.addEventListener('input', (e) => {
        filters.search = (e.target as HTMLInputElement).value.toLowerCase();
        refresh(onFilterChange);
    });

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        filters.search = '';
        refresh(onFilterChange);
    });

    // Populate console filter
    const consoleFilter = document.getElementById('console-filter') as HTMLSelectElement;
    consoleFilter.innerHTML = '<option value="">-</option>';
    consoles.forEach(console => {
        const option = document.createElement('option');
        option.value = console;
        option.textContent = CONSOLE_NAMES[console];
        consoleFilter.appendChild(option);
    });

    // Populate type filter
    const typeFilter = document.getElementById('type-filter') as HTMLSelectElement;
    typeFilter.innerHTML = '<option value="">-</option>';
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });

    // Setup filter change handlers
    consoleFilter.addEventListener('change', (e) => {
        filters.console = (e.target as HTMLSelectElement).value;
        refresh(onFilterChange);
    });

    typeFilter.addEventListener('change', (e) => {
        filters.type = (e.target as HTMLSelectElement).value;
        refresh(onFilterChange);
    });

    (document.getElementById('error-filter') as HTMLSelectElement).addEventListener('change', (e) => {
        filters.error = (e.target as HTMLSelectElement).value;
        refresh(onFilterChange);
    });
}

export function updateActiveFilters(onFilterChange: () => void): void {
    const activeFiltersContainer = document.getElementById('active-filters')!;
    activeFiltersContainer.innerHTML = '';

    if (filters.console) {
        addFilterTag(`Console: ${CONSOLE_NAMES[filters.console]}`, () => {
            filters.console = '';
            (document.getElementById('console-filter') as HTMLSelectElement).value = '';
            refresh(onFilterChange);
        });
    }

    if (filters.type) {
        addFilterTag('Type: ' + filters.type, () => {
            filters.type = '';
            (document.getElementById('type-filter') as HTMLSelectElement).value = '';
            refresh(onFilterChange);
        });
    }

    if (filters.error === 'errors') {
        addFilterTag('Errors Only', () => {
            filters.error = 'all';
            (document.getElementById('error-filter') as HTMLSelectElement).value = 'all';
            refresh(onFilterChange);
        });
    }

    if (filters.search) {
        addFilterTag(`Search: ${filters.search}`, () => {
            filters.search = '';
            (document.getElementById('search-input') as HTMLInputElement).value = '';
            refresh(onFilterChange);
        });
    }
}

function addFilterTag(text: string, onRemove: () => void): void {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
        ${text}
        <span class="material-icons">close</span>
    `;
    tag.querySelector('.material-icons')!.addEventListener('click', onRemove);
    document.getElementById('active-filters')!.appendChild(tag);
}

export function applyFilters(errorData: ErrorRow[]): ErrorRow[] {
    let filteredData = [...errorData];
    if (filters.console) {
        filteredData = filteredData.filter(row => {
            const consoles = Array.isArray(row.console) ? row.console : [row.console];
            return consoles.includes(filters.console);
        });
    }
    if (filters.type) {
        filteredData = filteredData.filter(row => row.type === filters.type);
    }
    if (filters.error === 'errors') {
        filteredData = filteredData.filter(row => row.isError);
    }
    if (filters.search) {
        filteredData = filteredData.filter(row =>
            row.name.toLowerCase().includes(filters.search) ||
            row.code.toLowerCase().includes(filters.search)
        );
    }
    return filteredData;
}
