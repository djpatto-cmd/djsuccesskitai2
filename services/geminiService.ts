import { EventType, TemplateType, EmailFollowUpType, OutputTone, RefinementAction, CreativeContentType, MC_Script_Type, SocialMediaPlatform, PlaylistType, SalesObjectionType, ImageAspectRatio, GroundingChunk } from '../types';

// These interfaces define the shape of the data passed from the frontend to the backend function.
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

interface GenerateImageParams {
    prompt: string;
    aspectRatio: ImageAspectRatio;
}

interface GenerateVideoParams {
    prompt: string;
}

export interface StreamResponse {
    text: string;
    groundingChunks?: GroundingChunk[];
}

/**
 * Generates DJ templates by streaming the response from a secure backend function.
 */
export async function* generateDjTemplateStream(params: GenerateTemplateParams): AsyncGenerator<StreamResponse> {
    const response = await fetch('/api/geminiProxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'generateStream', params }),
    });

    if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
        throw new Error(errorData.error || 'Failed to generate template.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.substring(6);
                try {
                    yield JSON.parse(data) as StreamResponse;
                } catch (e) {
                    console.error("Failed to parse stream chunk", data);
                }
            }
        }
    }
}

/**
 * Generates an image by calling the secure backend function.
 */
export async function generateDjImage(params: GenerateImageParams): Promise<string> {
    const response = await fetch('/api/geminiProxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'generateImage', params }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image.');
    }
    if (!data.imageBytes) {
        throw new Error("API did not return an image.");
    }
    return data.imageBytes;
}

/**
 * Generates a video by starting a job on the backend and then polling for its status.
 */
export async function generateDjVideo(params: GenerateVideoParams, onStatusUpdate: (message: string) => void): Promise<string> {
    onStatusUpdate('Starting video generation...');
    
    const startResponse = await fetch('/api/geminiProxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'startVideoGeneration', params }),
    });

    const startData = await startResponse.json();
    if (!startResponse.ok) {
        throw new Error(startData.error || 'Failed to start video generation.');
    }

    let operation = startData.operation;
    onStatusUpdate('Processing video... this can take a few minutes.');

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        onStatusUpdate('Checking video status...');

        const checkResponse = await fetch('/api/geminiProxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: 'checkVideoStatus', params: { operation } }),
        });

        const checkData = await checkResponse.json();
        if (!checkResponse.ok) {
            throw new Error(checkData.error || 'Failed to check video status.');
        }
        operation = checkData.operation;
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (downloadLink) {
        onStatusUpdate('Video generation complete!');
        return downloadLink;
    } else {
        const feedback = operation.response?.promptFeedback;
        if (feedback?.blockReason) {
            throw new Error(`Video generation failed. Your prompt was blocked for: ${feedback.blockReason}. Please try a different prompt.`);
        }
        throw new Error("No video was generated by the API.");
    }
}


/**
 * Fetches the video content securely through our backend proxy.
 * @param url The Gemini download URL for the video.
 * @returns A Blob containing the video data.
 */
export async function fetchProxiedVideo(url: string): Promise<Blob> {
    const response = await fetch('/api/geminiProxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'fetchVideo', params: { downloadLink: url } }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred while fetching the video.' }));
        throw new Error(errorData.error || 'Failed to fetch video.');
    }

    return response.blob();
}