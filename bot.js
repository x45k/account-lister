const { Collection, GatewayIntentBits, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, Client, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const process = require('node:process');
const sellaccountbutton = require('./buttons/sellaccount')
require('dotenv').config();

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });

process.on('unhandledRejection', async (reason, promise) => {
    console.log('Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log('Uncaught Exception Monitor:', err, origin);
});

client.once('ready', () => {
    console.log('Bot is ready');
});

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

client.commands = new Collection();

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.on("interactionCreate", async (interaction) => {
    const f3 = require('./functions/buyticket')
    const f4 = require('./functions/sellticket')

    if (interaction.customId === "buy") {
        await f3.modalf3(interaction)
    }

    if (interaction.customId === "carrymodalf3") {
        await f3.ticketf3(interaction)
    }

    if (interaction.customId === "sell") {
        await f4.modalf4(interaction)
    }

    if (interaction.customId === "carrymodalf4") {
        await f4.ticketf4(interaction)
    }
})

client.on('messageCreate', message => {
    // Check if the message is from a bot to avoid infinite loops
    if (message.author.bot) return;

    // Check if the message content matches the specified trigger
    if (message.content === process.env.SELL_ACCOUNT_TRIGGER) {
        // Create an embed
        const embed = new EmbedBuilder()
            .setTitle('Sell Your Account')
            .setDescription('Open a ticket and sell your account here!')
            .setColor('Blue'); // You can change the color as needed

        // Send the embed in the same channel
        message.channel.send({ embeds: [embed], components: [sellaccountbutton] });
    }
});

client.login(process.env.BOT_TOKEN);