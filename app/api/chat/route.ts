import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SYSTEM_PROMPTS, GUARDRAIL_REPROMPT, containsCode } from '@/lib/prompts'
import type { Mode } from '@/lib/types'

// Mode-specific expected sections, roughly reflecting prompts
const MODE_SECTIONS: Record<Mode, string[]> = {
  webdev: ['Problem Understanding', 'Root Cause', 'Fix Strategy', 'Pseudo-Code', 'Best Practices'],
  sql: ['Tables', 'Joins', 'Filters', 'Aggregations', 'Optimization'],
  'problem-solving': ['Brute Force', 'Better Approach', 'Optimal Approach', 'Pseudo-Code']
}

function parseGeminiResponse(text: string, mode: Mode): Record<string, string> {
  const sections = MODE_SECTIONS[mode];
  const parsedSections: Record<string, string> = {};

  let currentSection = "";
  let currentContent = "";

  const lines = text.split('\n');

  for (const line of lines) {
    // Check if line matches a known section heading
    const candidateMatches = sections.filter(s => line.toLowerCase().includes(s.toLowerCase() + ':'));
    
    // Also check for bold markdown around the heading just in case
    const candidateMatchesBold = sections.filter(s => line.toLowerCase().includes('**' + s.toLowerCase() + '**'));

    if (candidateMatches.length > 0) {
      if (currentSection) {
        parsedSections[currentSection] = currentContent.trim();
      }
      currentSection = candidateMatches[0];
      currentContent = line.replace(new RegExp(`.*${currentSection}:?`, 'i'), '').trim() + '\n';
    } else if (candidateMatchesBold.length > 0) {
      if (currentSection) {
         parsedSections[currentSection] = currentContent.trim();
      }
      currentSection = candidateMatchesBold[0];
      currentContent = line.replace(new RegExp(`.*\\*\\*${currentSection}\\*\\*:?`, 'i'), '').trim() + '\n';
    } else {
       currentContent += line + '\n';
    }
  }

  if (currentSection) {
    parsedSections[currentSection] = currentContent.trim();
  }

  // Fallback if parsing fails - just put everything in the first section
  if (Object.keys(parsedSections).length === 0) {
    parsedSections[sections[0]] = text;
  } else {
     // Ensure all expected sections are minimally present
     for (const expected of sections) {
        if (!parsedSections[expected]) {
           parsedSections[expected] = "No specific guidance provided for this section.";
        }
     }
  }

  return parsedSections;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Gemini API Key is missing' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await request.json()
    const { mode, input, attachments } = body as { mode: Mode, input: string, attachments?: { name: string, mimeType: string, dataUrl: string }[] }
    
    if (!mode || (!input && (!attachments || attachments.length === 0))) {
      return NextResponse.json({ error: 'Mode and input/attachments are required' }, { status: 400 })
    }
    
    if (!MODE_SECTIONS[mode]) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Ensure we start a chat session to pass system prompt effectively (as history)
    const chatSession = model.startChat({
        history: [
            {
               role: 'user',
               parts: [{ text: SYSTEM_PROMPTS[mode] }]
            },
            {
               role: 'model',
               parts: [{ text: "I understand the instructions and rules. I will provide structured reasoning following the exact sections required, and I will absolutely NOT include any code or syntax highlighted blocks." }]
            }
        ]
    });

    let payloadParts: any[] = [{ text: input || '' }];
    
    if (attachments && attachments.length > 0) {
       for (const file of attachments) {
         const base64Data = file.dataUrl.split(',')[1];
         if (base64Data) {
            if (file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf') {
                payloadParts.push({
                   inlineData: {
                      data: base64Data,
                      mimeType: file.mimeType
                   }
                });
            } else {
                // Decode text files instead of sending as inlineData
                try {
                   const decodedText = Buffer.from(base64Data, 'base64').toString('utf-8');
                   payloadParts.push({ text: `\n\n--- Attached File: ${file.name} ---\n${decodedText}\n--- End of File ---\n` });
                } catch(e) {
                   console.error("Failed to decode attachment", e);
                }
            }
         }
       }
    }

    let result = await chatSession.sendMessage(payloadParts);
    let text = result.response.text();

    console.log("Raw Gemini Output:\n", text);

    const hasCode = containsCode(text);
    if (hasCode) {
         console.warn("User logic guardrail triggered! Gemini returned code. Re-prompting...");
         const retryResult = await chatSession.sendMessage(GUARDRAIL_REPROMPT);
         text = retryResult.response.text();
         console.log("Retried Gemini Output:\n", text);
    }
    
    const parsedSections = parseGeminiResponse(text, mode);
    
    return NextResponse.json({ sections: parsedSections })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
