Markdown

# Bot Multicanal - WhatsApp & Telegram

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![License](https://img.shields.io/badge/License-ISC-blue)

Este é um bot robusto, construído em Node.js, que atua como uma poderosa ferramenta de comunicação centralizada. Ele permite que um administrador envie mensagens, imagens e outras mídias para múltiplos grupos de WhatsApp e chats do Telegram de forma simultânea, utilizando um único comando ou uma chamada de API.

O projeto foi desenhado para ser de fácil configuração, com um assistente interativo para o primeiro uso, e para ser distribuído como uma aplicação portátil no Windows, sem a necessidade de instalar o Node.js ou outras dependências manualmente.

---

## ✨ Funcionalidades Principais

* **🤖 Integração Dupla:** Funciona com WhatsApp e Telegram ao mesmo tempo, recebendo comandos de um e disparando para ambos.
* **✉️ Envio Flexível:** Suporta o envio de mensagens de texto, imagens (enviadas diretamente na conversa) e imagens a partir de uma URL pública.
* **👑 Controle de Admin:** O bot é controlado por um ou mais administradores através de uma conversa privada no WhatsApp, garantindo a segurança das operações.
* **⚙️ Setup Interativo:** Possui um assistente de configuração que guia o usuário na primeira execução, solicitando as informações necessárias (número do admin e token do Telegram) diretamente no terminal.
* **📝 Registro Automático:**
    * **WhatsApp:** Adiciona novos grupos à lista de transmissão automaticamente quando o bot é inserido neles.
    * **Telegram:** Adiciona novos chats ou grupos à lista de transmissão quando recebe uma mensagem pela primeira vez.
* **🔌 API para Disparos:** Inclui um servidor Express com uma rota `/send-to-all` para permitir disparos em massa a partir de outros sistemas ou scripts.
* **🐞 Logs Detalhados:** Cria uma pasta `logs` para registrar a atividade normal и um arquivo `ERRO_FATAL.log` para capturar qualquer erro crítico que feche a aplicação, facilitando a depuração.
* **📦 Versão Portátil:** O projeto pode ser distribuído como uma pasta autônoma para Windows, contendo um executável (`.bat`) que roda o bot sem necessidade de instalação prévia do Node.js na máquina do usuário.

---

## 📂 Estrutura do Projeto

/SEU_PROJETO/
│
├── INICIAR_BOT.bat         # (Opcional) Lançador para a versão portátil
├── bot.js                  # O código principal do bot
├── package.json            # Dependências e scripts do projeto
├── .gitignore              # Arquivos a serem ignorados pelo Git (MUITO IMPORTANTE)
├── .env.example            # Exemplo de como o arquivo .env deve ser
│
├── node_modules/           # Dependências baixadas via 'npm install'
│
├── .env                    # (CRIADO AUTOMATICAMENTE) Segredos, como o token do Telegram
├── bot_admins.json         # (CRIADO AUTOMATICAMENTE) Lista de administradores
├── groups.json             # (CRIADO AUTOMATICAMENTE) Lista de grupos do WhatsApp
├── telegram_chats.json     # (CRIADO AUTOMATICAMENTE) Lista de chats do Telegram
├── wwebjs_auth/            # (CRIADO AUTOMATICAMENTE) Pasta da sessão do WhatsApp
└── logs/                   # (CRIADO AUTOMATICAMENTE) Logs de atividade e erros


---

## 🚀 Instalação e Configuração

Siga estes passos para configurar e rodar o bot em um ambiente de desenvolvimento.

### 1. Pré-requisitos
* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* npm (instalado junto com o Node.js)

### 2. Instalação
Clone este repositório e instale as dependências:

```bash
# Clone o projeto para sua máquina
git clone [https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git](https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git)

# Entre na pasta do projeto
cd NOME_DO_REPOSITORIO

# Instale todas as bibliotecas necessárias
npm install
3. Primeira Execução (Setup Interativo)
Na primeira vez que você rodar o bot, ele entrará em modo de configuração.

Bash

npm start
O programa irá parar e fazer duas perguntas no terminal:

"Por favor, digite o número de telefone do administrador...": Digite seu número de WhatsApp, incluindo o código do país, sem símbolos (Ex: 5511987654321). Este será o único número capaz de dar comandos ao bot.

"Agora, cole aqui o seu token do bot do Telegram...": Vá até o Telegram, fale com o @BotFather, crie um novo bot e cole aqui o token de acesso que ele fornecer.

Após responder, o programa criará os arquivos bot_admins.json e .env para você e continuará a inicialização.

4. Conexão com o WhatsApp
Na sequência, o bot irá gerar um QR Code no terminal. Abra seu aplicativo do WhatsApp, vá em Configurações > Aparelhos Conectados > Conectar um aparelho e escaneie o código.

Após a leitura, seu bot estará 100% funcional! Nas próximas vezes que você iniciar o bot, ele não pedirá mais a configuração e tentará usar a sessão salva para se conectar automaticamente.

🎮 Como Usar
Controle pelo WhatsApp
Na sua conversa privada com o número do bot, envie menu para ver a lista de comandos disponíveis. Qualquer mensagem de texto ou mídia que você enviar nesta conversa será automaticamente reenviada para todos os grupos e chats registrados.

Adicionando Novos Grupos/Chats
WhatsApp: Simplesmente adicione o número do bot a qualquer grupo de WhatsApp. Ele salvará o ID do grupo automaticamente.

Telegram: Adicione o seu bot do Telegram ao grupo desejado e envie qualquer mensagem. Ele irá responder e salvar o ID do chat para futuras transmissões.

API
O bot expõe uma rota POST para envio em massa:

Endpoint: http://localhost:3000/send-to-all

Método: POST

Body (JSON):

JSON

{
  "message": "Esta é uma mensagem de teste via API!",
  "imageUrl": "[https://i.imgur.com/S6t6s2a.jpeg](https://i.imgur.com/S6t6s2a.jpeg)"
}
A imageUrl é opcional.

📦 Criando uma Versão Portátil (Windows)
Para distribuir o bot sem que o usuário precise instalar o Node.js, siga os passos para criar uma pasta autônoma.

Baixe o Node.js Portátil:

Vá até nodejs.org/en/download/ e baixe o arquivo "Windows Binary (.zip)" de 64-bit.

Monte a Pasta de Distribuição:

Crie uma nova pasta (ex: Bot_Portatil).

Descompacte o Node.js que você baixou. Renomeie a pasta resultante para node e coloque-a dentro de Bot_Portatil.

Copie todos os arquivos do seu projeto (exceto o .gitignore e README.md) e a pasta node_modules inteira para dentro de Bot_Portatil.

Crie o Lançador INICIAR_BOT.bat:

Dentro da pasta Bot_Portatil, crie um novo arquivo de texto com o seguinte conteúdo:

Snippet de código

@echo off
echo INICIANDO O BOT...
.\node\node.exe bot.js
echo.
echo O bot foi fechado. Pressione qualquer tecla para sair.
pause
Salve este arquivo como INICIAR_BOT.bat.

Agora, toda a pasta Bot_Portatil pode ser zipada e enviada para outro usuário, que só precisará clicar em INICIAR_BOT.bat para usar o programa.
