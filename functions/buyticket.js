const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
	
async function modalf3(interaction) {
    if (!interaction.isButton()) return;

	if (interaction.customId === 'buy') {
		const modal = new ModalBuilder()
		.setCustomId('carrymodalf3')
		.setTitle('Account Purchase');
	
	    const amountInput = new TextInputBuilder()
		.setCustomId('amountInput')
		.setLabel("How do you plan on paying for the account?")
		.setStyle(TextInputStyle.Short);

        const priceInput = new TextInputBuilder()
		.setCustomId('priceInput')
		.setLabel("How much are you paying for this account?")
		.setStyle(TextInputStyle.Short);
	
	const firstActionRow = new ActionRowBuilder().addComponents(amountInput);
    const secondActionRow = new ActionRowBuilder().addComponents(priceInput);
	
	modal.addComponents(firstActionRow, secondActionRow);
	
	await interaction.showModal(modal);
	}
}

async function ticketf3(interaction) {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === "carrymodalf3") {
        const guild = interaction.guild;
        const amount = interaction.fields.getTextInputValue('amountInput');
        const price = interaction.fields.getTextInputValue('priceInput'); // Ensure to get the price value as well

        const sentembed = new EmbedBuilder()
            .setColor("Orange")
            .addFields(
                { name: "Payment Method", value: `\`\`\`${amount}\`\`\`` },
                { name: "Price", value: `\`\`\`${price}\`\`\`` } // Add price to embed
            );

        try {
            const channel = await guild.channels.create({
                name: `account-purchase`,
                topic: `${interaction.user.id}`,
                parent: process.env.ACCOUNT_LISTING_CATEGORY_ID,
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'UseApplicationCommands'],
                    },
                    {
                        id: process.env.STAFF_BUYER_ROLE_ID,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'UseApplicationCommands'],
                    },
                    {
                        id: guild.roles.everyone,
                        deny: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'UseApplicationCommands'],
                    },
                ],
            });

            await interaction.reply({ content: `Your Ticket has been created <#${channel.id}>`, ephemeral: true });
            await channel.send({ content: `<@&${process.env.STAFF_BUYER_ROLE_ID}> <@${interaction.user.id}> wants to buy an account for ${price}`, embeds: [sentembed] });

        } catch (error) {
            console.error('Error creating channel or sending message:', error);
            await interaction.reply({ content: 'There was an error creating your ticket. Please try again later.', ephemeral: true });
        }
    }
}


module.exports = { ticketf3, modalf3 }