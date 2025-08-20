import React, { useState, useEffect } from 'react';
import Loader from './Loader';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';
import GoogleDocIcon from './icons/GoogleDocIcon';
import GoogleFormIcon from './icons/GoogleFormIcon';
import DownloadIcon from './icons/DownloadIcon';
import WebIcon from './icons/WebIcon';
import { TemplateType, CreativeContentType, GroundingChunk } from '../types';
import { fetchProxiedVideo } from '../services/geminiService';

interface TemplateOutputProps {
  template: string;
  isLoading: boolean;
  error: string | null;
  templateType: TemplateType;
  creativeContentType?: CreativeContentType;
  isVisualLoading: boolean;
  generatedImage: string;
  generatedVideoUrl: string; // This is the download link from the API
  videoStatus: string;
  groundingChunks: GroundingChunk[];
}

const TEXT_LOADING_MESSAGES = [
  'Cueing up the AI...',
  'Mixing the perfect prompts...',
  'Scratching the vinyl of creativity...',
  'Finding the right tempo for your text...',
  'Dropping the bass on this template...',
  'Syncing with the creative cloud...',
  'Warming up the generative decks...',
  'Crafting a killer set... of words.',
];

const IMAGE_LOADING_MESSAGES = [
    'Rendering pixels...',
    'Focusing the creative lens...',
    'Developing the digital image...',
    'Mixing a palette of colors...',
    'Composing the perfect shot...',
    'Waiting for the AI muse...',
];

const VIDEO_LOADING_MESSAGES = [
    'Directing the digital scene...',
    'Rendering the final cut...',
    'This can take a few minutes, great visuals are on the way!',
    'Action! The AI is rolling...',
    'Assembling frames into motion...',
    'Waiting for the video to process...',
];

const TemplateOutput: React.FC<TemplateOutputProps> = ({ template, isLoading, error, templateType, creativeContentType, isVisualLoading, generatedImage, generatedVideoUrl, videoStatus, groundingChunks }) => {
  const [copied, setCopied] = useState(false);
  const [showExportHelp, setShowExportHelp] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(TEXT_LOADING_MESSAGES[0]);
  const [videoObjectUrl, setVideoObjectUrl] = useState('');
  const [isFetchingVideo, setIsFetchingVideo] = useState(false);
  const [videoFetchError, setVideoFetchError] = useState<string | null>(null);

  const isImageTask = templateType === TemplateType.CreativeContent && creativeContentType === CreativeContentType.AI_Image_For_Social_Media;
  const isVideoTask = templateType === TemplateType.CreativeContent && creativeContentType === CreativeContentType.AI_Video_For_Social_Media;

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    if (generatedVideoUrl && isVideoTask) {
        setIsFetchingVideo(true);
        setVideoFetchError(null);
        fetchProxiedVideo(generatedVideoUrl)
            .then(videoBlob => {
                const objectUrl = URL.createObjectURL(videoBlob);
                setVideoObjectUrl(objectUrl);
            })
            .catch(err => {
                console.error("Video fetch error:", err);
                setVideoFetchError(err instanceof Error ? err.message : 'Failed to load video for playback.');
            })
            .finally(() => {
                setIsFetchingVideo(false);
            });
        
        // Cleanup function
        return () => {
            if (videoObjectUrl) {
                URL.revokeObjectURL(videoObjectUrl);
            }
        };
    }
  }, [generatedVideoUrl, isVideoTask]);


  useEffect(() => {
    const isGenerating = isLoading || isVisualLoading;
    if (isGenerating) {
      setShowExportHelp(false);
      setShowPasteModal(false);
      
      const messageList = isVideoTask ? VIDEO_LOADING_MESSAGES : isImageTask ? IMAGE_LOADING_MESSAGES : TEXT_LOADING_MESSAGES;
      setLoadingMessage(messageList[Math.floor(Math.random() * messageList.length)]);

      const intervalId = setInterval(() => {
        setLoadingMessage(prevMessage => {
          let newMessage;
          do {
            newMessage = messageList[Math.floor(Math.random() * messageList.length)];
          } while (newMessage === prevMessage && messageList.length > 1);
          return newMessage;
        });
      }, 3500);

      return () => clearInterval(intervalId);
    }
  }, [isLoading, isVisualLoading, isImageTask, isVideoTask]);
  
  useEffect(() => {
    if (showPasteModal) {
      const timer = setTimeout(() => setShowPasteModal(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showPasteModal]);

  const handleCopy = () => {
    if (template) {
      navigator.clipboard.writeText(template);
      setCopied(true);
    }
  };
  
  const handleGoogleDocExport = () => {
    if (template) {
      navigator.clipboard.writeText(template);
      window.open('https://docs.new', '_blank', 'noopener,noreferrer');
      setCopied(true);
      setShowPasteModal(true);
    }
  };

  const handleDownloadImage = () => {
    if (generatedImage) {
        const link = document.createElement('a');
        link.href = `data:image/jpeg;base64,${generatedImage}`;
        link.download = `dj-success-kit-ai-image-${Date.now()}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleDownloadVideo = () => {
    if (videoObjectUrl) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = videoObjectUrl;
        a.download = `dj-success-kit-ai-video-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
  };


  const isFormTemplate = [
    TemplateType.EventChecklist, 
    TemplateType.PreEventQuestionnaire, 
    TemplateType.PostEventQuestionnaire
  ].includes(templateType);

  const renderExportHelp = () => {
    if (!showExportHelp) return null;

    return (
       <div className="absolute inset-0 bg-slate-900/50 dark:bg-gray-800/80 backdrop-blur-sm z-10 p-4 rounded-lg flex items-center justify-center">
         <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-green-800 p-6 rounded-xl max-w-md w-full text-center relative shadow-lg">
            <button 
                onClick={() => setShowExportHelp(false)}
                className="absolute top-2 right-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center"><GoogleFormIcon className="w-6 h-6 mr-2"/>Export to Google Forms</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                This template is formatted for easy conversion into a Google Form.
                </p>
                <ul className="text-sm list-disc list-inside mt-2 text-slate-500 dark:text-slate-400 space-y-1 text-left">
                    <li>Open <a href="https://forms.new" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">Google Forms</a> to create a new form.</li>
                    <li>Use the 'Copy' button, then paste each line from the template as a new question in your form.</li>
                    <li>The AI has suggested question types like <code className="bg-slate-200 dark:bg-gray-700 px-1 rounded text-xs">[Short Answer]</code> to guide you.</li>
                </ul>
            </>
         </div>
       </div>
    );
  }

  const renderPasteModal = () => {
    if (!showPasteModal) return null;

    return (
        <div className="absolute inset-0 bg-slate-900/50 dark:bg-gray-800/80 backdrop-blur-sm z-10 p-4 rounded-lg flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-green-800 p-6 rounded-xl max-w-md w-full text-center relative shadow-lg">
                <button
                    onClick={() => setShowPasteModal(false)}
                    className="absolute top-2 right-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center">
                    <CheckIcon className="w-6 h-6 mr-2 text-green-500 dark:text-green-400"/>
                    Copied to Clipboard!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    A new Google Doc has been opened. Just paste your template to get started.
                </p>
                <p className="mt-4 text-slate-700 dark:text-slate-200">
                    Press <kbd className="inline-flex items-center px-2 py-1 mx-1 font-sans text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded">Cmd</kbd> + <kbd className="inline-flex items-center px-2 py-1 mx-1 font-sans text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded">V</kbd> (Mac) or <kbd className="inline-flex items-center px-2 py-1 mx-1 font-sans text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded">Ctrl</kbd> + <kbd className="inline-flex items-center px-2 py-1 mx-1 font-sans text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded">V</kbd> (Windows).
                </p>
                <button
                    onClick={() => setShowPasteModal(false)}
                    className="mt-6 w-full bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                    Got it!
                </button>
            </div>
        </div>
    );
  }
  
  const renderGroundingChunks = () => {
      if (!groundingChunks || groundingChunks.length === 0) return null;
      
      return (
        <div className="mt-4 p-3 bg-slate-200/50 dark:bg-gray-900/50 rounded-lg">
            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Sources:</h4>
            <ul className="space-y-2">
                {groundingChunks.map((chunk, index) => (
                    <li key={index}>
                        <a 
                          href={chunk.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-start text-xs text-green-700 dark:text-green-400 hover:underline"
                        >
                           <WebIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                           <span className="truncate">{chunk.web.title || chunk.web.uri}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
      );
  }

  const renderContent = () => {
    const isGenerating = isLoading || isVisualLoading;
    const finalError = error || videoFetchError;

    if (isGenerating && !template && !generatedImage && !generatedVideoUrl) {
      let currentStatus = videoStatus || loadingMessage;
       if (isFetchingVideo) {
        currentStatus = "Preparing video for playback...";
      }

      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
          <Loader />
          <p className="mt-4 text-center px-4">{currentStatus}</p>
        </div>
      );
    }
    
    if (finalError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-500 dark:text-red-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold">Generation Failed</p>
          <p className="text-sm mt-1 max-w-sm">{finalError}</p>
        </div>
      );
    }

    if (!template && !generatedImage && !generatedVideoUrl && !isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Your generated output will appear here.</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Fill out the form and click "Generate".</p>
        </div>
      );
    }
    
    if (isVideoTask) {
        if (isFetchingVideo || (isVisualLoading && !videoObjectUrl)) {
             return (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                  <Loader />
                  <p className="mt-4 text-center px-4">{isFetchingVideo ? "Preparing video for playback..." : (videoStatus || "Finalizing...")}</p>
                </div>
              );
        }

        if (videoObjectUrl) {
            return (
                <div className="relative h-full flex flex-col items-center justify-center">
                     <video
                        key={videoObjectUrl}
                        controls
                        autoPlay
                        loop
                        className="max-w-full max-h-[calc(100%-60px)] object-contain rounded-lg shadow-md"
                        src={videoObjectUrl}
                     >
                        Your browser does not support the video tag.
                     </video>
                     <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                        <button
                            onClick={handleDownloadVideo}
                            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
                            aria-label="Download Video"
                        >
                            <DownloadIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            <span>Download Video</span>
                        </button>
                     </div>
                </div>
            );
        }
    }


    if (isImageTask && generatedImage) {
        return (
            <div className="relative h-full flex flex-col items-center justify-center">
                 <img 
                    src={`data:image/jpeg;base64,${generatedImage}`} 
                    alt="AI generated image for social media"
                    className="max-w-full max-h-[calc(100%-60px)] object-contain rounded-lg shadow-md"
                 />
                 <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <button
                        onClick={handleDownloadImage}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
                        aria-label="Download Image"
                    >
                        <DownloadIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        <span>Download Image</span>
                    </button>
                 </div>
            </div>
        );
    }

    return (
      <div className="relative h-full">
         {!isLoading && template && (
            <div className="absolute top-2 right-2 flex space-x-2 z-[5]">
                {isFormTemplate ? (
                    <>
                        <button 
                            onClick={() => setShowExportHelp(true)} 
                            className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium" 
                            aria-label="Show instructions to export to Google Form"
                        >
                            <GoogleFormIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            <span>Export to Form</span>
                        </button>
                        <button
                            onClick={handleCopy}
                            className="p-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            aria-label="Copy to clipboard"
                        >
                            {copied ? <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-400" /> : <ClipboardIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={handleGoogleDocExport} 
                        className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium" 
                        aria-label="Export to Google Doc"
                    >
                        {copied ? <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-400" /> : <GoogleDocIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                        <span>{copied ? 'Copied!' : 'Export to Doc'}</span>
                    </button>
                )}
            </div>
         )}
        <div className="bg-slate-50 dark:bg-gray-950 rounded-lg h-full overflow-y-auto p-4">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm text-slate-700 dark:text-slate-200">
              {template}
              {isLoading && <span className="inline-block w-px h-4 bg-green-500 animate-blink align-middle"></span>}
            </pre>
            {renderGroundingChunks()}
        </div>

        {renderExportHelp()}
        {renderPasteModal()}
      </div>
    );
  };


  return (
    <div className="h-full flex flex-col">
       <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Generated Output</h2>
       <div className="flex-grow bg-slate-100 dark:bg-gray-800 rounded-lg p-2 relative min-h-[400px]">
          {renderContent()}
       </div>
    </div>
  );
};

export default TemplateOutput;