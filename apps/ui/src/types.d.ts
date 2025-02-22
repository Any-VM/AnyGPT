interface Conversation {
    id: string;
    name: string;
    messages: Message[];
    created: number;
    lastMessage: number;
    model: string;
}

interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: number;
}