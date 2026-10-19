import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime
import database
from windows import JanelaProfessores, JanelaCursos, JanelaFeriados, FormularioAgendamento
from export import exportar_para_excel

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Agenda de Cursos")
        self.geometry("800x500")

        database.setup_database() # Garante que a estrutura de dados exista

        self.criar_menus()
        self.criar_widgets_principais()
        self.atualizar_lista_agendamentos()

    def criar_menus(self):
        menu_bar = tk.Menu(self)
        self.config(menu=menu_bar)
        
        # Menu Agendamentos
        agendamento_menu = tk.Menu(menu_bar, tearoff=0)
        menu_bar.add_cascade(label="Agendamentos", menu=agendamento_menu)
        agendamento_menu.add_command(label="Novo", command=self.novo_agendamento)
        agendamento_menu.add_command(label="Editar", command=self.editar_agendamento)
        agendamento_menu.add_command(label="Apagar", command=self.excluir_agendamento)
        agendamento_menu.add_separator()
        agendamento_menu.add_command(label="Atualizar", command=self.atualizar_lista_agendamentos)
        agendamento_menu.add_separator()
        agendamento_menu.add_command(label="Exportar", command=exportar_para_excel)

        # Menu Cadastros
        cadastros_menu = tk.Menu(menu_bar, tearoff=0)
        menu_bar.add_cascade(label="Gerenciar", menu=cadastros_menu)
        cadastros_menu.add_command(label="Professores", command=self.abrir_janela_professores)
        cadastros_menu.add_command(label="Cursos", command=self.abrir_janela_cursos)
        cadastros_menu.add_command(label="Feriados", command=self.abrir_janela_feriados)

    def criar_widgets_principais(self):
        main_frame = ttk.Frame(self, padding="10")
        main_frame.pack(fill="both", expand=True)
        
        #ttk.Label(main_frame, text="Agenda", font=("Helvetica", 12)).pack(pady=10)

        # Frame para Treeview e botões
        tv_frame = ttk.Frame(main_frame)
        tv_frame.pack(fill="both", expand=True)

        cols = ('turma', 'curso', 'professor', 'inicio', 'fim')
        col_names = ('Turma', 'Curso', 'Professor', 'Início', 'Término')
        self.tree_agendamentos = ttk.Treeview(tv_frame, columns=cols, show='headings')
        
        for col, name in zip(cols, col_names):
            self.tree_agendamentos.heading(col, text=name)
            self.tree_agendamentos.column(col, width=150)

        # Scrollbar
        scrollbar = ttk.Scrollbar(tv_frame, orient="vertical", command=self.tree_agendamentos.yview)
        self.tree_agendamentos.configure(yscrollcommand=scrollbar.set)
        
        self.tree_agendamentos.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="both")

    def atualizar_lista_agendamentos(self):
        for i in self.tree_agendamentos.get_children():
            self.tree_agendamentos.delete(i)
        
        agendamentos = sorted(database.carregar_todos_agendamentos(), key=lambda x: datetime.strptime(x['data_inicio'], '%d/%m/%Y'))
        
        for ag in agendamentos:
            valores = (ag['turma_nome'], ag['curso_nome'], ag['professor_nome'], ag['data_inicio'], ag['data_final'])
            self.tree_agendamentos.insert("", "end", values=valores, iid=ag['id'])

    # --- Funções dos Menus e Botões ---

    def abrir_janela_professores(self):
        JanelaProfessores(self)
        
    def abrir_janela_cursos(self):
        JanelaCursos(self)

    def abrir_janela_feriados(self):
        JanelaFeriados(self)
        
    def novo_agendamento(self):
        FormularioAgendamento(self, on_save_callback=self.atualizar_lista_agendamentos)

    def editar_agendamento(self):
        selecionado_id = self.tree_agendamentos.focus()
        if not selecionado_id:
            messagebox.showwarning("Aviso", "Selecione um agendamento para editar.")
            return
        FormularioAgendamento(self, on_save_callback=self.atualizar_lista_agendamentos, agendamento_id=selecionado_id)
        
    def excluir_agendamento(self):
        selecionado_id = self.tree_agendamentos.focus()
        if not selecionado_id:
            messagebox.showwarning("Aviso", "Selecione um agendamento para excluir.")
            return

        if not messagebox.askyesno("Confirmar Exclusão", "Tem certeza que deseja excluir este agendamento? Todas as aulas associadas serão removidas."):
            return
            
        agendamentos = database.carregar_todos_agendamentos()
        agendamento_a_excluir = next((ag for ag in agendamentos if ag['id'] == selecionado_id), None)
        
        if not agendamento_a_excluir:
            messagebox.showerror("Erro", "Agendamento não encontrado.")
            return
            
        ano = datetime.strptime(agendamento_a_excluir['data_inicio'], '%d/%m/%Y').year
        agendamentos_ano = database.carregar_dados('agendamentos', ano=ano)
        
        agendamentos_ano_atualizado = [ag for ag in agendamentos_ano if ag['id'] != selecionado_id]
        
        database.salvar_dados('agendamentos', agendamentos_ano_atualizado, ano=ano)
        
        messagebox.showinfo("Sucesso", "Agendamento excluído com sucesso.")
        self.atualizar_lista_agendamentos()