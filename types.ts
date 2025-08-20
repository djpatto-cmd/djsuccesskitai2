export enum EventType {
  Wedding = 'Wedding',
  Corporate = 'Corporate Event',
  PrivateParty = 'Private Party',
}

export enum TemplateType {
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

export enum EmailFollowUpType {
  PreBooking = 'Pre-booking Inquiry Response',
  PostBooking = 'Post-booking Confirmation',
  PreEvent = 'One Week Before Event Check-in',
  PostEvent = 'Post-event Thank You & Review Request',
  ReferralRequest = 'Post-event Referral Request',
}

export enum OutputTone {
  Professional = 'Professional',
  Friendly = 'Friendly & Casual',
  Energetic = 'Energetic & Fun',
  Concise = 'Concise & To-the-Point',
}

export type RefinementAction = 
  | 'Make it more professional'
  | 'Make it more casual'
  | 'Make it shorter'
  | 'Add more energy';
  
export enum CreativeContentType {
  MC_Scripts = 'Gig Assistant (MC Scripts)',
  SocialMediaPost = 'Social Media Post',
  BlogPost = 'Blog Post for Website/SEO',
  AI_Image_For_Social_Media = 'AI Image for Social Media',
  AI_Video_For_Social_Media = 'AI Video for Social Media',
}

export enum MC_Script_Type {
  GrandEntrance = 'Grand Entrance',
  DinnerIntro = 'Dinner Introduction',
  DanceFloorOpening = 'Dance Floor Opening',
  PersonalizedStory = 'Personalized Client Story',
  LastCall = 'Last Call / Wind Down',
  ClosingRemarks = 'Closing Remarks & Send-off',
}

export enum SocialMediaPlatform {
  Instagram = 'Instagram',
  Facebook = 'Facebook',
  TwitterX = 'Twitter / X',
}

export enum PlaylistType {
  Dinner = 'Dinner Music',
  CocktailHour = 'Cocktail Hour',
  OpenDancing = 'Open Dancing',
  Ceremony = 'Ceremony Selections',
  Custom = 'Custom Playlist',
}

export enum SalesObjectionType {
  PriceTooHigh = 'My price is too high',
  CheaperPackage = 'Do you have a cheaper package?',
  JustNeedMusic = 'I just need someone to play music',
  SpotifyPlaylist = 'Why not just use a Spotify playlist?',
  FriendDJ = 'My friend can DJ for free/cheap',
  NotSure = 'I need to think about it / talk to my partner',
}

export enum ImageAspectRatio {
    Square = '1:1',
    Landscape = '16:9',
    Portrait = '4:3',
}

export interface ClientProfile {
  clientName: string;
  djName:string;
  eventDate: string;
  venue: string;
  totalCost: string;
  depositAmount: string;
  depositDueDate: string;
  paymentMethods: string;
  eventStartTime: string;
  eventEndTime: string;
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  }
}