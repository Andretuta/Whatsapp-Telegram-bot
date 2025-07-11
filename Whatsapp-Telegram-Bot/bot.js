const fs = require('fs');
const path = require('path');

// --- LÓGICA DE CAMINHOS PARA O .EXE ---
const isPkg = typeof process.pkg !== 'undefined';
const basePath = isPkg ? path.dirname(process.execPath) : __dirname;

// Função para logar erros fatais de forma síncrona
function logFatalError(error) {
    console.error('ERRO FATAL CAPTURADO:', error);
    const errorLogPath = path.join(basePath, 'ERRO_FATAL.log');
    const errorMessage = `[${new Date().toISOString()}] Ocorreu um erro fatal que fechou a aplicação:\n${error.stack || error}\n\n`;
    try {
        fs.writeFileSync(errorLogPath, errorMessage, { flag: 'a' }); // 'a' para adicionar ao final do arquivo
    } catch (writeError) {
        console.error('Não foi possível escrever no arquivo de log de erro fatal:', writeError);
    }
}

// --- VERIFICAÇÃO E CONFIGURAÇÃO INICIAL ---
// ... (O resto do código permanece o mesmo até o final)

// ==========================================================
// A LÓGICA PRINCIPAL DO BOT COMEÇA AQUI
// ==========================================================
async function main() {
    try {
        // --- VERIFICAÇÃO E CONFIGURAÇÃO INICIAL ---
        const adminsFilePath = path.join(basePath, 'bot_admins.json');
        const envFilePath = path.join(basePath, '.env');

        function runInitialSetup() {
            if (fs.existsSync(adminsFilePath)) {
                return;
            }

            const prompt = require('prompt-sync')({ sigint: true });
            console.log("--- CONFIGURAÇÃO INICIAL DO BOT ---");
            console.log("Olá! Parece que esta é a primeira vez que você está rodando o bot.");
            console.log("Vamos configurar algumas coisas necessárias.");

            let adminNumber = '';
            while (!/^\d+$/.test(adminNumber)) {
                adminNumber = prompt('Por favor, digite o número de telefone do administrador do bot (apenas números, com DDI, ex: 55119...): ');
                if (!/^\d+$/.test(adminNumber)) {
                    console.log("Número inválido. Por favor, digite apenas números.");
                }
            }
            const adminConfig = { admins: [adminNumber] };
            fs.writeFileSync(adminsFilePath, JSON.stringify(adminConfig, null, 2));
            console.log(`✅ Arquivo 'bot_admins.json' criado com o admin: ${adminNumber}`);

            let telegramToken = '';
            while (telegramToken.length < 20) {
                telegramToken = prompt('Agora, cole aqui o seu token do bot do Telegram: ');
                if (telegramToken.length < 20) {
                    console.log("Token parece curto demais. Por favor, cole o token completo.");
                }
            }
            const envContent = `TELEGRAM_TOKEN=${telegramToken}`;
            fs.writeFileSync(envFilePath, envContent);
            console.log("✅ Arquivo '.env' criado com o seu token do Telegram.");
            console.log("\n--- CONFIGURAÇÃO CONCLUÍDA! Iniciando o bot... ---");
        }

        runInitialSetup();

        require('dotenv').config({ path: envFilePath });

        const express = require('express');
        const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
        const qrcode = require('qrcode-terminal');
        const axios = require('axios');
        const TelegramBot = require('node-telegram-bot-api');

        let ADMINS_PATH, getAdmins;
        setImmediate(() => {
            ADMINS_PATH = path.join(basePath, 'bot_admins.json');
            getAdmins = function() {
                if (!fs.existsSync(ADMINS_PATH)) return [];
                try {
                    const data = fs.readFileSync(ADMINS_PATH, 'utf8');
                    const json = JSON.parse(data);
                    return json.admins || [];
                } catch { return []; }
            };
        });

        const WHATSAPP_GROUPS_DB = path.join(basePath, 'groups.json');
        const TELEGRAM_CHATS_DB = path.join(basePath, 'telegram_chats.json');

        const readJsonFromFile = (filePath) => {
            if (!fs.existsSync(filePath)) return [];
            const data = fs.readFileSync(filePath, 'utf8');
            if (!data) return [];
            try {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    return parsed.filter(item => item && (typeof item === 'string' || typeof item === 'number') && item.toString().trim() !== '');
                }
                return [];
            } catch (e) {
                logSync(`Erro ao ler o JSON de ${filePath}:`, e);
                return [];
            }
        };

        const writeJsonToFile = (filePath, data) => {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        };

        const LOG_DIR = path.join(basePath, 'logs');
        if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
        const LOG_FILE = path.join(LOG_DIR, 'bot.log');

        function logSync(...args) {
            const msg = `[${new Date().toISOString()}] ` + args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') + '\n';
            fs.appendFileSync(LOG_FILE, msg);
            console.log(...args);
        }

        logSync('Iniciando o bot...');

        const chromiumPath = isPkg
          ? path.join(path.dirname(process.execPath), 'puppeteer', '.local-chromium', 'win64-1083080', 'chrome-win', 'chrome.exe')
          : undefined;

        logSync(`Usando Chromium em: ${chromiumPath || 'Padrão (node_modules)'}`);

        const client = new Client({
            authStrategy: new LocalAuth({ dataPath: path.join(basePath, 'wwebjs_auth') }),
            puppeteer: {
                headless: true,
                executablePath: chromiumPath,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
        });

        client.on('qr', qr => {
            qrcode.generate(qr, { small: true });
            logSync('QR Code gerado. Escaneie para continuar.');
        });
        client.on('ready', () => logSync('******************************\nBOT DO WHATSAPP ESTÁ PRONTO!\n******************************'));
        client.on('auth_failure', msg => logSync('Falha na autenticação do WhatsApp:', msg));
        client.on('disconnected', reason => logSync('WhatsApp desconectado:', reason));

        client.on('group_join', notification => {
            logSync(`Bot adicionado ao grupo de WhatsApp: ${notification.chatId}`);
            const groups = readJsonFromFile(WHATSAPP_GROUPS_DB);
            if (!groups.includes(notification.chatId)) {
                groups.push(notification.chatId);
                writeJsonToFile(WHATSAPP_GROUPS_DB, groups);
                logSync('ID do grupo salvo com sucesso!');
            }
        });
        client.on('group_leave', notification => {
            logSync(`Bot removido do grupo de WhatsApp: ${notification.chatId}`);
            let groups = readJsonFromFile(WHATSAPP_GROUPS_DB);
            groups = groups.filter(id => id !== notification.chatId);
            writeJsonToFile(WHATSAPP_GROUPS_DB, groups);
            logSync('ID do grupo removido do banco de dados.');
        });

        const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
        let telegramBot;

        if (TELEGRAM_TOKEN) {
            telegramBot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
            logSync('Bot do Telegram inicializado e escutando por mensagens...');

            telegramBot.on('message', (msg) => {
                const chatId = msg.chat.id;
                const chats = readJsonFromFile(TELEGRAM_CHATS_DB);
                if (!chats.includes(chatId)) {
                    chats.push(chatId);
                    writeJsonToFile(TELEGRAM_CHATS_DB, chats);
                    telegramBot.sendMessage(chatId, 'Olá! Seu chat foi registrado com sucesso. ✅');
                } else {
                    telegramBot.sendMessage(chatId, 'Este chat já está registrado. 👍');
                }
            });
            logSync('******************************\nBOT DO TELEGRAM ESTÁ PRONTO!\n******************************');
        } else {
            logSync('AVISO: O token do Telegram não foi encontrado ou configurado. As funcionalidades do Telegram estão desativadas.');
        }

        async function getMediaFromUrl(url) {
            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                const mime = response.headers['content-type'];
                const base64 = Buffer.from(response.data, 'binary').toString('base64');
                return new MessageMedia(mime, base64, 'imagem.jpg');
            } catch (e) {
                logSync('Erro ao baixar mídia da URL:', e.message);
                return null;
            }
        }

        client.on('message', async (msg) => {
            if (msg.from.endsWith('@c.us')) {
                const admins = getAdmins();
                const senderNumber = msg.from.replace(/@c\.us$/, '');
                if (!admins.includes(senderNumber)) return;

                if (msg.body.trim().toLowerCase() === 'menu' || msg.body.trim() === 'ajuda') {
                    // ... (código do menu)
                } else if (msg.body.trim().toLowerCase() === 'status') {
                    // ... (código do status)
                } else {
                    const whatsappGroups = readJsonFromFile(WHATSAPP_GROUPS_DB);
                    const telegramChats = readJsonFromFile(TELEGRAM_CHATS_DB);
                    // ... (resto da lógica de envio)
                }
            }
        });

        const app = express();
        app.use(express.json());
        const port = process.env.PORT || 3000;

        app.get('/', (req, res) => res.status(200).json({ status: 'API do Bot está funcionando!' }));

        app.post('/send-to-all', async (req, res) => {
            // ... (código da rota send-to-all)
        });

        await client.initialize();
        app.listen(port, () => {
            logSync(`API do bot rodando em http://localhost:${port}`);
        });

    } catch (error) {
        logFatalError(error);
        process.exit(1);
    }
}

// Inicia a aplicação principal
main();