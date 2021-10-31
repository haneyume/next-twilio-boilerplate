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
    const participant = await client.conversations
      .conversations(req.query.conv as string)
      .participants.create({
        identity: req.query.id as string,
      });

    res.status(200).json({ sid: participant.sid });
  } catch (error) {
    console.log(error);

    const msg = (error as any).message;

    res.status(200).json({ error: msg });
  }
}
