import React from 'react';
import moment from 'moment';
import clsx from 'clsx';

import * as C from '../components';
import { Conversation } from '@twilio/conversations';

export default function Home() {
  const chatCtx = React.useContext(C.ChatContext);

  const [selectedSid, setSelectedSid] = React.useState<string>('');

  React.useEffect(() => {
    const id = prompt('Enter your ID');
    if (id !== '') {
      chatCtx.setUserId(id!);
    }
  }, []);

  React.useEffect(() => {
    if (chatCtx.userId !== '') {
      fetch(`/api/getToken?id=${chatCtx.userId}`)
        .then((res) => res.json())
        .then((data) => chatCtx.setToken(data.token));
    }
  }, [chatCtx.userId]);

  if (!chatCtx.initialized) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen relative">
      <div className="flex justify-end bg-gray-800 absolute left-0 right-0">
        <div className="h-12 px-5 flex items-center text-white">{`Account: ${chatCtx.userId}`}</div>
      </div>

      <div className="flex">
        <div className="w-64 h-screen bg-gray-200 pt-16 pb-5">
          {chatCtx.myConversations.map((conversation, index) => (
            <ChatListItem
              key={index}
              active={conversation.sid === selectedSid}
              conversation={conversation}
              onClick={() => setSelectedSid(conversation.sid)}
            />
          ))}
        </div>

        {selectedSid !== '' && (
          <C.MessagePanel
            key={selectedSid}
            conversation={
              chatCtx.myConversations.filter(
                (item) => item.sid === selectedSid,
              )[0]
            }
          />
        )}
      </div>
    </div>
  );
}

const ChatListItem = ({
  active,
  conversation,
  onClick,
}: {
  active: boolean;
  conversation: Conversation;
  onClick: () => void;
}) => {
  const chatCtx = React.useContext(C.ChatContext);

  const [avatar, setAvatar] = React.useState<string>('');
  const [nickname, setNickname] = React.useState<string>('');
  const [unreadCount, setUnreadCount] = React.useState<number>(0);
  const [lastMessage, setLastMessage] = React.useState<string>('');
  const [isOnline, setIsOnline] = React.useState<boolean>(false);

  React.useEffect(() => {
    conversation.getUnreadMessagesCount().then((count) => {
      setUnreadCount(count || 0);
    });

    if (conversation.attributes.type === 'direct') {
      conversation
        .getParticipants()
        .then((participants) => {
          return Promise.all(
            participants.map((participant) => participant.getUser()),
          );
        })
        .then((users) => {
          const user = users.filter(
            (user) => user.identity !== chatCtx.userId,
          )[0];

          setAvatar(user.attributes.avatar);
          setNickname(user.attributes.nickname);
        });
    } else {
      setNickname('Unknown');
    }

    conversation.getMessages(1).then((messages) => {
      if (messages.items.length > 0) {
        setLastMessage(messages.items[0].body);
      }
    });
  }, []);

  return (
    <div
      className={clsx(
        'flex items-center cursor-pointer px-5 py-3',
        active ? 'bg-gray-300' : '',
      )}
      onClick={onClick}
    >
      <img className="rounded-full w-10 h-10" src={avatar} />

      <div className="ml-3">
        <div>{nickname}</div>
        <div>{lastMessage}</div>
        <div>{moment(conversation.dateUpdated).format('YYYY-MM-DD')}</div>
        {/* <div>{unreadCount}</div> */}
      </div>
    </div>
  );
};
