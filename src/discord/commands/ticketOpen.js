const { ActionRowBuilder, ButtonBuilder, PermissionFlagsBits, ChannelType, ButtonStyle } = require("discord.js");
const { Embed, SuccessEmbed } = require("../../contracts/embedHandler.js");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const WristSpasmError = require("../../contracts/errorHandler.js");
const config = require("../../../config.json");

const permissions = [
  PermissionFlagsBits.ReadMessageHistory,
  PermissionFlagsBits.UseExternalEmojis,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.AttachFiles,
  PermissionFlagsBits.AddReactions,
  PermissionFlagsBits.EmbedLinks,
];

module.exports = {
  name: "open-ticket",
  description: "Open a support ticket.",
  options: [
    {
      name: "reason",
      description: "The reason for opening a ticket",
      type: 3,
      required: false,
    },
  ],

  execute: async (interaction, type) => {
    const reason = interaction.options?.getString("reason") ?? "No Reason Provided";
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: "1230422748648570970",
      permissionOverwrites: [
        { id: interaction.user.id, allow: permissions },
        { id: interaction.client.user.id, allow: permissions },
        { id: interaction.guild.roles.everyone.id, deny: permissions },
        { id: config.discord.roles.commandRole, allow: permissions },
      ],
    });

    const ticketEmbed = new Embed(
      2067276,
      "Ticket Opened",
      `Ticket opened by <@${interaction.user.id}>\n\nReason: ${reason}`,
      {
        text: `by @kathund. | /help [command] for more information`,
        iconURL: "https://i.imgur.com/uUuZx2E.png",
      }
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Close Ticket")
        .setCustomId(`TICKET_CLOSE_${channel.id}`)
        .setStyle(ButtonStyle.Danger)
    );

    const openMessage = await channel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [ticketEmbed],
      components: [row],
    });
    const staffPing = await channel.send({ content: `<@&${config.discord.roles.commandRole}>` });
    await delay(500);
    await openMessage.pin();
    await staffPing.delete();

    if (type) {
      switch (type.toLowerCase()) {
        case "report": {
          const reportEmbed = new Embed(
            16711680,
            "Report a Guild Member",
            "Please provide the name of the player you are reporting."
          );
          await openMessage.reply({ embeds: [reportEmbed] });
          break;
        }
        case "suggestion": {
          const suggestionEmbed = new Embed(
            16776960,
            "Give a Suggestion",
            "Please provide a short description of your suggestion."
          );
          await openMessage.reply({ embeds: [suggestionEmbed] });
          break;
        }
        case "question": {
          const questionEmbed = new Embed(
            16776960,
            "Questions or Concerns",
            "Please provide a detailed description of your question or concern."
          );
          await openMessage.reply({ embeds: [questionEmbed] });
          break;
        }
        case "staff": {
          const questionEmbed = new Embed(
            16776960,
            "Staff Application",
            'Please awnser these questions in detail.\n\nSay "cancel" to close the ticket and stop the application.'
          );
          await openMessage.reply({ embeds: [questionEmbed] });
          break;
        }
        // Other
        default: {
          const supportEmbed = new Embed(
            16776960,
            "General Support",
            "Please provide a detailed description of your issue."
          );
          await openMessage.reply({ embeds: [supportEmbed] });
          break;
        }
      }
      if (type.toLowerCase() === "staff") {
        let msgsSent = 0;
        const reportEmbed = new Embed(
          16711680,
          "Staff Application",
          `**Question ${msgsSent + 1}/${config.other.staffApplicationQuestions.length}**\n${
            config.other.staffApplicationQuestions[msgsSent]
          }`
        );
        await interaction.channel.send({ embeds: [reportEmbed] });
        msgsSent++;
        let finished = false;
        interaction.client.on("messageCreate", async (message) => {
          if (message.author.id !== interaction.user.id) return;
          if (message.channel.id !== channel.id) return;
          if (message.author.bot) return;
          if (message.content === "cancel") {
            const ticketCloseCommand = interaction.client.commands.get("close-ticket");

            if (ticketCloseCommand === undefined) {
              throw new WristSpasmError("Could not find close-ticket command! Please contact an administrator.");
            }

            await ticketCloseCommand.execute(interaction);
          }
          if (!finished) {
            if (msgsSent === config.other.staffApplicationQuestions.length) {
              const reportEmbed = new Embed(
                16711680,
                "Staff Application",
                "Thank you for applying! Your application will be reviewed shortly."
              );
              await channel.send({ embeds: [reportEmbed] });
              finished = true;
            } else {
              const reportEmbed = new Embed(
                16711680,
                "Staff Application",
                `**Question ${msgsSent + 1}/${config.other.staffApplicationQuestions.length}**\n${
                  config.other.staffApplicationQuestions[msgsSent]
                }`
              );
              await channel.send({ embeds: [reportEmbed] });
              msgsSent++;
            }
          }
        });
      }
    } else {
      const supportEmbed = new Embed(
        16776960,
        "General Support",
        "Please provide a detailed description of your issue."
      );
      await openMessage.reply({ embeds: [supportEmbed] });
    }

    const ticketOpenEmbed = new SuccessEmbed(`Ticket opened in <#${channel.id}>`, {
      text: `by @kathund. | /help [command] for more information`,
      iconURL: "https://i.imgur.com/uUuZx2E.png",
    });

    await interaction.followUp({ embeds: [ticketOpenEmbed], ephemeral: true });
  },
};
