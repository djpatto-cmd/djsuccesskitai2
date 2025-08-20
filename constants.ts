import { EventType, TemplateType, EmailFollowUpType, OutputTone, RefinementAction, CreativeContentType, MC_Script_Type, SocialMediaPlatform, PlaylistType, SalesObjectionType, ImageAspectRatio } from './types';

export const EVENT_TYPES = [
  { value: EventType.Wedding, label: 'Wedding' },
  { value: EventType.Corporate, label: 'Corporate Event' },
  { value: EventType.PrivateParty, label: 'Private Party' },
];

export const TEMPLATE_TYPES = [
  { value: TemplateType.Agreement, label: 'Service Agreement' },
  { value: TemplateType.DepositTerms, label: 'Deposit Terms' },
  { value: TemplateType.EmailFollowUp, label: 'Email Follow-up' },
  { value: TemplateType.CreativeContent, label: 'Creative Content' },
  { value: TemplateType.MusicPlaylists, label: 'Music Planning & Playlists' },
  { value: TemplateType.SalesAssistant, label: 'Sales Assistant' },
  { value: TemplateType.EventChecklist, label: 'Event Checklist Builder' },
  { value: TemplateType.PreEventQuestionnaire, label: 'Pre-Event Questionnaire' },
  { value: TemplateType.PostEventQuestionnaire, label: 'Post-Event Feedback Form' },
  { value: TemplateType.EventTimeline, label: 'Event Timeline Builder' },
];

export const EMAIL_FOLLOW_UP_TYPES = [
  { value: EmailFollowUpType.PreBooking, label: 'Pre-booking Inquiry' },
  { value: EmailFollowUpType.PostBooking, label: 'Post-booking Confirmation' },
  { value: EmailFollowUpType.PreEvent, label: 'Pre-event Check-in' },
  { value: EmailFollowUpType.PostEvent, label: 'Post-event Thank You' },
  { value: EmailFollowUpType.ReferralRequest, label: 'Post-event Referral Request' },
];

export const OUTPUT_TONES = [
  { value: OutputTone.Professional, label: 'Professional' },
  { value: OutputTone.Friendly, label: 'Friendly & Casual' },
  { value: OutputTone.Energetic, label: 'Energetic & Fun' },
  { value: OutputTone.Concise, label: 'Concise & To-the-Point' },
];

export const REFINEMENT_ACTIONS: { id: string; label: string; action: RefinementAction }[] = [
    { id: 'professional', label: '✨ More Professional', action: 'Make it more professional' },
    { id: 'casual', label: '✨ More Casual', action: 'Make it more casual' },
    { id: 'shorter', label: '✨ Make it Shorter', action: 'Make it shorter' },
    { id: 'energy', label: '✨ Add More Energy', action: 'Add more energy' },
];

export const CREATIVE_CONTENT_TYPES = [
    { value: CreativeContentType.MC_Scripts, label: 'Gig Assistant (MC Scripts)'},
    { value: CreativeContentType.SocialMediaPost, label: 'Social Media Post'},
    { value: CreativeContentType.BlogPost, label: 'Blog Post for Website/SEO'},
    { value: CreativeContentType.AI_Image_For_Social_Media, label: 'AI Image for Social Media'},
    { value: CreativeContentType.AI_Video_For_Social_Media, label: 'AI Video for Social Media'},
];

export const MC_SCRIPT_TYPES = [
    { value: MC_Script_Type.GrandEntrance, label: 'Grand Entrance' },
    { value: MC_Script_Type.DinnerIntro, label: 'Dinner Introduction' },
    { value: MC_Script_Type.DanceFloorOpening, label: 'Dance Floor Opening' },
    { value: MC_Script_Type.PersonalizedStory, label: 'Personalized Client Story' },
    { value: MC_Script_Type.LastCall, label: 'Last Call / Wind Down' },
    { value: MC_Script_Type.ClosingRemarks, label: 'Closing Remarks & Send-off' },
];

export const SOCIAL_MEDIA_PLATFORMS = [
    { value: SocialMediaPlatform.Instagram, label: 'Instagram' },
    { value: SocialMediaPlatform.Facebook, label: 'Facebook' },
    { value: SocialMediaPlatform.TwitterX, label: 'Twitter / X' },
];

export const PLAYLIST_TYPES = [
    { value: PlaylistType.OpenDancing, label: 'Open Dancing' },
    { value: PlaylistType.Dinner, label: 'Dinner Music' },
    { value: PlaylistType.CocktailHour, label: 'Cocktail Hour' },
    { value: PlaylistType.Ceremony, label: 'Ceremony Selections' },
    { value: PlaylistType.Custom, label: 'Custom (Describe Vibe)' },
];

export const SALES_OBJECTION_TYPES = [
    { value: SalesObjectionType.PriceTooHigh, label: 'Response to "Your price is too high"' },
    { value: SalesObjectionType.CheaperPackage, label: 'Response to "Do you have a cheaper package?"' },
    { value: SalesObjectionType.JustNeedMusic, label: 'Response to "I just need someone to play music"' },
    { value: SalesObjectionType.SpotifyPlaylist, label: 'Response to "Why not use a Spotify playlist?"' },
    { value: SalesObjectionType.FriendDJ, label: 'Response to "My friend can DJ for free"' },
    { value: SalesObjectionType.NotSure, label: 'Response to "I need to think about it"' },
];

export const IMAGE_ASPECT_RATIOS = [
    { value: ImageAspectRatio.Square, label: 'Square (1:1)' },
    { value: ImageAspectRatio.Landscape, label: 'Landscape (16:9)' },
    { value: ImageAspectRatio.Portrait, label: 'Portrait (4:3)' },
];