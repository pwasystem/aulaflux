/**
 * ============================================================================
 * AULAFLUX - INTEGRAÇÃO GOOGLE DRIVE VIA GOOGLE APPS SCRIPT
 * Estrutura no Drive:
 *   Aula Flux/Aulas/<Nome do Curso>/<Numero da Aula>/
 *     - Dados.txt
 *     - Mapa.png
 *     - Aula.pdf
 *     - Apresentação.pdf
 *     - Vídeo.mp4
 *     - Game.html
 *     - Infográfico.png
 *     - Quiz.json
 *   Envios dos alunos:
 *   Aula Flux/Aulas/<Nome do Curso>/envios/<Turma>/
 * ============================================================================
 */

function normalizarTexto(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Execute esta função uma única vez no editor do Google Apps Script
 * para conceder permissão de leitura e gravação no Google Drive.
 */
function autorizarDrive() {
  var root = DriveApp.getRootFolder();
  Logger.log('Acesso ao Google Drive autorizado com sucesso! Pasta raiz: ' + root.getName());
  var pastaAulas = obterPastaRaizAulas(true);
  Logger.log('Pasta Aula Flux/Aulas pronta: ' + (pastaAulas ? pastaAulas.getUrl() : 'não encontrada'));
}

var ALLOWED_ORIGINS = [
  'https://aulaflux.web.app',
  'https://aulaflux.firebaseapp.com',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

function responderJson(dados, e) {
  if (dados && typeof dados === 'object') {
    dados.allowedOrigin = 'https://aulaflux.web.app';
    dados.allowedOrigins = ALLOWED_ORIGINS;
  }
  var jsonStr = JSON.stringify(dados);
  var callback = (e && e.parameter && e.parameter.callback) ? String(e.parameter.callback).replace(/[^a-zA-Z0-9_$.]/g, '') : '';
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + jsonStr + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(jsonStr)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Busca uma subpasta pelo nome (case-insensitive e sem acentos) dentro de um pai (ou no Drive todo se pai=null)
 */
function buscarPasta(pastaPai, nomeAlvo, criarSeNaoExistir) {
  var alvoNorm = normalizarTexto(nomeAlvo);
  var iter = pastaPai ? pastaPai.getFolders() : DriveApp.getFolders();

  while (iter.hasNext()) {
    var folder = iter.next();
    if (normalizarTexto(folder.getName()) === alvoNorm) {
      return folder;
    }
  }

  if (criarSeNaoExistir) {
    return pastaPai ? pastaPai.createFolder(nomeAlvo) : DriveApp.createFolder(nomeAlvo);
  }
  return null;
}

/**
 * Localiza a pasta raiz "Aula Flux/Aulas"
 */
function obterPastaRaizAulas(criarSeNaoExistir) {
  var pastaAulaFlux = buscarPasta(null, 'Aula Flux', false) || buscarPasta(null, 'AulaFlux', criarSeNaoExistir);
  if (!pastaAulaFlux && criarSeNaoExistir) {
    pastaAulaFlux = DriveApp.createFolder('Aula Flux');
  }
  if (!pastaAulaFlux) return null;

  return buscarPasta(pastaAulaFlux, 'Aulas', criarSeNaoExistir);
}

/**
 * Classifica o tipo de arquivo da aula pelo nome
 */
function classificarArquivoAula(nomeArquivo) {
  var norm = normalizarTexto(nomeArquivo);
  if (norm === 'dados.txt' || (norm.indexOf('dados') === 0 && norm.slice(-4) === '.txt')) {
    return 'dados';
  }
  if (norm.indexOf('mapa.') === 0 || norm === 'mapa.png' || norm === 'mapa.jpg' || norm === 'mapa.jpeg' || norm === 'mapa.webp') {
    return 'mapa';
  }
  if (norm === 'aula.pdf' || (norm.indexOf('aula') === 0 && norm.slice(-4) === '.pdf')) {
    return 'aulaPdf';
  }
  if (norm.indexOf('apresentacao') === 0 && norm.slice(-4) === '.pdf') {
    return 'apresentacaoPdf';
  }
  if (norm.indexOf('video') === 0 && (norm.slice(-4) === '.mp4' || norm.slice(-5) === '.webm' || norm.slice(-4) === '.mov')) {
    return 'video';
  }
  if (norm === 'game.html' || norm === 'game.htm' || (norm.indexOf('game') === 0 && norm.slice(-5) === '.html')) {
    return 'game';
  }
  if ((norm.indexOf('infografico') === 0 || norm.indexOf('inforgrafico') === 0) &&
      (norm.slice(-4) === '.png' || norm.slice(-4) === '.jpg' || norm.slice(-5) === '.jpeg' || norm.slice(-5) === '.webp')) {
    return 'infografico';
  }
  if (norm === 'quiz.json' || (norm.indexOf('quiz') === 0 && norm.slice(-5) === '.json')) {
    return 'quiz';
  }
  return null;
}

/**
 * Garante que o arquivo possa ser visualizado/baixado via link público
 */
function garantirPermissaoLeitura(file) {
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    // Ignorar caso já compartilhado ou política de domínio restrita
  }
}

/**
 * Extrai metadados e conteúdo de uma pasta numerada de aula
 */
function lerPastaAula(pastaAula, incluirConteudoCompleto) {
  var arquivos = {
    dados: { exists: false },
    mapa: { exists: false },
    aulaPdf: { exists: false },
    apresentacaoPdf: { exists: false },
    video: { exists: false },
    game: { exists: false },
    infografico: { exists: false },
    quiz: { exists: false }
  };

  var filesIter = pastaAula.getFiles();
  while (filesIter.hasNext()) {
    var file = filesIter.next();
    var nome = file.getName();
    var tipo = classificarArquivoAula(nome);
    if (!tipo) continue;

    var id = file.getId();

    if (tipo === 'dados') {
      var textoDados = '';
      try {
        textoDados = file.getBlob().getDataAsString('UTF-8');
      } catch (e) {}
      var linhas = textoDados.split(/\r?\n/).map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });
      arquivos.dados = {
        exists: true,
        id: id,
        name: nome,
        content: textoDados,
        aulaLabel: linhas[0] || ('Aula ' + pastaAula.getName()),
        titulo: linhas[1] || linhas[0] || ('Aula ' + pastaAula.getName()),
        linhas: linhas
      };
    } else if (tipo === 'mapa') {
      if (incluirConteudoCompleto) garantirPermissaoLeitura(file);
      arquivos.mapa = {
        exists: true,
        id: id,
        name: nome,
        url: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w2500',
        previewUrl: 'https://drive.google.com/file/d/' + id + '/preview',
        viewUrl: 'https://drive.google.com/file/d/' + id + '/view',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=' + id
      };
    } else if (tipo === 'aulaPdf') {
      if (incluirConteudoCompleto) garantirPermissaoLeitura(file);
      arquivos.aulaPdf = {
        exists: true,
        id: id,
        name: nome,
        previewUrl: 'https://drive.google.com/file/d/' + id + '/preview',
        viewUrl: 'https://drive.google.com/file/d/' + id + '/view',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=' + id
      };
    } else if (tipo === 'apresentacaoPdf') {
      if (incluirConteudoCompleto) garantirPermissaoLeitura(file);
      arquivos.apresentacaoPdf = {
        exists: true,
        id: id,
        name: nome,
        previewUrl: 'https://drive.google.com/file/d/' + id + '/preview',
        viewUrl: 'https://drive.google.com/file/d/' + id + '/view',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=' + id
      };
    } else if (tipo === 'video') {
      if (incluirConteudoCompleto) garantirPermissaoLeitura(file);
      arquivos.video = {
        exists: true,
        id: id,
        name: nome,
        previewUrl: 'https://drive.google.com/file/d/' + id + '/preview',
        viewUrl: 'https://drive.google.com/file/d/' + id + '/view',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=' + id
      };
    } else if (tipo === 'game') {
      var gameContent = '';
      if (incluirConteudoCompleto) {
        try {
          gameContent = file.getBlob().getDataAsString('UTF-8');
        } catch (e) {}
      }
      arquivos.game = {
        exists: true,
        id: id,
        name: nome,
        content: gameContent
      };
    } else if (tipo === 'infografico') {
      if (incluirConteudoCompleto) garantirPermissaoLeitura(file);
      arquivos.infografico = {
        exists: true,
        id: id,
        name: nome,
        url: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w2500',
        previewUrl: 'https://drive.google.com/file/d/' + id + '/preview',
        viewUrl: 'https://drive.google.com/file/d/' + id + '/view',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=' + id
      };
    } else if (tipo === 'quiz') {
      var quizData = [];
      if (incluirConteudoCompleto) {
        try {
          var rawJson = file.getBlob().getDataAsString('UTF-8');
          quizData = JSON.parse(rawJson);
        } catch (e) {}
      }
      arquivos.quiz = {
        exists: true,
        id: id,
        name: nome,
        questions: quizData
      };
    }
  }

  arquivos.dadosTxt = arquivos.dados;
  arquivos.mapaPng = arquivos.mapa;
  arquivos.videoMp4 = arquivos.video;
  if (arquivos.game && arquivos.game.exists) {
    arquivos.game.htmlContent = arquivos.game.content;
  }
  arquivos.gameHtml = arquivos.game;
  arquivos.infograficoPng = arquivos.infografico;
  if (arquivos.quiz && arquivos.quiz.exists) {
    arquivos.quiz.jsonContent = arquivos.quiz.questions;
  }
  arquivos.quizJson = arquivos.quiz;

  return arquivos;
}

/**
 * Lê arquivo videos.txt da pasta do curso caso exista
 */
function lerVideosTxtCurso(pastaCurso) {
  var mapaVideos = {};
  var filesIter = pastaCurso.getFiles();
  while (filesIter.hasNext()) {
    var f = filesIter.next();
    if (normalizarTexto(f.getName()) === 'videos.txt') {
      try {
        var txt = f.getBlob().getDataAsString('UTF-8');
        var linhas = txt.split(/\r?\n/);
        for (var i = 0; i < linhas.length; i++) {
          var m = linhas[i].match(/aula\s*(\d+)\s*-\s*(https?:\/\/\S+)/i);
          if (m) {
            mapaVideos[parseInt(m[1], 10)] = m[2].trim();
          }
        }
      } catch (e) {}
    }
  }
  return mapaVideos;
}

/**
 * Handler GET da Web App
 */
function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || 'status';

    if (action === 'status') {
      var pastaRaiz = obterPastaRaizAulas(false);
      return responderJson({
        ok: true,
        service: 'AulaFlux GAS Drive Connector',
        raizEncontrada: !!pastaRaiz,
        raizId: pastaRaiz ? pastaRaiz.getId() : null
      }, e);
    }

    if (action === 'listarCursos') {
      var raiz = obterPastaRaizAulas(false);
      if (!raiz) {
        return responderJson({ ok: false, error: 'Pasta Aula Flux/Aulas não encontrada no Google Drive.' }, e);
      }
      var cursos = [];
      var fIter = raiz.getFolders();
      while (fIter.hasNext()) {
        var cFolder = fIter.next();
        var subIter = cFolder.getFolders();
        var pastasNumeradas = [];
        while (subIter.hasNext()) {
          var sub = subIter.next();
          var num = parseInt(sub.getName().trim(), 10);
          if (!isNaN(num)) pastasNumeradas.push(num);
        }
        pastasNumeradas.sort(function(a, b) { return a - b; });
        cursos.push({
          nome: cFolder.getName(),
          id: cFolder.getId(),
          pastasAulas: pastasNumeradas,
          totalPastas: pastasNumeradas.length
        });
      }
      return responderJson({ ok: true, cursos: cursos }, e);
    }

    if (action === 'verificarCurso') {
      var nomeCurso = params.curso || '';
      if (!nomeCurso) {
        return responderJson({ ok: false, error: 'Parâmetro curso é obrigatório.' }, e);
      }
      var raizAulas = obterPastaRaizAulas(false);
      if (!raizAulas) {
        return responderJson({ ok: false, error: 'Pasta Aula Flux/Aulas não encontrada no Drive.' }, e);
      }
      var pastaCurso = buscarPasta(raizAulas, nomeCurso, false);
      if (!pastaCurso) {
        return responderJson({
          ok: true,
          cursoExisteNoDrive: false,
          courseName: nomeCurso,
          curso: nomeCurso,
          totalLessonFolders: 0,
          aulas: {},
          pastasNumeros: []
        }, e);
      }

      var videosTxtMap = lerVideosTxtCurso(pastaCurso);
      var subPastas = pastaCurso.getFolders();
      var aulasResumo = {};
      var numeros = [];

      while (subPastas.hasNext()) {
        var pAula = subPastas.next();
        var nAula = parseInt(pAula.getName().trim(), 10);
        if (!isNaN(nAula)) {
          numeros.push(nAula);
          var resumoArquivos = lerPastaAula(pAula, false);
          if (videosTxtMap[nAula]) {
            resumoArquivos.videoYoutubeUrl = videosTxtMap[nAula];
          }
          aulasResumo[nAula] = {
            numero: nAula,
            folderExists: true,
            folderId: pAula.getId(),
            titulo: resumoArquivos.dados.exists ? resumoArquivos.dados.titulo : ('Aula ' + nAula),
            aulaLabel: resumoArquivos.dados.exists ? resumoArquivos.dados.aulaLabel : ('Aula ' + nAula),
            files: resumoArquivos
          };
        }
      }

      numeros.sort(function(a, b) { return a - b; });

      return responderJson({
        ok: true,
        cursoExisteNoDrive: true,
        courseName: pastaCurso.getName(),
        curso: pastaCurso.getName(),
        cursoFolderId: pastaCurso.getId(),
        pastasNumeros: numeros,
        totalPastas: numeros.length,
        totalLessonFolders: numeros.length,
        aulas: aulasResumo
      }, e);
    }

    if (action === 'obterAula') {
      var cursoParam = params.curso || '';
      var aulaNum = parseInt(params.aula || '1', 10);
      if (!cursoParam || isNaN(aulaNum)) {
        return responderJson({ ok: false, error: 'Parâmetros curso e aula são obrigatórios.' }, e);
      }

      var raizDrive = obterPastaRaizAulas(false);
      if (!raizDrive) {
        return responderJson({ ok: true, folderExists: false, curso: cursoParam, aula: aulaNum, files: {} }, e);
      }

      var folderCurso = buscarPasta(raizDrive, cursoParam, false);
      if (!folderCurso) {
        return responderJson({ ok: true, folderExists: false, curso: cursoParam, aula: aulaNum, files: {} }, e);
      }

      // Contar pastas numeradas existentes no curso
      var iterSub = folderCurso.getFolders();
      var totalFolders = 0;
      while (iterSub.hasNext()) {
        var sf = iterSub.next();
        if (!isNaN(parseInt(sf.getName().trim(), 10))) totalFolders++;
      }

      var folderAula = buscarPasta(folderCurso, String(aulaNum), false);
      if (!folderAula) {
        return responderJson({
          ok: true,
          folderExists: false,
          totalFolders: totalFolders || 6,
          curso: cursoParam,
          aula: aulaNum,
          files: {}
        }, e);
      }

      var videosMap = lerVideosTxtCurso(folderCurso);
      var dadosArquivos = lerPastaAula(folderAula, true);
      if (videosMap[aulaNum]) {
        dadosArquivos.videoYoutubeUrl = videosMap[aulaNum];
      }

      var headerInfo = {
        aulaLabel: dadosArquivos.dados.exists ? dadosArquivos.dados.aulaLabel : ('Aula ' + aulaNum),
        titulo: dadosArquivos.dados.exists ? dadosArquivos.dados.titulo : ('Aula ' + aulaNum)
      };

      return responderJson({
        ok: true,
        folderExists: true,
        totalFolders: totalFolders || 6,
        curso: folderCurso.getName(),
        aula: aulaNum,
        folderId: folderAula.getId(),
        header: headerInfo,
        files: dadosArquivos
      }, e);
    }

    return responderJson({ ok: false, error: 'Ação desconhecida: ' + action }, e);
  } catch (err) {
    return responderJson({ ok: false, error: String(err && err.message ? err.message : err) }, e);
  }
}

/**
 * Handler POST da Web App (Upload de arquivos dos alunos para Aula Flux/Aulas/<Curso>/envios/<Turma>)
 */
function doPost(e) {
  try {
    var rawBody = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var body = JSON.parse(rawBody);
    var action = body.action || 'uploadArquivo';

    if (action === 'uploadArquivo') {
      var nomeCurso = (body.curso || '').trim();
      var nomeTurma = (body.turma || '').trim();
      var numeroAula = body.aula || '';
      var nomeAluno = (body.alunoNome || body.aluno || 'Aluno').trim();
      var nomeProfessor = (body.professor || '').trim();

      if (!nomeCurso || !nomeTurma) {
        return responderJson({ ok: false, error: 'Curso e turma são obrigatórios para o envio de arquivos.' }, e);
      }

      var raiz = obterPastaRaizAulas(true);
      var pastaCurso = buscarPasta(raiz, nomeCurso, true);
      var pastaEnvios = buscarPasta(pastaCurso, 'envios', true);
      var pastaTurma = buscarPasta(pastaEnvios, nomeTurma, true);

      var listaArquivos = body.arquivos || [];
      var base64Recebido = body.base64Data || body.base64;
      var nomeArqRecebido = body.fileName || body.nomeArquivo;

      if (!listaArquivos.length && base64Recebido && nomeArqRecebido) {
        listaArquivos.push({
          nome: nomeArqRecebido,
          mimeType: body.mimeType || 'application/octet-stream',
          base64: base64Recebido
        });
      }

      if (!listaArquivos.length) {
        return responderJson({ ok: false, error: 'Nenhum arquivo recebido para upload.' }, e);
      }

      var salvos = [];
      for (var i = 0; i < listaArquivos.length; i++) {
        var item = listaArquivos[i];
        var base64Clean = String(item.base64 || '').replace(/^data:[^;]+;base64,/, '');
        var bytes = Utilities.base64Decode(base64Clean);
        var prefixoAluno = nomeAluno.replace(/[^a-zA-Z0-9À-ÿ _-]/g, '').trim().replace(/\s+/g, '_');
        var nomeOriginal = item.nome || ('arquivo_' + Date.now());
        var nomeFinal = 'Aula' + numeroAula + '_' + prefixoAluno + '_' + nomeOriginal;
        var blob = Utilities.newBlob(bytes, item.mimeType || 'application/octet-stream', nomeFinal);
        var arqCriado = pastaTurma.createFile(blob);
        arqCriado.setDescription(
          'Aluno: ' + nomeAluno +
          ' | Aula: ' + numeroAula +
          ' | Turma: ' + nomeTurma +
          ' | Curso: ' + nomeCurso +
          (nomeProfessor ? (' | Prof: ' + nomeProfessor) : '')
        );
        salvos.push({
          id: arqCriado.getId(),
          nome: arqCriado.getName(),
          url: arqCriado.getUrl()
        });
      }

      var caminhoStr = 'Aula Flux/Aulas/' + pastaCurso.getName() + '/envios/' + pastaTurma.getName();
      var primeiroArq = salvos[0] || {};

      return responderJson({
        ok: true,
        caminho: caminhoStr,
        folderPath: caminhoStr,
        pastaTurmaId: pastaTurma.getId(),
        pastaTurmaUrl: pastaTurma.getUrl(),
        fileId: primeiroArq.id || '',
        fileName: primeiroArq.nome || '',
        fileUrl: primeiroArq.url || '',
        arquivos: salvos
      }, e);
    }

    if (action === 'atualizarGameHtml') {
      var cursoAlvo = (body.curso || '').trim();
      var aulaAlvo = String(body.aula || '').trim();
      var htmlNovo = body.content || '';
      if (!cursoAlvo || !aulaAlvo || !htmlNovo) {
        return responderJson({ ok: false, error: 'Parâmetros curso, aula e content são obrigatórios.' }, e);
      }
      var raizAulas = obterPastaRaizAulas(false);
      if (!raizAulas) return responderJson({ ok: false, error: 'Pasta Aula Flux/Aulas não encontrada.' }, e);
      var pCurso = buscarPasta(raizAulas, cursoAlvo, false);
      if (!pCurso) return responderJson({ ok: false, error: 'Pasta do curso não encontrada.' }, e);
      var pAula = buscarPasta(pCurso, aulaAlvo, false);
      if (!pAula) return responderJson({ ok: false, error: 'Pasta da aula não encontrada.' }, e);

      var fIter = pAula.getFiles();
      var gameFile = null;
      while (fIter.hasNext()) {
        var f = fIter.next();
        if (classificarArquivoAula(f.getName()) === 'game') {
          gameFile = f;
          break;
        }
      }
      if (gameFile) {
        gameFile.setContent(htmlNovo);
        return responderJson({ ok: true, updated: true, id: gameFile.getId() }, e);
      } else {
        var novoArq = pAula.createFile('Game.html', htmlNovo, 'text/html');
        return responderJson({ ok: true, created: true, id: novoArq.getId() }, e);
      }
    }

    return responderJson({ ok: false, error: 'Ação POST desconhecida: ' + action }, e);
  } catch (err) {
    return responderJson({ ok: false, error: String(err && err.message ? err.message : err) }, e);
  }
}
