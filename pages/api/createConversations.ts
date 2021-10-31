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
    const conversation = await client.conversations.conversations.create({
      friendlyName: 'My First Conversation',
    });

    res.status(200).json({ sid: conversation.sid });
  } catch (error) {
    console.log(error);

    const msg = (error as any).message;

    res.status(200).json({ error: msg });
  }
}
