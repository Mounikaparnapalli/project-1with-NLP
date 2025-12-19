
import { ChatMessage } from './types';

/**
 * Parses raw WhatsApp export text into structured objects.
 * Typical format: [DD/MM/YY, HH:MM:SS] Name: Message
 * Or: DD/MM/YY, HH:MM - Name: Message
 */
export const parseWhatsAppChat = (rawText: string): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  const lines = rawText.split('\n');
  
  // Standard Regex for WhatsApp format: [Date, Time] Name: Message
  // This varies by OS and region, so we use a flexible approach
  const messageRegex = /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4},?\s\d{1,2}:\d{2}(?::\d{2})?\s?[APM]?)\]?\s-?\s?([^:]+):\s(.+)$/i;

  let currentMsg: ChatMessage | null = null;

  lines.forEach((line, index) => {
    const match = line.match(messageRegex);
    if (match) {
      if (currentMsg) messages.push(currentMsg);
      currentMsg = {
        id: `msg-${index}`,
        timestamp: match[1],
        sender: match[2].trim(),
        content: match[3].trim(),
      };
    } else if (currentMsg && line.trim()) {
      // Handle multi-line messages
      currentMsg.content += `\n${line.trim()}`;
    }
  });

  if (currentMsg) messages.push(currentMsg);
  
  return messages;
};
