/**
 * The 20 Daily Tools: ONE list that the hub page, every tool page, the sitemap, the Ctrl+K launcher and the
 * server all read from. Safe to import anywhere (pure data, no I/O).
 *
 *  - "ai" tools call the server (sign-in required, counted as one AI tool run, 12 output languages).
 *  - "local" tools run entirely in the browser: no sign-in, no limits, nothing sent anywhere.
 *  - "online" tools need one server step (e.g. looking up a public page) but no sign-in.
 */

import { MEDIA_TOOLS } from './registry-media';
import { CAREER_TOOLS } from './registry-career';

import { CATEGORY_BLURB, CATEGORY_ORDER, type ToolCategory, type ToolKind } from './categories';
export { CATEGORY_BLURB, CATEGORY_ORDER };
export type { ToolCategory, ToolKind };

export interface DailyTool {
  slug: string;
  name: string;
  /** One line shown on cards. */
  tagline: string;
  /** Meta description (~150 chars). */
  description: string;
  category: ToolCategory;
  kind: ToolKind;
  /** lucide-react icon name, or "brand:linkedin" / "brand:youtube" / "brand:pdf" for a brand glyph. */
  icon: string;
  /** Accent colour (#rrggbb) of the card's icon tile. */
  color: string;
  keywords: string[];
  /** What makes this one different from the usual tool. Shown as chips. */
  edge: string[];
  intro: string[];
  steps: Array<{ title: string; text: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

const AI_EDGE = ['12 languages incl. Hinglish', 'One-click refine', 'History stays on your device'];
const LOCAL_EDGE = ['Unlimited use'];

const BASE_TOOLS: Array<Omit<DailyTool, 'color'>> = [
  // ───────────────────────── Write & Reply (AI)
  {
    slug: 'email-writer', name: 'Email Writer', tagline: 'Turn a one-line goal into a ready-to-send email.', category: 'Write & Reply', kind: 'ai', icon: 'Mail',
    description: 'Write professional emails in seconds: leave requests, follow-ups, apologies, complaints. Pick the tone and language, including Hinglish. Free to try.',
    keywords: ['email writer', 'AI email generator', 'leave application email', 'professional email', 'follow up email', 'email in Hindi'],
    edge: [...AI_EDGE, 'Subject lines included'],
    intro: ['Tell the Email Writer what you want to achieve and who it is for, and it drafts a complete email with a subject line and two alternative subjects. Choose the tone (professional, friendly, firm, apologetic) and the length.', 'It is built for everyday Indian work and study life: asking your manager for leave, following up on a payment, writing to a professor or complaining to a service provider. You can write in English, Hindi, Hinglish or nine other Indian languages.'],
    steps: [{ title: 'Say what you need', text: 'Describe the goal in one line, for example "ask my manager for 2 days leave next week".' }, { title: 'Add details and pick a tone', text: 'Optional key points, the recipient and the tone help the draft sound like you.' }, { title: 'Copy, refine or share', text: 'Copy the email, or tap a refine chip such as "Shorter" or "More formal" to adjust it in one click.' }],
    faqs: [{ question: 'Is the email sent for me?', answer: 'No. The tool only writes the draft. You copy it into your own email app, so nothing is sent without you.' }, { question: 'Can it write in Hindi or Hinglish?', answer: 'Yes. Choose the output language above the Write button. Hinglish means Hindi written in English letters, the way people message each other.' }, { question: 'Does it keep my emails?', answer: 'Your recent drafts are saved only in your own browser so you can reopen them. We do not store them on our servers.' }],
  },
  {
    slug: 'reply-assistant', name: 'Reply Assistant', tagline: 'Paste a message, get three ways to reply.', category: 'Write & Reply', kind: 'ai', icon: 'MessageCircle',
    description: 'Paste any WhatsApp, email or LinkedIn message and get three reply options in the tone you choose: polite decline, firm, friendly and more.',
    keywords: ['reply generator', 'WhatsApp reply', 'how to reply to message', 'polite decline message', 'AI reply assistant', 'LinkedIn reply'],
    edge: [...AI_EDGE, 'Three styles at once'],
    intro: ['Stuck on how to answer? Paste the message you received, say what you want to convey, and get three distinct replies: short, warm and detailed. Pick WhatsApp, email, LinkedIn, Instagram or SMS so the style fits the channel.', 'It is useful for declining politely, negotiating a price, answering a client, replying to a difficult relative or saying no without burning a bridge.'],
    steps: [{ title: 'Paste the message', text: 'Paste what you received. Remove anything private you do not want processed.' }, { title: 'Say what you want', text: 'For example "I cannot come but want to stay friendly". Leave blank to let the assistant suggest a sensible reply.' }, { title: 'Choose and send', text: 'Pick the reply you like, copy it, or open WhatsApp with it ready to send.' }],
    faqs: [{ question: 'Can I send the reply on WhatsApp directly?', answer: 'Yes. Use the WhatsApp button under the result to open WhatsApp with the text filled in. You choose the contact and press send yourself.' }, { question: 'Will it understand Hinglish messages?', answer: 'Yes. You can paste Hindi, English or Hinglish and reply in any of the supported languages.' }, { question: 'Is my message stored?', answer: 'It is sent to the AI to write the reply and is not kept on our servers. Your history lives only in your browser.' }],
  },
  {
    slug: 'rewrite-fix', name: 'Rewrite & Grammar Fixer', tagline: 'Fix grammar or change the tone of any text.', category: 'Write & Reply', kind: 'ai', icon: 'PenLine',
    description: 'Fix grammar, shorten, simplify or make any text more formal or friendly. See exactly what changed. Works for English, Hindi and Hinglish.',
    keywords: ['grammar checker', 'paraphrasing tool', 'rewrite text', 'make text formal', 'simplify text', 'fix English'],
    edge: [...AI_EDGE, 'Shows what changed'],
    intro: ['Paste any text and choose what you want: fix grammar only, improve clarity, shorten, make it more formal, friendlier or more persuasive, or simplify it for easy reading.', 'Unlike tools that silently rewrite everything, this one lists what it changed so you can learn from it and keep your own voice.'],
    steps: [{ title: 'Paste your text', text: 'Up to about 6,000 characters at a time.' }, { title: 'Choose a mode', text: '"Fix grammar only" keeps your wording and corrects mistakes. The other modes rewrite more.' }, { title: 'Review the changes', text: 'Read the improved text and the short list of changes, then copy it.' }],
    faqs: [{ question: 'Will it change my meaning?', answer: 'It is told to keep your meaning and facts. Always read the result before using it, especially for legal or financial text.' }, { question: 'Does it work on Hindi text?', answer: 'Yes. It can fix and rewrite Hindi and Hinglish as well as English.' }, { question: 'Is there a length limit?', answer: 'About 6,000 characters per run. For longer documents, run it in sections.' }],
  },
  {
    slug: 'translator', name: 'Translator', tagline: 'Natural translation into Hindi, Hinglish and 10 more languages.', category: 'Write & Reply', kind: 'ai', icon: 'Languages',
    description: 'Translate between English, Hindi, Hinglish, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi and Urdu with natural phrasing.',
    keywords: ['translator', 'English to Hindi', 'Hindi to English', 'Hinglish translator', 'Tamil translation', 'translate to Marathi'],
    edge: ['Hinglish output', 'Natural, not word-for-word', 'History stays on your device'],
    intro: ['Translate text into English, Hindi, Hinglish or nine other Indian languages. The source language is detected automatically, and you choose a natural, formal or casual style.', 'Because it translates meaning rather than word by word, idioms and polite forms come out the way a person would say them. For scripts like Tamil or Bengali it also gives a Roman-letter reading so you can pronounce it.'],
    steps: [{ title: 'Paste the text', text: 'Any language. It is detected automatically.' }, { title: 'Choose the target and style', text: 'Natural suits most things; formal suits letters and offices; casual suits chats.' }, { title: 'Copy the translation', text: 'You also get a Roman-letter reading for non-Latin scripts.' }],
    faqs: [{ question: 'What is Hinglish?', answer: 'Hindi written in English letters with common English words mixed in, as people type on WhatsApp. It is one of the target options.' }, { question: 'Is it accurate enough for official documents?', answer: 'It is good for everyday use. For legal, medical or official documents, have a qualified translator check it.' }, { question: 'Which languages are supported?', answer: 'English, Hindi, Hinglish, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi and Urdu.' }],
  },
  {
    slug: 'letter-writer', name: 'Letter & Application Writer', tagline: 'Leave, bank, complaint and rent letters in the right format.', category: 'Write & Reply', kind: 'ai', icon: 'FileText',
    description: 'Write formal letters and applications in proper Indian format: leave, bank complaint, consumer complaint, rent, resignation and more. Ready to print.',
    keywords: ['leave application', 'formal letter format', 'bank complaint letter', 'consumer complaint letter', 'resignation letter', 'application writer'],
    edge: [...AI_EDGE, 'Indian letter formats'],
    intro: ['Pick the kind of letter, describe your situation, and get a properly formatted letter with the right salutation, subject line and closing, using the conventions Indian offices, schools and banks expect.', 'It covers leave applications for office or school, bank problems, consumer complaints, landlord and rent matters, resignation and experience letters, fee concessions and society complaints.'],
    steps: [{ title: 'Choose the letter type', text: 'This sets the format and level of formality.' }, { title: 'Describe your situation', text: 'Dates, amounts and account details make the letter specific. Use placeholders for anything private.' }, { title: 'Print or copy', text: 'Copy the text or use Print to get a clean page. Replace any [bracketed] placeholders before sending.' }],
    faqs: [{ question: 'Is the letter legally valid?', answer: 'It is a well-formatted draft. For legal disputes, have a lawyer review it. Always check dates, names and amounts.' }, { question: 'Should I put my account number in?', answer: 'Better not. Leave a placeholder like [Account No.] and fill it in on your own copy.' }, { question: 'Can I get it in Hindi?', answer: 'Yes. Choose Hindi as the output language and the letter is written in Devanagari with the correct formal forms.' }],
  },
  {
    slug: 'caption-writer', name: 'Caption & Hashtag Writer', tagline: 'Captions that fit Instagram, LinkedIn, X and more.', category: 'Write & Reply', kind: 'ai', icon: 'Hash',
    description: 'Generate scroll-stopping captions and hashtags for Instagram, LinkedIn, X, YouTube Shorts and WhatsApp Status in the tone you want.',
    keywords: ['caption generator', 'Instagram captions', 'hashtag generator', 'LinkedIn post ideas', 'YouTube Shorts title', 'social media caption'],
    edge: [...AI_EDGE, 'Platform-specific length and style'],
    intro: ['Describe your post and pick the platform and tone. You get several caption options that follow each platform\'s norms, plus a set of relevant hashtags.', 'It helps creators, small businesses and students who need to post regularly without staring at a blank box.'],
    steps: [{ title: 'Describe the post', text: 'What is it about, and who is it for?' }, { title: 'Pick platform and tone', text: 'Instagram, LinkedIn, X, YouTube Shorts, Facebook or WhatsApp Status; witty, professional, inspirational and more.' }, { title: 'Choose your favourite', text: 'Copy a caption with its hashtags, or refine it to be shorter or bolder.' }],
    faqs: [{ question: 'How many hashtags should I use?', answer: 'It suggests a sensible number for the platform. Instagram works with a handful of relevant tags; LinkedIn and X need only a few.' }, { question: 'Can it write captions in Hinglish?', answer: 'Yes. Hinglish captions are popular on Instagram and are one of the language options.' }, { question: 'Will the captions be unique?', answer: 'Each run is freshly generated, but always review and personalise before posting.' }],
  },

  // ───────────────────────── Money (local)
  {
    slug: 'emi-calculator', name: 'EMI Calculator', tagline: 'See your EMI, total interest and how prepayment saves you money.', category: 'Money', kind: 'local', icon: 'Landmark',
    description: 'Calculate home, car or personal loan EMI with a full amortization schedule, and see how much interest and time an extra monthly payment saves.',
    keywords: ['EMI calculator', 'home loan EMI calculator', 'loan prepayment calculator', 'car loan EMI', 'personal loan EMI', 'amortization schedule'],
    edge: [...LOCAL_EDGE, 'Prepayment savings', 'Shareable link'],
    intro: ['Enter the loan amount, interest rate and tenure to see your monthly EMI, total interest and total payment, with a year-by-year and month-by-month repayment schedule.', 'Add an extra monthly payment to see how many months and how much interest you would save. Everything is calculated in your browser and the amounts are shown in Indian number format with the amount in words.'],
    steps: [{ title: 'Enter the loan', text: 'Amount, yearly interest rate and tenure in years or months.' }, { title: 'Try an extra payment', text: 'Add a monthly prepayment to see the time and interest you save.' }, { title: 'Share or print', text: 'The link keeps your numbers, so you can send the exact calculation to your family or bank.' }],
    faqs: [{ question: 'How is EMI calculated?', answer: 'EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1), where P is the loan, r the monthly rate (yearly rate ÷ 12 ÷ 100) and n the number of months.' }, { question: 'Why does my bank show a slightly different EMI?', answer: 'Banks round the EMI to a whole rupee and may count days exactly or use a floating rate. Treat this as a very close estimate.' }, { question: 'Is my data sent anywhere?', answer: 'No. The calculation runs in your browser and nothing is uploaded.' }],
  },
  {
    slug: 'sip-calculator', name: 'SIP & Investment Calculator', tagline: 'Project SIP, step-up SIP and lump sum growth, in today\'s money too.', category: 'Money', kind: 'local', icon: 'TrendingUp',
    description: 'Estimate how a monthly SIP, a yearly step-up SIP or a lump sum can grow, with the inflation-adjusted value and a year-by-year table. Free, private.',
    keywords: ['SIP calculator', 'mutual fund calculator', 'step up SIP calculator', 'lumpsum calculator', 'investment calculator India', 'inflation adjusted returns'],
    edge: [...LOCAL_EDGE, 'Inflation-adjusted value', 'Shareable link'],
    intro: ['Choose SIP, step-up SIP (your monthly amount rises every year) or a one-time lump sum, enter the expected return and duration, and see what you invest, what it may grow to and how much of that is gain.', 'Add expected inflation to see what the final amount would buy in today\'s money, which is the number that actually matters for goals like education or retirement.'],
    steps: [{ title: 'Pick the type', text: 'SIP for a fixed monthly amount, step-up if you will increase it yearly, or lump sum for a one-time investment.' }, { title: 'Enter return and duration', text: 'Use a realistic expected return. Higher is not safer.' }, { title: 'Check the real value', text: 'Add inflation to see the future amount in today\'s purchasing power.' }],
    faqs: [{ question: 'Are these returns guaranteed?', answer: 'No. Market-linked investments can lose value. This is an illustration based on the return you type, not a promise or advice.' }, { question: 'How is the SIP calculated?', answer: 'Each month your instalment is added and the total grows by the yearly return ÷ 12 (monthly compounding), the convention most Indian calculators use. A lump sum compounds once a year.' }, { question: 'What is a step-up SIP?', answer: 'A SIP where you raise the monthly amount by a fixed percentage every year, for example as your salary grows.' }],
  },
  {
    slug: 'gst-calculator', name: 'GST Calculator', tagline: 'Add or remove GST with the CGST/SGST/IGST split.', category: 'Money', kind: 'local', icon: 'Receipt',
    description: 'Add GST to a price or remove it from a GST-inclusive amount. Shows CGST, SGST and IGST with exact paise. Pick any rate.',
    keywords: ['GST calculator', 'GST inclusive calculator', 'remove GST', 'CGST SGST calculator', 'IGST calculator', 'GST invoice amount'],
    edge: [...LOCAL_EDGE, 'CGST/SGST/IGST split', 'Exact to the paisa'],
    intro: ['Type an amount and choose a GST rate to add GST to a price, or switch to "remove GST" to find the base price inside a GST-inclusive total. Choose intra-state for the CGST and SGST split or inter-state for IGST.', 'All the maths is done in whole paise so the pieces always add up exactly, which matters on an invoice.'],
    steps: [{ title: 'Enter the amount', text: 'Either the price before GST, or the total that already includes GST.' }, { title: 'Pick the rate and mode', text: 'Choose a common rate or type your own. Select add or remove GST.' }, { title: 'Read the breakup', text: 'See the net price, GST, total and the CGST/SGST or IGST split.' }],
    faqs: [{ question: 'Which GST rate applies to my item?', answer: 'Rates depend on the item or service and change from time to time. Check the current GST rate notification or ask your accountant, then type that rate here.' }, { question: 'How do I remove GST from a total?', answer: 'Net price = total × 100 ÷ (100 + rate). Switch the mode to "remove GST" and the calculator does it for you.' }, { question: 'What is the difference between CGST/SGST and IGST?', answer: 'Within one state the tax is split equally into CGST and SGST. Between states it is charged as a single IGST.' }],
  },
  {
    slug: 'percentage-calculator', name: 'Percentage & Discount Calculator', tagline: 'Percent of, change, discounts with coupons, and profit margin.', category: 'Money', kind: 'local', icon: 'Percent',
    description: 'Work out percentages, percentage change, successive discounts (sale plus coupon) and profit margin vs markup, with the steps shown.',
    keywords: ['percentage calculator', 'discount calculator', 'percentage change calculator', 'profit margin calculator', 'markup calculator', 'sale price calculator'],
    edge: [...LOCAL_EDGE, 'Shows the working', 'Margin vs markup'],
    intro: ['Five calculators in one: X% of Y, what percent one number is of another, percentage increase or decrease, a discount with an optional second discount, and profit margin versus markup.', 'Every answer shows the formula it used, so you can check it or learn from it. The discount mode correctly applies a second coupon to the already-reduced price, which is how real stores do it.'],
    steps: [{ title: 'Pick what you need', text: 'Choose one of the five modes.' }, { title: 'Enter the numbers', text: 'The answer updates as you type.' }, { title: 'Check the working', text: 'The steps under the answer show exactly how it was calculated.' }],
    faqs: [{ question: 'Why is 20% off plus 10% off not 30% off?', answer: 'The second discount applies to the reduced price. 20% then 10% is 28% off in total.' }, { question: 'What is the difference between margin and markup?', answer: 'Markup is profit as a share of the cost; margin is profit as a share of the selling price. The same sale has a lower margin than markup.' }, { question: 'How is percentage change calculated?', answer: '(new − old) ÷ old × 100. A positive result is an increase, a negative one a decrease.' }],
  },
  {
    slug: 'bill-splitter', name: 'Bill Splitter & Group Expenses', tagline: 'Split a bill, or settle a whole trip in the fewest payments.', category: 'Money', kind: 'local', icon: 'Users',
    description: 'Split a restaurant bill with tip and tax, or track group expenses and see who pays whom in the fewest transfers. Private and free.',
    keywords: ['bill splitter', 'split bill calculator', 'group expense calculator', 'trip expense splitter', 'who owes whom', 'Splitwise alternative'],
    edge: [...LOCAL_EDGE, 'Fewest payments to settle', 'Saved on your device'],
    intro: ['Two tools in one. The quick split divides a bill (with optional tax and tip) among any number of people, to the exact paisa. The group mode tracks who paid what for a trip or flat and works out who owes whom.', 'The settle-up uses as few payments as possible, so five friends do not need ten transfers. Your group is saved in your own browser so you can come back to it, and nothing is uploaded.'],
    steps: [{ title: 'Quick split or group', text: 'Use quick split for one bill. Use group for a trip or shared flat.' }, { title: 'Add people and expenses', text: 'For each expense choose who paid and who shared it.' }, { title: 'Settle up', text: 'See each person\'s balance and the short list of payments that clears everything.' }],
    faqs: [{ question: 'Does everyone need an account?', answer: 'No. Only you use the page, and your group is saved only in your browser.' }, { question: 'How does it avoid rounding errors?', answer: 'Amounts are handled in paise, and any leftover paisa is spread across people so the total is always exact.' }, { question: 'Can I share the result?', answer: 'Yes. Copy the summary or send it on WhatsApp so everyone sees who owes what.' }],
  },

  // ───────────────────────── Health & Fitness
  {
    slug: 'meal-planner', name: 'Indian Meal Planner', tagline: 'A day-wise meal plan with a grocery list, in rupees.', category: 'Health & Fitness', kind: 'ai', icon: 'UtensilsCrossed',
    description: 'Get a 1 to 7 day Indian meal plan for your diet, goal, region and daily budget, with a grocery list and prep tips. Vegetarian, Jain, vegan and more.',
    keywords: ['Indian meal planner', 'diet plan for weight loss India', 'vegetarian meal plan', 'grocery list', 'Jain diet plan', 'budget meal plan'],
    edge: [...AI_EDGE, 'Regional Indian cuisines', 'Budget in rupees'],
    intro: ['Choose your diet (vegetarian, eggetarian, non-vegetarian, vegan or Jain), your goal, how many days, your regional cuisine and a daily budget. You get a plan with breakfast, lunch, snack and dinner, approximate calories, a grocery list and meal-prep tips.', 'The plans use everyday Indian foods you can actually buy and cook, not imported ingredients. It is general guidance, not a medical diet.'],
    steps: [{ title: 'Set your diet and goal', text: 'Diet type, goal, number of days and calories if you know them.' }, { title: 'Add region, budget and exclusions', text: 'Mention allergies and dislikes so they are avoided.' }, { title: 'Use the plan', text: 'Copy the plan and grocery list, or print it for the fridge.' }],
    faqs: [{ question: 'Is this a medical diet plan?', answer: 'No. It is general guidance. If you have diabetes, thyroid issues, kidney problems, are pregnant or take medication, ask a doctor or dietitian first.' }, { question: 'Are the calories exact?', answer: 'They are estimates. Portion sizes and cooking oil change the real numbers a lot.' }, { question: 'Can it follow a Jain or no-onion-garlic diet?', answer: 'Yes. Choose Jain, or type "no onion, no garlic" under foods to avoid.' }],
  },
  {
    slug: 'workout-planner', name: 'Workout Planner', tagline: 'A weekly plan for your level, time and equipment.', category: 'Health & Fitness', kind: 'ai', icon: 'Dumbbell',
    description: 'Get a weekly workout plan for your goal, fitness level, days, time and equipment, from no-equipment home workouts to the gym, with sets, reps and progression.',
    keywords: ['workout planner', 'home workout plan', 'beginner gym plan', 'weight loss workout', 'workout without equipment', 'weekly exercise plan'],
    edge: [...AI_EDGE, 'Works with no equipment', 'Progression built in'],
    intro: ['Tell the planner your goal, level, how many days a week and how long you have, and what equipment you own. You get a day-by-day plan with warm-up, exercises, sets and reps, rest times and how to progress each week.', 'It adapts for home workouts with no equipment and avoids movements you flag because of injuries. It is general fitness guidance, not medical advice.'],
    steps: [{ title: 'Set your goal and time', text: 'Fat loss, muscle, strength or general fitness, plus days and minutes.' }, { title: 'List equipment and limits', text: 'Say what you have and mention any injuries or pain to avoid.' }, { title: 'Follow and progress', text: 'Use the weekly progression notes to make it harder safely.' }],
    faqs: [{ question: 'Is it safe for beginners?', answer: 'Beginner plans start light and focus on form. Stop if anything hurts, and see a doctor before starting if you have a health condition.' }, { question: 'Can I train without a gym?', answer: 'Yes. Choose "No equipment" for bodyweight workouts, or "Dumbbells" for a simple home setup.' }, { question: 'How long until I see results?', answer: 'Most people notice strength and energy changes in 3 to 4 weeks, with visible changes taking longer. Consistency matters more than intensity.' }],
  },
  {
    slug: 'bmi-calorie-calculator', name: 'BMI & Calorie Calculator', tagline: 'BMI with Indian cut-offs, daily calories and water.', category: 'Health & Fitness', kind: 'local', icon: 'HeartPulse',
    description: 'Calculate BMI using both WHO and Indian (Asian) cut-offs, plus daily calorie needs, protein, water and a healthy weight range for your height.',
    keywords: ['BMI calculator India', 'calorie calculator', 'TDEE calculator', 'ideal weight calculator', 'BMR calculator', 'daily water intake'],
    edge: [...LOCAL_EDGE, 'Indian BMI cut-offs', 'Healthy weight range'],
    intro: ['Enter your height, weight, age, sex and activity level to get your BMI, your daily calorie needs (BMR and TDEE), a protein range, how much water to aim for, and a healthy weight range for your height.', 'It shows BMI against both the WHO global categories and the lower cut-offs recommended for Indians and other South Asians, because the same BMI carries more health risk for us. It is for healthy adults and is not a diagnosis.'],
    steps: [{ title: 'Enter your details', text: 'Height (cm or feet and inches), weight (kg or pounds), age, sex and how active you are.' }, { title: 'Read both BMI categories', text: 'Compare the WHO and Indian categories for your BMI.' }, { title: 'Use the calorie targets', text: 'Maintenance, and a gentle target for losing or gaining about half a kilo a week.' }],
    faqs: [{ question: 'Why two BMI categories?', answer: 'Indians tend to carry more body fat at a lower BMI, so Indian guidelines flag overweight from 23 and obesity from 25, compared with 25 and 30 globally.' }, { question: 'Which formula gives the calories?', answer: 'The Mifflin-St Jeor equation for resting energy, multiplied by an activity factor for your daily needs.' }, { question: 'Is BMI enough to judge my health?', answer: 'No. It ignores muscle, waist size and fitness. Treat it as a starting point and talk to a doctor about your health.' }],
  },

  // ───────────────────────── Plan & Learn (AI)
  {
    slug: 'trip-planner', name: 'Trip Planner', tagline: 'A day-wise itinerary with costs in rupees.', category: 'Plan & Learn', kind: 'ai', icon: 'Plane',
    description: 'Plan a trip anywhere with a day-by-day itinerary, approximate costs in rupees, local food and tips for your budget, group and interests.',
    keywords: ['trip planner', 'travel itinerary generator', 'India trip planner', 'budget trip plan', 'weekend getaway plan', 'family trip itinerary'],
    edge: [...AI_EDGE, 'Costs in rupees', 'Budget-aware'],
    intro: ['Enter your destination, number of days, budget style, who is travelling and what you enjoy. You get a day-by-day itinerary with timings, approximate costs in rupees, local food to try, getting-around tips and a packing list.', 'Prices and opening hours change, so treat the costs as estimates and confirm bookings and timings before you travel.'],
    steps: [{ title: 'Where and how long', text: 'Destination, number of days, and where you start from.' }, { title: 'Budget and company', text: 'Backpacker to luxury, and solo, couple, family or friends.' }, { title: 'Refine the plan', text: 'Ask for fewer places per day, cheaper options or a different pace with one click.' }],
    faqs: [{ question: 'Are the prices accurate?', answer: 'They are approximate. Hotel, flight and entry prices change often, so check current prices before booking.' }, { question: 'Can it plan abroad trips?', answer: 'Yes, though costs will still be shown in rupees as estimates. Check visa and entry rules separately.' }, { question: 'Does it book anything?', answer: 'No. It only plans. You book hotels and tickets yourself.' }],
  },
  {
    slug: 'study-planner', name: 'Study Planner', tagline: 'A realistic timetable that counts down to your exam.', category: 'Plan & Learn', kind: 'ai', icon: 'GraduationCap',
    description: 'Create a study timetable for JEE, NEET, UPSC, boards or any exam from your subjects, strengths, days left and daily hours, with revision and mock tests.',
    keywords: ['study planner', 'study timetable generator', 'exam preparation plan', 'JEE study plan', 'UPSC study plan', 'board exam timetable'],
    edge: [...AI_EDGE, 'Weak-subject weighting', 'Revision and mock cadence'],
    intro: ['Tell the planner your exam, your subjects with how strong you feel in each, how many days are left and how many hours you can study. It builds a phase-wise plan that gives more time to weak subjects, with a weekly timetable, revision cycles and a mock test schedule.', 'It keeps the plan realistic with breaks and a buffer day each week, and it can write in Hindi or Hinglish if that is how you think about your studies.'],
    steps: [{ title: 'Name the exam and subjects', text: 'List subjects and mark each as strong, average or weak.' }, { title: 'Set time', text: 'Days left until the exam and the hours you can really study each day.' }, { title: 'Follow and adjust', text: 'Use the refine chips to make it lighter, more detailed or more actionable.' }],
    faqs: [{ question: 'Will this guarantee a good score?', answer: 'No tool can. A good plan removes confusion and keeps you consistent; the studying is still yours.' }, { question: 'What if I fall behind?', answer: 'Use the weekly buffer day, and re-run the planner with fewer days left to rebuild the plan from where you are.' }, { question: 'Can I use it for college semester exams?', answer: 'Yes. Name the exam, list your subjects and set the days left.' }],
  },

  // ───────────────────────── Everyday Utilities (local)
  {
    slug: 'age-date-calculator', name: 'Age & Date Calculator', tagline: 'Exact age, next birthday, date gaps and working days.', category: 'Everyday Utilities', kind: 'local', icon: 'CalendarDays',
    description: 'Calculate your exact age in years, months and days, days to your next birthday, the gap between two dates with working days, or add days to a date.',
    keywords: ['age calculator', 'date difference calculator', 'days between dates', 'working days calculator', 'next birthday countdown', 'add days to date'],
    edge: [...LOCAL_EDGE, 'Working days included', 'Leap-year safe'],
    intro: ['Three tools for dates. Age shows your exact age in years, months and days, the weekday you were born and a countdown to your next birthday. Difference shows the days, weeks and working days between two dates. Add and subtract moves a date by days, months or years.', 'It handles leap years and short months correctly: a 29 February birthday is celebrated on 1 March in common years, and 31 January plus one month lands on the last day of February.'],
    steps: [{ title: 'Choose a mode', text: 'Age, difference between dates, or add/subtract.' }, { title: 'Pick the dates', text: 'Use the date pickers. Today is filled in for you.' }, { title: 'Read the result', text: 'See the exact answer, and copy or share it.' }],
    faqs: [{ question: 'Are public holidays excluded from working days?', answer: 'No. Working days count Monday to Friday only, because holidays differ by state and year.' }, { question: 'How are leap-year birthdays handled?', answer: 'In years without 29 February we count the birthday on 1 March.' }, { question: 'Does it use my time zone?', answer: 'Today is taken from your device\'s clock, and all other maths uses plain calendar dates so time zones cannot shift a day.' }],
  },
  {
    slug: 'unit-converter', name: 'Unit Converter', tagline: 'Length, weight, area, volume, speed, data, time and temperature.', category: 'Everyday Utilities', kind: 'local', icon: 'ArrowLeftRight',
    description: 'Convert length, weight, area, volume, speed, data, time and temperature, including Indian units like guntha, quintal and tola. Instant and offline.',
    keywords: ['unit converter', 'acre to sq ft', 'guntha to sq ft', 'tola to gram', 'quintal to kg', 'temperature converter'],
    edge: [...LOCAL_EDGE, 'Guntha, quintal, tola, gaj', 'Two-way live conversion'],
    intro: ['Eight categories of units with live two-way conversion: change either box and the other updates. It includes units people in India actually use, such as guntha, gaj (square yard), quintal and tola, next to the standard metric and imperial ones.', 'Results are shown with up to ten significant digits and can be copied in one click.'],
    steps: [{ title: 'Pick a category', text: 'Length, weight, area, volume, speed, data, time or temperature.' }, { title: 'Choose units and type a value', text: 'Edit either side and the other side updates.' }, { title: 'Copy the result', text: 'Use Copy, or swap the units with one tap.' }],
    faqs: [{ question: 'Why is there no bigha?', answer: 'A bigha means different areas in different states, so a single conversion would mislead. We include guntha, which is standardised.' }, { question: 'What is a tola?', answer: 'A traditional Indian unit for gold and silver, 11.6638 grams.' }, { question: 'Is a kilobyte 1000 or 1024 bytes?', answer: 'KB, MB and GB here are decimal (1000). The binary units KiB, MiB and GiB (1024) are listed separately so you can choose.' }],
  },
  {
    slug: 'password-generator', name: 'Password Generator & Checker', tagline: 'Strong passwords, passphrases and PINs. Never sent anywhere.', category: 'Everyday Utilities', kind: 'local', icon: 'KeyRound',
    description: 'Generate strong passwords, memorable passphrases and PINs using your browser\'s secure random generator, and check how strong a password is. Nothing leaves your device.',
    keywords: ['password generator', 'strong password', 'passphrase generator', 'PIN generator', 'password strength checker', 'secure password'],
    edge: [...LOCAL_EDGE, 'Cryptographically random', 'Honest strength estimate'],
    intro: ['Generate a random password with the character types you want, a memorable passphrase of random words, or a numeric PIN. Randomness comes from your browser\'s cryptographic generator, and nothing you generate or type is ever sent to a server.', 'The checker estimates how strong a password you already use is and why, and says roughly how long a fast attacker would need. It is an estimate, so use it as a guide, not a guarantee.'],
    steps: [{ title: 'Choose a type', text: 'Password, passphrase or PIN.' }, { title: 'Set the options', text: 'Length, character types, and whether to avoid look-alike characters.' }, { title: 'Copy it into a password manager', text: 'Use a different password for every account and store them in a password manager.' }],
    faqs: [{ question: 'Is it safe to generate passwords on a website?', answer: 'Here the password is made in your browser and never leaves it. You can even load the page and then go offline.' }, { question: 'Passphrase or password?', answer: 'A passphrase of 5 or more random words is easier to remember and just as strong as a shorter complex password.' }, { question: 'Can I trust the strength meter?', answer: 'It is an estimate that catches common mistakes like patterns and popular passwords. A long random password from this tool will always score high.' }],
  },
  {
    slug: 'text-toolkit', name: 'Text Toolkit', tagline: 'Word count, case, clean-up, find & replace, and amount in words.', category: 'Everyday Utilities', kind: 'local', icon: 'Type',
    description: 'Count words and reading time, change case, clean up lines, find and replace, make slugs, and write rupee amounts in words (lakh, crore) for cheques.',
    keywords: ['word counter', 'case converter', 'remove duplicate lines', 'find and replace text', 'number to words in rupees', 'amount in words for cheque'],
    edge: [...LOCAL_EDGE, 'Amount in words (lakh/crore)', 'Counts Hindi correctly'],
    intro: ['Six small tools in one page. Count words, characters, sentences and reading time, including Hindi text. Change case, tidy up lines (sort, remove duplicates, trim), find and replace, make URL slugs, and turn numbers into rupees in words using lakh and crore, which is what cheques and forms need.', 'Everything happens in your browser, so you can safely paste private text.'],
    steps: [{ title: 'Pick a tab', text: 'Count, Case, Clean up, Find & replace, Slug or Amount in words.' }, { title: 'Paste or type', text: 'Results update as you type.' }, { title: 'Copy the result', text: 'One click copies the output.' }],
    faqs: [{ question: 'Is my text uploaded?', answer: 'No. Everything runs in your browser.' }, { question: 'How is the amount written for cheques?', answer: 'For example, 123456.50 becomes "One Lakh Twenty-Three Thousand Four Hundred Fifty-Six Rupees and Fifty Paise Only".' }, { question: 'Does it count Hindi words properly?', answer: 'Yes. Words made of letters with vowel signs are counted as single words.' }],
  },
];

const COLORS: Record<string, string> = {
  'pdf-converter': '#E5252A', 'pdf-tools': '#B91C1C', 'favicon-generator': '#8B5CF6', 'image-converter': '#0EA5E9', 'qr-code-generator': '#1F2937',
  'youtube-thumbnail-downloader': '#FF0000', 'linkedin-video-downloader': '#0A66C2', 'x-video-downloader': '#262B33',
  'resume-builder': '#6366F1', 'resume-keyword-matcher': '#14B8A6', 'cover-letter-writer': '#F43F5E', 'resume-bullet-improver': '#A855F7', 'invoice-generator': '#059669', 'day-planner': '#F59E0B',
  'content-calendar': '#EC4899', 'linkedin-post-writer': '#0A66C2', 'linkedin-profile-optimizer': '#2563EB',
  'email-writer': '#EA580C', 'reply-assistant': '#16A34A', 'rewrite-fix': '#7C3AED', translator: '#2563EB', 'letter-writer': '#475569', 'caption-writer': '#DB2777',
  'emi-calculator': '#0D9488', 'sip-calculator': '#16A34A', 'gst-calculator': '#EA580C', 'percentage-calculator': '#CA8A04', 'bill-splitter': '#9333EA',
  'meal-planner': '#65A30D', 'workout-planner': '#DC2626', 'bmi-calorie-calculator': '#E11D48', 'trip-planner': '#0284C7', 'study-planner': '#4F46E5',
  'age-date-calculator': '#0891B2', 'unit-converter': '#7C3AED', 'password-generator': '#334155', 'text-toolkit': '#0F766E',
};

/** Shown first on the hub as "Most useful". */
export const FEATURED_SLUGS = ['resume-builder', 'pdf-converter', 'linkedin-video-downloader', 'x-video-downloader', 'favicon-generator', 'qr-code-generator', 'invoice-generator', 'image-converter'];
/** The newest tools get a "New" badge. */
export const NEW_SLUGS = new Set([...MEDIA_TOOLS, ...CAREER_TOOLS].map((t) => t.slug));

/** Newest and most capable first; the order inside the hub's sections follows this order. */
export const DAILY_TOOLS: DailyTool[] = [...MEDIA_TOOLS, ...CAREER_TOOLS, ...BASE_TOOLS].map((t) => ({ ...t, color: COLORS[t.slug] ?? '#f97316' }));

export function getDailyTool(slug: string): DailyTool | undefined {
  return DAILY_TOOLS.find((t) => t.slug === slug);
}

export function toolsByCategory(): Array<{ category: ToolCategory; blurb: string; tools: DailyTool[] }> {
  return CATEGORY_ORDER.map((category) => ({ category, blurb: CATEGORY_BLURB[category], tools: DAILY_TOOLS.filter((t) => t.category === category) }));
}

export const toolHref = (slug: string) => `/tools/${slug}`;
