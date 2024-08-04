const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const axios = require('axios');
const Hypixel = require('hypixel-api-reborn');
const hypixel = new Hypixel.Client(process.env.API_KEY);
const buyaccountbutton = require('../../buttons/buy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-account')
        .setDescription('Lists an account for the user.')
        .addStringOption(option =>
            option.setName('price')
                .setDescription('The price of the account.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The username to fetch stats for')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('crypto')
                .setDescription('The cryptocurrency category')
                .addChoices(
                    { name: 'Bitcoin (BTC)', value: 'BTC' },
                    { name: 'Litecoin (LTC)', value: 'LTC' },
                    { name: 'Ethereum (ETH)', value: 'ETH' }
                ))
        .addStringOption(option =>
            option.setName('paypal')
                .setDescription('Paypal category')
                .addChoices(
                    { name: 'Paypal', value: 'Paypal' }
                ))
        .addStringOption(option =>
            option.setName('cashapp')
                .setDescription('Cashapp category')
                .addChoices(
                    { name: 'Cashapp', value: 'Cashapp' }
                ))
        .addStringOption(option =>
            option.setName('creditcard')
                .setDescription('Credit Card/Debit Card category')
                .addChoices(
                    { name: 'Credit Card/Debit Card', value: 'Credit Card' }
                ))
        .addStringOption(option =>
            option.setName('bank')
                .setDescription('Bank Transfer category')
                .addChoices(
                    { name: 'Bank Transfer', value: 'Bank' }
                )),
    async execute(interaction) {
        const staffRoleId = process.env.STAFF_BUYER_ROLE_ID;
        
        // Check if the user has the required role
        if (!interaction.guild.roles.cache.get(staffRoleId).members.has(interaction.user.id)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const username = interaction.options.getString('username');
        const priceofaccount = interaction.options.getString('price');
        const crypto = interaction.options.getString('crypto');
        const paypal = interaction.options.getString('paypal');
        const cashapp = interaction.options.getString('cashapp');
        const creditcard = interaction.options.getString('creditcard');
        const bankTransfer = interaction.options.getString('bank');
        const guild = interaction.guild;

        await interaction.deferReply({ content: 'Loading...' });

        try {
            // Fetch Slayer data from API
            const response = await axios.get(`https://sky.shiiyu.moe/api/v2/slayers/${username}`);
            const data = response.data;

            // Extract profiles
            const profiles = data;
            let profile = null;

            // Find the selected profile
            for (const key in profiles) {
                if (profiles[key]?.selected) {
                    profile = profiles[key];
                    break;
                }
            }

            // Set default Slayer data if no selected profile is found
            const slayers = profile && profile.data ? profile.data.slayers : {
                zombie: { level: { currentLevel: 0 } },
                spider: { level: { currentLevel: 0 } },
                wolf: { level: { currentLevel: 0 } },
                enderman: { level: { currentLevel: 0 } },
                blaze: { level: { currentLevel: 0 } },
                vampire: { level: { currentLevel: 0 } },
            };

            // Fetch Networth data from API
            const networthResponse = await axios.get(`https://sky.shiiyu.moe/api/v2/profile/${username}`);
            const networthData = networthResponse.data;

            let networthProfile = null;
            for (const key in networthData.profiles) {
                if (networthData.profiles[key]?.current) {
                    networthProfile = networthData.profiles[key];
                    break;
                }
            }

            if (!networthProfile || !networthProfile.data) {
                await interaction.editReply(`No selected networth profile found for user ${username}`);
                return;
            }

            const networth = networthProfile.data.networth || {};
            const purse = networth.purse ? Math.round(networth.purse).toLocaleString() : 'N/A';
            const bank = networth.bank ? Math.round(networth.bank).toLocaleString() : 'N/A';
            const totalNetworth = networth.networth ? Math.round(networth.networth).toLocaleString() : 'N/A';
            const totalUnsoulboundNetworth = networth.unsoulboundNetworth ? Math.round(networth.unsoulboundNetworth).toLocaleString() : 'N/A';
            const skyblockLevel = networthProfile.data.skyblock_level?.level || 'N/A';

            // Fetch player rank from Hypixel API
            let playerRank = 'Failed to retrieve data.';
            try {
                const player = await hypixel.getPlayer(username);
                playerRank = player.rank || 'NON';
            } catch (error) {
                console.error(`Error fetching player rank for ${username}: ${error}`);
                playerRank = 'Error';
            }

            // Fetch Catacombs data from API
            const cataresponse = await axios.get(`https://sky.shiiyu.moe/api/v2/dungeons/${username}`);
            const catadata = cataresponse.data;

            // Log data to verify structure
            console.log(`Catacombs Data: ${JSON.stringify(catadata, null, 2)}`);

            // Extract profiles
            const cataprofiles = catadata.profiles;
            if (!cataprofiles) {
                await interaction.editReply(`No profiles found for user ${username}`);
                return;
            }

            let cataprofile = null;

            // Find the profile where `selected` is true
            for (const key in cataprofiles) {
                if (cataprofiles[key]?.selected) {
                    cataprofile = cataprofiles[key];
                    break;
                }
            }

            if (!cataprofile) {
                await interaction.editReply(`No selected profile found for user ${username}`);
                return;
            }

            // Log the profile data to check its structure
            console.log(`Catacombs Profile Data: ${JSON.stringify(cataprofile, null, 2)}`);

            // Check if profile.dungeons and profile.dungeons.catacombs are available
            if (!cataprofile.dungeons || !cataprofile.dungeons.catacombs) {
                await interaction.editReply(`No dungeon data found for user ${username}`);
                return;
            }

            // Extract Catacombs data
            const catacombsData = cataprofile.dungeons.catacombs;

            if (!catacombsData.level) {
                await interaction.editReply(`No Catacombs level data found for user ${username}`);
                return;
            }

            // Extract level
            const catalevel = catacombsData.level.level;

            const mining = networthProfile.data.mining || {};

            const core = mining.core || {};
            const hotmLevel = core.level ? `Level: ${core.level.level}, XP: ${core.level.xp}` : 'N/A';

            // Build the embed
            const embed = new EmbedBuilder()
                .setTitle(`New Account`)
                .setColor('Blue')
                .addFields(
                    { 
                        name: 'Slayers', 
                        value: `${slayers.zombie.level.currentLevel} / ${slayers.spider.level.currentLevel} / ${slayers.wolf.level.currentLevel} / ${slayers.enderman.level.currentLevel} / ${slayers.blaze.level.currentLevel} / ${slayers.vampire.level.currentLevel}`, 
                        inline: true 
                    },
                    { 
                        name: 'Networth', 
                        value: `**${totalNetworth}** total \n **${totalUnsoulboundNetworth}** unsoulbound \n **${purse}** purse`,
                        inline: true
                    },
                    {
                        name: 'Rank',
                        value: `**${playerRank}**`,
                        inline: false
                    },
                    {
                        name: 'Skyblock Level',
                        value: `**${skyblockLevel}**`,
                        inline: false
                    },
                    {
                        name: 'Catacombs Level',
                        value: `**${catalevel}**`,
                        inline: false
                    },
                    {
                        name: 'HOTM',
                        value: `**${hotmLevel}**`,
                        inline: false
                    },
                    {
                        name: 'Cost',
                        value: `**${priceofaccount}**`,
                        inline: false
                    }
                )
                .setFooter({ text: 'Data provided by SkyCrypt' });

            // Add categories if they are provided
            if (crypto) embed.addFields({ name: 'Cryptocurrency', value: crypto });
            if (paypal) embed.addFields({ name: 'Paypal', value: paypal });
            if (cashapp) embed.addFields({ name: 'Cashapp', value: cashapp });
            if (creditcard) embed.addFields({ name: 'Credit Card/Debit Card', value: creditcard });
            if (bankTransfer) embed.addFields({ name: 'Bank Transfer', value: bankTransfer });

            // Send the embed message
            await interaction.editReply({ content: 'Here is the account listing:', embeds: [embed] });

            // Create a new channel with specific settings
            const categoryId = process.env.ACCOUNT_LISTING_CATEGORY_ID;
            const staffRoleId = process.env.STAFF_BUYER_ROLE_ID;

            const category = interaction.guild.channels.cache.get(categoryId);

            const newChannel = await interaction.guild.channels.create({
                name: `${priceofaccount}-account`,
                parent: category, // Set the category
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: ['SendMessages'],
                        allow: ['ViewChannel', 'ReadMessageHistory']
                    },
                    {
                        id: staffRoleId,
                        allow: ['SendMessages'],
                    },
                ],
            });

            await newChannel.send({ embeds: [embed], components: [buyaccountbutton] });
        } catch (error) {
            console.error(`Error executing /list-account command: ${error}`);
            await interaction.editReply(`An error occurred while processing the request.`);
        }
    },
};
