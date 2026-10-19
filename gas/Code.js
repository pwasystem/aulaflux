/**
 * ============================================================================
 * AULAFLUX - GOOGLE APPS SCRIPT (GAS) - DRIVE UPLOADER API
 * ============================================================================
 * Script para recebimento e organização automática de arquivos no Google Drive.
 * 
 * Estrutura criada automaticamente no Google Drive:
 *   Meu Drive /
 *     AulaFlux /
 *       [Nome do Curso] /
 *         Aula [Número] - [Título] /
 *           PDFs /
 *           Materiais_ZIP /
 *           Trabalhos_Alunos /
 * 
 * Como implantar:
 * 1. Acesse https://script.google.com
 * 2. Crie um novo projeto "AulaFlux Drive Uploader"
 * 3. Cole este código no editor (Code.gs)
 * 4. Clique em "Implantar" > "Nova implantação"
 * 5. Selecione "App da Web" (Web App)
 *    - Executar como: "Eu" (sua conta Google)
 *    - Quem pode acessar: "Qualquer pessoa" (permite requisições do frontend)
 * 6. Copie a URL do Web App (ex: https://script.google.com/macros/s/.../exec)
 * 7. Cole a URL no arquivo config.js ou no campo de configuração do AulaFlux.
 * ============================================================================
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: "error", message: "Nenhum dado recebido no payload." });
    }

    var data = JSON.parse(e.postData.contents);
    var base64Data = data.base64;
    var filename = data.filename || ("arquivo_" + new Date().getTime());
    var mimeType = data.mimeType || "application/octet-stream";
    var cursoNome = data.cursoNome || "Curso Geral";
    var aulaNome = data.aulaNome || "Aula Geral";
    var tipoPasta = data.tipo || "Materiais"; // "PDFs", "Materiais_ZIP", "Trabalhos_Alunos"

    if (!base64Data) {
      return jsonResponse({ status: "error", message: "Campo base64 ausente no payload." });
    }

    // Remover eventual prefixo 'data:...;base64,' se enviado
    if (base64Data.indexOf(",") > -1) {
      base64Data = base64Data.split(",")[1];
    }

    // Decodificar Base64 para Blob binário
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, filename);

    // 1. Obter ou Criar Pasta Raiz "AulaFlux"
    var rootFolder = getOrCreateFolder(DriveApp.getRootFolder(), "AulaFlux");

    // 2. Obter ou Criar Pasta do Curso (ex: "Power BI")
    var cursoFolder = getOrCreateFolder(rootFolder, cursoNome);

    // 3. Obter ou Criar Pasta da Aula (ex: "Aula 01 - Fundamentos")
    var aulaFolder = getOrCreateFolder(cursoFolder, aulaNome);

    // 4. Obter ou Criar Subpasta pelo Tipo (ex: "PDFs", "Materiais_ZIP", "Trabalhos_Alunos")
    var targetFolder = getOrCreateFolder(aulaFolder, tipoPasta);

    // Salvar o arquivo no Drive
    var file = targetFolder.createFile(blob);

    // Definir permissão pública de visualização para compartilhamento instantâneo
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    var fileUrl = file.getUrl();
    var downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;
    var folderUrl = targetFolder.getUrl();

    return jsonResponse({
      status: "success",
      fileId: fileId,
      fileName: file.getName(),
      fileUrl: fileUrl,
      downloadUrl: downloadUrl,
      folderUrl: folderUrl,
      folderPath: "AulaFlux / " + cursoNome + " / " + aulaNome + " / " + tipoPasta
    });

  } catch (error) {
    return jsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

function doGet(e) {
  return jsonResponse({
    status: "online",
    service: "AulaFlux Google Drive Uploader (Google Apps Script)",
    timestamp: new Date().toISOString()
  });
}

function getOrCreateFolder(parentFolder, folderName) {
  var safeName = (folderName || "Geral").replace(/[\\/:*?"<>|]/g, "_");
  var folders = parentFolder.getFoldersByName(safeName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(safeName);
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
