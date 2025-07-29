/**
 * Displays a chat message as a styled bubble. Messages from the user are
 * aligned to the right with a green background, while agent messages are
 * aligned to the left with a blue background. Long messages wrap onto
 * multiple lines gracefully.
 */
export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const alignment = isUser ? 'items-end' : 'items-start';
  const bubbleColor = isUser ? 'bg-green-100' : 'bg-blue-100';
  const textColor = 'text-gray-900';
  return (
    <div className={`flex ${alignment} my-1 px-2`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg ${bubbleColor} ${textColor} p-3 rounded-xl shadow`}
      >
        {message.text}
      </div>
    </div>
  );
}