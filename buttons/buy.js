const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = new ActionRowBuilder()

.addComponents(

    new ButtonBuilder()

    .setCustomId('buy')

    .setLabel('Purchase')

    .setStyle(ButtonStyle.Success),

)