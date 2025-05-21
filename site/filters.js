// Filtering logic for Xbox POST Error Codes table

export let filters = {
    console: '',
    type: '',
    error: 'all',
    search: ''
};

export function setupFilters(errorData, onFilterChange) {
    // Get unique values for console and type
    const consoles = [...new Set(errorData.map(row => row.console))].sort();
    const types = [...new Set(errorData.map(row => row.type))].sort();

    // Setup search functionality
    const searchInput = document.getElementById('search-input');
    const searchClear = document.querySelector('.search-clear');

    searchInput.addEventListener('input', (e) => {
        filters.search = e.target.value.toLowerCase();
        updateActiveFilters(onFilterChange);
        onFilterChange();
    });

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        filters.search = '';
        updateActiveFilters(onFilterChange);
        onFilterChange();
    });

    // Populate console filter
    const consoleFilter = document.getElementById('console-filter');
    consoleFilter.innerHTML = '<option value="">All Consoles</option>';
    consoles.forEach(console => {
        const option = document.createElement('option');
        option.value = console;
        option.textContent = console;
        consoleFilter.appendChild(option);
    });

    // Populate type filter
    const typeFilter = document.getElementById('type-filter');
    typeFilter.innerHTML = '<option value="">All Types</option>';
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });

    // Setup filter change handlers
    consoleFilter.addEventListener('change', (e) => {
        filters.console = e.target.value;
        updateActiveFilters(onFilterChange);
        onFilterChange();
    });

    typeFilter.addEventListener('change', (e) => {
        filters.type = e.target.value;
        updateActiveFilters(onFilterChange);
        onFilterChange();
    });

    document.getElementById('error-filter').addEventListener('change', (e) => {
        filters.error = e.target.value;
        updateActiveFilters(onFilterChange);
        onFilterChange();
    });
}

export function updateActiveFilters(onFilterChange) {
    const activeFiltersContainer = document.getElementById('active-filters');
    activeFiltersContainer.innerHTML = '';

    if (filters.console) {
        addFilterTag('Console: ' + filters.console, () => {
            filters.console = '';
            document.getElementById('console-filter').value = '';
            updateActiveFilters(onFilterChange);
            onFilterChange();
        });
    }

    if (filters.type) {
        addFilterTag('Type: ' + filters.type, () => {
            filters.type = '';
            document.getElementById('type-filter').value = '';
            updateActiveFilters(onFilterChange);
            onFilterChange();
        });
    }

    if (filters.error === 'errors') {
        addFilterTag('Errors Only', () => {
            filters.error = 'all';
            document.getElementById('error-filter').value = 'all';
            updateActiveFilters(onFilterChange);
            onFilterChange();
        });
    }
}

function addFilterTag(text, onRemove) {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
        ${text}
        <span class="material-icons">close</span>
    `;
    tag.querySelector('.material-icons').addEventListener('click', onRemove);
    document.getElementById('active-filters').appendChild(tag);
}

export function applyFilters(errorData) {
    let filteredData = [...errorData];
    if (filters.console) {
        filteredData = filteredData.filter(row => row.console === filters.console);
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