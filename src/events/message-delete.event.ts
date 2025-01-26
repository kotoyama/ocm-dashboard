import { Events, Message } from 'discord.js'

import { logAction } from '~/shared/lib'

export default {
  name: Events.MessageDelete,
  execute(message: Message) {
    if (!message.author || message.author.bot || message.author.system) {
      return
    }

    return logAction(message.client, {
      channel: 'msglog',
      action: 'message-remove',
      channelId: message.channelId,
      author_id: message.author.id,
      content: message.content,
      attachments: message.attachments,
    })
  },
}
