# Nisal-Enterprises-database

## Setup (Windows)

### 1) Create a virtual environment

```powershell
cd D:\Nisal-Enterprises-database
py -3 -m venv .venv
```

### 2) Install dependencies

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 3) Create the MySQL database

- Import `nisal_db.sql` into MySQL.
- Update the credentials in `app.py` if needed.

### 4) Run the app

- Double-click `start_app.vbs` (starts hidden and opens the browser), or run:

```powershell
.\.venv\Scripts\python.exe app.py
```