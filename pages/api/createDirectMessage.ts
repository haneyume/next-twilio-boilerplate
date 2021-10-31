// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import twilio from 'twilio';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;

  const client = twilio(accountSid, authToken);

  try {
    const user1 = req.query.user1 as string;
    const user2 = req.query.user2 as string;
    const roomName = user1 <= user2 ? user1 + '_' + user2 : user2 + '_' + user1;

    const conversation = await client.conversations.conversations.create({
      friendlyName: roomName,
      uniqueName: roomName,
      attributes: JSON.stringify({ type: 'direct' }),
    });

    await client.conversations
      .conversations(conversation.sid)
      .participants.create({ identity: user1 });

    await client.conversations
      .conversations(conversation.sid)
      .participants.create({ identity: user2 });

    await client.conversations.users(user1).update({
      attributes: JSON.stringify({
        avatar:
          user1 === '1234'
            ? 'https://randomuser.me/api/portraits/med/women/40.jpg'
            : 'https://randomuser.me/api/portraits/med/women/10.jpg',
        nickname: user1 === '1234' ? 'Rita' : 'Sam',
      }),
    });

    await client.conversations.users(user2).update({
      attributes: JSON.stringify({
        avatar:
          user2 === '1234'
            ? 'https://randomuser.me/api/portraits/med/women/40.jpg'
            : 'https://randomuser.me/api/portraits/med/women/10.jpg',
        nickname: user2 === '1234' ? 'Rita' : 'Sam',
      }),
    });

    res.status(200).json({ sid: conversation.sid });
  } catch (error) {
    console.log(error);

    const msg = (error as any).message;

    res.status(200).json({ error: msg });
  }
}
