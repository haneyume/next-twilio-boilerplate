import React from 'react';
import { Conversation, Message, Participant } from '@twilio/conversations';
import moment from 'moment';
import clsx from 'clsx';

import { ChatContext } from './ChatContext';

export interface MessagePanelProps {
  conversation: Conversation;
}

export const MessagePanel = ({ conversation }: MessagePanelProps) => {
  const chatCtx = React.useContext(ChatContext);

  const [msgs, setMsgs] = React.useState<Message[]>([]);
  const [typings, setTypings] = React.useState<string[]>([]);

  React.useEffect(() => {
    conversation.getMessages().then((messages) => {
      setMsgs(messages.items);
    });

    const messageAddedFunc = (message: Message) => {
      setMsgs((prevMsgs) => [...prevMsgs, message]);
    };

    const typingStartedFunc = (participant: Participant) => {
      setTypings((prevTypings) => {
        const newTyping = participant.identity;
        if (prevTypings.includes(newTyping)) {
          return prevTypings;
        }
        return [...prevTypings, newTyping];
      });
    };

    const typingEndedFunc = (participant: Participant) => {
      setTypings((prevTypings) => {
        const newTyping = participant.identity;
        return prevTypings.filter((typing) => typing !== newTyping);
      });
    };

    conversation.on('messageAdded', messageAddedFunc);
    conversation.on('typingStarted', typingStartedFunc);
    conversation.on('typingEnded', typingEndedFunc);

    return () => {
      conversation.off('messageAdded', messageAddedFunc);
      conversation.off('typingStarted', typingStartedFunc);
      conversation.off('typingEnded', typingEndedFunc);
    };
  }, []);

  const InputBar = () => {
    const [text, setText] = React.useState<string>('');

    return (
      <div className="flex px-5 py-3 border-t border-gray-200">
        <input
          className="bg-gray-200 p-2 flex-1"
          value={text}
          onChange={(evt) => {
            conversation.typing();
            setText(evt.target.value);
          }}
          // onFocus={() => conversation.typing()}
        />

        <button
          className="ml-5"
          onClick={() => {
            conversation.sendMessage(text);
            setText('');
          }}
        >
          Send
        </button>
      </div>
    );
  };

  const MsgBubble = ({ msg }: { msg: Message }) => {
    const isMe = msg.author === chatCtx.userId;
    const date = moment(msg.dateCreated).format('HH:mm');

    return (
      <div
        className={clsx(
          'flex space-x-3 items-end',
          isMe ? 'self-end' : 'self-start',
        )}
      >
        {!isMe && (
          <img
            className="rounded-full w-10 h-10"
            src={'https://randomuser.me/api/portraits/med/women/40.jpg'}
          />
        )}

        {isMe && <div className="text-gray-500">{date}</div>}

        <div className="bg-gray-200 px-5 py-2 rounded-lg">
          <div>{msg.body}</div>
        </div>

        {!isMe && <div className="text-gray-500">{date}</div>}
      </div>
    );
  };

  return (
    <div className="flex-1 h-screen pt-12 flex flex-col">
      <div className="flex-1 px-5 py-5 space-y-3 flex flex-col">
        {msgs.map((msg, index) => {
          return <MsgBubble key={index} msg={msg} />;
        })}
      </div>

      <div className="px-5 py-1 flex space-x-5">
        {typings.map((typing, index) => {
          return (
            <div
              key={index}
              className="text-gray-500"
            >{`${typing} is typing...`}</div>
          );
        })}
      </div>

      <InputBar />
    </div>
  );
};
