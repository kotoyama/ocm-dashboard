import { Events, Message } from 'discord.js'

import { logAction } from '~/shared/lib'

export default {
  name: Events.MessageUpdate,
  execute(oldMessage: Message, newMessage: Message) {
    if (
      !newMessage.author ||
      newMessage.author.bot ||
      newMessage.author.system ||
      !newMessage.content ||
      oldMessage.content === newMessage.content
    ) {
      return
    }

    return logAction(newMessage.client, {
      channel: 'msglog',
      action: 'message-update',
      channelId: newMessage.channelId,
      author_id: newMessage.author.id,
      beforeContent: oldMessage.content,
      afterContent: newMessage.content,
    })
  },
}
