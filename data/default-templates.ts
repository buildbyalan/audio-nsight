import { Template } from "@/types/template";

export const defaultTemplates: Record<string, Template[]> = {
  "Interviews": [
    {
      id: "software-engineer-interview",
      name: "Software Engineer Interview",
      description: "Template for technical interviews with software engineers, including technical assessment and behavioral questions",
      category: "Interviews",
      subcategory: "Technical",
      fields: [
        { id: "1", name: "Candidate Name", type: "name", required: true },
        { id: "2", name: "Technical Skills Discussed", type: "keyFinding" },
        { id: "3", name: "Problem Solving Examples", type: "quote" },
        { id: "4", name: "System Design Discussion", type: "text" },
        { id: "5", name: "Interview Date", type: "date", required: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true
    },
    {
      id: "marketing-interview",
      name: "Marketing Interview",
      description: "Template for interviewing marketing professionals, focusing on campaign experience and strategic thinking",
      category: "Interviews",
      subcategory: "Marketing",
      fields: [
        { id: "1", name: "Candidate Name", type: "name", required: true },
        { id: "2", name: "Campaign Examples", type: "keyFinding" },
        { id: "3", name: "Marketing Strategy Insights", type: "quote" },
        { id: "4", name: "Interview Date", type: "date", required: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true
    }
  ],
  "Sales Calls": [
    {
      id: "sales-discovery-call",
      name: "Sales Discovery Call",
      description: "Template for initial sales discovery calls to understand client needs and pain points",
      category: "Sales Calls",
      fields: [
        { id: "1", name: "Client Name", type: "name", required: true },
        { id: "2", name: "Company Name", type: "text", required: true },
        { id: "3", name: "Pain Points", type: "keyFinding" },
        { id: "4", name: "Budget Discussion", type: "quote" },
        { id: "5", name: "Next Steps", type: "text" },
        { id: "6", name: "Call Date", type: "date", required: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true
    }
  ],
  "Court Cases": [
    {
      id: "witness-testimony",
      name: "Witness Testimony",
      description: "Template for recording and analyzing witness testimonies in legal proceedings",
      category: "Court Cases",
      fields: [
        { id: "1", name: "Witness Name", type: "name", required: true },
        { id: "2", name: "Case Number", type: "text", required: true },
        { id: "3", name: "Key Statements", type: "quote" },
        { id: "4", name: "Important Dates Mentioned", type: "date" },
        { id: "5", name: "Critical Evidence", type: "keyFinding" },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true
    }
  ],
  "Podcasts": [
    {
      id: "interview-podcast",
      name: "Interview Podcast",
      description: "Template for podcast episodes featuring guest interviews",
      category: "Podcasts",
      fields: [
        { id: "1", name: "Guest Name", type: "name", required: true },
        { id: "2", name: "Episode Title", type: "text", required: true },
        { id: "3", name: "Key Takeaways", type: "keyFinding" },
        { id: "4", name: "Notable Quotes", type: "quote" },
        { id: "5", name: "Topics Discussed", type: "text" },
        { id: "6", name: "Recording Date", type: "date" },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true
    }
  ],
  "Voice Notes": [
    {
      id: "meeting-notes",
      name: "Meeting Notes",
      description: "Template for capturing and organizing meeting discussions and action items",
      category: "Voice Notes",
      fields: [
        { id: "1", name: "Meeting Title", type: "text", required: true },
        { id: "2", name: "Participants", type: "name", required: true },
        { id: "3", name: "Key Decisions", type: "keyFinding" },
        { id: "4", name: "Action Items", type: "text" },
        { id: "5", name: "Important Quotes", type: "quote" },
        { id: "6", name: "Meeting Date", type: "date", required: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true
    }
  ],
  "Debates": [
    {
      id: "academic-debate",
      name: "Academic Debate",
      description: "Template for academic debates and discussions",
      category: "Debates",
      fields: [
        { id: "1", name: "Topic", type: "text", required: true },
        { id: "2", name: "Participants", type: "name", required: true },
        { id: "3", name: "Key Arguments", type: "keyFinding" },
        { id: "4", name: "Notable Quotes", type: "quote" },
        { id: "5", name: "Conclusions", type: "text" },
        { id: "6", name: "Debate Date", type: "date", required: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true
    }
  ],
  "My Templates": [],
};
