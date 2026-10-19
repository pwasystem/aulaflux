import tkinter as tk
from tkinter import ttk, messagebox, simpledialog, Toplevel, Text
from datetime import datetime, timedelta
import database
import uuid
from tkcalendar import DateEntry

# --- Verificar Conflito ---
def verificar_conflito_professor(professor_id, novas_aulas, agendamento_id_sendo_editado=None):

    agendamentos_existentes = database.carregar_todos_agendamentos()
    horarios_ocupados = set()

    for ag in agendamentos_existentes:
        if ag['id'] == agendamento_id_sendo_editado:
            continue

        if ag.get('professor_id') == professor_id:
            for aula in ag.get('aulas_geradas', []):
                horarios_ocupados.add((aula['data'], aula['periodo']))

    for nova_aula in novas_aulas:
        horario_proposto = (nova_aula['data'], nova_aula['periodo'])
        if horario_proposto in horarios_ocupados:
            return nova_aula

    return None

# --- Funções Auxiliares de Validação ---
def validar_data(data_str):
    try:
        datetime.strptime(data_str, '%d/%m/%Y')
        return True
    except ValueError:
        return False

# --- Classe Base para Janelas de Gerenciamento ---
class JanelaGerenciamento(Toplevel):
    def __init__(self, parent, titulo, tipo_dados, colunas):
        super().__init__(parent)
        self.title(titulo)
        self.tipo_dados = tipo_dados
        self.colunas = colunas
        self.transient(parent)
        self.grab_set()

        # Frame para a Treeview e Scrollbar
        frame_tv = ttk.Frame(self)
        frame_tv.pack(pady=10, padx=10, fill="both", expand=True)

        self.tree = ttk.Treeview(frame_tv, columns=list(colunas.keys()), show='headings')
        for col, nome in colunas.items():
            self.tree.heading(col, text=nome)
            self.tree.column(col, width=150)
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(frame_tv, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="both")

        # Frame para os botões
        frame_botoes = ttk.Frame(self)
        frame_botoes.pack(pady=10, padx=10, fill="x")

        ttk.Button(frame_botoes, text="Adicionar", command=self.adicionar_item).pack(side="left", padx=5)
        ttk.Button(frame_botoes, text="Editar", command=self.editar_item).pack(side="left", padx=5)
        ttk.Button(frame_botoes, text="Excluir", command=self.excluir_item).pack(side="left", padx=5)
        
        self.carregar_lista()

    def carregar_lista(self):
        for i in self.tree.get_children():
            self.tree.delete(i)
        
        dados = database.carregar_dados(self.tipo_dados)
        for item in dados:
            valores = [item.get(col) for col in self.colunas.keys()]
            self.tree.insert("", "end", values=valores, iid=item['id'])

    def adicionar_item(self):
        # Esta função será implementada nas classes filhas
        raise NotImplementedError

    def editar_item(self):
        # Esta função será implementada nas classes filhas
        raise NotImplementedError

    def excluir_item(self):
        selecionado = self.tree.focus()
        if not selecionado:
            messagebox.showwarning("Aviso", "Selecione um item para excluir.")
            return

        if messagebox.askyesno("Confirmar Exclusão", "Você tem certeza que deseja excluir este item?"):
            # Lógica de verificação de uso
            if self.verificar_uso(selecionado):
                messagebox.showerror("Erro", "Este item está em uso e não pode ser excluído.")
                return

            dados = database.carregar_dados(self.tipo_dados)
            dados_filtrados = [item for item in dados if item['id'] != selecionado]
            database.salvar_dados(self.tipo_dados, dados_filtrados)
            self.carregar_lista()
            messagebox.showinfo("Sucesso", "Item excluído com sucesso.")

    def verificar_uso(self, item_id):
        # Verifica se um professor ou curso está em uso nos agendamentos
        if self.tipo_dados in ['professores', 'cursos']:
            agendamentos = database.carregar_todos_agendamentos()
            chave = 'professor_id' if self.tipo_dados == 'professores' else 'curso_id'
            for ag in agendamentos:
                if ag[chave] == item_id:
                    return True
        return False

# --- Janelas Específicas ---

# --- Formulário para Adicionar/Editar Professor ---
class FormularioProfessor(Toplevel):
    def __init__(self, parent, on_save_callback, professor_existente=None):
        super().__init__(parent)
        self.on_save_callback = on_save_callback
        self.professor_existente = professor_existente

        self.title("Novo Professor" if not professor_existente else "Editar Professor")
        self.transient(parent)
        self.grab_set()

        frame = ttk.Frame(self, padding="10")
        frame.pack(fill="both", expand=True)

        ttk.Label(frame, text="Nome do Professor:").grid(row=0, column=0, sticky="w", pady=5)
        self.entry_nome = ttk.Entry(frame, width=40)
        self.entry_nome.grid(row=0, column=1, sticky="ew", pady=5)

        ttk.Label(frame, text="Área de Atuação:").grid(row=1, column=0, sticky="w", pady=5)
        self.entry_area = ttk.Entry(frame, width=40)
        self.entry_area.grid(row=1, column=1, sticky="ew", pady=5)

        if self.professor_existente:
            self.entry_nome.insert(0, self.professor_existente['nome'])
            self.entry_area.insert(0, self.professor_existente['area'])

        btn_frame = ttk.Frame(frame)
        btn_frame.grid(row=2, column=0, columnspan=2, pady=10)
        ttk.Button(btn_frame, text="Salvar", command=self.salvar).pack(side="left", padx=5)
        ttk.Button(btn_frame, text="Cancelar", command=self.destroy).pack(side="left", padx=5)
    
    def salvar(self):
        nome = self.entry_nome.get().strip()
        area = self.entry_area.get().strip()

        if not nome or not area:
            messagebox.showerror("Erro de Validação", "Todos os campos são obrigatórios.", parent=self)
            return

        dados = database.carregar_dados('professores')

        if self.professor_existente: # Editando
            item_para_editar = next((p for p in dados if p['id'] == self.professor_existente['id']), None)
            if item_para_editar:
                item_para_editar['nome'] = nome
                item_para_editar['area'] = area
        else: # Adicionando
            novo_professor = {'id': str(uuid.uuid4()), 'nome': nome, 'area': area}
            dados.append(novo_professor)
        
        database.salvar_dados('professores', dados)
        self.on_save_callback()
        messagebox.showinfo("Sucesso", "Professor salvo com sucesso.", parent=self.master)
        self.destroy()

class JanelaProfessores(JanelaGerenciamento):
    def __init__(self, parent):
        super().__init__(parent, "Gerenciar Professores", "professores", 
                         {'id': 'ID', 'nome': 'Nome', 'area': 'Área'})
        self.tree.column('id', width=50)

    def adicionar_item(self):
        FormularioProfessor(self, on_save_callback=self.carregar_lista)

    def editar_item(self):
        selecionado_id = self.tree.focus()
        if not selecionado_id:
            messagebox.showwarning("Aviso", "Selecione um professor para editar.")
            return

        dados = database.carregar_dados(self.tipo_dados)
        item_para_editar = next((item for item in dados if item['id'] == selecionado_id), None)
        
        if item_para_editar:
            FormularioProfessor(self, on_save_callback=self.carregar_lista, professor_existente=item_para_editar)


# --- Formulário para Adicionar/Editar Curso ---
class FormularioCurso(Toplevel):
    def __init__(self, parent, on_save_callback, curso_existente=None):
        super().__init__(parent)
        self.on_save_callback = on_save_callback
        self.curso_existente = curso_existente

        self.title("Novo Curso" if not curso_existente else "Editar Curso")
        self.transient(parent)
        self.grab_set()

        frame = ttk.Frame(self, padding="10")
        frame.pack(fill="both", expand=True)

        ttk.Label(frame, text="Nome do Curso:").grid(row=0, column=0, sticky="w", pady=5)
        self.entry_nome = ttk.Entry(frame, width=40)
        self.entry_nome.grid(row=0, column=1, sticky="ew", pady=5)

        ttk.Label(frame, text="Duração (horas):").grid(row=1, column=0, sticky="w", pady=5)
        self.spin_duracao = ttk.Spinbox(frame, from_=1, to=999, width=10)
        self.spin_duracao.grid(row=1, column=1, sticky="w", pady=5)

        if self.curso_existente:
            self.entry_nome.insert(0, self.curso_existente['nome'])
            self.spin_duracao.set(self.curso_existente['duracao_horas'])

        btn_frame = ttk.Frame(frame)
        btn_frame.grid(row=2, column=0, columnspan=2, pady=10)
        ttk.Button(btn_frame, text="Salvar", command=self.salvar).pack(side="left", padx=5)
        ttk.Button(btn_frame, text="Cancelar", command=self.destroy).pack(side="left", padx=5)
    
    def salvar(self):
        nome = self.entry_nome.get().strip()
        
        if not nome:
            messagebox.showerror("Erro de Validação", "O nome do curso é obrigatório.", parent=self)
            return
            
        try:
            duracao = int(self.spin_duracao.get())
            if duracao <= 0:
                raise ValueError
        except ValueError:
            messagebox.showerror("Erro de Validação", "A duração deve ser um número inteiro positivo.", parent=self)
            return

        dados = database.carregar_dados('cursos')

        if self.curso_existente: # Editando
            item_para_editar = next((c for c in dados if c['id'] == self.curso_existente['id']), None)
            if item_para_editar:
                item_para_editar['nome'] = nome
                item_para_editar['duracao_horas'] = duracao
        else: # Adicionando
            novo_curso = {'id': str(uuid.uuid4()), 'nome': nome, 'duracao_horas': duracao}
            dados.append(novo_curso)
        
        database.salvar_dados('cursos', dados)
        self.on_save_callback()
        messagebox.showinfo("Sucesso", "Curso salvo com sucesso.", parent=self.master)
        self.destroy()

class JanelaCursos(JanelaGerenciamento):
    def __init__(self, parent):
        super().__init__(parent, "Gerenciar Cursos", "cursos", 
                         {'id': 'ID', 'nome': 'Curso', 'duracao_horas': 'Duração (h)'})
        self.tree.column('id', width=50)

    def adicionar_item(self):
        FormularioCurso(self, on_save_callback=self.carregar_lista)

    def editar_item(self):
        selecionado_id = self.tree.focus()
        if not selecionado_id:
            messagebox.showwarning("Aviso", "Selecione um curso para editar.")
            return

        dados = database.carregar_dados(self.tipo_dados)
        item_para_editar = next((item for item in dados if item['id'] == selecionado_id), None)
        
        if item_para_editar:
            FormularioCurso(self, on_save_callback=self.carregar_lista, curso_existente=item_para_editar)

# --- Formulário para Adicionar/Editar Feriado ---
class FormularioFeriado(Toplevel):
    def __init__(self, parent, on_save_callback, feriado_existente=None):
        super().__init__(parent)
        self.on_save_callback = on_save_callback
        self.feriado_existente = feriado_existente

        self.title("Novo Feriado" if not feriado_existente else "Editar Feriado")
        self.transient(parent)
        self.grab_set()

        frame = ttk.Frame(self, padding="10")
        frame.pack(fill="both", expand=True)

        ttk.Label(frame, text="Nome do Feriado:").grid(row=0, column=0, sticky="w", pady=5)
        self.entry_nome = ttk.Entry(frame, width=40)
        self.entry_nome.grid(row=0, column=1, sticky="ew", pady=5)

        ttk.Label(frame, text="Data:").grid(row=1, column=0, sticky="w", pady=5)
        self.entry_data = DateEntry(frame, date_pattern='dd/mm/yyyy', locale='pt_BR')
        self.entry_data.grid(row=1, column=1, sticky="ew", pady=5)
        
        if self.feriado_existente:
            self.entry_nome.insert(0, self.feriado_existente['nome'])
            # Tenta definir a data no DateEntry
            try:
                data = datetime.strptime(self.feriado_existente['data'], '%d/%m/%Y')
                self.entry_data.set_date(data)
            except (ValueError, TypeError):
                pass # Deixa a data padrão se houver erro no formato antigo

        ttk.Button(frame, text="Salvar", command=self.salvar).grid(row=2, column=0, columnspan=2, pady=10)

    def salvar(self):
        nome = self.entry_nome.get()
        data_str = self.entry_data.get() # O widget já retorna a string formatada

        if not nome:
            messagebox.showerror("Erro de Validação", "O nome do feriado é obrigatório.", parent=self)
            return

        dados = database.carregar_dados('feriados')

        if self.feriado_existente: # Editando
            item_para_editar = next((item for item in dados if item['id'] == self.feriado_existente['id']), None)
            if item_para_editar:
                item_para_editar['nome'] = nome
                item_para_editar['data'] = data_str
        else: # Adicionando
            novo_feriado = {'id': str(uuid.uuid4()), 'nome': nome, 'data': data_str}
            dados.append(novo_feriado)

        database.salvar_dados('feriados', dados)
        self.on_save_callback()
        messagebox.showinfo("Sucesso", "Feriado salvo com sucesso.", parent=self.master)
        self.destroy()

class JanelaFeriados(JanelaGerenciamento):
    def __init__(self, parent):
        super().__init__(parent, "Gerenciar Feriados", "feriados", 
                         {'id': 'ID', 'nome': 'Feriado', 'data': 'Data'})
        self.tree.column('id', width=50)

    def adicionar_item(self):
        FormularioFeriado(self, on_save_callback=self.carregar_lista)

    def editar_item(self):
        selecionado_id = self.tree.focus()
        if not selecionado_id:
            messagebox.showwarning("Aviso", "Selecione um feriado para editar.")
            return

        dados = database.carregar_dados(self.tipo_dados)
        item_para_editar = next((item for item in dados if item['id'] == selecionado_id), None)
        
        if item_para_editar:
            FormularioFeriado(self, on_save_callback=self.carregar_lista, feriado_existente=item_para_editar)

# --- Janela de Agendamento ---
class FormularioAgendamento(Toplevel):
    def __init__(self, parent, on_save_callback, agendamento_id=None):
        super().__init__(parent)
        self.title("Novo Agendamento" if not agendamento_id else "Editar Agendamento")
        self.on_save_callback = on_save_callback
        self.agendamento_id = agendamento_id
        self.agendamento_existente = None
        
        self.transient(parent)
        self.grab_set()

        # Carregar dados necessários
        self.cursos = {c['nome']: c for c in database.carregar_dados('cursos')}
        self.professores = {p['nome']: p for p in database.carregar_dados('professores')}
        
        if self.agendamento_id:
            agendamentos = database.carregar_todos_agendamentos()
            self.agendamento_existente = next((ag for ag in agendamentos if ag['id'] == self.agendamento_id), None)

        self._criar_widgets()
        if self.agendamento_existente:
            self._preencher_formulario()

    def _criar_widgets(self):
        frame = ttk.Frame(self, padding="10")
        frame.pack(fill="both", expand=True)

        # Labels e Entradas
        ttk.Label(frame, text="Turma:").grid(row=0, column=0, sticky="w", pady=2)
        self.entry_turma = ttk.Entry(frame)
        self.entry_turma.grid(row=0, column=1, sticky="ew", pady=2)       
        
        ttk.Label(frame, text="Curso:").grid(row=1, column=0, sticky="w", pady=2)
        self.combo_curso = ttk.Combobox(frame, values=list(self.cursos.keys()), state="readonly")
        self.combo_curso.grid(row=1, column=1, sticky="ew", pady=2)

        ttk.Label(frame, text="Professor:").grid(row=2, column=0, sticky="w", pady=2)
        self.combo_professor = ttk.Combobox(frame, values=list(self.professores.keys()), state="readonly")
        self.combo_professor.grid(row=2, column=1, sticky="ew", pady=2)

        ttk.Label(frame, text="Data de Início (DD/MM/YYYY):").grid(row=3, column=0, sticky="w", pady=2)
        self.entry_data_inicio = DateEntry(frame, date_pattern='dd/mm/yyyy', locale='pt_BR')
        self.entry_data_inicio.grid(row=3, column=1, sticky="ew", pady=2)

        ttk.Label(frame, text="Duração da Aula (h):").grid(row=4, column=0, sticky="w", pady=2)
        self.spin_duracao_aula = ttk.Spinbox(frame, from_=1, to=8, width=5)
        self.spin_duracao_aula.grid(row=4, column=1, sticky="w", pady=2)

        # Periodicidade
        group_dias = ttk.LabelFrame(frame, text="Dias da Semana")
        group_dias.grid(row=5, column=0, columnspan=2, sticky="ew", pady=10)
        
        self.dias_semana_vars = {}
        dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
        for i, dia in enumerate(dias):
            self.dias_semana_vars[i] = tk.BooleanVar()
            ttk.Checkbutton(group_dias, text=dia, variable=self.dias_semana_vars[i]).grid(row=0, column=i, padx=5)

        group_periodo = ttk.LabelFrame(frame, text="Período")
        group_periodo.grid(row=6, column=0, columnspan=2, sticky="ew", pady=5)
        self.periodo_var = tk.StringVar(value="Manhã")
        ttk.Radiobutton(group_periodo, text="Manhã", value="Manhã", variable=self.periodo_var).pack(side="left", padx=10)
        ttk.Radiobutton(group_periodo, text="Tarde", value="Tarde", variable=self.periodo_var).pack(side="left", padx=10)
        ttk.Radiobutton(group_periodo, text="Noite", value="Noite", variable=self.periodo_var).pack(side="left", padx=10)

        # Botão Salvar
        ttk.Button(frame, text="Salvar Agendamento", command=self.salvar).grid(row=7, column=0, columnspan=2, pady=20)
        
        # Área de edição de aulas individuais (se estiver editando)
        if self.agendamento_id:
            self.criar_editor_aulas(frame)

    def criar_editor_aulas(self, parent_frame):
        aulas_frame = ttk.LabelFrame(parent_frame, text="Editar Aulas Individuais")
        aulas_frame.grid(row=8, column=0, columnspan=2, sticky="ew", pady=10)
        
        cols = {'data': 'Data', 'periodo': 'Período'}
        self.tree_aulas = ttk.Treeview(aulas_frame, columns=list(cols.keys()), show='headings', height=5)
        for col, nome in cols.items():
            self.tree_aulas.heading(col, text=nome)
            self.tree_aulas.column(col, width=120)
        self.tree_aulas.pack(side="left", fill="both", expand=True, padx=5, pady=5)
        
        # Botão para editar observações
        btn_edit_obs = ttk.Button(aulas_frame, text="Editar Obs.", command=self.editar_observacao_aula)
        btn_edit_obs.pack(pady=5)
        
        self.popular_tree_aulas()

    def popular_tree_aulas(self):
        for i in self.tree_aulas.get_children():
            self.tree_aulas.delete(i)
        
        aulas = self.agendamento_existente.get('aulas_geradas', [])
        for i, aula in enumerate(aulas):
            self.tree_aulas.insert("", "end", iid=i, values=[aula['data'], aula['periodo']])
            
    def editar_observacao_aula(self):
        selecionado_id = self.tree_aulas.focus()
        if not selecionado_id:
            messagebox.showwarning("Aviso", "Selecione uma aula para editar a observação.")
            return
        
        idx = int(selecionado_id)
        aula_selecionada = self.agendamento_existente['aulas_geradas'][idx]
        
        # Janela para edição do texto
        editor_win = Toplevel(self)
        editor_win.title(f"Observações - Aula de {aula_selecionada['data']}")
        editor_win.transient(self)
        editor_win.grab_set()
        
        txt_obs = Text(editor_win, wrap="word", width=50, height=10)
        txt_obs.pack(padx=10, pady=10, fill="both", expand=True)
        txt_obs.insert("1.0", aula_selecionada.get('observacoes', ''))
        
        def salvar_obs():
            aula_selecionada['observacoes'] = txt_obs.get("1.0", "end-1c")
            messagebox.showinfo("Sucesso", "Observação salva.", parent=editor_win)
            editor_win.destroy()
            
        btn_salvar = ttk.Button(editor_win, text="Salvar e Fechar", command=salvar_obs)
        btn_salvar.pack(pady=5)

    def _preencher_formulario(self):
        ag = self.agendamento_existente
        self.entry_turma.insert(0, ag['turma_nome'])
        self.combo_curso.set(ag['curso_nome'])
        self.combo_professor.set(ag['professor_nome'])
        self.spin_duracao_aula.set(ag['duracao_aula'])
        self.periodo_var.set(ag['periodo'])
        
        try:
            data_inicio = datetime.strptime(ag['data_inicio'], '%d/%m/%Y')
            self.entry_data_inicio.set_date(data_inicio)
        except (ValueError, TypeError):
            pass
        
        dias_selecionados = ag['dias_semana']
        for i, var in self.dias_semana_vars.items():
            if i in dias_selecionados:
                var.set(True)

    def salvar(self):
        # --- Validação dos Dados ---
        turma_nome = self.entry_turma.get()
        curso_nome = self.combo_curso.get()
        prof_nome = self.combo_professor.get()
        data_inicio_str = self.entry_data_inicio.get()
        duracao_aula = int(self.spin_duracao_aula.get())
        
        if not all([turma_nome, curso_nome, prof_nome, data_inicio_str, duracao_aula]):
            messagebox.showerror("Erro", "Todos os campos são obrigatórios.")
            return
        
        if not validar_data(data_inicio_str):
            messagebox.showerror("Erro", "Data de início inválida. Use DD/MM/YYYY.")
            return
            
        dias_semana_selecionados = [i for i, var in self.dias_semana_vars.items() if var.get()]
        if not dias_semana_selecionados:
            messagebox.showerror("Erro", "Selecione pelo menos um dia da semana.")
            return
        
        # --- Preservar observações antigas ---
        observacoes_antigas = {}
        if self.agendamento_existente and 'aulas_geradas' in self.agendamento_existente:
            for aula_antiga in self.agendamento_existente['aulas_geradas']:
                if aula_antiga.get('observacoes'):
                    observacoes_antigas[aula_antiga['data']] = aula_antiga['observacoes']
        
        # --- Lógica de Geração de Aulas ---
        data_inicio = datetime.strptime(data_inicio_str, '%d/%m/%Y')
        curso_selecionado = self.cursos[curso_nome]
        professor_selecionado = self.professores[prof_nome]
        horas_totais_curso = curso_selecionado['duracao_horas']
        
        feriados_raw = database.carregar_dados('feriados')
        feriados = {datetime.strptime(f['data'], '%d/%m/%Y').date() for f in feriados_raw}

        aulas_geradas = []
        horas_agendadas = 0
        data_atual = data_inicio
        data_final = data_inicio

        while horas_agendadas < horas_totais_curso:
            # Verifica se é um dia da semana selecionado e não é feriado
            if data_atual.weekday() in dias_semana_selecionados and data_atual.date() not in feriados:
                nova_aula = {
                    'data': data_atual.strftime('%d/%m/%Y'),
                    'periodo': self.periodo_var.get(),
                    'duracao_aula': duracao_aula,
                    'observacoes': ''
                }
                if nova_aula['data'] in observacoes_antigas:
                    nova_aula['observacoes'] = observacoes_antigas[nova_aula['data']]
                aulas_geradas.append(nova_aula)
                horas_agendadas += duracao_aula
                data_final = data_atual

            data_atual += timedelta(days=1)
            if (data_atual - data_inicio).days > 365 * 5: 
                messagebox.showerror("Erro", "O cálculo do agendamento excedeu 5 anos. Verifique os dados.")
                return

        # --- Verificação de Conflito ---
        conflito = verificar_conflito_professor(
            professor_id=professor_selecionado['id'],
            novas_aulas=aulas_geradas,
            agendamento_id_sendo_editado=self.agendamento_id
        )
        if conflito:
            messagebox.showerror(
                "Conflito de Horário",
                f"O professor {prof_nome} já tem um compromisso agendado na data "
                f"{conflito['data']} no período da {conflito['periodo']}."
            )
            return

        # --- Estrutura do Agendamento ---
        novo_agendamento = {
            'id': self.agendamento_id or str(uuid.uuid4()),
            'curso_id': curso_selecionado['id'],
            'turma_nome': turma_nome,
            'curso_nome': curso_nome,
            'professor_id': self.professores[prof_nome]['id'],
            'professor_nome': prof_nome,
            'data_inicio': data_inicio_str,
            'data_final': data_final.strftime('%d/%m/%Y'),
            'duracao_aula': duracao_aula,
            'dias_semana': dias_semana_selecionados,
            'periodo': self.periodo_var.get(),
            'aulas_geradas': aulas_geradas
        }
        
        # Se estiver editando, sobrescreve as observações existentes
        # if self.agendamento_existente:
        #    novo_agendamento['aulas_geradas'] = self.agendamento_existente['aulas_geradas']

        # --- Salvar no JSON correto ---
        ano_inicio = data_inicio.year
        agendamentos_ano = database.carregar_dados('agendamentos', ano=ano_inicio)

        if self.agendamento_existente:
            # Remove o antigo antes de adicionar o novo (pode ter mudado de ano)
            ano_antigo = datetime.strptime(self.agendamento_existente['data_inicio'], '%d/%m/%Y').year
            agendamentos_ano_antigo = database.carregar_dados('agendamentos', ano=ano_antigo)
            agendamentos_ano_antigo = [ag for ag in agendamentos_ano_antigo if ag['id'] != self.agendamento_id]
            database.salvar_dados('agendamentos', agendamentos_ano_antigo, ano=ano_antigo)
            
            # Se o ano mudou, precisa salvar no arquivo do ano antigo também
            if ano_antigo != ano_inicio:
                agendamentos_ano.append(novo_agendamento)
            else: # se não mudou, atualiza na lista correta
                agendamentos_ano = [ag if ag['id'] != self.agendamento_id else novo_agendamento for ag in agendamentos_ano]
                # Se não encontrou para substituir (porque mudou de ano), adiciona
                if not any(ag['id'] == self.agendamento_id for ag in agendamentos_ano):
                    agendamentos_ano.append(novo_agendamento)
        else:
             agendamentos_ano.append(novo_agendamento)

        database.salvar_dados('agendamentos', agendamentos_ano, ano=ano_inicio)

        messagebox.showinfo("Sucesso", "Agendamento salvo com sucesso!")
        self.on_save_callback()
        self.destroy()