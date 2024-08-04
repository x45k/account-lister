const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv')
const Hypixel = require('hypixel-api-reborn');
const hypixel = new Hypixel.Client(process.env.API_KEY);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('value')
        .setDescription('Gives you the estimated value of an account in USD.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The username to fetch value for')
                .setRequired(true)),
    async execute(interaction) {
        const username = interaction.options.getString('username');

        await interaction.reply({ content: 'Loading...' });

        try {
            // Fetch data from API
            const response = await axios.get(`https://sky.shiiyu.moe/api/v2/profile/${username}`);
            const data = response.data;

            console.log(`API Response: ${JSON.stringify(data, null, 2)}`);

            // Extract profiles
            const profiles = data.profiles;
            let profile = null;

            // Find the selected profile
            for (const key in profiles) {
                if (profiles[key]?.current) {
                    profile = profiles[key];
                    break;
                }
            }

            if (!profile || !profile.data) {
                await interaction.editReply(`No selected profile found for user ${username}`);
                return;
            }

            // Extract networth data
            const networth = profile.data.networth;

            if (!networth) {
                await interaction.editReply(`No networth data found for user ${username}`);
                return;
            }

            // Calculate the estimated value in USD
            const purse = networth.purse ? Math.round(networth.purse) : 0;
            const bank = networth.bank ? Math.round(networth.bank) : 0;
            const totalNetworth = networth.networth ? Math.round(networth.networth) : 0;

            // Assuming unsoulbound networth is the same as total networth for this calculation
            const unsoulboundNetworth = totalNetworth; 
            const remainingNetworth = totalNetworth - unsoulboundNetworth;

            // Calculate USD values
            const unsoulboundValue = (unsoulboundNetworth / 1_000_000) * 0.13;
            const remainingValue = (remainingNetworth / 1_000_000) * 0.06;
            const totalValue = unsoulboundValue + remainingValue;

            // Round the total value
            const formattedValue = totalValue.toFixed(2);

            // Build the embed
            const embed = new EmbedBuilder()
                .setTitle(`${username}'s Estimated Account Value`)
                .setColor('Blue') // Customize color as needed
                .addFields(
                    { name: 'Estimated Value (USD)', value: `$${formattedValue}`, inline: false }
                )
                .setFooter({ text: 'Data provided by SkyCrypt' });

            await interaction.editReply({ content: null, embeds: [embed] });

        } catch (error) {
            console.error(`Error fetching value for user ${username}: ${error}`);
            await interaction.editReply(`Error fetching value for user ${username}: ${error.message}`);
        }
    },
};
