const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = new ActionRowBuilder()

.addComponents(

    new ButtonBuilder()

    .setCustomId('sell')

    .setLabel('Sell Account')

    .setStyle(ButtonStyle.Success),

)