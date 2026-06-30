const answers = [
  {
    keys: ["hi", "hello", "hey", "good morning", "good afternoon"],
    reply: "Hi! Welcome to ClariBot support. I can help with refunds, delivery, contact details, opening hours, products, pricing, or human escalation.",
    status: "open",
    sentiment: "positive",
  },
  {
    keys: ["refund", "return", "money back", "cancel", "cancellation"],
    reply: "Refunds are reviewed within 1-2 business days. Please send your order number, purchase email, and refund reason.",
    status: "escalated",
    sentiment: "negative",
  },
  {
    keys: ["delivery", "shipping", "track", "tracking", "late order", "where is my order"],
    reply: "Delivery usually takes 3-7 business days. Please share your order number so I can help check the delivery status or escalate a delayed shipment.",
    status: "open",
    sentiment: "neutral",
  },
  {
    keys: ["contact", "phone", "email", "call", "customer service"],
    reply: "You can contact support at support@claribot.com. For urgent issues, include your account email and order number.",
    status: "resolved",
    sentiment: "neutral",
  },
  {
    keys: ["opening hours", "business hours", "when are you open", "working hours", "hours"],
    reply: "Our support team is available Monday to Friday, 9:00 AM to 6:00 PM. The AI assistant is available 24/7.",
    status: "resolved",
    sentiment: "positive",
  },
  {
    keys: ["product", "products", "items", "catalog", "what do you sell"],
    reply: "We offer AI-powered customer support tools including live chat, saved conversations, admin analytics, lead capture, exports, and escalation workflows.",
    status: "open",
    sentiment: "neutral",
  },
  {
    keys: ["pricing", "price", "cost", "price list", "how much", "plans"],
    reply: "Pricing depends on the plan and business needs. Starter is for small teams, Growth adds analytics and exports, and Enterprise supports advanced workflows.",
    status: "open",
    sentiment: "neutral",
  },
  {
    keys: ["human", "agent", "representative", "talk to someone", "escalate"],
    reply: "I can escalate your issue to a human agent. Please provide your order number and a brief description of the problem.",
    status: "escalated",
    sentiment: "neutral",
  },
];

export function makeBotReply(text) {
  const lower = String(text || "").toLowerCase();
  const match = answers.find((answer) =>
    answer.keys.some((key) => lower.includes(key))
  );

  if (match) return match.reply;

  return "Thanks for your message. I can help with refunds, delivery, contact information, opening hours, products, pricing, or human escalation.";
}

export function classify(text) {
  const lower = String(text || "").toLowerCase();
  const match = answers.find((answer) =>
    answer.keys.some((key) => lower.includes(key))
  );

  if (match) {
    return {
      sentiment: match.sentiment,
      status: match.status,
    };
  }

  return {
    sentiment: "neutral",
    status: "open",
  };
}