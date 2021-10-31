// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import twilio from 'twilio';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const apiKey = process.env.TWILIO_API_KEY!;
  const apiSecret = process.env.TWILIO_API_SECRET!;
  const serviceSid = process.env.TWILIO_SERVICE_SID!;

  try {
    const AccessToken = twilio.jwt.AccessToken;
    const ChatGrant = AccessToken.ChatGrant;

    const chatGrant = new ChatGrant({
      serviceSid: serviceSid,
    });

    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity: req.query.id as string,
    });

    token.addGrant(chatGrant);

    res.status(200).json({ token: token.toJwt() });
  } catch (error) {
    console.log(error);

    const msg = (error as any).message;

    res.status(200).json({ error: msg });
  }
}
