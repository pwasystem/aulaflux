import json
import os
from datetime import datetime

DATA_DIR = 'data'
PROFESSORES_FILE = os.path.join(DATA_DIR, 'professores.json')
CURSOS_FILE = os.path.join(DATA_DIR, 'cursos.json')
FERIADOS_FILE = os.path.join(DATA_DIR, 'feriados.json')

def setup_database():
    """Garante que o diretório de dados e os arquivos JSON básicos existam."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    for file_path in [PROFESSORES_FILE, CURSOS_FILE, FERIADOS_FILE]:
        if not os.path.exists(file_path):
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump([], f, indent=4)

def get_agendamentos_file_path(year):
    """Retorna o caminho do arquivo de agendamentos para um ano específico."""
    return os.path.join(DATA_DIR, f'agendamentos_{year}.json')

def carregar_dados(tipo, ano=None):
    """
    Carrega dados de um arquivo JSON.
    'tipo' pode ser 'professores', 'cursos', 'feriados' ou 'agendamentos'.
    'ano' é necessário para 'agendamentos'.
    """
    setup_database() # Garante que tudo existe
    
    if tipo == 'professores':
        filepath = PROFESSORES_FILE
    elif tipo == 'cursos':
        filepath = CURSOS_FILE
    elif tipo == 'feriados':
        filepath = FERIADOS_FILE
    elif tipo == 'agendamentos':
        if not ano:
            raise ValueError("O ano é necessário para carregar agendamentos.")
        filepath = get_agendamentos_file_path(ano)
        if not os.path.exists(filepath):
            return [] # Retorna lista vazia se o arquivo do ano não existir
    else:
        raise ValueError("Tipo de dados desconhecido.")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def salvar_dados(tipo, dados, ano=None):
    """
    Salva dados em um arquivo JSON.
    'tipo' pode ser 'professores', 'cursos', 'feriados' ou 'agendamentos'.
    'ano' é necessário para 'agendamentos'.
    """
    setup_database()
    
    if tipo == 'professores':
        filepath = PROFESSORES_FILE
    elif tipo == 'cursos':
        filepath = CURSOS_FILE
    elif tipo == 'feriados':
        filepath = FERIADOS_FILE
    elif tipo == 'agendamentos':
        if not ano:
            raise ValueError("O ano é necessário para salvar agendamentos.")
        filepath = get_agendamentos_file_path(ano)
    else:
        raise ValueError("Tipo de dados desconhecido.")
        
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(dados, f, indent=4, ensure_ascii=False)

def carregar_todos_agendamentos():
    """Carrega agendamentos de todos os anos encontrados na pasta de dados."""
    todos_agendamentos = []
    if not os.path.exists(DATA_DIR):
        return []
    
    for filename in os.listdir(DATA_DIR):
        if filename.startswith('agendamentos_') and filename.endswith('.json'):
            try:
                ano = int(filename.split('_')[1].split('.')[0])
                agendamentos_ano = carregar_dados('agendamentos', ano)
                todos_agendamentos.extend(agendamentos_ano)
            except (ValueError, IndexError):
                continue # Ignora arquivos mal formatados
    return todos_agendamentos