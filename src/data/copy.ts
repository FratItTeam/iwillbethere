export const HEADLINE_EMOJIS = ['😊', '🥳', '❤️', '🔥', '🎉', '🙌', '✨', '💃'] as const;

export const UI_COPY = {
  skipLink: 'Skip to the form',
  brand: {
    family: 'Chorale La Fraternité',
    name: 'Frat Day',
    accent: 'Flyer Studio',
    tagline: 'Frat Day is better when we’re together.',
  },
  header: {
    privacy: 'Everything stays on your device',
    action: 'Create my flyer',
  },
  preview: {
    eyebrow: 'Your invitation',
    title: 'Your flyer',
    badge: 'Updates as you type',
    caption:
      'Your photo never leaves this device. Download a crisp PNG for WhatsApp, stories or print.',
  },
  intro: {
    eyebrow: 'A personal invitation',
    title: 'Make it yours',
    description:
      'Frat Day is better when we’re together. Add your name and photo, then create a personal invitation to share with the friends you miss.',
  },
  sections: {
    details: {
      number: '01',
      title: 'Your details',
      subtitle: 'The star of this flyer is you.',
    },
    photo: {
      number: '02',
      title: 'Your Photo',
      subtitle: 'A familiar face makes the invitation personal.',
    },
    export: {
      number: '03',
      title: 'Download Your Flyer',
      subtitle: 'Choose a size and save your finished invitation.',
    },
  },
  fields: {
    firstName: {
      label: 'Your First Name',
      helper: 'Let everyone know who’s coming.',
      placeholder: 'e.g. Jean',
      counterLabel: 'characters used',
    },
    headline: {
      label: 'Your Headline',
      helper: 'This is the invitation your friends will see.',
      addEmoji: 'Add an emoji to your headline',
      removeEmoji: 'Remove headline emoji',
      pickerTitle: 'Choose an emoji',
      pickerHelp: 'Choose one emoji to add before the final exclamation mark.',
      pickerNone: 'No emoji',
    },
    statusLine: {
      label: 'Your Status',
      helper: 'Set the mood in 50 characters or fewer.',
      counterLabel: 'characters used',
    },
    message: {
      label: 'Your Message',
      helper: 'Keep it short, warm and under 150 characters.',
      counterLabel: 'characters used',
    },
  },
  photo: {
    title: 'Add Your Photo',
    helper: 'Choose a photo your friends will recognize.',
    dropHint: 'or drop it here · JPG, PNG or WebP · up to 10 MB',
    choose: 'Add Your Photo',
    opening: 'Opening photo…',
    ready: 'Photo ready',
    replace: 'Replace',
    remove: 'Remove',
    cropTitle: 'Adjust the crop',
    center: 'Center',
    horizontal: 'Horizontal',
    vertical: 'Vertical',
    privacy: 'Your photo is processed right here in your browser and never uploaded.',
    errors: {
      type: 'Choose a JPG, PNG or WebP image.',
      empty: 'That image file is empty. Please choose another photo.',
      tooLarge: 'That photo is larger than 10 MB. Please choose a smaller image.',
      unreadable: 'That image file could not be opened.',
      noDimensions: 'That image has no visible dimensions. Please choose another photo.',
      generic: 'That photo could not be added.',
      required: 'Add your photo before downloading.',
    },
  },
  export: {
    eyebrow: 'One last step',
    sizeLegend: 'Download size',
    sizeHelp: 'Pick a resolution for WhatsApp, stories or print.',
    button: 'Download My Flyer',
    exporting: 'Creating your flyer…',
    ready: 'Your name and photo are set. Choose a size, then download.',
    missingBoth: 'Add your first name and photo to enable your download.',
    missingName: 'Add your first name to enable your download.',
    missingPhoto: 'Add your photo to enable your download.',
    invalidFields: 'Fix the highlighted fields to enable your download.',
    filename: (filename: string) => `Your file will be saved as ${filename}.`,
    filenamePending: 'Your PNG will be saved using your first name.',
    privacy: 'Your photo stays in this browser.',
    reset: 'Start over',
    resetConfirm:
      'Start over? This will clear your name, photo, emoji and message.',
    success: (width: number, height: number) =>
      `Your flyer is ready — ${width} × ${height}px PNG. Share it and let them know you’ll be there.`,
    notReady: 'The flyer is not ready yet. Please try again.',
    genericError:
      'Something went wrong while creating your flyer. Please try again.',
  },
  validation: {
    nameRequired: 'Add your first name.',
    namePlaceholder: 'Replace “First Name” with your own name.',
    nameTooLong: 'Use 10 characters or fewer.',
    nameTooManyEmoji: 'Use only one emoji in your name.',
    statusTooLong: 'Keep your status to 50 characters or fewer.',
    messageTooLong: 'Keep your message to 150 characters or fewer.',
  },
  footer: {
    madeFor: 'Made for the',
    family: 'Chorale La Fraternité',
    signoff: 'Twongere duhure.',
  },
  toast: {
    dismiss: 'Dismiss notification',
  },
} as const;
