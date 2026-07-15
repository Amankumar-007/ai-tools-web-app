import {
    Bot, HeadphonesIcon, Rocket, BookOpen, Code, Mail, LineChart, Search, FileText, Cpu, Database, Blocks, Network, ShieldCheck
} from 'lucide-react';

export interface AgentStep {
    id: string;
    title: string;
    description: string;
    actionType: 'setup' | 'code' | 'prompt' | 'deploy';
    content?: string; // Markdown or code snippet
    toolName: string;
    toolUrl: string;
}

export interface AgentWorkflow {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedTime: string;
    prerequisites: string[];
    architecture: {
        trigger: string;
        brain: string;
        action: string;
    };
    steps: AgentStep[];
}

export const agentWorkflows: AgentWorkflow[] = [
    {
        id: 'customer-support-agent',
        slug: 'customer-support-agent',
        title: 'Customer Support AI Agent',
        description: 'Build a fully autonomous customer support agent that reads emails, queries your knowledge base, and drafts replies.',
        icon: HeadphonesIcon,
        color: 'from-blue-500 to-indigo-600',
        difficulty: 'Intermediate',
        estimatedTime: '2 Hours',
        prerequisites: ['OpenAI API Key', 'n8n Cloud or Local Account', 'Zendesk/Gmail Account'],
        architecture: {
            trigger: 'Incoming Email / Ticket (Webhook)',
            brain: 'OpenAI GPT-4o + Vector DB (Pinecone)',
            action: 'Draft Reply in Zendesk / Send via Gmail'
        },
        steps: [
            {
                id: 'step-1-trigger',
                title: 'Phase 1: Set up the Ingestion Trigger',
                description: 'First, we need our agent to listen for incoming support requests. We will use n8n to connect to your Gmail or Zendesk.',
                actionType: 'setup',
                toolName: 'n8n',
                toolUrl: 'https://n8n.io',
                content: `1. Log into your n8n workspace.\n2. Add a new **Gmail Trigger** node or **Webhook** node.\n3. Configure it to trigger on "Message Received".\n4. Extract the \`subject\`, \`sender\`, and \`body_text\`.`
            },
            {
                id: 'step-2-knowledge',
                title: 'Phase 2: Connect Knowledge Base (RAG)',
                description: 'To prevent hallucinations, the agent needs context. We fetch related articles from a Vector Store.',
                actionType: 'code',
                toolName: 'Pinecone',
                toolUrl: 'https://pinecone.io',
                content: `// Sample Python script to populate your Pinecone DB with FAQ data
import pinecone
from langchain.embeddings.openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
index = pinecone.Index("support-kb")
index.upsert(vectors=[
    ("faq-1", embeddings.embed_query("Refund policy: 30 days..."), {"category": "billing"}),
])`
            },
            {
                id: 'step-3-prompt',
                title: 'Phase 3: The System Prompt',
                description: 'Configure the AI node with a strict system prompt that enforces brand voice and restricts capabilities.',
                actionType: 'prompt',
                toolName: 'OpenAI',
                toolUrl: 'https://platform.openai.com',
                content: `You are an empathetic, professional Customer Support Agent for [Your Company].
Your goal is to answer the customer's query using ONLY the provided context from our knowledge base.

Context: {{ $json.knowledge_base_results }}
Customer Email: {{ $json.body_text }}

Rules:
1. If the answer is not in the context, apologize and say a human agent will follow up.
2. Never promise refunds unless explicitly authorized by the context.
3. Keep the tone friendly and concise.`
            },
            {
                id: 'step-4-deploy',
                title: 'Phase 4: Draft or Send',
                description: 'Connect the output of the OpenAI node to an email sender or ticket updater.',
                actionType: 'deploy',
                toolName: 'Zendesk',
                toolUrl: 'https://zendesk.com',
                content: `1. Add a **Zendesk Node** (or Gmail node).\n2. Set the Action to "Update Ticket".\n3. Map the AI's response to the Internal Note or Public Reply field.\n4. Activate the workflow!`
            }
        ]
    },
    {
        id: 'research-agent',
        slug: 'research-agent',
        title: 'Deep Research Agent',
        description: 'An autonomous agent that searches the web, scrapes articles, and synthesizes 10-page research reports on any topic.',
        icon: Search,
        color: 'from-emerald-500 to-teal-600',
        difficulty: 'Advanced',
        estimatedTime: '3 Hours',
        prerequisites: ['Tavily API Key', 'Anthropic Claude API Key', 'LangChain / Python Environment'],
        architecture: {
            trigger: 'User Query (CLI or Web UI)',
            brain: 'Claude 3.5 Sonnet (ReAct Pattern)',
            action: 'Web Search + Scraping + Markdown Generation'
        },
        steps: [
            {
                id: 'step-1-setup',
                title: 'Phase 1: Environment Setup',
                description: 'Initialize a Python environment and install the necessary agentic frameworks.',
                actionType: 'setup',
                toolName: 'Python / LangChain',
                toolUrl: 'https://python.langchain.com/',
                content: `pip install langchain-anthropic langchain-community tavily-python python-dotenv\ntouch agent.py .env`
            },
            {
                id: 'step-2-tools',
                title: 'Phase 2: Define Agent Tools',
                description: 'Give the agent the ability to search the web and scrape pages.',
                actionType: 'code',
                toolName: 'Tavily',
                toolUrl: 'https://tavily.com',
                content: `from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.document_loaders import WebBaseLoader

search_tool = TavilySearchResults(max_results=5)

def scrape_webpage(url: str):
    loader = WebBaseLoader(url)
    return loader.load()[0].page_content

tools = [search_tool, scrape_webpage]`
            },
            {
                id: 'step-3-prompt',
                title: 'Phase 3: The ReAct Prompt',
                description: 'Instruct the agent to think step-by-step and use its tools iteratively.',
                actionType: 'prompt',
                toolName: 'Claude',
                toolUrl: 'https://anthropic.com',
                content: `You are an expert Research Analyst. 
Given a topic, you must:
1. Search the web for recent, highly credible sources.
2. Scrape the full content of the most relevant URLs.
3. Synthesize the findings into a comprehensive, deeply technical 10-page report using Markdown.

You have access to the following tools: {tool_names}
Use them wisely. Always cite your sources.`
            }
        ]
    },
    {
        id: 'outbound-lead-agent',
        slug: 'outbound-lead-agent',
        title: 'Outbound Lead Gen Agent',
        description: 'Automatically discover target companies, find decision-makers, and draft hyper-personalized cold outreach emails.',
        icon: Rocket,
        color: 'from-orange-500 to-red-600',
        difficulty: 'Intermediate',
        estimatedTime: '1.5 Hours',
        prerequisites: ['Apollo.io API', 'OpenAI API', 'Make.com Account'],
        architecture: {
            trigger: 'Weekly Schedule (Cron)',
            brain: 'OpenAI GPT-4o (Personalization Engine)',
            action: 'Draft Email in Instantly.ai / Lemlist'
        },
        steps: [
            {
                id: 'step-1-trigger',
                title: 'Phase 1: Scheduled Lead Extraction',
                description: 'Set up a recurring trigger that polls a B2B database for companies matching your Ideal Customer Profile.',
                actionType: 'setup',
                toolName: 'Make.com',
                toolUrl: 'https://make.com',
                content: `1. In Make.com, add a **Timer** module set to run every Monday at 9 AM.\n2. Connect it to an **Apollo.io** or **Clearbit** module to search for "VP of Engineering in SaaS".\n3. Iterate through the results.`
            },
            {
                id: 'step-2-research',
                title: 'Phase 2: Contextual Research',
                description: 'Use the target company\'s URL to scrape their recent news or homepage to find a personalization angle.',
                actionType: 'code',
                toolName: 'ScrapingBee',
                toolUrl: 'https://scrapingbee.com',
                content: `// Node.js example for web scraping via API
const axios = require('axios');
const response = await axios.get('https://app.scrapingbee.com/api/v1/', {
    params: {
        'api_key': 'YOUR_API_KEY',
        'url': companyUrl,
        'extract_rules': '{"headline":"h1","latest_news":".news-item"}'
    }
});
const companyData = response.data;`
            },
            {
                id: 'step-3-prompt',
                title: 'Phase 3: Hyper-Personalized Copy',
                description: 'Generate a unique, non-spammy cold email using the scraped data.',
                actionType: 'prompt',
                toolName: 'OpenAI',
                toolUrl: 'https://platform.openai.com',
                content: `Write a cold email to {{ lead.first_name }}, the {{ lead.title }} at {{ company.name }}.

Company Context: {{ scraped_data.latest_news }}

Rules:
1. Max 100 words.
2. The opening sentence MUST reference their recent news or company mission.
3. Soft call to action (e.g., "Open to a quick chat?").
4. No buzzwords.`
            }
        ]
    }
];
