import { GoogleGenAI, GenerateContentConfig } from "@google/genai";

// --- START: Types duplicated from frontend/types.ts for self-containment ---
enum EventType {
  Wedding = 'Wedding',
  Corporate = 'Corporate Event',
  PrivateParty = 'Private Party',
}
enum TemplateType {
  Agreement = 'Service Agreement',
  DepositTerms = 'Deposit Terms',
  EmailFollowUp = 'Email Follow-up',
  CreativeContent = 'Creative Content',
  MusicPlaylists = 'Music Planning & Playlists',
  SalesAssistant = 'Sales Assistant (Objection Handling)',
  EventChecklist = 'Event Checklist',
  PreEventQuestionnaire = 'Pre-Event Questionnaire',
  PostEventQuestionnaire = 'Post-Event Feedback & Testimonial',
  EventTimeline = 'Event Timeline Builder',
}
enum EmailFollowUpType {
  PreBooking = 'Pre-booking Inquiry Response',
  PostBooking = 'Post-booking Confirmation',
  PreEvent = 'One Week Before Event Check-in',
  PostEvent = 'Post-event Thank You & Review Request',
  ReferralRequest = 'Post-event Referral Request',
}
enum OutputTone {
  Professional = 'Professional',
  Friendly = 'Friendly & Casual',
  Energetic = 'Energetic & Fun',
  Concise = 'Concise & To-the-Point',
}
type RefinementAction =
  | 'Make it more professional'
  | 'Make it more casual'
  | 'Make it shorter'
  | 'Add more energy';
enum CreativeContentType {
  MC_Scripts = 'Gig Assistant (MC Scripts)',
  SocialMediaPost = 'Social Media Post',
  BlogPost = 'Blog Post for Website/SEO',
  AI_Image_For_Social_Media = 'AI Image for Social Media',
  AI_Video_For_Social_Media = 'AI Video for Social Media',
}
enum MC_Script_Type {
  GrandEntrance = 'Grand Entrance',
  DinnerIntro = 'Dinner Introduction',
  DanceFloorOpening = 'Dance Floor Opening',
  PersonalizedStory = 'Personalized Client Story',
  LastCall = 'Last Call / Wind Down',
  ClosingRemarks = 'Closing Remarks & Send-off',
}
enum SocialMediaPlatform {
  Instagram = 'Instagram',
  Facebook = 'Facebook',
  TwitterX = 'Twitter / X',
}
enum PlaylistType {
  Dinner = 'Dinner Music',
  CocktailHour = 'Cocktail Hour',
  OpenDancing = 'Open Dancing',
  Ceremony = 'Ceremony Selections',
  Custom = 'Custom Playlist',
}
enum SalesObjectionType {
  PriceTooHigh = 'My price is too high',
  CheaperPackage = 'Do you have a cheaper package?',
  JustNeedMusic = 'I just need someone to play music',
  SpotifyPlaylist = 'Why not just use a Spotify playlist?',
  FriendDJ = 'My friend can DJ for free/cheap',
  NotSure = 'I need to think about it / talk to my partner',
}
// --- END: Types ---

interface GenerateTemplateParams {
    eventType: EventType;
    templateType: TemplateType;
    tone: OutputTone;
    brandVoice?: string;
    emailFollowUpType?: EmailFollowUpType;
    clientName?: string;
    djName?: string;
    eventDate?: string;
    venue?: string;
    totalCost?: string;
    depositAmount?: string;
    depositDueDate?: string;
    paymentMethods?: string;
    eventStartTime?: string;
    eventEndTime?: string;
    creativeContentType?: CreativeContentType;
    mcScriptType?: MC_Script_Type;
    clientFunFacts?: string;
    socialMediaPlatform?: SocialMediaPlatform;
    postTopic?: string;
    playlistType?: PlaylistType;
    genreVibe?: string;
    mustPlaySongs?: string;
    doNotPlaySongs?: string;
    salesObjectionType?: SalesObjectionType;
    isRefinement: boolean;
    refinementAction?: RefinementAction;
    originalText?: string;
}

// The API key is accessed via process.env.API_KEY.
// This is set in the Netlify UI, not in the code.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


/**
 * Logic for creating the detailed prompt for the Gemini API.
 * This now lives on the backend to keep it secure and centralized.
 */
function createPrompt(params: GenerateTemplateParams): string {
    if (params.isRefinement && params.refinementAction && params.originalText) {
        return `You are an expert text editor for a professional DJ. Your task is to refine the following text.
        
        Refinement instruction: "${params.refinementAction}"
        
        Original Text:
        ---
        ${params.originalText}
        ---
        
        Produce only the refined text as the output. Do not add any extra commentary.`;
    }
    
    const { eventType, templateType, tone, brandVoice } = params;
    const brandVoiceInstruction = brandVoice 
        ? `Adapt your writing style to match the DJ's brand voice: "${brandVoice}".`
        : '';
    
    const baseInstruction = `You are a world-class business consultant for professional DJs. Your task is to generate a well-structured, professional, and clear document. The tone should be ${tone}. The output should be plain text, ready to be copied. ${brandVoiceInstruction}`;

    const formFormattingInstruction = `
    IMPORTANT: Structure the output for easy conversion into a Google Form. For each question or checklist item, specify the suggested question type in brackets, like [Short Answer], [Paragraph], [Multiple Choice], [Checkboxes], or [Linear Scale 1-5]. Start each item on a new line.`;


    switch (templateType) {
        case TemplateType.SalesAssistant:
             return `You are an expert sales coach and copywriter for professional DJs. Your task is to generate 2-3 distinct, professional, and persuasive email/message responses to a common client objection. The goal is to overcome the objection by highlighting value, building trust, and gently guiding the potential client toward booking.

            Client Objection: "${params.salesObjectionType}"
            
            DJ Name: ${params.djName || '[Your Name/Company]'}
            Client Name: ${params.clientName || '[Client Name]'}
            Your Quoted Price: $${params.totalCost || '[Your Price]'}

            Instructions:
            - Create 2-3 distinct versions, each with a different strategic approach.
            - Version 1 should focus on **Value & Experience**. Explain what the client is getting for the price beyond just "playing music" (e.g., MCing, planning, professional equipment, peace of mind).
            - Version 2 should be **Empathetic & Solution-Oriented**. Acknowledge their concern and see if there are ways to adjust the package or payment plan without devaluing your service.
            - Version 3 can be **Short, Confident & Direct**, for when you want to firmly but politely hold your ground.
            - Clearly label each version (e.g., "--- OPTION 1: The Value-Driven Approach ---").
            - The tone should be ${tone}, but always professional and helpful. ${brandVoiceInstruction}
            - Use placeholders where appropriate.
            - Do not add any extra commentary before or after the responses.`;

        case TemplateType.MusicPlaylists:
            return `You are an expert DJ and music curator with deep knowledge across all genres and decades. Your task is to generate a list of song suggestions for a client's event.

            Event Type: ${eventType}
            Client: ${params.clientName || '[Client Name]'}
            Playlist for: ${params.playlistType}
            
            Desired Genre / Vibe: 
            "${params.genreVibe || 'DJ\'s choice'}"
            
            Client's Must-Play Songs (incorporate these and similar vibes):
            ---
            ${params.mustPlaySongs || 'None specified'}
            ---
            
            Client's Do-Not-Play List (strictly avoid these artists/songs):
            ---
            ${params.doNotPlaySongs || 'None specified'}
            ---

            Instructions:
            - Generate a list of 20-30 song suggestions that fit the client's request.
            - Format the output as a numbered list with "Artist - Song Title".
            - The suggestions should be thoughtful and create a cohesive flow for the specified part of the event.
            - Ensure your suggestions are appropriate for a ${eventType}.
            - Do not include any songs or artists from the Do-Not-Play list.
            - Begin the output with a clear title, like "### ${params.playlistType} Suggestions for ${params.clientName || 'the Event'}".
            - Do not add any extra commentary or introduction before the title.`;

        case TemplateType.CreativeContent:
            if (params.creativeContentType === CreativeContentType.MC_Scripts) {
                 if (params.mcScriptType === MC_Script_Type.PersonalizedStory) {
                    return `You are a charismatic and professional event MC and storyteller, acting as an assistant for another DJ.
                    
                    Your task is to generate 3 distinct, short, and engaging stories or introductions that a DJ can use live at an event. These stories should be based on the personal facts provided about the client(s). The goal is to create a warm, memorable, and personalized moment.

                    Event Type: ${eventType}
                    Client(s) Name: ${params.clientName || '[Client Name(s)]'}
                    DJ Name: ${params.djName || '[DJ Name]'}

                    Client Fun Facts (use these to build the story):
                    ---
                    ${params.clientFunFacts || 'No facts provided.'}
                    ---

                    Instructions:
                    - Create three versions, each with a different emotional angle.
                    - Version 1 should be **Heartfelt & Sweet**.
                    - Version 2 should be **Funny & High-Energy**.
                    - Version 3 should be **Cool & Charming**.
                    - Clearly label each version (e.g., "--- OPTION 1: Heartfelt ---").
                    - Keep each script concise (30-60 seconds when spoken) and easy to deliver.
                    - The tone should be ${tone}. ${brandVoiceInstruction}
                    - End each script with a clear call to action (e.g., "...Let's hear it for them!", "...let's get them on the dance floor!").`;
                }
                return `You are a charismatic and experienced professional event MC, acting as an assistant for another DJ.
                
                Your task is to generate 3 distinct script options for a DJ to say during a ${eventType}.
                
                Event Moment: ${params.mcScriptType}
                Client(s) Name: ${params.clientName || '[Client Name(s)]'}
                DJ Name: ${params.djName || '[DJ Name]'}
                
                Instructions:
                - Create three versions, each with a slightly different personality.
                - Version 1 should be **High-Energy & Fun**.
                - Version 2 should be **Cool, Confident & Modern**.
                - Version 3 should be **Warm, Elegant & Formal**.
                - Clearly label each version (e.g., "--- OPTION 1: High-Energy ---").
                - Keep each script concise, typically 30-60 seconds when spoken.
                - Use placeholders like [Song Name] or [Next Event Item] where appropriate.`;
            }
            if (params.creativeContentType === CreativeContentType.SocialMediaPost) {
                return `You are a social media marketing expert specializing in the events industry, specifically for DJs.
                
                Your task is to write a compelling social media post for ${params.djName || '[DJ Name]'}.
                
                Platform: ${params.socialMediaPlatform}
                Post Goal/Topic: "${params.postTopic || 'A recap of a great event.'}"
                
                Instructions:
                - Write in a tone that is ${tone}. ${brandVoiceInstruction}
                - Tailor the post to the specific platform.
                - For **Instagram**, focus on an engaging caption that tells a story or asks a question. Provide a block of 5-10 relevant, popular hashtags.
                - For **Facebook**, write a slightly longer, more conversational post. Encourage comments and sharing.
                - For **Twitter / X**, keep it concise and punchy. Use 2-3 key hashtags.
                - The post should be ready to copy and paste. Do not include any meta-commentary.`;
            }
             if (params.creativeContentType === CreativeContentType.BlogPost) {
                return `You are a social media and SEO marketing expert for DJs. Your task is to write an engaging, helpful, and SEO-friendly blog post based on the following topic.
                
                Blog Post Topic: "${params.postTopic || 'A Guide to Wedding Music Planning'}"
                Target Audience: Potential clients planning events (weddings, corporate parties, etc.).
                
                Instructions:
                - The tone should be ${tone}. ${brandVoiceInstruction}
                - The article should be well-structured with a clear title, an introduction, several sub-headings (using markdown like '### Subheading'), and a conclusion.
                - The content must be accurate, informative, and up-to-date.
                - Naturally include keywords related to the topic.
                - End with a call-to-action encouraging readers to contact ${params.djName || 'us'} for their next event.
                - Do not add any extra commentary before the title or after the post. Output only the blog post content.`;
            }
            return `Please generate helpful creative content for a DJ.`;

        case TemplateType.Agreement:
            return `${baseInstruction}
            
            Generate a comprehensive DJ service agreement for a ${eventType}.
            
            Details:
            - Parties Involved: ${params.djName || '[DJ Name/Company]'} (Hereinafter "DJ") and ${params.clientName || '[Client Name(s)]'} (Hereinafter "Client").
            - Event Type: ${eventType}
            - Event Date: ${params.eventDate || '[Event Date]'}
            - Venue: ${params.venue || '[Venue Name & Address]'}
            - Service Period: [Specify Start and End Times, e.g., 6:00 PM to 11:00 PM]
            - Total Fee: $${params.totalCost || '[Total Cost]'}
            - Deposit: $${params.depositAmount || '[Deposit Amount]'} required to secure the date.
            - Final Balance Due: [Specify Date, e.g., 14 days prior to the event]
            
            The agreement must include the following sections, clearly titled:
            1.  **Parties**: Defines the DJ and Client.
            2.  **Event Details**: Summarizes date, time, and location.
            3.  **Services Provided**: Details the DJ/MC services, equipment provided (sound system, microphones, basic lighting).
            4.  **Payment Schedule**: Outlines total fee, deposit amount and due date, and final balance due date.
            5.  **Cancellation Policy**: Clear terms for cancellation by either the Client or the DJ.
            6.  **Overtime**: Specifies the hourly rate for services extending beyond the agreed time.
            7.  **DJ Requirements**: Client's responsibility to provide adequate power, a safe working environment, and protection from elements if outdoors.
            8.  **Music & Planning**: Mentions the process for music requests and planning.
            9.  **Liability & Indemnification**: Standard limitation of liability clause.
            10. **Model Release**: A clause allowing the DJ to use photos/videos from the event for promotional purposes (optional, but good to include).
            11. **Entire Agreement**: Standard clause stating this document is the entire agreement.
            12. **Signatures**: Lines for both DJ and Client signatures and dates.`;

        case TemplateType.DepositTerms:
            return `${baseInstruction}
            
            Generate a clear and concise "Deposit and Payment Terms" document. This is often sent with an invoice or included in an agreement.
            
            Details:
            - Event Type: ${eventType}
            - Total Cost: $${params.totalCost || '[Total Cost]'}
            - Deposit Amount: $${params.depositAmount || '[Deposit Amount]'}
            - Deposit Due Date: ${params.depositDueDate || '[Deposit Due Date]'}
            - Accepted Payment Methods: ${params.paymentMethods || '[List of Payment Methods]'}
            
            The document should clearly state:
            - The purpose of the deposit is to secure the event date, making it non-refundable.
            - The deposit amount and due date.
            - The remaining balance and its due date (e.g., 14 days before the event).
            - How payments can be made.
            - What happens if a payment is late.`;

        case TemplateType.EmailFollowUp:
            let followUpInstruction = '';
            if (params.emailFollowUpType === EmailFollowUpType.ReferralRequest) {
                followUpInstruction = `The purpose of this email is to politely request referrals from a happy client a week or two after their event. Mention how much you enjoyed their event. Briefly explain that your business grows through word-of-mouth. You can optionally include a small incentive for a successful referral.`;
            }
            return `${baseInstruction}
            
            Generate a professional email template for a DJ.
            
            Email Type: ${params.emailFollowUpType} for a ${eventType}.
            
            Details:
            - DJ Name: ${params.djName || '[DJ Name]'}
            - Client Name: ${params.clientName || '[Client Name]'}
            - Event Date: ${params.eventDate || '[Event Date]'}
            
            ${followUpInstruction}
            
            Based on the email type, write a suitable email. For a review request, include placeholders for links to review sites like The Knot, WeddingWire, or Google.`;

        case TemplateType.EventChecklist:
            return `${baseInstruction}
            
            Generate a comprehensive, customizable planning checklist template for a DJ preparing for a ${eventType}. The checklist should be organized by timeline (e.g., "Upon Booking", "3 Months Out", "1 Month Out", "Week Of Event", "Day Of Event"). It should be easy for a DJ to copy this template and modify it for their specific needs.
            
            Topics to cover include: Client Communication, Music Curation, Equipment Prep, Venue Logistics, Timeline Finalization, and Post-Event Tasks.
            
            ${formFormattingInstruction}`;

        case TemplateType.PreEventQuestionnaire:
            return `${baseInstruction}
            
            Generate a detailed pre-event client questionnaire for a ${eventType}. The goal is to gather all necessary information to ensure the event is a success. Organize the questions into logical sections.
            
            For a **Wedding**, sections should include: Couple's Info, Key Contacts, Ceremony, Cocktail/Dinner Music, Formalities (dances, toasts), Music Vibe (must plays/do not plays), and special announcements.
            
            For a **Corporate Event** or **Private Party**, sections should include: Client Info, Venue Logistics, Event Timeline, Audience Demographics, Desired Atmosphere, and Technical Needs.
            
            ${formFormattingInstruction}`;
        
        case TemplateType.PostEventQuestionnaire:
            return `${baseInstruction}
            
            Generate a professional post-event feedback questionnaire for a client after their ${eventType}. The goal is to gather constructive feedback and request a testimonial.
            
            The questionnaire should include sections for: Overall Experience, Music Selection, Professionalism/MCing, and Planning Process. Include an open-ended question asking for a testimonial and another for suggestions for improvement.
            
            ${formFormattingInstruction}`;

        case TemplateType.EventTimeline:
            return `${baseInstruction}
            
            Generate a detailed, customizable event timeline template for a ${eventType}. This timeline will serve as a foundational schedule for the DJ to coordinate with the client and other vendors.
            
            Details:
            - Event Type: ${eventType}
            - Client: ${params.clientName || '[Client Name]'}
            - Date: ${params.eventDate || '[Event Date]'}
            - Service Start Time: ${params.eventStartTime || '[Start Time]'}
            - Service End Time: ${params.eventEndTime || '[End Time]'}
            
            The timeline should be structured with time slots and corresponding activities. It must include key moments typical for a ${eventType}. For a wedding, this includes ceremony, cocktail hour, grand entrance, dinner, toasts, first dance, parent dances, open dancing, cake cutting, and last dance. For a corporate event, this includes guest arrival, opening remarks, dinner/cocktails, presentations/awards, and open networking/dancing.
            
            Present it in a clean, easy-to-read format with suggested timings based on the start and end times. Use placeholders like "[Time]" for easy editing.`;

        default:
            return `Please generate a helpful document for a DJ related to a ${eventType} and ${templateType}.`;
    }
}


/**
 * The main handler for the Netlify serverless function.
 * It acts as a secure proxy to the Google Gemini API.
 */
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  
  try {
    const { task, params } = await req.json();

    switch (task) {
        case 'generateStream': {
            const prompt = createPrompt(params);
            const isBlogPost = params.templateType === TemplateType.CreativeContent && params.creativeContentType === CreativeContentType.BlogPost;
            const config: GenerateContentConfig = {
                temperature: 0.7,
                topP: 0.95,
            };
            if (isBlogPost) {
                config.tools = [{ googleSearch: {} }];
            }

            const stream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: config,
            });

            const readableStream = new ReadableStream({
                async start(controller) {
                    const encoder = new TextEncoder();
                    for await (const chunk of stream) {
                        const chunkPayload = {
                            text: chunk.text,
                            groundingChunks: chunk.candidates?.[0]?.groundingMetadata?.groundingChunks,
                        };
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkPayload)}\n\n`));
                    }
                    controller.close();
                }
            });

            return new Response(readableStream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        }

        case 'generateImage': {
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: params.prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: params.aspectRatio,
                },
            });

            const imageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;
            if (imageBytes) {
                return new Response(JSON.stringify({ imageBytes }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                // When image generation is blocked due to safety policies, the API returns a successful
                // response with an empty `generatedImages` array. We check for this case to provide
                // a more specific error message to the user.
                if (imageResponse.generatedImages && imageResponse.generatedImages.length === 0) {
                    throw new Error("Image generation failed. Your prompt may have violated the safety policy. Please try a different prompt.");
                }
                throw new Error("No image was generated by the API.");
            }
        }

        case 'startVideoGeneration': {
            const startOp = await ai.models.generateVideos({
                model: 'veo-2.0-generate-001',
                prompt: params.prompt,
                config: { numberOfVideos: 1 }
            });
            return new Response(JSON.stringify({ operation: startOp }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        case 'checkVideoStatus': {
            const checkOp = await ai.operations.getVideosOperation({ operation: params.operation });
            return new Response(JSON.stringify({ operation: checkOp }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        case 'fetchVideo': {
            const { downloadLink } = params;
            if (!downloadLink) {
                 return new Response(JSON.stringify({ error: 'Missing downloadLink parameter.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
            // Fetch the video from the Google URL, securely adding the API key on the server-side.
            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            
            if (!videoResponse.ok) {
                 return new Response(JSON.stringify({ error: 'Failed to fetch video from the provider.' }), { status: videoResponse.status, headers: { 'Content-Type': 'application/json' } });
            }

            // Stream the video content back to the client.
            const headers = new Headers({
                'Content-Type': videoResponse.headers.get('Content-Type') || 'video/mp4',
                'Content-Length': videoResponse.headers.get('Content-Length') || '',
            });

            return new Response(videoResponse.body, { headers });
        }


        default:
            return new Response(JSON.stringify({ error: 'Invalid task specified.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error("Error in Netlify function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
};

// This config is needed for Netlify to correctly handle the function, especially for streaming responses.
export const config = {
  path: "/api/geminiProxy",
  preferStatic: true,
};