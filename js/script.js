// Espera o DOM carregar para executar o script
document.addEventListener('DOMContentLoaded', () => {

    // ---- ESTRUTURA DE DADOS DOS CONTEÚDOS ----
    const conteudos = {
        'Matemática': ['Razão e Proporção', 'Regra de Três', 'Porcentagem', 'Funções (1º e 2º grau)', 'Geometria Plana', 'Geometria Espacial', 'Análise Combinatória', 'Probabilidade', 'Estatística'],
        'Física': ['Cinemática', 'Leis de Newton', 'Trabalho e Energia', 'Termologia', 'Óptica', 'Ondulatória', 'Eletrodinâmica', 'Eletromagnetismo'],
        'Química': ['Modelos Atômicos', 'Tabela Periódica', 'Ligações Químicas', 'Funções Inorgânicas', 'Estequiometria', 'Soluções', 'Termoquímica', 'Cinética Química', 'Equilíbrio Químico', 'Química Orgânica'],
        'Biologia': ['Citologia', 'Bioquímica', 'Genética Mendeliana', 'Evolução', 'Ecologia', 'Fisiologia Humana', 'Botânica', 'Zoologia'],
        'História': ['Grécia e Roma', 'Idade Média', 'Brasil Colônia', 'Brasil Império', 'República Velha', 'Era Vargas', 'Ditadura Militar', 'Guerra Fria', 'História Contemporânea'],
        'Geografia': ['Cartografia', 'Geologia e Relevo', 'Clima e Vegetação', 'Geografia Agrária', 'Urbanização', 'Geopolítica', 'Questões Ambientais'],
        'Português': ['Interpretação de Texto', 'Funções da Linguagem', 'Figuras de Linguagem', 'Gramática (Crase, Concordância)', 'Variação Linguística'],
        'Literatura': ['Trovadorismo ao Arcadismo', 'Romantismo', 'Realismo/Naturalismo', 'Modernismo no Brasil', 'Pós-Modernismo']
    };

    const coresMaterias = {
        'Matemática': 'var(--cor-matematica)', 'Física': 'var(--cor-fisica)', 'Química': 'var(--cor-quimica)', 'Biologia': 'var(--cor-biologia)',
        'História': 'var(--cor-historia)', 'Geografia': 'var(--cor-geografia)', 'Português': 'var(--cor-portugues)', 'Literatura': 'var(--cor-literatura)'
    };

    // ---- FUNÇÕES DE INICIALIZAÇÃO ----
    function init() {
        renderizarConteudos();
        carregarProgressoChecklists();
        carregarProgressoConteudos();
        atualizarResumoProgresso();
        carregarLogs();
        setupEventListeners();
    }

    function setupEventListeners() {
        // Event listeners para checklists
        document.querySelectorAll('.checklist li').forEach(item => {
            item.addEventListener('click', () => toggleChecklistItem(item));
        });

        // Event listener para resetar checklist semanal
        document.getElementById('reset-semanal').addEventListener('click', resetarChecklistSemanal);
        
        // Event listener para o formulário de logs
        document.getElementById('log-form').addEventListener('submit', adicionarLog);

        // Event listeners para os seletores de status dos conteúdos
        // Precisamos chamar isso DEPOIS de renderizar os conteúdos
        document.querySelectorAll('.topic-item select').forEach(select => {
            select.addEventListener('change', (e) => salvarProgressoConteudo(e.target));
        });

        // Event listeners para o timer Pomodoro
        document.getElementById('start-btn').addEventListener('click', startTimer);
        document.getElementById('pause-btn').addEventListener('click', pauseTimer);
        document.getElementById('reset-btn').addEventListener('click', resetTimer);

        // Event listener para o botão de enviar da IA
        document.getElementById('ai-send-btn').addEventListener('click', chamarAssistenteIA);
    }

    // ---- NAVEGAÇÃO POR ABAS ----
    window.showTab = function(tabId) {
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        
        document.getElementById(tabId).classList.add('active');
        event.currentTarget.classList.add('active');
    }

    // ---- LÓGICA DO CHECKLIST COM LOCALSTORAGE ----
    function toggleChecklistItem(item) {
        item.classList.toggle('checked');
        salvarProgressoChecklists();
    }

    function salvarProgressoChecklists() {
        const checklists = {};
        document.querySelectorAll('.checklist').forEach(cl => {
            const id = cl.id;
            const items = [];
            cl.querySelectorAll('li').forEach((item, index) => {
                if (item.classList.contains('checked')) {
                    items.push(index);
                }
            });
            checklists[id] = items;
        });
        localStorage.setItem('checklistProgresso', JSON.stringify(checklists));
        atualizarBarrasDeProgresso();
    }

    function carregarProgressoChecklists() {
        const progresso = JSON.parse(localStorage.getItem('checklistProgresso'));
        if (progresso) {
            for (const id in progresso) {
                const checklist = document.getElementById(id);
                if (checklist) {
                    progresso[id].forEach(index => {
                        const item = checklist.querySelectorAll('li')[index];
                        if (item) item.classList.add('checked');
                    });
                }
            }
        }
        atualizarBarrasDeProgresso();
    }

    function atualizarBarrasDeProgresso() {
        document.querySelectorAll('.checklist').forEach(cl => {
            const totalItems = cl.querySelectorAll('li').length;
            if (totalItems === 0) return;
            const checkedItems = cl.querySelectorAll('li.checked').length;
            const percentage = (checkedItems / totalItems) * 100;
            const progressBarId = `progress-${cl.id.split('-')[1]}`;
            const progressBar = document.getElementById(progressBarId);
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
        });
    }

    function resetarChecklistSemanal() {
        if (confirm("Tem certeza que deseja reiniciar o checklist da semana?")) {
            document.querySelectorAll('#checklist-semanal li').forEach(item => {
                item.classList.remove('checked');
            });
            salvarProgressoChecklists();
        }
    }

    // ---- LÓGICA DO PROGRESSO POR MATÉRIA ----
    function renderizarConteudos() {
        const container = document.querySelector('.materia-container');
        container.innerHTML = ''; // Limpa o container
        for (const materia in conteudos) {
            const cor = coresMaterias[materia] || 'var(--cor-geral)';
            const card = document.createElement('div');
            card.className = 'card';
            card.style.borderColor = cor;

            let itemsHTML = '';
            conteudos[materia].forEach((conteudo, index) => {
                itemsHTML += `
                    <li class="topic-item status-nao-iniciado" data-materia="${materia}" data-conteudo-index="${index}">
                        <span>${conteudo}</span>
                        <select>
                            <option value="nao-iniciado">Não iniciado</option>
                            <option value="estudando">Estudando</option>
                            <option value="concluido">Concluído</option>
                        </select>
                    </li>`;
            });

            card.innerHTML = `
                <h3><i class="fa-solid fa-book"></i> ${materia}</h3>
                <ul class="topic-list">${itemsHTML}</ul>`;
            container.appendChild(card);
        }
    }
    
    function salvarProgressoConteudo(selectElement) {
        const item = selectElement.closest('.topic-item');
        const materia = item.dataset.materia;
        const index = item.dataset.conteudoIndex;
        const status = selectElement.value;

        let progresso = JSON.parse(localStorage.getItem('conteudoProgresso')) || {};
        if (!progresso[materia]) {
            progresso[materia] = {};
        }
        progresso[materia][index] = status;
        localStorage.setItem('conteudoProgresso', JSON.stringify(progresso));

        // Atualiza a aparência
        item.className = 'topic-item'; // reseta classes
        item.classList.add(`status-${status}`);
        
        atualizarResumoProgresso();
    }

    function carregarProgressoConteudos() {
        const progresso = JSON.parse(localStorage.getItem('conteudoProgresso'));
        if (progresso) {
            for (const materia in progresso) {
                for (const index in progresso[materia]) {
                    const status = progresso[materia][index];
                    const item = document.querySelector(`.topic-item[data-materia="${materia}"][data-conteudo-index="${index}"]`);
                    if (item) {
                        item.querySelector('select').value = status;
                        item.className = 'topic-item';
                        item.classList.add(`status-${status}`);
                    }
                }
            }
        }
    }

    function atualizarResumoProgresso() {
        for (const materia in conteudos) {
            const total = conteudos[materia].length;
            if (total === 0) continue;
            
            let concluidos = 0;
            const progresso = JSON.parse(localStorage.getItem('conteudoProgresso')) || {};

            if (progresso[materia]) {
                concluidos = Object.values(progresso[materia]).filter(status => status === 'concluido').length;
            }
            
            const percentual = Math.round((concluidos / total) * 100);
            const summaryId = `summary-${materia.toLowerCase().replace('í', 'i').replace('ú', 'u')}`;
            const summaryElement = document.getElementById(summaryId);
            if(summaryElement) {
                summaryElement.textContent = `${materia}: ${percentual}%`;
            }
        }
    }
    
    // ---- LÓGICA DE LOGS DE SIMULADOS E REDAÇÕES ----
    function adicionarLog(event) {
        event.preventDefault();
        
        const tipo = document.getElementById('log-tipo').value;
        const data = document.getElementById('log-data').value;
        const tema = document.getElementById('log-tema').value;
        const nota = document.getElementById('log-nota').value;

        const log = { id: Date.now(), data, tema, nota };
        
        const logs = JSON.parse(localStorage.getItem(`${tipo}Logs`)) || [];
        logs.push(log);
        localStorage.setItem(`${tipo}Logs`, JSON.stringify(logs));
        
        renderizarLogs(tipo);
        document.getElementById('log-form').reset();
    }
    
    function renderizarLogs(tipo) {
        const tableBody = document.querySelector(`#${tipo}-table tbody`);
        tableBody.innerHTML = '';
        const logs = JSON.parse(localStorage.getItem(`${tipo}Logs`)) || [];
        
        logs.forEach(log => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${new Date(log.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                <td>${log.tema}</td>
                <td>${log.nota}</td>
                <td><button class="delete-btn" onclick="deletarLog('${tipo}', ${log.id})"><i class="fa-solid fa-trash"></i></button></td>
            `;
        });
    }

    window.deletarLog = function(tipo, id) {
        if (confirm("Tem certeza que deseja excluir este registro?")) {
            let logs = JSON.parse(localStorage.getItem(`${tipo}Logs`)) || [];
            logs = logs.filter(log => log.id !== id);
            localStorage.setItem(`${tipo}Logs`, JSON.stringify(logs));
            renderizarLogs(tipo);
        }
    }
    
    function carregarLogs() {
        renderizarLogs('redacao');
        renderizarLogs('simulado');
    }

    // ---- LÓGICA DO TIMER POMODORO ----
    let timerInterval;
    let timeLeft = 1500; // 25 minutos em segundos
    let isPaused = true;
    let mode = 'foco'; // 'foco', 'descanso-curto', 'descanso-longo'
    let cycles = 0;

    const display = document.getElementById('timer-display');
    const statusDisplay = document.getElementById('pomodoro-status');

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const seconds = (timeLeft % 60).toString().padStart(2, '0');
        display.textContent = `${minutes}:${seconds}`;
        document.title = `${minutes}:${seconds} - Projeto Medicina`;
    }
    
    function startTimer() {
        if (isPaused) {
            isPaused = false;
            timerInterval = setInterval(() => {
                timeLeft--;
                updateDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    new Audio('https://www.soundjay.com/buttons/sounds/button-1.mp3').play(); // som de alerta
                    changeMode();
                }
            }, 1000);
        }
    }

    function pauseTimer() {
        isPaused = true;
        clearInterval(timerInterval);
    }
    
    function resetTimer() {
        pauseTimer();
        switch (mode) {
            case 'foco': timeLeft = 1500; break;
            case 'descanso-curto': timeLeft = 300; break;
            case 'descanso-longo': timeLeft = 900; break;
        }
        updateDisplay();
    }

    function changeMode() {
        if (mode === 'foco') {
            cycles++;
            if (cycles % 4 === 0) {
                mode = 'descanso-longo';
                timeLeft = 900; // 15 min
                statusDisplay.textContent = 'Modo: Descanso Longo. Relaxe de verdade!';
            } else {
                mode = 'descanso-curto';
                timeLeft = 300; // 5 min
                statusDisplay.textContent = 'Modo: Descanso Curto. Alongue-se!';
            }
        } else {
            mode = 'foco';
            timeLeft = 1500; // 25 min
            statusDisplay.textContent = `Modo: Foco (${cycles % 4 + 1}/4). Celular longe!`;
        }
        isPaused = true;
        updateDisplay();
        alert("Tempo esgotado! Hora de mudar de modo.");
    }
    
    // Inicia a aplicação
    init();
});

// -------------------------------------------------------------------------
// ---- LÓGICA DO ASSISTENTE DE IA (VERSÃO SIMPLIFICADA - DIRETO NO FRONT-END) ----
// -------------------------------------------------------------------------

// IMPORTANTE: COLE SUA CHAVE DE API AQUI DENTRO DAS ASPAS!
const API_KEY = 'AIzaSyArm2VW5-0AV6Hk_hlmJO9y9XJFrcVNyN4'; 
const MODEL_NAME = "gemini-pro";

async function chamarAssistenteIA() {
    const promptInput = document.getElementById('ai-prompt-input');
    const chatBox = document.getElementById('ai-chat-box');
    const loadingIndicator = document.getElementById('ai-loading');
    const sendButton = document.getElementById('ai-send-btn');

    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // Adiciona a mensagem do usuário ao chat
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'ai-message user';
    userMessageDiv.textContent = prompt;
    chatBox.appendChild(userMessageDiv);

    // Limpa o input e mostra o loading
    promptInput.value = '';
    loadingIndicator.style.display = 'block';
    sendButton.disabled = true;
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        const headers = { "Content-Type": "application/json" };
        const body = JSON.stringify({
            contents: [{
                parts: [{
                    text: `Você é um tutor especialista em vestibulares de Medicina no Brasil (ENEM, UEM, UFPR). Responda a pergunta do estudante de forma clara, didática e motivadora. Pergunta: "${prompt}"`
                }]
            }]
        });

        const response = await fetch(url, { method: "POST", headers, body });

        if (!response.ok) {
            // Tenta ler a mensagem de erro da API do Google para nos dar mais pistas
            const errorData = await response.json();
            throw new Error(`Erro na API do Google: ${errorData.error.message}`);
        }

        const data = await response.json();
        const aiResponseText = data.candidates[0].content.parts[0].text;

        // Adiciona a resposta da IA ao chat
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'ai-message bot';
        botMessageDiv.textContent = aiResponseText;
        chatBox.appendChild(botMessageDiv);

    } catch (error) {
        console.error("Erro ao chamar a IA:", error);
        const errorMessageDiv = document.createElement('div');
        errorMessageDiv.className = 'ai-message bot';
        errorMessageDiv.textContent = 'Desculpe, ocorreu um erro. Detalhes: ' + error.message;
        chatBox.appendChild(errorMessageDiv);
    } finally {
        loadingIndicator.style.display = 'none';
        sendButton.disabled = false;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}