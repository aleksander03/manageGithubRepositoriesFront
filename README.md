# manageGithubRepositoriesFront

***Wymagania przed instalacją***
**NodeJS** - pobrać (https://nodejs.org/en/download/) i zainstalować

**PostgreSQL** - pobrać (https://www.postgresql.org/download/windows/) i zainstalować

**OAuth App** - utworzyć nową aplikację OAuth na platformie GitHub

## Webapp
### Konfiguracja
- odnaleźć plik .env w głównym folderze i wypełnić
    1. REACT_APP_CLIENT_ID - client id z OAuthApp
    2. REACT_APP_CLIENT_SECRET - client secret z OAuthApp
    3. REACT_APP_REDIRECT_URL - adres url strony głównej aplikacji webowej
    4. REACT_APP_REDIRECT_URL_LOGIN - adres url strony logowania aplikacji webowej
    5. REACT_APP_REDIRECT_SERVER_URL - adres url serwera
    6. REACT_APP_BACKEND_PATH - ścieżka do folderu, w którym znajduje się serwer
### Instalacja
- w terminalu użyć polecenia *npm install* do pobrania wszystkich wymaganych bibliotek
### Uruchomienie
- w terminalu użyć polecenia *npm run start*

## Backend
### Konfiguracja
- odnaleźć plik .env w głównym folderze i wypełnić
    1. REACT_APP_CLIENT_ID - client id z OAuthApp
    2. REACT_APP_CLIENT_SECRET - client secret z OAuthApp
    3. REACT_APP_REDIRECT_URL - adres url strony głównej aplikacji webowej
    4. REACT_APP_BACKEND_URL - adres url serwera
    5. DATABASE_URL - wypełnić w cudzysłowie ("") w formacie: "postgresql://nazwa_użytkownika:hasło@adres_url:port/DISMaGR?schema=public"
    6. nazwa_użytkownika - nazwa użytkownika postgreSQL
    7. hasło - hasło użytkownika postgreSQL
    8. adres_url - adres url serwera (domyślnie localhost)
    9. port - domyślnie 5432 (przy zmianie, należy również zmienić w pliku server.js)
- odnaleźć plik seed.js w folderze prisma. Utworzyć w tym miejscu pierwszego Administratora
### Instalacja
- w terminalu użyć polecenia *npm install* do pobrania wszystkich wymaganych bibliotek
- w terminalu użyć poleceń *npm run prisma_migrate* oraz *npm run prisma_generate* służące do utworzenia początkowej bazy danych
### Uruchomienie
- w terminalu użyć polecenia *npm run start*