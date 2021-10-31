import React from 'react';
import { Client, Conversation } from '@twilio/conversations';

export interface ChatContextProps {
  initialized: boolean;
  setInitiaized: React.Dispatch<React.SetStateAction<boolean>>;

  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;

  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;

  myConversations: Conversation[];
  setMyConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

export const ChatContext = React.createContext<ChatContextProps>(undefined!);

export interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [initialized, setInitiaized] = React.useState(false);
  const [userId, setUserId] = React.useState<string>('');
  const [token, setToken] = React.useState<string>('');
  const [myConversations, setMyConversations] = React.useState<Conversation[]>(
    [],
  );

  React.useEffect(() => {
    let client: Client;

    if (token !== '') {
      client = new Client(token);

      client.on('stateChanged', (state) => {
        if (state === 'initialized') {
          setInitiaized(true);

          // alert(JSON.stringify(client.user.attributes));

          client.getSubscribedConversations().then((conversations) => {
            setMyConversations(conversations.items);
          });
        }
      });
    }

    return () => {
      if (client) {
        client.shutdown();
      }
    };
  }, [token]);

  return (
    <ChatContext.Provider
      value={{
        initialized,
        setInitiaized,
        userId,
        setUserId,
        token,
        setToken,
        myConversations,
        setMyConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
