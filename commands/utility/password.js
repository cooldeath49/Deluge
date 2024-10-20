// interaction.followUp({content: "Would you like to set a password?", components: [row]});

//         const collectorFilter = i => i.user.id === interaction.user.id;

//         try {
//           const confirmation = await interaction.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

//           if (confirmation.customId == 'add pw') {
//             const modal = new ModalBuilder()
//             .setCustomId("pw modal")
//             .setTitle("Deluge");

//             const textBuilder = new TextInputBuilder()
//             .setCustomId("pw text")
//             .setLabel("Please enter a password.")
//             .setStyle(TextInputStyle.Short);

//             const actionRow = new ActionRowBuilder().addComponents(textBuilder);

//             modal.addComponents(actionRow);
//             await confirmation.showModal(modal);
            
//             // confirmation.update({content: "Got a yes!", components: []});
//           } else if (confirmation.customId == 'reject edit fac') {
//             confirmation.update({content: "Got a no!", components: []});
//           }

//         } catch (e) {
//           console.log(e);
//           await interaction.followUp({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
//         }