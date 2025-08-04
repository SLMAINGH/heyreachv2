/**
 * HEYREACH V2 - DOKUMENTACJA LOGIKI APLIKACJI
 * ============================================
 * 
 * Pełna dokumentacja architektury, przepływu danych i logiki filtrowania
 * dla aplikacji HeyReach Dashboard V2.
 */

// =============================================================================
// STRUKTURA STANU APLIKACJI
// =============================================================================

/**
 * Globalny stan aplikacji zawierający wszystkie dane i konfigurację
 */
const STATE_STRUCTURE = {
    // Konfiguracja API
    workerUrl: 'https://snowy-hall-5f3d.lammelstanislaw.workers.dev',
    authPassword: '',           // Hasło autoryzacji użytkownika
    selectedApiKeys: [],        // Wybrane klucze API do pobierania danych
    
    // Dane pobrane z API
    accounts: [],               // Array obiektów kont LinkedIn
    campaigns: [],              // Array obiektów kampanii
    conversations: [],          // Array wszystkich konwersacji (raw data)
    
    // Dane po filtracji
    filteredConversations: [],  // Array konwersacji po zastosowaniu filtrów
    
    // Konfiguracja filtrów
    filters: {
        hasResponse: false,     // Boolean - pokazuj tylko z odpowiedzią
        apiKeys: [],           // Array stringów - wybrane klucze API
        senderIds: [],         // Array intów - wybrane ID kont LinkedIn
        campaignIds: []        // Array intów - wybrane ID kampanii
    }
};

// =============================================================================
// STRUKTURY DANYCH API
// =============================================================================

/**
 * Struktura obiektu Account (konto LinkedIn)
 */
const ACCOUNT_STRUCTURE = {
    id: 123,                    // int - unikalny identyfikator
    firstName: "Jan",           // string - imię
    lastName: "Kowalski",       // string - nazwisko  
    apiKeyAlias: "ICP"         // string - alias klucza API
};

/**
 * Struktura obiektu Campaign (kampania)
 */
const CAMPAIGN_STRUCTURE = {
    id: 456,                    // int - unikalny identyfikator
    name: "Q4 Outreach",       // string - nazwa kampanii
    apiKeyAlias: "ICP"         // string - alias klucza API
};

/**
 * Struktura obiektu Conversation (konwersacja)
 */
const CONVERSATION_STRUCTURE = {
    id: "conv_789",                    // string - unikalny identyfikator
    linkedInAccountId: 123,            // int - ID konta LinkedIn (sender)
    campaignId: 456,                   // int - ID kampanii (może być null)
    correspondentProfile: {            // obiekt - profil rozmówcy
        firstName: "Anna",
        lastName: "Nowak",
        companyName: "TechCorp",
        position: "CEO"
    },
    lastMessageText: "Dziekuje...",    // string - treść ostatniej wiadomości
    lastMessageAt: "2024-01-15T...",   // string - timestamp ostatniej wiadomości
    apiKeyAlias: "ICP",               // string - alias klucza API
    
    // Pola dodawane przez aplikację:
    hasResponse: false,                // boolean - czy ma odpowiedź od rozmówcy
    fullData: null                     // obiekt - pełne dane chatroomu lub null
};

/**
 * Struktura obiektu Chatroom (pełne dane konwersacji)
 */
const CHATROOM_STRUCTURE = {
    correspondentProfile: { /* jak wyżej */ },
    linkedInAccount: { /* jak Account */ },
    messages: [                        // Array wiadomości
        {
            sender: "linkedInAccount", // string - "linkedInAccount" lub "correspondentProfile"  
            subject: "Re: Propozycja", // string - temat (może być null)
            body: "Treść wiadomości",  // string - treść
            createdAt: "2024-01-15T..." // string - timestamp
        }
    ]
};

// =============================================================================
// PRZEPŁYW DANYCH - GŁÓWNE FUNKCJE
// =============================================================================

/**
 * 1. INICJALIZACJA I POBIERANIE DANYCH
 * ===================================
 */

/**
 * fetchData() - Główna funkcja pobierająca wszystkie dane
 * 
 * PRZEPŁYW:
 * 1. Resetuje state.accounts, state.campaigns, state.conversations
 * 2. Dla każdego wybranego API key tworzy Promise:
 *    - Pobiera accounts (/api/public/li_account/GetAll)
 *    - Pobiera campaigns (/api/public/campaign/GetAll) 
 *    - Pobiera conversations z paginacją (/api/public/inbox/GetConversations)
 * 3. Wykonuje wszystkie Promise równolegle (Promise.allSettled)
 * 4. Łączy wyniki do state.accounts, state.campaigns, state.conversations
 * 5. Dla każdej konwersacji pobiera pełne dane chatroom równolegle
 * 6. Oznacza konwersacje jako hasResponse=true jeśli mają wiadomości od rozmówcy
 * 7. Wywołuje createFilters(), showSections(), applyFilters()
 * 
 * OPTYMALIZACJE:
 * - Równoległe zapytania API (Promise.all)
 * - Paginacja dla dużych zestawów danych
 * - Promise.allSettled aby jeden błąd nie zatrzymał całości
 * - Parallel fetching chatroom details aby uniknąć N+1 queries
 */

/**
 * 2. TWORZENIE FILTRÓW
 * ==================
 */

/**
 * createFilters() - Tworzy dynamiczne checkboxy do filtrowania
 * 
 * LOGIKA:
 * 1. API Keys: Pobiera unikalne apiKeyAlias z state.conversations
 * 2. Senders: Używa state.accounts (firstName + lastName)
 * 3. Campaigns: Używa state.campaigns (name)
 * 4. Każdy checkbox ma checked=true domyślnie
 * 5. Każdy checkbox ma addEventListener('change', applyFilters)
 * 
 * UWAGA: Używa Map do deduplikacji unikalnych wartości
 */

/**
 * 3. LOGIKA FILTROWANIA  
 * ====================
 */

/**
 * applyFilters() - Aplikuje wszystkie filtry i aktualizuje widok
 * 
 * KROKI:
 * 1. Odczytuje stan wszystkich checkboxów i zapisuje do state.filters
 * 2. Filtruje state.conversations według zasad:
 *    - hasResponse: jeśli true, pokazuj tylko conv.hasResponse === true
 *    - apiKeys: jeśli wybrane, pokazuj tylko te z state.filters.apiKeys
 *    - senderIds: jeśli wybrane, pokazuj tylko te z state.filters.senderIds  
 *    - campaignIds: jeśli wybrane, pokazuj tylko te które MAJĄ campaignId I jest w liście
 * 3. Zapisuje wynik do state.filteredConversations
 * 4. Wywołuje updateConversationsTable() i updateStats()
 * 
 * PROBLEMY DO NAPRAWIENIA:
 * - Linia 285: conv.campaignId && !state.filters.campaignIds.includes(conv.campaignId)
 *   Problem: Konwersacje BEZ campaignId będą pokazane nawet gdy wybrane konkretne kampanie
 *   Rozwiązanie: Dodać osobną obsługę dla null/undefined campaignId
 */

/**
 * 4. AKTUALIZACJA INTERFEJSU
 * ========================
 */

/**
 * updateConversationsTable() - Aktualizuje tabelę konwersacji
 * 
 * OPTYMALIZACJE:
 * - Używa DocumentFragment dla szybszych aktualizacji DOM
 * - Tworzy Map z kampanii dla O(1) lookup zamiast O(n) find()
 * - Czyści tbody raz i dodaje wszystkie wiersze jedną operacją
 */

/**
 * updateStats() - Aktualizuje statystyki dashboard
 * 
 * METRYKI:
 * - Całkowita liczba konwersacji (po filtracji)
 * - Liczba z odpowiedzią (hasResponse === true)
 * - Współczynnik odpowiedzi w procentach
 */

// =============================================================================
// PROBLEMY I SUGEROWANE POPRAWKI
// =============================================================================

/**
 * PROBLEM 1: Nieprawidłowe filtrowanie kampanii
 * ============================================
 * 
 * OBECNY KOD (linia 285):
 * if (state.filters.campaignIds.length > 0 && conv.campaignId && !state.filters.campaignIds.includes(conv.campaignId)) return false;
 * 
 * PROBLEM: 
 * Konwersacje bez campaignId (null/undefined) będą ZAWSZE pokazane gdy wybrane są konkretne kampanie
 * 
 * POPRAWKA:
 * if (state.filters.campaignIds.length > 0) {
 *     if (!conv.campaignId) return false; // Odrzuć konwersacje bez kampanii
 *     if (!state.filters.campaignIds.includes(conv.campaignId)) return false; // Odrzuć inne kampanie
 * }
 */

/**
 * PROBLEM 2: Brak walidacji parseInt()
 * ==================================
 * 
 * OBECNY KOD (linie 278-279):
 * state.filters.senderIds = [...].map(cb => parseInt(cb.value));
 * state.filters.campaignIds = [...].map(cb => parseInt(cb.value));
 * 
 * PROBLEM:
 * parseInt() może zwrócić NaN dla nieprawidłowych wartości
 * 
 * POPRAWKA:
 * state.filters.senderIds = [...].map(cb => parseInt(cb.value)).filter(id => !isNaN(id));
 * state.filters.campaignIds = [...].map(cb => parseInt(cb.value)).filter(id => !isNaN(id));
 */

/**
 * PROBLEM 3: Brak obsługi błędów dla pojedynczych konwersacji
 * =========================================================
 * 
 * OBECNY KOD:
 * Używa Promise.allSettled dla głównych zapytań ale nie dla chatroom details
 * 
 * POPRAWKA:
 * Już zostało naprawione - używa .catch() dla każdego zapytania chatroom
 */

// =============================================================================
// EVENT LISTENERS I INTERAKCJE
// =============================================================================

/**
 * LISTA WSZYSTKICH EVENT LISTENERÓW:
 * 
 * 1. #fetch-data-btn.click - Rozpoczyna pobieranie danych
 * 2. #apply-filters-btn.click - Ręczne zastosowanie filtrów  
 * 3. #export-csv-btn.click - Export do CSV
 * 4. #close-thread.click - Zamyka popup konwersacji
 * 5. #filter-has-response.change - Auto-filtrowanie przy zmianie
 * 6. #conversations-table.click (delegation) - Otwieranie konwersacji
 * 7. Dynamiczne checkboxy filtrów .change - Auto-filtrowanie
 */

/**
 * PRZEPŁYW INTERAKCJI UŻYTKOWNIKA:
 * 
 * 1. Użytkownik wprowadza hasło i wybiera API keys
 * 2. Klika "Pobierz Dane" → fetchData()
 * 3. Aplikacja pokazuje sekcje filtrów, statystyk i konwersacji
 * 4. Użytkownik zmienia filtry → applyFilters() automatycznie
 * 5. Użytkownik klika "Otwórz wątek" → openThread()
 * 6. Użytkownik może wyeksportować do CSV → exportToCSV()
 */

// =============================================================================
// OPTYMALIZACJE WYDAJNOŚCI
// =============================================================================

/**
 * ZASTOSOWANE OPTYMALIZACJE:
 * 
 * 1. PARALLEL API CALLS
 *    - Promise.all() dla równoległych zapytań na różne klucze API
 *    - Promise.allSettled() dla odporności na błędy
 * 
 * 2. DOM OPTIMIZATIONS  
 *    - DocumentFragment dla batch DOM updates
 *    - Event delegation dla dynamicznych elementów
 * 
 * 3. DATA STRUCTURE OPTIMIZATIONS
 *    - Map() structures dla O(1) lookups zamiast O(n) find()
 *    - Deduplikacja przez new Set() + Map()
 * 
 * 4. MEMORY OPTIMIZATIONS
 *    - Ponowne użycie istniejących struktur danych
 *    - Czyszczenie innerHTML zamiast usuwania po kolei
 */

// =============================================================================
// API ENDPOINTS I STRUKTURY ZAPYTAŃ
// =============================================================================

/**
 * UŻYWANE ENDPOINTY:
 * 
 * 1. POST /api/public/li_account/GetAll
 *    Body: { offset: 0, limit: 100 }
 *    Headers: X-API-KEY, X-Custom-Auth
 * 
 * 2. POST /api/public/campaign/GetAll  
 *    Body: { offset: 0, limit: 100 }
 *    Headers: X-API-KEY, X-Custom-Auth
 * 
 * 3. POST /api/public/inbox/GetConversations
 *    Body: { offset: 0, limit: 100, filters: {} }
 *    Headers: X-API-KEY, X-Custom-Auth
 *    Uwaga: Używa paginacji w pętli while
 * 
 * 4. GET /api/public/inbox/GetChatroom/{linkedInAccountId}/{conversationId}
 *    Headers: X-API-KEY, X-Custom-Auth
 *    Uwaga: Wywołane dla każdej konwersacji równolegle
 */

/**
 * STRUKTURA ODPOWIEDZI API:
 * 
 * GetAll endpoints zwracają:
 * {
 *   items: [...],      // Array obiektów
 *   totalCount: 150    // Całkowita liczba
 * }
 * 
 * GetChatroom zwraca:
 * {
 *   correspondentProfile: {...},
 *   linkedInAccount: {...}, 
 *   messages: [...]
 * }
 */

// =============================================================================
// BEZPIECZEŃSTWO I UWAGI
// =============================================================================

/**
 * KWESTIE BEZPIECZEŃSTWA:
 * 
 * 1. Hasło przesyłane w header X-Custom-Auth (plain text)
 * 2. API keys w URL i headers
 * 3. Brak walidacji po stronie klienta dla danych API
 * 4. Potencjalne XSS przy innerHTML (używa escapeCSV dla CSV)
 * 
 * REKOMENDACJE:
 * - Walidacja i sanitizacja wszystkich danych z API
 * - Użycie textContent zamiast innerHTML gdzie możliwe  
 * - Implementacja proper authentication flow
 * - Rate limiting dla API calls
 */

/**
 * UWAGI DEWELOPERSKIE:
 * 
 * 1. Kod jest w jednym pliku HTML - rozważyć podział na moduły
 * 2. Brak TypeScript - dodać dla lepszej type safety
 * 3. Brak testów jednostkowych
 * 4. Brak error boundary dla React-like error handling
 * 5. Hardcoded strings - rozważyć i18n w przyszłości
 */