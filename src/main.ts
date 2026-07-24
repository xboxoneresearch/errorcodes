import { filters, setupFilters, updateActiveFilters, applyFilters, CONSOLE_NAMES, type ErrorRow } from './filters.js';

function closeModal(modal: HTMLElement, onClose?: () => void): void {
    modal.style.display = "none";
    onClose?.();
}

function setupModal(modal: HTMLElement, onClose?: () => void): void {
    modal.querySelector<HTMLElement>('.close-modal')?.addEventListener('click', () => closeModal(modal, onClose));
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal(modal, onClose);
    });
}

// Check for thanks parameter and show popup if present
const urlParams = new URLSearchParams(window.location.search);
const thanksPopup = document.getElementById('thanks-popup') as HTMLElement;
setupModal(thanksPopup, () => {
    // Remove the thanks parameter from URL without reloading
    const newUrl = window.location.pathname + window.location.search.replace(/[?&]thanks/, '');
    window.history.replaceState({}, '', newUrl);
});
if (urlParams.has('thanks')) {
    thanksPopup.style.display = "block";
}

// Modal handling
const modal = document.getElementById('submit-modal') as HTMLElement;
const btn = document.getElementById('submit-code-btn') as HTMLElement;
setupModal(modal);

btn.onclick = function () {
    modal.style.display = "block";
}

const SUPPORTED_FORMAT_VERSION = 2;
let errorData: ErrorRow[] = [];
let currentSort: { column: keyof ErrorRow; direction: 'asc' | 'desc' } = { column: 'code', direction: 'asc' };
let showBitmasks = false;

interface MetaItem {
    metaType: string;
    path: string;
    hash?: string;
}

interface MetaJson {
    formatVersion: number;
    updated?: string;
    items: MetaItem[];
}

// URL query parameter handling
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        console: params.get('console') || '',
        type: params.get('type') || '',
        error: params.get('error') || 'all',
        search: params.get('search') || '',
        sort: (params.get('sort') || 'code') as keyof ErrorRow,
        direction: (params.get('direction') || 'asc') as 'asc' | 'desc',
        bitmask: params.get('bitmask') === 'true'
    };
}

function updateURL(): void {
    const params = new URLSearchParams();
    if (filters.console) params.set('console', filters.console);
    if (filters.type) params.set('type', filters.type);
    if (filters.error !== 'all') params.set('error', filters.error);
    if (filters.search) params.set('search', filters.search);
    if (currentSort.column !== 'code') params.set('sort', currentSort.column);
    if (currentSort.direction !== 'asc') params.set('direction', currentSort.direction);
    if (showBitmasks) params.set('bitmask', 'true');

    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newURL);
}

function applyQueryParams(): void {
    const params = getQueryParams();

    // Apply filters
    filters.console = params.console;
    filters.type = params.type;
    filters.error = params.error;
    filters.search = params.search;
    showBitmasks = params.bitmask;

    // Apply sorting
    currentSort.column = params.sort;
    currentSort.direction = params.direction;

    // Update UI elements
    (document.getElementById('console-filter') as HTMLSelectElement).value = filters.console;
    (document.getElementById('type-filter') as HTMLSelectElement).value = filters.type;
    (document.getElementById('error-filter') as HTMLSelectElement).value = filters.error;
    (document.getElementById('search-input') as HTMLInputElement).value = filters.search;
    (document.getElementById('bitmask-filter') as HTMLInputElement).checked = showBitmasks;

    // Update sort indicators
    document.querySelectorAll('th').forEach(header => {
        header.classList.remove('asc', 'desc');
        if (header.dataset.sort === currentSort.column) {
            header.classList.add(currentSort.direction);
        }
    });
}

// Theme handling
function setupTheme(): void {
    const themeToggle = document.getElementById('theme-toggle') as HTMLElement;
    const themeIcon = themeToggle.querySelector('.material-icons') as HTMLElement;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeIcon.textContent = savedTheme === 'dark' ? 'light_mode' : 'dark_mode';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeIcon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
    });
}

function showError(prefix: string, error: unknown): void {
    document.getElementById('loading')!.style.display = 'none';
    const errorEl = document.getElementById('error') as HTMLElement;
    errorEl.style.display = 'block';
    errorEl.textContent = `${prefix}: ${(error as Error).message}`;
}

async function fetchMetaJson(): Promise<MetaItem> {
    try {
        const response = await fetch("meta.json", { cache: "no-cache" });
        if (!response.ok) throw new Error('Failed to fetch meta.json');
        const meta: MetaJson = await response.json();

        if (meta.formatVersion !== SUPPORTED_FORMAT_VERSION) {
            throw new Error(`Unexpected format version: ${meta.formatVersion}`);
        }

        const postCodeItem = meta.items.find(item => item.metaType === 'PostCodes');
        if (!postCodeItem) {
            throw new Error('PostCode item not found in meta.json');
        }

        // Display last update time
        if (meta.updated) {
            const updateDate = new Date(meta.updated);
            const formattedDate = updateDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            document.getElementById('last-update')!.textContent = `Last updated: ${formattedDate}`;
        }

        return postCodeItem;
    } catch (error) {
        showError('Error loading meta.json', error);
        throw error;
    }
}

async function fetchErrorCodes(): Promise<void> {
    try {
        const postCodeItem = await fetchMetaJson();
        const response = await fetch(postCodeItem.path, { cache: "no-cache" });
        if (!response.ok) throw new Error('Failed to fetch error codes');
        const csvText = await response.text();
        parseCSV(csvText);
    } catch (error) {
        showError('Error loading error codes', error);
    }
}

function parseCSV(csvText: string): void {
    const lines = csvText.split('\n');

    errorData = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
            // Split by comma but respect quoted values
            const values: string[] = [];
            let currentValue = '';
            let insideQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];

                if (char === '"') {
                    insideQuotes = !insideQuotes;
                } else if (char === ',' && !insideQuotes) {
                    values.push(currentValue);
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }
            // Push the last value
            values.push(currentValue);

            // Parse console column which can be a single value or comma-separated list
            const console: string | string[] = values[0].includes(',')
                ? values[0].split(',').map(c => c.trim())
                : values[0];

            // Parse bitmask if present
            const bitmask = values[3] ? parseInt(values[3], 16) : null;

            return {
                console: console,
                type: values[1],
                code: values[2],
                bitmask: bitmask,
                isError: values[4] === '1',
                name: values[5],
                description: values[6]?.replace(/^"|"$/g, '') || '', // Remove surrounding quotes if present
            };
        });

    setupFilters(errorData, () => {
        renderTable();
        updateURL();
    });
    applyQueryParams();
    renderTable();
    document.getElementById('loading')!.style.display = 'none';
    (document.getElementById('table-container') as HTMLElement).style.display = 'block';
}

function renderTable(): void {
    const tbody = document.querySelector('#error-table tbody')!;
    tbody.innerHTML = '';
    let filteredData = applyFilters(errorData);
    // Apply sorting
    const sortedData = filteredData.sort((a, b) => {
        const aValue = a[currentSort.column];
        const bValue = b[currentSort.column];

        if (currentSort.column === 'code') {
            // Sort hex codes numerically
            return currentSort.direction === 'asc'
                ? parseInt(aValue as string, 16) - parseInt(bValue as string, 16)
                : parseInt(bValue as string, 16) - parseInt(aValue as string, 16);
        }

        return currentSort.direction === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
    });

    sortedData.forEach(row => {
        // Skip bitmask entries if not showing them
        if (!showBitmasks && row.bitmask !== null) {
            return;
        }

        const tr = document.createElement('tr');
        const consoles = Array.isArray(row.console) ? row.console : [row.console];
        const consoleBadges = consoles.map(console =>
            `<span class="console-badge ${console}" title="${CONSOLE_NAMES[console]}"><nobr>${CONSOLE_NAMES[console]}</nobr></span>`
        ).join('');

        const codeType = row.type;
        const codeTypeBadge = `<span class="codetype-badge ${codeType}" title="${codeType}">${codeType}</span>`;

        // Format code with bitmask if present
        const codeDisplay = row.bitmask !== null
            ? `${row.code} (${row.bitmask.toString(16).toUpperCase()})`
            : row.code;

        tr.innerHTML = `
            <td>${codeDisplay}</td>
            <td>${codeTypeBadge}</td>
            <td>${row.name}</td>
            <td>${row.description}</td>
            <td>${row.isError ? 'Yes' : 'No'}</td>
            <td>${consoleBadges}</td>
        `;
        tbody.appendChild(tr);
    });
}

function setupSorting(): void {
    document.querySelectorAll('th').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort as keyof ErrorRow;
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
            }

            // Update sort indicators
            document.querySelectorAll('th').forEach(header => {
                header.classList.remove('asc', 'desc');
            });
            th.classList.add(currentSort.direction);

            renderTable();
            updateURL();
        });
    });
}

// Initialize
setupTheme();
fetchErrorCodes();
setupSorting();

// Add bitmask filter event listener
(document.getElementById('bitmask-filter') as HTMLInputElement).addEventListener('change', (e) => {
    showBitmasks = (e.target as HTMLInputElement).checked;
    renderTable();
    updateURL();
});
