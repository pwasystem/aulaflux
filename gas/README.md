# AulaFlux • Integração Google Apps Script (GAS) para Google Drive

Este módulo permite que a plataforma **AulaFlux** realize o upload direto de:
1. **Apostilas / Arquivos PDF** da aula para pastas organizadas no Google Drive (`AulaFlux / [Curso] / [Aula] / PDFs`).
2. **Pacotes de Material ZIP** para download dos alunos (`AulaFlux / [Curso] / [Aula] / Materiais_ZIP`).
3. **Trabalhos e Atividades enviadas pelos Alunos** diretamente para o Drive do Professor (`AulaFlux / [Curso] / [Aula] / Trabalhos_Alunos`).

---

## Passo a Passo para Implantação do Web App (Google Apps Script)

1. Acesse o **[Google Apps Script](https://script.google.com)** com sua conta Google.
2. Clique em **"Novo projeto"**.
3. Renomeie o projeto para: `AulaFlux Drive Uploader`.
4. Copie o conteúdo de [`gas/Code.js`](file:///c:/Users/spide/Sistemas/aulaflux/gas/Code.js) e cole no arquivo `Código.gs`.
5. Clique em **"Implantar"** (canto superior direito) > **"Nova implantação"**.
6. Clique no ícone de engrenagem ao lado de "Selecione o tipo" e escolha **"App da Web"**.
7. Preencha as configurações:
   - **Descrição**: `AulaFlux API de Upload para Drive v1`
   - **Executar como**: `Eu (seu-email@gmail.com)`
   - **Quem pode acessar**: `Qualquer pessoa` *(necessário para permitir envios do frontend sem login Google dos alunos)*
8. Clique em **"Implantar"** e autorize as permissões de acesso ao seu Google Drive.
9. Copie a **URL do App da Web** gerada (começa com `https://script.google.com/macros/s/.../exec`).
10. No arquivo [`public/config.js`](file:///c:/Users/spide/Sistemas/aulaflux/public/config.js), atualize a variável:
    ```javascript
    const GOOGLE_GAS_UPLOAD_URL = "SUA_URL_DO_WEB_APP_AQUI";
    ```
