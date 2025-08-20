import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { EventType, TemplateType, EmailFollowUpType, OutputTone, RefinementAction, CreativeContentType, MC_Script_Type, SocialMediaPlatform, ClientProfile, PlaylistType, SalesObjectionType, ImageAspectRatio, GroundingChunk } from './types';
import { EVENT_TYPES, TEMPLATE_TYPES, EMAIL_FOLLOW_UP_TYPES, OUTPUT_TONES, REFINEMENT_ACTIONS, CREATIVE_CONTENT_TYPES, MC_SCRIPT_TYPES, SOCIAL_MEDIA_PLATFORMS, PLAYLIST_TYPES, SALES_OBJECTION_TYPES, IMAGE_ASPECT_RATIOS } from './constants';
import { generateDjTemplateStream, generateDjImage, generateDjVideo } from './services/geminiService';
import { loadProfiles, saveProfiles } from './services/localStorageService';
import Header from './components/Header';
import Select from './components/Select';
import Input from './components/Input';
import Button from './components/Button';
import TemplateOutput from './components/TemplateOutput';
import SparkleIcon from './components/icons/SparkleIcon';
import Textarea from './components/Textarea';

const DEFAULT_FORM_DATA = {
  clientName: 'John & Jane Doe',
  djName: 'DJ Sonic',
  eventDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  venue: 'The Grand Ballroom, 123 Celebration Ave, Funky Town',
  totalCost: '2500',
  depositAmount: '1000',
  depositDueDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  paymentMethods: 'Zelle, Venmo, Credit Card',
  eventStartTime: '18:00',
  eventEndTime: '23:00',
};


export default function App() {
  const [eventType, setEventType] = useState<EventType>(EventType.Wedding);
  const [templateType, setTemplateType] = useState<TemplateType>(TemplateType.Agreement);
  const [emailFollowUpType, setEmailFollowUpType] = useState<EmailFollowUpType>(EmailFollowUpType.PreBooking);
  const [tone, setTone] = useState<OutputTone>(OutputTone.Professional);
  const [brandVoice, setBrandVoice] = useState('');

  // Creative Content State
  const [creativeContentType, setCreativeContentType] = useState<CreativeContentType>(CreativeContentType.MC_Scripts);
  const [mcScriptType, setMcScriptType] = useState<MC_Script_Type>(MC_Script_Type.GrandEntrance);
  const [socialMediaPlatform, setSocialMediaPlatform] = useState<SocialMediaPlatform>(SocialMediaPlatform.Instagram);
  const [postTopic, setPostTopic] = useState('A recap of a fantastic wedding event.');
  const [imagePrompt, setImagePrompt] = useState('A stylish DJ mixing music on modern equipment at a luxury wedding reception, with happy people dancing in the background.');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>(ImageAspectRatio.Square);
  const [clientFunFacts, setClientFunFacts] = useState('e.g., Met at a dog park, love hiking, favorite movie is Star Wars.');

  // Music Playlist State
  const [playlistType, setPlaylistType] = useState<PlaylistType>(PlaylistType.OpenDancing);
  const [genreVibe, setGenreVibe] = useState('Fun, upbeat 80s and 90s pop and dance');
  const [mustPlaySongs, setMustPlaySongs] = useState('Whitney Houston - I Wanna Dance with Somebody\nMichael Jackson - Don\'t Stop \'Til You Get Enough');
  const [doNotPlaySongs, setDoNotPlaySongs] = useState('Chicken Dance, Macarena');

  // Sales Assistant State
  const [salesObjectionType, setSalesObjectionType] = useState<SalesObjectionType>(SalesObjectionType.PriceTooHigh);

  const [formData, setFormData] = useState<ClientProfile>(DEFAULT_FORM_DATA);
  
  const [generatedTemplate, setGeneratedTemplate] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [videoStatus, setVideoStatus] = useState('');
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisualLoading, setIsVisualLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Client Profiles State
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [selectedProfileName, setSelectedProfileName] = useState<string>('new');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const isImageTask = useMemo(() => 
    templateType === TemplateType.CreativeContent && creativeContentType === CreativeContentType.AI_Image_For_Social_Media,
    [templateType, creativeContentType]
  );
  
  const isVideoTask = useMemo(() =>
    templateType === TemplateType.CreativeContent && creativeContentType === CreativeContentType.AI_Video_For_Social_Media,
    [templateType, creativeContentType]
  );


  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profileName = e.target.value;
    setSelectedProfileName(profileName);

    if (profileName === 'new') {
      setFormData(DEFAULT_FORM_DATA);
    } else {
      const profileToLoad = profiles.find(p => p.clientName === profileName);
      if (profileToLoad) {
        setFormData(profileToLoad);
      }
    }
  };

  const handleSaveProfile = () => {
    if (!formData.clientName || !formData.clientName.trim()) {
      alert("Please enter a Client Name to save a profile.");
      return;
    }

    const newProfile: ClientProfile = { ...formData };
    
    let updatedProfiles = [...profiles];
    const existingProfileIndex = updatedProfiles.findIndex(p => p.clientName === newProfile.clientName);

    if (existingProfileIndex !== -1) {
      updatedProfiles[existingProfileIndex] = newProfile;
    } else {
      updatedProfiles.push(newProfile);
    }

    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);
    setSelectedProfileName(newProfile.clientName);
    
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 2000);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'postTopic') {
      setPostTopic(value);
    } else if (name === 'genreVibe') {
      setGenreVibe(value);
    } else if (name === 'mustPlaySongs') {
      setMustPlaySongs(value);
    } else if (name === 'doNotPlaySongs') {
      setDoNotPlaySongs(value);
    } else if (name === 'imagePrompt') {
      setImagePrompt(value);
    } else if (name === 'clientFunFacts') {
      setClientFunFacts(value);
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const resetOutputs = () => {
    setGeneratedImage('');
    setGeneratedTemplate('');
    setGeneratedVideoUrl('');
    setVideoStatus('');
    setGroundingChunks([]);
    setError(null);
  }

  const runVideoGeneration = useCallback(async () => {
    setIsVisualLoading(true);
    resetOutputs();

    try {
        const videoResult = await generateDjVideo({ prompt: imagePrompt }, setVideoStatus);
        setGeneratedVideoUrl(videoResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while generating the video. Please try again.');
    } finally {
        setIsVisualLoading(false);
        setVideoStatus('');
    }
  }, [imagePrompt]);

  const runImageGeneration = useCallback(async () => {
    setIsVisualLoading(true);
    resetOutputs();

    try {
        const imageResult = await generateDjImage({
            prompt: imagePrompt,
            aspectRatio: aspectRatio,
        });
        setGeneratedImage(imageResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while generating the image. Please try again.');
    } finally {
        setIsVisualLoading(false);
    }
  }, [imagePrompt, aspectRatio]);


  const runGeneration = useCallback(async (isRefinement: boolean, refinementAction?: RefinementAction) => {
    setIsLoading(true);
    resetOutputs();
    if (isRefinement) {
        setGeneratedTemplate(generatedTemplate); // Keep old template for refinement
    }

    try {
      let refinementStarted = false; 

      const stream = generateDjTemplateStream({
        eventType,
        templateType,
        tone,
        brandVoice,
        emailFollowUpType: templateType === TemplateType.EmailFollowUp ? emailFollowUpType : undefined,
        ...formData,
        // Creative Content params
        creativeContentType: templateType === TemplateType.CreativeContent ? creativeContentType : undefined,
        mcScriptType: templateType === TemplateType.CreativeContent && creativeContentType === CreativeContentType.MC_Scripts ? mcScriptType : undefined,
        clientFunFacts: templateType === TemplateType.CreativeContent && creativeContentType === CreativeContentType.MC_Scripts && mcScriptType === MC_Script_Type.PersonalizedStory ? clientFunFacts : undefined,
        socialMediaPlatform: templateType === TemplateType.CreativeContent && creativeContentType === CreativeContentType.SocialMediaPost ? socialMediaPlatform : undefined,
        postTopic: templateType === TemplateType.CreativeContent && (creativeContentType === CreativeContentType.SocialMediaPost || creativeContentType === CreativeContentType.BlogPost) ? postTopic : undefined,
        // Music Playlist params
        playlistType: templateType === TemplateType.MusicPlaylists ? playlistType : undefined,
        genreVibe: templateType === TemplateType.MusicPlaylists ? genreVibe : undefined,
        mustPlaySongs: templateType === TemplateType.MusicPlaylists ? mustPlaySongs : undefined,
        doNotPlaySongs: templateType === TemplateType.MusicPlaylists ? doNotPlaySongs : undefined,
        // Sales Assistant params
        salesObjectionType: templateType === TemplateType.SalesAssistant ? salesObjectionType : undefined,
        // Refinement-specific params
        isRefinement,
        refinementAction: refinementAction,
        originalText: isRefinement ? generatedTemplate : undefined,
      });

      for await (const chunk of stream) {
        if (isRefinement && !refinementStarted) {
          setGeneratedTemplate(chunk.text);
          refinementStarted = true;
        } else {
          setGeneratedTemplate(prev => prev + chunk.text);
        }
        if (chunk.groundingChunks && chunk.groundingChunks.length > 0) {
            setGroundingChunks(chunk.groundingChunks);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [eventType, templateType, emailFollowUpType, formData, tone, brandVoice, generatedTemplate, creativeContentType, mcScriptType, socialMediaPlatform, postTopic, playlistType, genreVibe, mustPlaySongs, doNotPlaySongs, salesObjectionType, clientFunFacts]);


  const handleGenerate = () => {
    if(isVideoTask) {
        runVideoGeneration();
    } else if(isImageTask) {
        runImageGeneration();
    } else {
        runGeneration(false);
    }
  };
  const handleRefine = (action: RefinementAction) => runGeneration(true, action);

  const renderConditionalInputs = useMemo(() => {
    switch (templateType) {
      case TemplateType.SalesAssistant:
        return (
          <>
            <div className="md:col-span-2">
              <Select
                label="Common Client Objection"
                value={salesObjectionType}
                onChange={(e) => setSalesObjectionType(e.target.value as SalesObjectionType)}
                options={SALES_OBJECTION_TYPES}
              />
            </div>
             <Input label="DJ Name / Company" name="djName" value={formData.djName} onChange={handleInputChange} />
             <Input label="Client Name(s)" name="clientName" value={formData.clientName} onChange={handleInputChange} />
             <Input label="Your Price ($)" name="totalCost" type="number" value={formData.totalCost} onChange={handleInputChange} />
          </>
        );
      case TemplateType.MusicPlaylists:
        return (
          <>
            <div className="md:col-span-2">
              <Select
                label="Playlist Type"
                value={playlistType}
                onChange={(e) => setPlaylistType(e.target.value as PlaylistType)}
                options={PLAYLIST_TYPES}
              />
            </div>
            <Input label="Client Name(s)" name="clientName" value={formData.clientName} onChange={handleInputChange} />
             <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Event Type</label>
                <p className="w-full bg-slate-100 dark:bg-gray-700/50 border border-slate-300 dark:border-green-800 rounded-md px-3 py-2 text-slate-700 dark:text-slate-300">{eventType}</p>
            </div>
            <Textarea 
              label="Genre / Vibe Description"
              name="genreVibe"
              value={genreVibe}
              onChange={handleInputChange}
              placeholder="e.g., 90s Hip Hop, Laid-back indie folk, High-energy Top 40"
            />
            <Textarea 
              label="Must-Play Songs (one per line)"
              name="mustPlaySongs"
              value={mustPlaySongs}
              onChange={handleInputChange}
              placeholder="Artist - Song Title"
              rows={4}
            />
            <Textarea 
              label="Do-Not-Play Songs (one per line)"
              name="doNotPlaySongs"
              value={doNotPlaySongs}
              onChange={handleInputChange}
              placeholder="Artist - Song Title"
              rows={4}
            />
          </>
        );
      case TemplateType.CreativeContent:
        return (
          <>
            <div className="md:col-span-2">
              <Select
                label="Creative Type"
                value={creativeContentType}
                onChange={(e) => {
                    setCreativeContentType(e.target.value as CreativeContentType);
                    resetOutputs();
                }}
                options={CREATIVE_CONTENT_TYPES}
              />
            </div>
            {creativeContentType === CreativeContentType.MC_Scripts && (
              <>
                <Select
                  label="Script Moment"
                  value={mcScriptType}
                  onChange={(e) => setMcScriptType(e.target.value as MC_Script_Type)}
                  options={MC_SCRIPT_TYPES}
                />
                <Input label="Client Name(s)" name="clientName" value={formData.clientName} onChange={handleInputChange} />
                <Input label="DJ Name / Company" name="djName" value={formData.djName} onChange={handleInputChange} />
                {mcScriptType === MC_Script_Type.PersonalizedStory && (
                  <Textarea
                    label="Client Fun Facts (one per line)"
                    name="clientFunFacts"
                    value={clientFunFacts}
                    onChange={handleInputChange}
                    placeholder="e.g., Met at a coffee shop, Both love hiking"
                    rows={4}
                  />
                )}
              </>
            )}
            {creativeContentType === CreativeContentType.SocialMediaPost && (
              <>
                <Select
                  label="Platform"
                  value={socialMediaPlatform}
                  onChange={(e) => setSocialMediaPlatform(e.target.value as SocialMediaPlatform)}
                  options={SOCIAL_MEDIA_PLATFORMS}
                />
                 <Input label="DJ Name / Company" name="djName" value={formData.djName} onChange={handleInputChange} />
                 <Textarea 
                   label="Post Topic / Goal"
                   name="postTopic"
                   value={postTopic}
                   onChange={handleInputChange}
                   placeholder="e.g., Promote my availability for next month's weddings"
                 />
              </>
            )}
            {creativeContentType === CreativeContentType.BlogPost && (
               <>
                 <Input label="DJ Name / Company" name="djName" value={formData.djName} onChange={handleInputChange} />
                 <Textarea 
                   label="Blog Post Topic"
                   name="postTopic"
                   value={postTopic}
                   onChange={handleInputChange}
                   placeholder="e.g., Top 10 First Dance Songs for 2024"
                 />
                 <div className="md:col-span-2 text-center text-sm text-slate-500 dark:text-slate-400 p-2 bg-slate-100 dark:bg-gray-700/50 rounded-lg">
                    <p>✨ **Note:** This feature uses Google Search to provide up-to-date, relevant information.</p>
                </div>
               </>
            )}
            {creativeContentType === CreativeContentType.AI_Image_For_Social_Media && (
               <>
                <Textarea 
                    label="Image Prompt"
                    name="imagePrompt"
                    value={imagePrompt}
                    onChange={handleInputChange}
                    placeholder="e.g., A stylish DJ in front of a modern, glowing sound system..."
                    rows={4}
                />
                <Select
                    label="Aspect Ratio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as ImageAspectRatio)}
                    options={IMAGE_ASPECT_RATIOS}
                />
               </>
            )}
            {creativeContentType === CreativeContentType.AI_Video_For_Social_Media && (
               <>
                <Textarea 
                    label="Video Prompt"
                    name="imagePrompt"
                    value={imagePrompt}
                    onChange={handleInputChange}
                    placeholder="e.g., A DJ's hands scratching a vinyl record in slow motion with neon lights"
                    rows={4}
                />
                <div className="md:col-span-2 text-center text-sm text-slate-500 dark:text-slate-400 p-2 bg-slate-100 dark:bg-gray-700/50 rounded-lg">
                    <p>✨ **Note:** Video generation can take a few minutes to complete. Thanks for your patience!</p>
                </div>
               </>
            )}
          </>
        );
      case TemplateType.Agreement:
        return (
          <>
            <Input label="Client Name(s)" name="clientName" value={formData.clientName} onChange={handleInputChange} />
            <Input label="DJ Name / Company" name="djName" value={formData.djName} onChange={handleInputChange} />
            <Input label="Event Date" name="eventDate" type="date" value={formData.eventDate} onChange={handleInputChange} />
            <Input label="Venue Name & Address" name="venue" value={formData.venue} onChange={handleInputChange} />
            <Input label="Total Cost ($)" name="totalCost" type="number" value={formData.totalCost} onChange={handleInputChange} />
            <Input label="Deposit Amount ($)" name="depositAmount" type="number" value={formData.depositAmount} onChange={handleInputChange} />
          </>
        );
      case TemplateType.DepositTerms:
        return (
          <>
            <Input label="Total Cost ($)" name="totalCost" type="number" value={formData.totalCost} onChange={handleInputChange} />
            <Input label="Deposit Amount ($)" name="depositAmount" type="number" value={formData.depositAmount} onChange={handleInputChange} />
            <Input label="Deposit Due Date" name="depositDueDate" type="date" value={formData.depositDueDate} onChange={handleInputChange} />
            <Input label="Accepted Payment Methods" name="paymentMethods" value={formData.paymentMethods} onChange={handleInputChange} />
          </>
        );
      case TemplateType.EmailFollowUp:
        return (
          <>
            <Select
              label="Email Type"
              value={emailFollowUpType}
              onChange={(e) => setEmailFollowUpType(e.target.value as EmailFollowUpType)}
              options={EMAIL_FOLLOW_UP_TYPES}
            />
            <Input label="Client Name(s)" name="clientName" value={formData.clientName} onChange={handleInputChange} />
            <Input label="DJ Name / Company" name="djName" value={formData.djName} onChange={handleInputChange} />
            <Input label="Event Date" name="eventDate" type="date" value={formData.eventDate} onChange={handleInputChange} />
          </>
        );
      case TemplateType.EventTimeline:
        return (
           <>
            <Input label="Client Name(s)" name="clientName" value={formData.clientName} onChange={handleInputChange} />
            <Input label="Event Date" name="eventDate" type="date" value={formData.eventDate} onChange={handleInputChange} />
            <Input label="Event Start Time" name="eventStartTime" type="time" value={formData.eventStartTime} onChange={handleInputChange} />
            <Input label="Event End Time" name="eventEndTime" type="time" value={formData.eventEndTime} onChange={handleInputChange} />
          </>
        );
      case TemplateType.EventChecklist:
      case TemplateType.PreEventQuestionnaire:
      case TemplateType.PostEventQuestionnaire:
        return <p className="text-slate-500 dark:text-slate-400 text-center col-span-1 md:col-span-2">The AI will generate a comprehensive {templateType.toLowerCase()} based on the selected event type.</p>;
      default:
        return null;
    }
  }, [templateType, formData, emailFollowUpType, handleInputChange, creativeContentType, mcScriptType, socialMediaPlatform, postTopic, eventType, playlistType, genreVibe, mustPlaySongs, doNotPlaySongs, salesObjectionType, imagePrompt, aspectRatio, clientFunFacts]);

  const isGenerating = isLoading || isVisualLoading;
  
  const getButtonText = () => {
    if (isGenerating) {
      if (isVideoTask) return 'Generating Video...';
      if (isImageTask) return 'Generating Image...';
      return 'Generating...';
    }
    if (isVideoTask) return 'Generate Video';
    if (isImageTask) return 'Generate Image';
    return 'Generate Template';
  };


  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-slate-200 dark:border-green-800 shadow-sm flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create Your Template</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-6">

              <div className="p-4 -m-4 mb-2 border-b border-slate-200 dark:border-green-800/50">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Client Profiles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <Select
                          label="Load Profile"
                          value={selectedProfileName}
                          onChange={handleProfileChange}
                          options={[
                              { value: 'new', label: '✨ New Client' },
                              ...profiles.map(p => ({ value: p.clientName, label: p.clientName }))
                          ]}
                      />
                      <div className="relative">
                          <button 
                              type="button"
                              onClick={handleSaveProfile}
                              className="w-full md:w-auto px-4 py-2 bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-slate-100 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
                          >
                              Save Current Profile
                          </button>
                          {showSaveConfirmation && (
                              <span className="absolute left-0 -bottom-6 text-xs text-green-600 dark:text-green-400 animate-fade-in">
                                  Profile saved!
                              </span>
                          )}
                      </div>
                  </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Select
                  label="Event Type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  options={EVENT_TYPES}
                />
                <Select
                  label="Template Type"
                  value={templateType}
                  onChange={(e) => {
                    setTemplateType(e.target.value as TemplateType);
                    resetOutputs();
                  }}
                  options={TEMPLATE_TYPES}
                />
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Select
                  label="Output Tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as OutputTone)}
                  options={OUTPUT_TONES}
                />
                 <Input 
                   label="My DJ Brand Voice (Optional)"
                   name="brandVoice"
                   value={brandVoice}
                   onChange={(e) => setBrandVoice(e.target.value)}
                   placeholder="e.g., High-energy, modern, fun"
                 />
               </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-green-800/50">
                {renderConditionalInputs}
              </div>
              <Button onClick={handleGenerate} isLoading={isGenerating} disabled={isGenerating}>
                {getButtonText()}
              </Button>
            </form>
          </div>
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-slate-200 dark:border-green-800 shadow-sm flex-1">
              <TemplateOutput 
                template={generatedTemplate} 
                isLoading={isLoading} 
                error={error} 
                templateType={templateType}
                creativeContentType={creativeContentType}
                isVisualLoading={isVisualLoading}
                generatedImage={generatedImage}
                generatedVideoUrl={generatedVideoUrl}
                videoStatus={videoStatus}
                groundingChunks={groundingChunks}
              />
            </div>
            {generatedTemplate && !isGenerating && !error && !isImageTask && !isVideoTask &&(
              <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-slate-200 dark:border-green-800 shadow-sm animate-fade-in">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                  <SparkleIcon className="w-5 h-5 mr-2 text-green-500" />
                  AI-Powered Refinements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {REFINEMENT_ACTIONS.map(action => (
                    <button 
                      key={action.id}
                      onClick={() => handleRefine(action.action)}
                      disabled={isGenerating}
                      className="text-sm text-center px-3 py-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}