# Setup and Installation Guide

## 1. Create a virtual environment

```bash
python -m venv .venv
```

Activate it:

- **Windows (PowerShell):**
    ```powershell
    .venv/Scripts/activate
    ```

- **macOS / Linux:**
    ```bash
    source .venv/bin/activate
    ```

## 2. Install Dependencies

```bash
pip install -r ./python-backend/requirements.txt
```

## 3. Install and enable Git LFS

**Install Git LFS**
```bash
git lfs install
```

**Pull files**
```bash
git lfs pull
```

## 4. Run the server

```bash
uvicorn python-backend.main:app --host 0.0.0.0 --port 8000 --reload
```
