"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretShare = void 0;
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
var SecretShare;
(function (SecretShare) {
    function initialize(bot) {
        bot.application?.commands.fetch()
            .then(commands => syncCommands(bot, commands))
            .catch(console.error);
        bot.on('interaction', interaction => receive(interaction));
    }
    SecretShare.initialize = initialize;
    const entryCommands = [
        {
            name: 'share',
            description: 'このチャンネルにDMで最後に送信したメッセージを秘匿共有します',
            options: [
                {
                    type: 'STRING',
                    name: 'summary',
                    description: '秘匿メッセージの要約を指定できます',
                },
                {
                    type: 'STRING',
                    name: 'roles',
                    description: '秘匿メッセージを共有するロールを指定できます(複数可)',
                },
            ],
        },
    ];
    function syncCommands(bot, commands) {
        const createdCommands = entryCommands
            .filter(entryCmd => !commands.some(cmd => cmd.name === entryCmd.name))
            .map(entryCmd => bot.application?.commands.create(entryCmd));
        const overwritedCommands = commands.map(cmd => {
            const overlapCmd = entryCommands.find(entryCmd => entryCmd.name === cmd.name);
            return overlapCmd ? cmd.edit(overlapCmd) : cmd.delete();
        });
        Promise.all(createdCommands.concat(overwritedCommands))
            .catch(console.error);
    }
    const sharingIDPrefix = 'secret-sharing-message';
    const deleteIDPrefix = 'secret-delete-message';
    function receive(interaction) {
        if (interaction.isCommand())
            if (interaction.commandName === 'share')
                sharingMessage(interaction)
                    .catch(exception => unknownError(interaction, exception));
        if (interaction.isButton()) {
            const customID = interaction.customID;
            if (customID.startsWith(sharingIDPrefix))
                trasferMessage(interaction)
                    .catch(exception => unknownError(interaction, exception));
            if (customID.startsWith(deleteIDPrefix))
                deleteSharingMessage(interaction)
                    .catch(exception => unknownError(interaction, exception));
        }
    }
    function unknownError(interaction, exception) {
        console.error(exception);
        if (!interaction.isCommand()
            && !interaction.isButton()
            && !interaction.isMessageComponent())
            return;
        interaction.reply({
            ephemeral: true,
            embeds: [{ title: '⚠️ 不明なエラーが発生しました' }],
        })
            .catch(console.error);
    }
    async function sharingMessage(interaction) {
        const author = interaction.user;
        const dmChannel = await author.createDM();
        const lastMessageID = dmChannel.lastMessageID;
        if (!lastMessageID)
            return;
        const lastMessage = await dmChannel.messages.fetch(lastMessageID);
        if (author.id === lastMessage.author.id)
            await replyResolveSharingMessage(interaction, lastMessageID);
        else
            await replyRejectSharingMessage(interaction);
    }
    function replyResolveSharingMessage(interaction, lastMessageID) {
        const embed = new discord_js_1.MessageEmbed({
            title: '📨 秘匿メッセージが共有されました'
        });
        const summary = interaction.options.get('summary')?.value;
        const rolesString = interaction.options.get('roles')?.value;
        if (typeof summary === 'string')
            embed.setDescription(summary);
        if (typeof rolesString === 'string')
            embed.addField('共有するロール', [...rolesString.matchAll(/(?<!\\)<@&\d+>/g)].map(m => m[0]).join(' '));
        return interaction.reply({
            embeds: [embed],
            components: [
                {
                    type: 'ACTION_ROW',
                    components: [
                        {
                            type: 'BUTTON',
                            style: 'PRIMARY',
                            label: 'メッセージを受け取る',
                            customID: `${sharingIDPrefix},${lastMessageID}`
                        },
                        {
                            type: 'BUTTON',
                            style: 'DANGER',
                            label: '削除',
                            customID: deleteIDPrefix
                        },
                    ],
                },
            ],
        });
    }
    function replyRejectSharingMessage(interaction) {
        return interaction.reply({
            ephemeral: true,
            embeds: [
                {
                    title: '⚠️ DMにメッセージがありません',
                    description: '秘匿メッセージを共有するには、このBOTへDMを送る必要があります。',
                },
            ],
        });
    }
    async function trasferMessage(interaction) {
        const bot = interaction.client;
        const sharingMessage = interaction.message;
        const authorID = sharingMessage.interaction?.user.id;
        const member = interaction.member;
        const shareMessageID = interaction.customID.split(',')[1];
        if (!authorID || !member || !shareMessageID)
            return;
        if (!validateRoles(member, sharingMessage))
            return lackRoleTransferMessage(interaction);
        const author = await bot.users.fetch(authorID);
        const dmChannel = await author.createDM();
        const shareMessage = await utils_1.Utils.fetchMessage(bot, dmChannel.id, shareMessageID);
        if (!shareMessage)
            return notFoundTranceferMessage(interaction);
        const otherDMChannel = await interaction.user.createDM();
        otherDMChannel.send({
            embeds: [messgeToEmbed(shareMessage, author)],
        })
            .then(() => resolveTransferMessage(interaction))
            .catch(() => rejectTransferMessage(interaction));
    }
    function validateRoles(member, message) {
        const roleIDs = message.embeds[0].fields?.[0]?.value
            .replace(/<@&|>/g, '')
            .split(' ');
        if (!roleIDs)
            return true;
        const permissions = typeof member.permissions === 'string'
            ? new discord_js_1.Permissions(BigInt(member.permissions))
            : member.permissions;
        if (permissions.has('MANAGE_MESSAGES'))
            return true;
        const roles = member.roles;
        if (roles instanceof discord_js_1.GuildMemberRoleManager)
            return roleIDs.some(roleID => roles.cache.some(role => role.id === roleID));
        else
            return roleIDs.some(roleID => roles.some(targetRoleID => targetRoleID === roleID));
    }
    function lackRoleTransferMessage(interaction) {
        return interaction.reply({
            ephemeral: true,
            embeds: [
                {
                    title: '⚠️ 秘匿メッセージを共有できるロールがありません',
                    description: '**共有するロール** か \`メッセージの管理\` 権限以上のロール'
                        + 'だけが秘匿メッセージを受け取れます。',
                }
            ]
        });
    }
    function notFoundTranceferMessage(interaction) {
        return interaction.reply({
            ephemeral: true,
            embeds: [{ title: '⚠️ 秘匿メッセージが削除されました' }],
        });
    }
    function messgeToEmbed(message, author) {
        const files = new discord_js_1.Collection(message.attachments.map(file => [file.name || 'unnamed', file.url]));
        const filesField = {
            name: '添付ファイル',
            value: files.map((url, name) => `[${name}](${url})`).join('\n'),
        };
        return new discord_js_1.MessageEmbed({
            author: {
                iconURL: author.displayAvatarURL(),
                name: author.tag,
            },
            description: message.content,
            fields: files.size && filesField ? [filesField] : [],
            timestamp: message.createdTimestamp,
        });
    }
    function resolveTransferMessage(interaction) {
        interaction.reply({
            ephemeral: true,
            embeds: [{ title: '✅ 秘匿メッセージをDMへ送信しました' }],
        })
            .catch(console.error);
    }
    function rejectTransferMessage(interaction) {
        interaction.reply({
            ephemeral: true,
            embeds: [
                {
                    title: '⚠️ 秘匿メッセージをDMへ送信できません',
                    description: 'サーバーにいるメンバーからのダイレクトメッセージを許可しているか、'
                        + '確認してください。',
                }
            ]
        });
    }
    async function deleteSharingMessage(interaction) {
        const channel = interaction.channel;
        const message = interaction.message;
        const author = message.interaction?.user;
        const member = interaction.member;
        if (!channel || !author || !member)
            return;
        if (member.user.id === author.id)
            await utils_1.Utils.deleteMessage(interaction.client, channel.id, message.id);
        else
            await interaction.reply({
                ephemeral: true,
                embeds: [{ title: '⚠️ このメッセージは本人のみが削除できます' }],
            });
    }
})(SecretShare = exports.SecretShare || (exports.SecretShare = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYm90L2ludGVyYWN0aW9ucy9zaGFyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FnQm9CO0FBRXBCLHVDQUFvQztBQUVwQyxJQUFpQixXQUFXLENBb1MzQjtBQXBTRCxXQUFpQixXQUFXO0lBQzFCLFNBQWdCLFVBQVUsQ0FBQyxHQUFXO1FBQ3BDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRTthQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQzdDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFeEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBTmUsc0JBQVUsYUFNekIsQ0FBQTtJQUVELE1BQU0sYUFBYSxHQUE2QjtRQUM5QztZQUNFLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUNULGlDQUFpQztZQUNuQyxPQUFPLEVBQUU7Z0JBQ1A7b0JBQ0UsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsV0FBVyxFQUFFLG1CQUFtQjtpQkFDakM7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsSUFBSSxFQUFFLE9BQU87b0JBQ2IsV0FBVyxFQUFFLDZCQUE2QjtpQkFDM0M7YUFDRjtTQUNGO0tBQ0YsQ0FBQztJQUVGLFNBQVMsWUFBWSxDQUNuQixHQUFXLEVBQUUsUUFBbUQ7UUFFaEUsTUFBTSxlQUFlLEdBQUcsYUFBYTthQUNsQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FB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