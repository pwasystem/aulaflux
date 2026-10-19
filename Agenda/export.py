import pandas as pd
from tkinter import messagebox, filedialog

def exportar_para_excel():
    """Exporta o calendário detalhado de aulas para uma planilha Excel."""
    from database import carregar_todos_agendamentos

    agendamentos = carregar_todos_agendamentos()
    if not agendamentos:
        messagebox.showinfo("Exportar", "Não há agendamentos para exportar.")
        return

    # Estrutura os dados para a planilha
    dados_planilha = []
    for agendamento in agendamentos:
        for aula in agendamento.get('aulas_geradas', []):
            dados_planilha.append({
                'Curso': agendamento['curso_nome'],
                'Professor': agendamento['professor_nome'],
                'Data da Aula': aula['data'],
                'Período': aula['periodo'],
                'Duração (h)': aula['duracao_aula'],
                'Observações': aula.get('observacoes', '')
            })
    
    if not dados_planilha:
        messagebox.showinfo("Exportar", "Não há aulas geradas nos agendamentos para exportar.")
        return

    df = pd.DataFrame(dados_planilha)
    df = df.sort_values(by='Data da Aula') # Ordena pela data

    try:
        # Pede ao usuário para escolher onde salvar o arquivo
        filepath = filedialog.asksaveasfilename(
            defaultextension=".xlsx",
            filetypes=[("Excel files", "*.xlsx"), ("All files", "*.*")],
            title="Salvar Calendário de Aulas"
        )
        if not filepath:
            return # Usuário cancelou

        df.to_excel(filepath, index=False, engine='openpyxl')
        messagebox.showinfo("Sucesso", f"Calendário exportado com sucesso para:\n{filepath}")
    except Exception as e:
        messagebox.showerror("Erro de Exportação", f"Ocorreu um erro ao exportar o arquivo:\n{e}")