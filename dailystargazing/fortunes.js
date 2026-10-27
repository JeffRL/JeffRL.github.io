// Every reading the Daily Stargazing page can give. To add one, copy a { } block and change it.
//   rarity: 1 (a gentle warning) to 5 (great fortune). The wish animation and colors come from this.
//   emotes: image names from the resources folder, without ".png". Usually as many as the rarity,
//           and they can be mixed, like ["book", "book", "beers"].
//   text:   the reading shown under the emotes. Keep it vague and kind, like a horoscope.
// Each day one rarity is picked, then one reading with that rarity.
// The logbook tells readings apart by rarity + emotes, so don't give two readings the same pair of those.

// the emoji used for each image when copying a result as text. Add a line here for any new image.
const emoteEmoji = {
  moneybag: "💰",
  book: "📖",
  fireworks: "🎆",
  broccoli: "🥦",
  people_hugging: "🫂",
  speaking_head_in_silhouette: "🗣️",
  rotating_light: "🚨",
  brain: "🧠",
  grey_heart: "🩶",
  cyclone: "🌀",
  beers: "🍻",
  monorail: "🚝",
  shirt: "👕",
  sheep: "🐑",
  screwdriver: "🪛",
  scales: "⚖️",
  bubble_tea: "🧋",
  dragon: "🐉",
  sparkling_heart: "💖",
  airplane_departure: "🛫",
  art: "🎨",
  barely_sunny: "🌥️",
  battery: "🔋",
  bouquet: "💐",
  busstop: "🚏",
  champagne: "🍾",
  cherry_blossom: "🌸",
  chess_pawn: "♟️",
  confetti_ball: "🎊",
  construction: "🚧",
  crystal_ball: "🔮",
  dart: "🎯",
  first_place_medal: "🥇",
  second_place_medal: "🥈",
  third_place_medal: "🥉",
  game_die: "🎲",
  gift: "🎁",
  hear_no_evil: "🙉",
  see_no_evil: "🙈",
  speak_no_evil: "🙊",
  hourglass_flowing_sand: "⏳",
  house_buildings: "🏘️",
  jigsaw: "🧩",
  lightning: "⚡",
  low_battery: "🪫",
  magic_wand: "🪄",
  magnet: "🧲",
  milky_way: "🌌",
  mortar_board: "🎓",
  parachute: "🪂",
  pushpin: "📌",
  sleeping_accommodation: "🛌",
  sunny: "☀️",
  tea: "🍵",
  trophy: "🏆",
  volcano: "🌋",
  world_map: "🗺️",
  writing_hand: "✍️",
  zzz: "💤"
};

const fortunes = [
  /* ---------- moneybag: money, spending, value ---------- */
  {
    rarity: 1,
    emotes: ["moneybag"],
    text: "Money has a way of slipping out through the small stuff today. A purchase that feels harmless in the moment might be one you think twice about later, so give it a second look before you commit."
  },
  {
    rarity: 2,
    emotes: ["moneybag", "moneybag"],
    text: "Your finances are fine, but they're asking for a little more attention than you've been giving them. Something you signed up for a while ago may be costing more than you remember."
  },
  {
    rarity: 3,
    emotes: ["moneybag", "moneybag", "moneybag"],
    text: "Things are steady where money is concerned. It's a good day to sort out something you've been meaning to organize, even something small, because it'll make the next decision easier."
  },
  {
    rarity: 4,
    emotes: ["moneybag", "moneybag", "moneybag", "moneybag"],
    text: "A bit of patience you showed earlier is starting to pay off. Keep an eye out for an offer that seems easy to pass up, because this one might actually be worth it."
  },
  {
    rarity: 5,
    emotes: ["moneybag", "moneybag", "moneybag", "moneybag", "moneybag"],
    text: "Something you put time or effort into is ready to give back. Today favors confident choices about what you're worth, so don't sell yourself short."
  },

  /* ---------- book: studying, learning, effort paying off ---------- */
  {
    rarity: 1,
    emotes: ["book"],
    text: "There may be a small gap in something you thought you had down. Better to notice it now than later, so it's worth going back over the basics today."
  },
  {
    rarity: 2,
    emotes: ["book", "book"],
    text: "You might feel like you're putting in the work without seeing much come from it. That's often just how learning feels in the middle, and it passes."
  },
  {
    rarity: 3,
    emotes: ["book", "book", "book"],
    text: "What you've been learning is sinking in, even if it doesn't feel like it yet. Something you skimmed past has more in it than you thought, so it's a good day to review."
  },
  {
    rarity: 4,
    emotes: ["book", "book", "book", "book"],
    text: "Your studying is starting to connect in ways you didn't plan for. An idea from one place may suddenly make sense of another, so follow that thread when it shows up."
  },
  {
    rarity: 5,
    emotes: ["book", "book", "book", "book", "book"],
    text: "The effort you've been putting in quietly is about to be noticed, maybe by you most of all. Something that used to feel hard will feel natural today, and that's your practice paying off."
  },

  /* ---------- fireworks: excitement, plans, big moments ---------- */
  {
    rarity: 1,
    emotes: ["fireworks"],
    text: "Something you're looking forward to may not look quite the way you pictured it. Leave a little room for plans to shift, and you might like the new version better."
  },
  {
    rarity: 2,
    emotes: ["fireworks", "fireworks"],
    text: "There's a lot of energy around you today, but it's scattered. Big plans are fine, just make sure there's something small and finished underneath them."
  },
  {
    rarity: 3,
    emotes: ["fireworks", "fireworks", "fireworks"],
    text: "A plan you've been sitting on is close to ready. It doesn't need to be perfect to start, it just needs you to pick a direction."
  },
  {
    rarity: 4,
    emotes: ["fireworks", "fireworks", "fireworks", "fireworks"],
    text: "Something you've been looking forward to has more in store than you expect. Say yes to the invitation or idea that makes you a little nervous."
  },
  {
    rarity: 5,
    emotes: ["fireworks", "fireworks", "fireworks", "fireworks", "fireworks"],
    text: "Today has the feel of a turning point. Whatever you start now carries extra momentum, so if there's something you've been waiting to begin, this is a great day for it."
  },

  /* ---------- broccoli: health, food, routines ---------- */
  {
    rarity: 1,
    emotes: ["broccoli"],
    text: "Your body may be asking for a little more care than it's been getting. A skipped meal or a short night could catch up with you today, so go easy on yourself."
  },
  {
    rarity: 2,
    emotes: ["broccoli", "broccoli"],
    text: "Your routine has slipped a little, and you probably already know where. One small reset, like an earlier night or a proper meal, will do more than you'd think."
  },
  {
    rarity: 3,
    emotes: ["broccoli", "broccoli", "broccoli"],
    text: "You're holding steady, and there's room to feel even better. A change to your habits that you've been considering is worth trying soon."
  },
  {
    rarity: 4,
    emotes: ["broccoli", "broccoli", "broccoli", "broccoli"],
    text: "The good habits you've been keeping are starting to show. You'll likely have more energy than usual today, so put it toward something you've been putting off."
  },
  {
    rarity: 5,
    emotes: ["broccoli", "broccoli", "broccoli", "broccoli", "broccoli"],
    text: "You're in a good place physically, and it shows in everything else. It's a great day to do more of whatever keeps you feeling your best."
  },

  /* ---------- people_hugging: friends, family, support ---------- */
  {
    rarity: 1,
    emotes: ["people_hugging"],
    text: "Someone close to you may be carrying more than they're letting on, or maybe you are. A small misunderstanding is easy to clear up today if you check in instead of guessing."
  },
  {
    rarity: 2,
    emotes: ["people_hugging", "people_hugging"],
    text: "You might feel a little distant from people who usually feel close. It's only temporary, but the first message may need to come from you."
  },
  {
    rarity: 3,
    emotes: ["people_hugging", "people_hugging", "people_hugging"],
    text: "The people around you are steady, even if things feel quiet. Someone you haven't talked to in a while may be thinking about you too."
  },
  {
    rarity: 4,
    emotes: ["people_hugging", "people_hugging", "people_hugging", "people_hugging"],
    text: "Support is closer than you think today. Asking for help with something you've been handling alone will go better than you expect."
  },
  {
    rarity: 5,
    emotes: ["people_hugging", "people_hugging", "people_hugging", "people_hugging", "people_hugging"],
    text: "Your people are on your side in a big way today. Someone from your past could come back around and open a door you didn't know was there."
  },

  /* ---------- speaking_head_in_silhouette: words, conversations, being heard ---------- */
  {
    rarity: 1,
    emotes: ["speaking_head_in_silhouette"],
    text: "Words carry a little more weight than usual today, and they might not come across the way you mean them. Give that message a second read before you send it."
  },
  {
    rarity: 2,
    emotes: ["speaking_head_in_silhouette", "speaking_head_in_silhouette"],
    text: "You may feel a bit unheard in a conversation that matters to you. Try saying it more simply, and listen for what isn't being said on the other side."
  },
  {
    rarity: 3,
    emotes: ["speaking_head_in_silhouette", "speaking_head_in_silhouette", "speaking_head_in_silhouette"],
    text: "A conversation you've been avoiding would go better than you think. You don't need the perfect words, just honest ones."
  },
  {
    rarity: 4,
    emotes: ["speaking_head_in_silhouette", "speaking_head_in_silhouette", "speaking_head_in_silhouette", "speaking_head_in_silhouette"],
    text: "People are more ready to listen to you than usual. If there's an idea you've been holding back, today is a good day to share it."
  },
  {
    rarity: 5,
    emotes: ["speaking_head_in_silhouette", "speaking_head_in_silhouette", "speaking_head_in_silhouette", "speaking_head_in_silhouette", "speaking_head_in_silhouette"],
    text: "Your words land just right today. Whether you're asking for something, explaining yourself or clearing the air, people will meet you more than halfway."
  },

  /* ---------- rotating_light: alerts, deadlines, things that need attention ---------- */
  {
    rarity: 1,
    emotes: ["rotating_light"],
    text: "Something small you've been meaning to get to is ready for your attention. A reply, a task or a loose end is easy to handle today, and it'll feel good to have it done."
  },
  {
    rarity: 2,
    emotes: ["rotating_light", "rotating_light"],
    text: "Things might feel a little more rushed than they need to be. Slow down where you can, because taking an extra minute today saves you time later."
  },
  {
    rarity: 3,
    emotes: ["rotating_light", "rotating_light", "rotating_light"],
    text: "You've caught something early that could have turned into a hassle. Take care of it now and it stays small."
  },
  {
    rarity: 4,
    emotes: ["rotating_light", "rotating_light", "rotating_light", "rotating_light"],
    text: "Your instincts are sharp today. If something feels a little off, trust that feeling, because you'll likely spot it before anyone else does."
  },
  {
    rarity: 5,
    emotes: ["rotating_light", "rotating_light", "rotating_light", "rotating_light", "rotating_light"],
    text: "Something you've been worried about is turning out fine. Whatever has been nagging at the back of your mind can finally be set down."
  },

  /* ---------- brain: thinking, ideas, mental load ---------- */
  {
    rarity: 1,
    emotes: ["brain"],
    text: "Your mind may be juggling more than you realize, and it could show up as a bit of forgetfulness. Writing things down today will save you some trouble."
  },
  {
    rarity: 2,
    emotes: ["brain", "brain"],
    text: "You might be overthinking something that only needs a simple answer. Step away from it for a while and it'll look clearer when you come back."
  },
  {
    rarity: 3,
    emotes: ["brain", "brain", "brain"],
    text: "Your thinking is clear, but it's spread across a lot of things at once. Pick one thing to really focus on today and let the others wait their turn."
  },
  {
    rarity: 4,
    emotes: ["brain", "brain", "brain", "brain"],
    text: "An idea you've been turning over is close to clicking into place. Pay attention to the thoughts that come when you're not trying, like on a walk or in the shower."
  },
  {
    rarity: 5,
    emotes: ["brain", "brain", "brain", "brain", "brain"],
    text: "Your mind is at its sharpest today. Something that's felt stuck for a while could suddenly come together, and you may surprise yourself with how easily it does."
  },

  /* ---------- grey_heart: past relationships, old feelings, closure ---------- */
  {
    rarity: 1,
    emotes: ["grey_heart"],
    text: "Old feelings may drift up today when you aren't expecting them. There's no need to act on them right away, so give yourself a day before deciding anything."
  },
  {
    rarity: 2,
    emotes: ["grey_heart", "grey_heart"],
    text: "Something left unsaid from a past relationship still has a small hold on you. You don't have to fix it, but it helps to admit it's there."
  },
  {
    rarity: 3,
    emotes: ["grey_heart", "grey_heart", "grey_heart"],
    text: "Your heart is in a calm, in-between place. It's a good time to think about what you really want from the people closest to you."
  },
  {
    rarity: 4,
    emotes: ["grey_heart", "grey_heart", "grey_heart", "grey_heart"],
    text: "Lessons from past relationships are working in your favor now. You'll recognize something good when you see it, because you know what it isn't."
  },
  {
    rarity: 5,
    emotes: ["grey_heart", "grey_heart", "grey_heart", "grey_heart", "grey_heart"],
    text: "Something from your past finally feels settled. You can look back on it with more kindness than you used to, and that leaves a lot more room for what's ahead."
  },

  /* ---------- cyclone: chaos, change, stress ---------- */
  {
    rarity: 1,
    emotes: ["cyclone"],
    text: "A bit of stress has been building up in your habits, and today it might show. Keep your plans loose enough to bend, and a few bumps won't throw you off."
  },
  {
    rarity: 2,
    emotes: ["cyclone", "cyclone"],
    text: "Things around you may feel a little unsettled. Not everything needs a reaction from you, so let some of the noise pass on its own."
  },
  {
    rarity: 3,
    emotes: ["cyclone", "cyclone", "cyclone"],
    text: "A change that felt messy at first is starting to settle. You're more adaptable than you give yourself credit for."
  },
  {
    rarity: 4,
    emotes: ["cyclone", "cyclone", "cyclone", "cyclone"],
    text: "A little shake-up is working in your favor. It's clearing space for something you didn't have room for before."
  },
  {
    rarity: 5,
    emotes: ["cyclone", "cyclone", "cyclone", "cyclone", "cyclone"],
    text: "Change is in the air, and you're more ready for it than you think. What looks like a whirlwind from the outside is carrying you somewhere good."
  },

  /* ---------- beers: social life, downtime, celebration ---------- */
  {
    rarity: 1,
    emotes: ["beers"],
    text: "A social plan might take more out of you than it gives today. It's perfectly fine to leave early or sit this one out."
  },
  {
    rarity: 2,
    emotes: ["beers", "beers"],
    text: "You might feel some pressure to show up for something when you'd rather rest. Rest is a fine choice today, and the fun will still be there next time."
  },
  {
    rarity: 3,
    emotes: ["beers", "beers", "beers"],
    text: "A little downtime with good company would do you good. It doesn't need to be a big night, just something that gets you laughing."
  },
  {
    rarity: 4,
    emotes: ["beers", "beers", "beers", "beers"],
    text: "Good times are easy to find today. A casual hangout could turn into one of those nights you end up talking about for a while."
  },
  {
    rarity: 5,
    emotes: ["beers", "beers", "beers", "beers", "beers"],
    text: "Today is made for celebrating, even if it's something small. The people around you are in a great mood, and some of that luck is going to rub off on you."
  },

  /* ---------- mixed readings ---------- */
  {
    rarity: 2,
    emotes: ["rotating_light", "brain"],
    text: "Your mind is running in a lot of directions, and something small could slip through the cracks. A quick list before the day gets going will keep things on track."
  },
  {
    rarity: 2,
    emotes: ["bubble_tea", "moneybag"],
    text: "A night out or a treat for yourself might cost a bit more than you planned. Have fun, just decide on your limit before you start."
  },
  {
    rarity: 2,
    emotes: ["grey_heart", "cyclone"],
    text: "Thoughts about someone from your past may stir things up a little. Let the feeling pass through before you act on any of it."
  },
  {
    rarity: 3,
    emotes: ["book", "book", "beers"],
    text: "You've been working hard on something, and a short break will help more than another hour of it. The answer you're after comes easier once you've had some fun."
  },
  {
    rarity: 3,
    emotes: ["broccoli", "zzz", "brain"],
    text: "How you feel and how you think are tied together today. Take care of the basics, like food, water and rest, and your focus will follow."
  },
  {
    rarity: 3,
    emotes: ["people_hugging", "speaking_head_in_silhouette", "cyclone"],
    text: "Someone around you may be going through a busy stretch, and a few kind words from you could steady them. Just be careful not to take their stress on as your own."
  },
  {
    rarity: 4,
    emotes: ["book", "book", "moneybag", "moneybag"],
    text: "What you've been learning is close to turning into something valuable. A skill you've been building could open a door that pays off sooner than you think."
  },
  {
    rarity: 4,
    emotes: ["grey_heart", "grey_heart", "people_hugging", "people_hugging"],
    text: "Someone from your past may reach out, and it'll feel easier than it used to. Old connections have a way of helping when you least expect it."
  },
  {
    rarity: 4,
    emotes: ["fireworks", "fireworks", "beers", "beers"],
    text: "There's something worth celebrating today, even if you haven't noticed it yet. Say yes to the plans that come your way."
  },
  {
    rarity: 4,
    emotes: ["brain", "brain", "speaking_head_in_silhouette", "speaking_head_in_silhouette"],
    text: "Your ideas are good, and today people are ready to hear them. Speak up in the conversation where you'd usually stay quiet."
  },
  {
    rarity: 5,
    emotes: ["moneybag", "moneybag", "moneybag", "fireworks", "fireworks"],
    text: "Fortune is leaning your way. Effort you put in a while ago is about to come back with interest, and it's worth celebrating when it does."
  },
  {
    rarity: 5,
    emotes: ["people_hugging", "people_hugging", "sparkling_heart", "sparkling_heart", "beers"],
    text: "Today is all about the people who matter to you. Love, friendship and good company line up at once, so make some time for them."
  },
  {
    rarity: 5,
    emotes: ["book", "brain", "brain", "fireworks", "fireworks"],
    text: "Everything you've been studying and thinking through comes together today. A breakthrough is close, and it'll feel as good as it sounds."
  },

  /* ---------- monorail: travel, commutes, moving forward ---------- */
  {
    rarity: 2,
    emotes: ["monorail", "monorail"],
    text: "Getting from one place to another might take a little longer than you'd like today. Leave some extra time, and use the wait for something you enjoy."
  },
  {
    rarity: 3,
    emotes: ["monorail", "monorail", "monorail"],
    text: "You're moving forward, even if it doesn't feel fast. Stay on the track you're on today, because you're closer to where you're going than you think."
  },
  {
    rarity: 4,
    emotes: ["monorail", "monorail", "monorail", "monorail"],
    text: "Things are picking up speed in a good way. A plan that's been waiting at the station is finally starting to move."
  },

  /* ---------- shirt: appearance, first impressions ---------- */
  {
    rarity: 2,
    emotes: ["shirt", "shirt"],
    text: "You might be a little more self-conscious than usual today. Most people are too busy thinking about themselves to notice what you're worried about."
  },
  {
    rarity: 3,
    emotes: ["shirt", "shirt", "shirt"],
    text: "How you show up today matters a little more than usual. Small touches, like a tidy space or a favorite outfit, will help you feel ready."
  },
  {
    rarity: 4,
    emotes: ["shirt", "shirt", "shirt", "shirt"],
    text: "You're making a good impression without even trying. Someone is noticing the care you put into yourself, so wear it with confidence."
  },

  /* ---------- sheep: going along with the crowd ---------- */
  {
    rarity: 2,
    emotes: ["zzz", "zzz"],
    text: "You may feel a bit tired today, like your batteries never fully charged. An early night will help more than another cup of coffee."
  },
  {
    rarity: 3,
    emotes: ["sheep", "sheep", "sheep"],
    text: "It's easy to follow along with what everyone else is doing today. That's fine for the small stuff, but make the bigger choices your own."
  },
  {
    rarity: 4,
    emotes: ["zzz", "zzz", "zzz", "zzz"],
    text: "Rest is working in your favor. A good night's sleep or a slow morning leaves you clearer and calmer than you've felt in a while."
  },

  /* ---------- screwdriver: fixing things, hands-on projects ---------- */
  {
    rarity: 2,
    emotes: ["screwdriver", "screwdriver"],
    text: "Something small around you needs fixing, and it's been bugging you more than you admit. It's probably a quicker job than you think."
  },
  {
    rarity: 3,
    emotes: ["screwdriver", "screwdriver", "screwdriver"],
    text: "A practical problem has a practical answer today. Roll up your sleeves and take it one piece at a time."
  },
  {
    rarity: 4,
    emotes: ["screwdriver", "screwdriver", "screwdriver", "screwdriver"],
    text: "You're handy in more ways than one today. Something you've been tinkering with, a project or a plan, comes together nicely."
  },

  /* ---------- scales: balance, decisions, fairness ---------- */
  {
    rarity: 2,
    emotes: ["scales", "scales"],
    text: "You might feel pulled between two things you care about. You don't have to choose today, but notice which one you keep coming back to."
  },
  {
    rarity: 3,
    emotes: ["scales", "scales", "scales"],
    text: "Balance is the theme of the day. A little less of one thing and a little more of another will make everything feel steadier."
  },
  {
    rarity: 4,
    emotes: ["scales", "scales", "scales", "scales"],
    text: "A decision you've been weighing is about to feel obvious. Trust your sense of what's fair, to others and to yourself."
  },

  /* ---------- bubble_tea: small treats, little joys ---------- */
  {
    rarity: 2,
    emotes: ["bubble_tea", "bubble_tea"],
    text: "You might be running low on energy without noticing. Give yourself a small break today, even if it's just a few minutes."
  },
  {
    rarity: 3,
    emotes: ["bubble_tea", "bubble_tea", "bubble_tea"],
    text: "A small treat goes a long way today. Something simple and sweet could turn an ordinary afternoon into a good one."
  },
  {
    rarity: 4,
    emotes: ["bubble_tea", "bubble_tea", "bubble_tea", "bubble_tea"],
    text: "Little joys are everywhere today. Say yes to the small pleasures, because they add up to a really good day."
  },

  /* ---------- dragon: courage, ambition, big challenges ---------- */
  {
    rarity: 2,
    emotes: ["dragon", "dragon"],
    text: "Something ahead might feel bigger than it really is. Take one small step toward it today and it'll start to shrink down to size."
  },
  {
    rarity: 3,
    emotes: ["dragon", "dragon", "dragon"],
    text: "There's a challenge in front of you that you're more ready for than you think. Face it with a bit of nerve and you'll be glad you did."
  },
  {
    rarity: 4,
    emotes: ["dragon", "dragon", "dragon", "dragon"],
    text: "Your courage is running high. It's a great day to take on the thing you've been putting off because it felt too big."
  },

  /* ---------- sparkling_heart: new or blooming romance, affection ---------- */
  {
    rarity: 2,
    emotes: ["sparkling_heart", "sparkling_heart"],
    text: "Feelings might be a little tender today. Be gentle with your own heart, and don't read too much into a quiet reply."
  },
  {
    rarity: 3,
    emotes: ["sparkling_heart", "sparkling_heart", "sparkling_heart"],
    text: "There's a soft, warm feeling around you today. A kind word or a small gesture toward someone you care about will be well received."
  },
  {
    rarity: 4,
    emotes: ["sparkling_heart", "sparkling_heart", "sparkling_heart", "sparkling_heart"],
    text: "Affection is easy to give and receive today. Someone may be thinking of you more fondly than you realize."
  },
  {
    rarity: 5,
    emotes: ["sparkling_heart", "sparkling_heart", "sparkling_heart", "sparkling_heart", "sparkling_heart"],
    text: "There's a warmth to today where love is concerned. Old hurts feel lighter, and a new or renewed connection has a real chance to grow."
  },

  /* ---------- more mixed readings ---------- */
  {
    rarity: 2,
    emotes: ["zzz", "rotating_light"],
    text: "A late night could catch up with you at an awkward moment. Set a reminder for anything important so a tired brain doesn't have to remember it."
  },
  {
    rarity: 2,
    emotes: ["shirt", "speaking_head_in_silhouette"],
    text: "You might worry about how something you said came across. Chances are it landed better than you think, but a quick follow-up never hurts."
  },
  {
    rarity: 3,
    emotes: ["dragon", "book", "book"],
    text: "Something that looks like a big challenge is really a test of what you've already been learning. You've prepared for this more than you realize."
  },
  {
    rarity: 3,
    emotes: ["monorail", "people_hugging", "beers"],
    text: "Plans to go somewhere with people you like are worth making. Even a short trip together could end up being the best part of your week."
  },
  {
    rarity: 3,
    emotes: ["scales", "moneybag", "brain"],
    text: "A money decision deserves a little more thought today. Weigh it once more, then trust the answer you land on."
  },
  {
    rarity: 3,
    emotes: ["bubble_tea", "people_hugging", "speaking_head_in_silhouette"],
    text: "A casual catch-up over something sweet could turn into a really good conversation. Someone has been wanting to talk to you."
  },
  {
    rarity: 3,
    emotes: ["screwdriver", "brain", "brain"],
    text: "A problem you've been stuck on needs a different tool, not more effort. Try looking at it from another angle."
  },
  {
    rarity: 3,
    emotes: ["zzz", "cyclone", "broccoli"],
    text: "Your routine has been a bit of a whirlwind lately. A proper night's sleep and a decent meal will steady things more than you expect."
  },
  {
    rarity: 3,
    emotes: ["shirt", "fireworks", "beers"],
    text: "There may be an occasion coming up that's worth dressing up for. Go ahead and make a bit of an effort, you'll enjoy it more."
  },
  {
    rarity: 3,
    emotes: ["sparkling_heart", "speaking_head_in_silhouette", "bubble_tea"],
    text: "Sweet words come easily today. A small message to someone you care about could brighten both of your days."
  },
  {
    rarity: 3,
    emotes: ["dragon", "cyclone", "rotating_light"],
    text: "Things might feel hectic, but you're steadier in the middle of it than you think. Handle the most pressing thing first and the rest will follow."
  },
  {
    rarity: 3,
    emotes: ["monorail", "book", "brain"],
    text: "Time spent getting from place to place is good thinking time today. An idea might come to you while you're on your way somewhere."
  },
  {
    rarity: 3,
    emotes: ["scales", "people_hugging", "grey_heart"],
    text: "You may be weighing how much of yourself to give to someone. Being fair to them and being fair to yourself can go hand in hand."
  },
  {
    rarity: 3,
    emotes: ["screwdriver", "moneybag", "moneybag"],
    text: "Fixing something yourself instead of replacing it could save you more than you'd guess. It might even be satisfying."
  },
  {
    rarity: 3,
    emotes: ["tea", "zzz", "broccoli"],
    text: "Your body is asking for a slow, cozy kind of day. Something warm to drink, some rest and a good meal will do wonders."
  },
  {
    rarity: 3,
    emotes: ["fireworks", "dragon", "monorail"],
    text: "An exciting idea is ready to get moving. Be bold about the first step, and the rest of the way will become clearer as you go."
  },
  {
    rarity: 3,
    emotes: ["grey_heart", "zzz", "brain"],
    text: "Old memories might drift in when you're trying to rest. Let them pass by without holding on, and sleep will come easier."
  },
  {
    rarity: 3,
    emotes: ["shirt", "scales", "moneybag"],
    text: "You might be tempted by something new to wear or own. Think about whether you'll still love it next week, then decide."
  },
  {
    rarity: 3,
    emotes: ["speaking_head_in_silhouette", "dragon", "people_hugging"],
    text: "Standing up for someone, or for yourself, comes naturally today. Your words carry more strength than usual."
  },
  {
    rarity: 3,
    emotes: ["book", "bubble_tea", "hourglass_flowing_sand"],
    text: "A cozy study session is in the cards. Short bursts with small rewards will get you further than one long push."
  },
  {
    rarity: 3,
    emotes: ["cyclone", "scales", "people_hugging"],
    text: "When things get busy, the people around you help keep you level. Lean on them a little, they don't mind."
  },
  {
    rarity: 3,
    emotes: ["monorail", "moneybag", "rotating_light"],
    text: "Keep an eye on travel plans and anything you've booked. A quick double check today saves a hassle later."
  },
  {
    rarity: 3,
    emotes: ["screwdriver", "people_hugging", "beers"],
    text: "Helping someone with a practical task could turn into a fun afternoon. Many hands make light work, and better company."
  },
  {
    rarity: 3,
    emotes: ["sparkling_heart", "fireworks", "shirt"],
    text: "There's a little spark in the air today. Put your best foot forward, because someone may be noticing."
  },
  {
    rarity: 3,
    emotes: ["brain", "scales", "speaking_head_in_silhouette"],
    text: "Think before you weigh in on something today. A calm, balanced answer will carry more weight than a quick one."
  },
  {
    rarity: 3,
    emotes: ["dragon", "broccoli", "broccoli"],
    text: "Your energy is stronger than it's been in a while. It's a good day to push yourself a little in whatever keeps you healthy."
  },
  {
    rarity: 3,
    emotes: ["bubble_tea", "book", "moneybag"],
    text: "A small reward for a job well done is well earned. Just keep the treat small enough that it still feels like a treat."
  },
  {
    rarity: 3,
    emotes: ["sheep", "people_hugging", "speaking_head_in_silhouette"],
    text: "It's easy to go along with what others want today. Speak up gently if you'd rather do something different, and they'll understand."
  },
  {
    rarity: 3,
    emotes: ["screwdriver", "rotating_light", "brain"],
    text: "A little problem you've been ignoring is easy to fix if you deal with it now. A few minutes today saves a lot more later."
  },
  {
    rarity: 3,
    emotes: ["monorail", "sparkling_heart", "grey_heart"],
    text: "Thinking about where your heart has been and where it's heading can bring some clarity. You've come further than you think."
  },
  /* ---------- airplane_departure: fresh starts, leaving something behind ---------- */
  {
    rarity: 2,
    emotes: ["airplane_departure", "airplane_departure"],
    text: "A fresh start you've been thinking about might feel a little daunting today. You don't have to leave right away, just start packing your thoughts."
  },
  {
    rarity: 3,
    emotes: ["airplane_departure", "airplane_departure", "airplane_departure"],
    text: "Something new is on the horizon, and it's okay to feel a mix of nerves and excitement. Take the first small step and see how it feels."
  },
  {
    rarity: 4,
    emotes: ["airplane_departure", "airplane_departure", "airplane_departure", "airplane_departure"],
    text: "It's a good day to leave behind something that's been weighing you down. What's ahead is lighter and brighter than where you've been."
  },
  /* ---------- art: creativity, making things ---------- */
  {
    rarity: 2,
    emotes: ["art", "art"],
    text: "Your creative side might feel a little blocked today. Try making something with no goal at all, just for the fun of it."
  },
  {
    rarity: 3,
    emotes: ["art", "art", "art"],
    text: "A creative idea is quietly forming. Give it some room, even if it's just a few doodles or notes in the margins."
  },
  {
    rarity: 4,
    emotes: ["art", "art", "art", "art"],
    text: "Your imagination is in great shape today. Whatever you make, cook, write or build will come out with a little extra spark."
  },
  /* ---------- barely_sunny: mixed moods, things slowly clearing up ---------- */
  {
    rarity: 1,
    emotes: ["barely_sunny"],
    text: "Your mood might feel a little cloudy today for no clear reason. Be patient with yourself, because it'll lift sooner than you expect."
  },
  {
    rarity: 2,
    emotes: ["barely_sunny", "barely_sunny"],
    text: "Things might feel only partly bright today. Look for the small patches of good, they're there even when the sky is gray."
  },
  {
    rarity: 3,
    emotes: ["barely_sunny", "barely_sunny", "barely_sunny"],
    text: "The clouds are starting to part on something that's been unclear. You don't have the whole picture yet, but it's getting brighter."
  },
  {
    rarity: 4,
    emotes: ["barely_sunny", "barely_sunny", "barely_sunny", "barely_sunny"],
    text: "Something that felt gloomy is clearing up nicely. By the end of the day, you'll likely feel lighter than when you started."
  },
  /* ---------- battery: energy, recharging ---------- */
  {
    rarity: 2,
    emotes: ["battery", "battery"],
    text: "Your energy might come and go in waves today. Save the bigger tasks for when you're feeling most charged."
  },
  {
    rarity: 3,
    emotes: ["battery", "battery", "battery"],
    text: "You've got a steady amount of energy to work with today. Spend it on what matters and let the small stuff wait."
  },
  {
    rarity: 4,
    emotes: ["battery", "battery", "battery", "battery"],
    text: "You're fully charged and ready to go. It's a great day to tackle something that needs your full attention."
  },
  /* ---------- bouquet: appreciation, thanking someone ---------- */
  {
    rarity: 2,
    emotes: ["bouquet", "bouquet"],
    text: "Someone may have done something kind that went unthanked. A quick note of appreciation would mean more than you think."
  },
  {
    rarity: 3,
    emotes: ["bouquet", "bouquet", "bouquet"],
    text: "Appreciation flows both ways today. Thank someone for something small, and you might hear something nice in return."
  },
  {
    rarity: 4,
    emotes: ["bouquet", "bouquet", "bouquet", "bouquet"],
    text: "Your kindness is coming back around to you. Someone is about to show you how much they appreciate you."
  },
  /* ---------- busstop: waiting, timing, patience ---------- */
  {
    rarity: 2,
    emotes: ["busstop", "busstop"],
    text: "You might find yourself waiting on someone or something today. Bring something to pass the time, and try not to let it sour your mood."
  },
  {
    rarity: 3,
    emotes: ["busstop", "busstop", "busstop"],
    text: "Good things are on their way, they're just running a little behind schedule. Patience today pays off later."
  },
  {
    rarity: 4,
    emotes: ["busstop", "busstop", "busstop", "busstop"],
    text: "The thing you've been waiting for is about to arrive. Your timing turns out to be better than you thought."
  },
  /* ---------- champagne: big celebrations, milestones ---------- */
  {
    rarity: 2,
    emotes: ["champagne", "champagne"],
    text: "A celebration might not go quite as planned today. Enjoy the people there more than the details, and it'll still be a good time."
  },
  {
    rarity: 3,
    emotes: ["champagne", "champagne", "champagne"],
    text: "There's a milestone worth marking, even if it's a quiet one. Take a moment to raise a glass to how far you've come."
  },
  {
    rarity: 4,
    emotes: ["champagne", "champagne", "champagne", "champagne"],
    text: "Something worth celebrating is just around the corner. Let yourself enjoy it fully when it arrives."
  },
  /* ---------- cherry_blossom: new seasons, enjoying the moment ---------- */
  {
    rarity: 2,
    emotes: ["cherry_blossom", "cherry_blossom"],
    text: "A good moment might pass by quickly today if you're too busy to notice. Slow down just enough to catch it."
  },
  {
    rarity: 3,
    emotes: ["cherry_blossom", "cherry_blossom", "cherry_blossom"],
    text: "A new season of some kind is starting in your life. Enjoy what's blooming now, without worrying about what comes next."
  },
  {
    rarity: 4,
    emotes: ["cherry_blossom", "cherry_blossom", "cherry_blossom", "cherry_blossom"],
    text: "Something beautiful is unfolding around you. It's a lovely day to stop and take it all in."
  },
  /* ---------- chess_pawn: strategy, small moves that add up ---------- */
  {
    rarity: 2,
    emotes: ["chess_pawn", "chess_pawn"],
    text: "You might feel like a small piece in a big game today. Small moves still matter, and yours are adding up."
  },
  {
    rarity: 3,
    emotes: ["chess_pawn", "chess_pawn", "chess_pawn"],
    text: "Think a step or two ahead today. A little planning now saves you from scrambling later."
  },
  {
    rarity: 4,
    emotes: ["chess_pawn", "chess_pawn", "chess_pawn", "chess_pawn"],
    text: "Your patience and planning are paying off. A move you made a while ago is about to put you in a great position."
  },
  /* ---------- confetti_ball: small wins ---------- */
  {
    rarity: 2,
    emotes: ["confetti_ball", "confetti_ball"],
    text: "A small win might go unnoticed today, even by you. Take a second to give yourself credit for it."
  },
  {
    rarity: 3,
    emotes: ["confetti_ball", "confetti_ball", "confetti_ball"],
    text: "There's a little something to celebrate today. Small wins count, so let yourself enjoy them."
  },
  {
    rarity: 4,
    emotes: ["confetti_ball", "confetti_ball", "confetti_ball", "confetti_ball"],
    text: "Little victories are stacking up. Today feels like a quiet celebration of everything going right."
  },
  /* ---------- construction: works in progress, detours ---------- */
  {
    rarity: 1,
    emotes: ["construction"],
    text: "A plan might hit a detour today. It's not a dead end, just a reminder to stay flexible about how you get there."
  },
  {
    rarity: 2,
    emotes: ["construction", "construction"],
    text: "Something you're working on is still a little messy in the middle. That's normal for things that are being built well."
  },
  {
    rarity: 3,
    emotes: ["construction", "construction", "construction"],
    text: "You're a work in progress, and that's a good thing. Keep building, one piece at a time."
  },
  {
    rarity: 4,
    emotes: ["construction", "construction", "construction", "construction"],
    text: "Something you've been building is nearly finished. The hard part is behind you, and it's starting to look great."
  },
  /* ---------- crystal_ball: intuition, hunches ---------- */
  {
    rarity: 2,
    emotes: ["crystal_ball", "crystal_ball"],
    text: "Your hunches might be a little foggy today. Get a second opinion before trusting your gut on something important."
  },
  {
    rarity: 3,
    emotes: ["crystal_ball", "crystal_ball", "crystal_ball"],
    text: "Your intuition has something to tell you today. Pay attention to the quiet feeling that keeps coming back."
  },
  {
    rarity: 4,
    emotes: ["crystal_ball", "crystal_ball", "crystal_ball", "crystal_ball"],
    text: "Your instincts are especially clear today. If something feels right, it probably is."
  },
  /* ---------- dart: focus, goals ---------- */
  {
    rarity: 2,
    emotes: ["dart", "dart"],
    text: "Your focus might drift today. Pick one target and aim for that instead of trying to hit everything at once."
  },
  {
    rarity: 3,
    emotes: ["dart", "dart", "dart"],
    text: "A clear goal will help you cut through the noise today. Decide what matters most and aim straight for it."
  },
  {
    rarity: 4,
    emotes: ["dart", "dart", "dart", "dart"],
    text: "You're right on target today. Whatever you set your mind to has a great chance of landing exactly where you want."
  },
  /* ---------- first_place_medal: doing your best, coming out on top ---------- */
  {
    rarity: 2,
    emotes: ["first_place_medal", "first_place_medal"],
    text: "You might feel pressure to come out on top today. Doing your best is enough, even when it's not first place."
  },
  {
    rarity: 3,
    emotes: ["first_place_medal", "first_place_medal", "first_place_medal"],
    text: "Your effort is putting you ahead, even if nobody's keeping score. Keep doing what you're doing."
  },
  {
    rarity: 4,
    emotes: ["first_place_medal", "first_place_medal", "first_place_medal", "first_place_medal"],
    text: "You're at your best today. Something you've worked hard on puts you right where you want to be."
  },
  /* ---------- second_place_medal: coming close, strong effort ---------- */
  {
    rarity: 2,
    emotes: ["second_place_medal", "second_place_medal"],
    text: "Coming close but not quite there might sting a little today. Remember that close means you're on the right track."
  },
  {
    rarity: 3,
    emotes: ["second_place_medal", "second_place_medal", "second_place_medal"],
    text: "A solid effort earns solid results today. It might not feel like a win, but it's a strong step forward."
  },
  {
    rarity: 4,
    emotes: ["second_place_medal", "second_place_medal", "second_place_medal", "second_place_medal"],
    text: "You're closer to the top than you think. One more push could make all the difference."
  },
  /* ---------- third_place_medal: showing up, effort being noticed ---------- */
  {
    rarity: 2,
    emotes: ["third_place_medal", "third_place_medal"],
    text: "You might feel a little overlooked today. Your effort is still noticed, even if no one says it out loud."
  },
  {
    rarity: 3,
    emotes: ["third_place_medal", "third_place_medal", "third_place_medal"],
    text: "Showing up counts for a lot today. You might not be in the spotlight, but you're definitely on the podium."
  },
  {
    rarity: 4,
    emotes: ["third_place_medal", "third_place_medal", "third_place_medal", "third_place_medal"],
    text: "Your steady effort is starting to get noticed. Recognition is coming, even if it starts small."
  },
  /* ---------- game_die: chance, small risks ---------- */
  {
    rarity: 2,
    emotes: ["game_die", "game_die"],
    text: "Today might not be the best day for big gambles. Play it a little safe, and save the risks for another time."
  },
  {
    rarity: 3,
    emotes: ["game_die", "game_die", "game_die"],
    text: "A small risk could pay off today. Nothing too big, just enough to keep things interesting."
  },
  {
    rarity: 4,
    emotes: ["game_die", "game_die", "game_die", "game_die"],
    text: "Luck is on your side today. It's a good time to take a chance on something you've been unsure about."
  },
  /* ---------- gift: surprises, generosity ---------- */
  {
    rarity: 2,
    emotes: ["gift", "gift"],
    text: "A gift or favor might not land the way you hoped. It's the thought that counts, and people remember that."
  },
  {
    rarity: 3,
    emotes: ["gift", "gift", "gift"],
    text: "A little surprise could brighten your day. Keep an eye out for small kindnesses coming your way."
  },
  {
    rarity: 4,
    emotes: ["gift", "gift", "gift", "gift"],
    text: "Something nice is coming your way when you least expect it. Enjoy it, you've earned it."
  },
  /* ---------- hear_no_evil: tuning out noise and gossip ---------- */
  {
    rarity: 1,
    emotes: ["hear_no_evil"],
    text: "There may be some noise around you today, like gossip or opinions you didn't ask for. It's fine to tune it out."
  },
  {
    rarity: 2,
    emotes: ["hear_no_evil", "hear_no_evil"],
    text: "You might be avoiding hearing something you need to know. It'll be easier to take in than you think."
  },
  {
    rarity: 3,
    emotes: ["hear_no_evil", "hear_no_evil", "hear_no_evil"],
    text: "Not every opinion needs your attention today. Listen to the people who matter and let the rest drift by."
  },
  {
    rarity: 4,
    emotes: ["hear_no_evil", "hear_no_evil", "hear_no_evil", "hear_no_evil"],
    text: "Tuning out the noise is working in your favor. With fewer distractions, you'll hear your own thoughts clearly."
  },
  /* ---------- see_no_evil: not looking, letting things slide ---------- */
  {
    rarity: 1,
    emotes: ["see_no_evil"],
    text: "There might be something you've been avoiding looking at. It's smaller than it seems once you take a peek."
  },
  {
    rarity: 2,
    emotes: ["see_no_evil", "see_no_evil"],
    text: "It's tempting to look away from something uncomfortable today. A quick glance now saves a bigger surprise later."
  },
  {
    rarity: 3,
    emotes: ["see_no_evil", "see_no_evil", "see_no_evil"],
    text: "Not everything needs your attention today. It's okay to overlook the small stuff and focus on what matters."
  },
  {
    rarity: 4,
    emotes: ["see_no_evil", "see_no_evil", "see_no_evil", "see_no_evil"],
    text: "Sometimes not looking too closely is a gift. Let little imperfections slide, and you'll enjoy the day a lot more."
  },
  /* ---------- speak_no_evil: holding your tongue, discretion ---------- */
  {
    rarity: 1,
    emotes: ["speak_no_evil"],
    text: "You might be tempted to say something you'd take back later. Holding your tongue for a moment could save a lot of trouble."
  },
  {
    rarity: 2,
    emotes: ["speak_no_evil", "speak_no_evil"],
    text: "Some things are better left unsaid today. Not every thought needs to be shared right away."
  },
  {
    rarity: 3,
    emotes: ["speak_no_evil", "speak_no_evil", "speak_no_evil"],
    text: "Choosing your words carefully pays off today. A little restraint keeps things smooth."
  },
  {
    rarity: 4,
    emotes: ["speak_no_evil", "speak_no_evil", "speak_no_evil", "speak_no_evil"],
    text: "Your discretion is a strength today. Knowing when to stay quiet earns you a lot of trust."
  },
  /* ---------- hourglass_flowing_sand: time, patience, deadlines ---------- */
  {
    rarity: 1,
    emotes: ["hourglass_flowing_sand"],
    text: "Time might feel like it's slipping away today. Focus on one thing at a time, and the day will feel longer."
  },
  {
    rarity: 2,
    emotes: ["hourglass_flowing_sand", "hourglass_flowing_sand"],
    text: "Something might take longer than you'd hoped. Patience now saves you a lot of frustration later."
  },
  {
    rarity: 3,
    emotes: ["hourglass_flowing_sand", "hourglass_flowing_sand", "hourglass_flowing_sand"],
    text: "Time is on your side, even if it doesn't feel like it. Things are unfolding at just the right pace."
  },
  {
    rarity: 4,
    emotes: ["hourglass_flowing_sand", "hourglass_flowing_sand", "hourglass_flowing_sand", "hourglass_flowing_sand"],
    text: "Good timing is with you today. Something you've been waiting on falls into place at just the right moment."
  },
  /* ---------- house_buildings: home, neighbors, community ---------- */
  {
    rarity: 2,
    emotes: ["house_buildings", "house_buildings"],
    text: "Things at home might feel a little cluttered or busy today. A small tidy-up will make your space feel calmer."
  },
  {
    rarity: 3,
    emotes: ["house_buildings", "house_buildings", "house_buildings"],
    text: "Home is a good place to recharge today. Spend some time making your space feel a bit more like you."
  },
  {
    rarity: 4,
    emotes: ["house_buildings", "house_buildings", "house_buildings", "house_buildings"],
    text: "Your community has your back today. A neighbor, roommate or someone close by could make your day easier."
  },
  /* ---------- jigsaw: pieces fitting together ---------- */
  {
    rarity: 2,
    emotes: ["jigsaw", "jigsaw"],
    text: "Something might feel like it's missing a piece today. Don't force it, the missing part usually turns up when you stop looking."
  },
  {
    rarity: 3,
    emotes: ["jigsaw", "jigsaw", "jigsaw"],
    text: "The pieces are slowly coming together. You might not see the whole picture yet, but it's taking shape."
  },
  {
    rarity: 4,
    emotes: ["jigsaw", "jigsaw", "jigsaw", "jigsaw"],
    text: "Everything is clicking into place today. Something that seemed confusing suddenly makes perfect sense."
  },
  /* ---------- lightning: sudden ideas, surprises ---------- */
  {
    rarity: 1,
    emotes: ["lightning"],
    text: "A surprise might catch you off guard today. Take a breath before reacting, and it'll feel much smaller."
  },
  {
    rarity: 2,
    emotes: ["lightning", "lightning"],
    text: "Things might change a little faster than you'd like today. Stay flexible and you'll keep up just fine."
  },
  {
    rarity: 3,
    emotes: ["lightning", "lightning", "lightning"],
    text: "A sudden idea could strike today. Write it down before it fades, it might be worth more than it seems."
  },
  {
    rarity: 4,
    emotes: ["lightning", "lightning", "lightning", "lightning"],
    text: "A flash of inspiration is headed your way. Something you've been stuck on could suddenly become clear."
  },
  /* ---------- low_battery: running low, needing rest ---------- */
  {
    rarity: 1,
    emotes: ["low_battery"],
    text: "You might be running on less energy than you realize today. Go easy on yourself and don't take on more than you need to."
  },
  {
    rarity: 2,
    emotes: ["low_battery", "low_battery"],
    text: "Your energy might dip later in the day. Plan for a slower stretch, and give yourself permission to rest."
  },
  {
    rarity: 3,
    emotes: ["low_battery", "low_battery", "low_battery"],
    text: "Even when you feel a little drained, you have just enough to get through what matters. Recharge when you can."
  },
  {
    rarity: 4,
    emotes: ["low_battery", "low_battery", "low_battery", "low_battery"],
    text: "After a tiring stretch, you're starting to bounce back. Rest you've taken recently is finally paying off."
  },
  /* ---------- magic_wand: skill that looks like luck, small miracles ---------- */
  {
    rarity: 2,
    emotes: ["magic_wand", "magic_wand"],
    text: "You might wish for a quick fix today. Things will still work out, they just need a little more of your effort."
  },
  {
    rarity: 3,
    emotes: ["magic_wand", "magic_wand", "magic_wand"],
    text: "A small bit of effort could make something feel almost like magic today. Little touches go a long way."
  },
  {
    rarity: 4,
    emotes: ["magic_wand", "magic_wand", "magic_wand", "magic_wand"],
    text: "Your skill is going to look a lot like luck today. Something you do easily could impress someone more than you expect."
  },
  /* ---------- magnet: attraction, drawing people and chances in ---------- */
  {
    rarity: 2,
    emotes: ["magnet", "magnet"],
    text: "You might be drawn to something that isn't good for you today. Take a second to ask if it's really what you want."
  },
  {
    rarity: 3,
    emotes: ["magnet", "magnet", "magnet"],
    text: "You're drawing the right people and chances toward you. Stay open and friendly, and see who comes along."
  },
  {
    rarity: 4,
    emotes: ["magnet", "magnet", "magnet", "magnet"],
    text: "Your energy is magnetic today. People are drawn to you, so it's a great day to meet someone new or reconnect."
  },
  /* ---------- milky_way: the big picture, dreams, hope ---------- */
  {
    rarity: 2,
    emotes: ["milky_way", "milky_way"],
    text: "The big picture might feel a little overwhelming today. Focus on the next small step instead of the whole path."
  },
  {
    rarity: 3,
    emotes: ["milky_way", "milky_way", "milky_way"],
    text: "It's a good day to dream a little. Thinking about the bigger picture could remind you why you're doing all this."
  },
  {
    rarity: 4,
    emotes: ["milky_way", "milky_way", "milky_way", "milky_way"],
    text: "Your hopes are closer to coming true than they seem. Keep looking up, because something wonderful is on its way."
  },
  /* ---------- mortar_board: learning milestones ---------- */
  {
    rarity: 2,
    emotes: ["mortar_board", "mortar_board"],
    text: "A milestone might feel further away than you hoped. You're still making progress, even when it's slow."
  },
  {
    rarity: 3,
    emotes: ["mortar_board", "mortar_board", "mortar_board"],
    text: "You're closer to a learning milestone than you think. Keep going, the finish line is in sight."
  },
  {
    rarity: 4,
    emotes: ["mortar_board", "mortar_board", "mortar_board", "mortar_board"],
    text: "Something you've been working toward is about to pay off. A milestone is near, and it's well deserved."
  },
  /* ---------- parachute: safety nets, leaps of faith ---------- */
  {
    rarity: 2,
    emotes: ["parachute", "parachute"],
    text: "You might feel like you're taking a leap without a safety net today. Check that you have a backup plan, just in case."
  },
  {
    rarity: 3,
    emotes: ["parachute", "parachute", "parachute"],
    text: "A leap of faith feels a little less scary today. You have more support than you realize."
  },
  {
    rarity: 4,
    emotes: ["parachute", "parachute", "parachute", "parachute"],
    text: "It's a good day to take a leap. Even if things don't go perfectly, you'll land softly."
  },
  /* ---------- pushpin: remembering, committing ---------- */
  {
    rarity: 2,
    emotes: ["pushpin", "pushpin"],
    text: "Something important might slip your mind today. Write it down or set a reminder so it doesn't get lost."
  },
  {
    rarity: 3,
    emotes: ["pushpin", "pushpin", "pushpin"],
    text: "It's a good day to commit to something you've been on the fence about. Pin it down and stick with it."
  },
  {
    rarity: 4,
    emotes: ["pushpin", "pushpin", "pushpin", "pushpin"],
    text: "Something you committed to earlier is starting to pay off. Your follow-through is being noticed."
  },
  /* ---------- sleeping_accommodation: rest days, recovery ---------- */
  {
    rarity: 2,
    emotes: ["sleeping_accommodation", "sleeping_accommodation"],
    text: "Your body might be asking for a day off. If you can't take one, at least give yourself a quiet evening."
  },
  {
    rarity: 3,
    emotes: ["sleeping_accommodation", "sleeping_accommodation", "sleeping_accommodation"],
    text: "A little time to yourself would do you good today. Rest isn't lazy, it's how you get ready for what's next."
  },
  {
    rarity: 4,
    emotes: ["sleeping_accommodation", "sleeping_accommodation", "sleeping_accommodation", "sleeping_accommodation"],
    text: "Rest and recovery are working in your favor. Taking it easy today sets you up for a great tomorrow."
  },
  /* ---------- sunny: good moods, clear days ---------- */
  {
    rarity: 2,
    emotes: ["sunny", "sunny"],
    text: "A good mood might be hard to find this morning. It'll warm up as the day goes on, so give it a little time."
  },
  {
    rarity: 3,
    emotes: ["sunny", "sunny", "sunny"],
    text: "There's a bright, easy feeling to the day. Spend a little time outside if you can, it'll lift your spirits."
  },
  {
    rarity: 4,
    emotes: ["sunny", "sunny", "sunny", "sunny"],
    text: "Today is full of sunshine, in more ways than one. Your mood is bright and it's spreading to everyone around you."
  },
  /* ---------- tea: slowing down, calm ---------- */
  {
    rarity: 2,
    emotes: ["tea", "tea"],
    text: "You might feel rushed today. Taking a moment to slow down, even for a few minutes, will help more than hurrying."
  },
  {
    rarity: 3,
    emotes: ["tea", "tea", "tea"],
    text: "A calm, steady pace suits you today. Take things one sip at a time."
  },
  {
    rarity: 4,
    emotes: ["tea", "tea", "tea", "tea"],
    text: "Peace and quiet are easy to find today. A slow, calm moment could bring you exactly the clarity you need."
  },
  /* ---------- trophy: achievements, being proud ---------- */
  {
    rarity: 2,
    emotes: ["trophy", "trophy"],
    text: "You might not get credit for something you worked hard on today. Be proud of it anyway, you know what it took."
  },
  {
    rarity: 3,
    emotes: ["trophy", "trophy", "trophy"],
    text: "You've accomplished more lately than you're giving yourself credit for. Take a moment to be proud."
  },
  {
    rarity: 4,
    emotes: ["trophy", "trophy", "trophy", "trophy"],
    text: "Your hard work is earning recognition today. Enjoy the moment, you've earned every bit of it."
  },
  /* ---------- volcano: pressure building, tempers ---------- */
  {
    rarity: 1,
    emotes: ["volcano"],
    text: "Pressure might be building up inside you today. Find a healthy way to let off some steam before it boils over."
  },
  {
    rarity: 2,
    emotes: ["volcano", "volcano"],
    text: "Tempers might run a little hot around you today. Stay cool, and it'll pass without much trouble."
  },
  {
    rarity: 3,
    emotes: ["volcano", "volcano", "volcano"],
    text: "Something that's been simmering is ready to be dealt with. Calmly letting it out will make you feel much better."
  },
  {
    rarity: 4,
    emotes: ["volcano", "volcano", "volcano", "volcano"],
    text: "Strong feelings are working in your favor today. Channel that energy into something you care about."
  },
  /* ---------- world_map: exploring, new places and ideas ---------- */
  {
    rarity: 2,
    emotes: ["world_map", "world_map"],
    text: "You might feel a little stuck in the same old routine today. Even a small change of scenery could help."
  },
  {
    rarity: 3,
    emotes: ["world_map", "world_map", "world_map"],
    text: "Exploring something new, even close to home, could bring a fresh perspective today."
  },
  {
    rarity: 4,
    emotes: ["world_map", "world_map", "world_map", "world_map"],
    text: "Adventure is calling today. A new place, idea or experience could open your eyes to something wonderful."
  },
  /* ---------- writing_hand: writing, journaling ---------- */
  {
    rarity: 2,
    emotes: ["writing_hand", "writing_hand"],
    text: "Something you meant to write down might get lost today. Jot it down the moment you think of it."
  },
  {
    rarity: 3,
    emotes: ["writing_hand", "writing_hand", "writing_hand"],
    text: "Putting your thoughts on paper could help clear your head today. Even a few lines can make a difference."
  },
  {
    rarity: 4,
    emotes: ["writing_hand", "writing_hand", "writing_hand", "writing_hand"],
    text: "Your words flow easily today. It's a great time to write something, whether it's a message, a list or a story."
  },
  /* ---------- zzz: sleep ---------- */
  {
    rarity: 3,
    emotes: ["zzz", "zzz", "zzz"],
    text: "Sleep is doing more for you than you think. Protect your rest tonight, and tomorrow will feel easier."
  },
  /* ---------- sheep: going along with the crowd ---------- */
  {
    rarity: 2,
    emotes: ["sheep", "sheep"],
    text: "You might feel pressure to do what everyone else is doing today. It's okay to do your own thing instead."
  },
  {
    rarity: 4,
    emotes: ["sheep", "sheep", "sheep", "sheep"],
    text: "Being part of the group feels good today. Going along with the crowd leads you somewhere fun."
  },
  /* ---------- mixed readings with the newer emotes ---------- */
  {
    rarity: 2,
    emotes: ["low_battery", "rotating_light"],
    text: "Your energy might run out before your to-do list does. Pick the one thing that really can't wait and let the rest slide."
  },
  {
    rarity: 2,
    emotes: ["volcano", "speaking_head_in_silhouette"],
    text: "Frustration might bubble up in a conversation today. Take a breath before you reply, and things will stay calm."
  },
  {
    rarity: 2,
    emotes: ["busstop", "hourglass_flowing_sand"],
    text: "Waiting might test your patience today. Bring something to keep you busy, and the time will pass faster."
  },
  {
    rarity: 2,
    emotes: ["game_die", "moneybag"],
    text: "A gamble with money might not be worth it today. Keep your spending simple and save the risks for later."
  },
  {
    rarity: 2,
    emotes: ["construction", "monorail"],
    text: "Your usual route might have a few bumps today. Leave a little early so a detour doesn't throw off your day."
  },
  {
    rarity: 2,
    emotes: ["see_no_evil", "broccoli"],
    text: "You might be avoiding a habit you know needs some attention. A small change today will feel better than you expect."
  },
  {
    rarity: 2,
    emotes: ["speak_no_evil", "people_hugging"],
    text: "A friend might share something in confidence today. Keeping it to yourself will mean a lot to them."
  },
  {
    rarity: 2,
    emotes: ["hear_no_evil", "brain"],
    text: "Your mind might be full of other people's opinions today. Take some quiet time to sort out what you actually think."
  },
  {
    rarity: 2,
    emotes: ["barely_sunny", "beers"],
    text: "Your social battery might be running a little low. A quiet night in could be just what you need."
  },
  {
    rarity: 2,
    emotes: ["lightning", "cyclone"],
    text: "Things might shift around unexpectedly today. Roll with the changes, they're smaller than they look."
  },
  {
    rarity: 2,
    emotes: ["pushpin", "book"],
    text: "A detail you studied might slip your mind today. A quick review will lock it back in place."
  },
  {
    rarity: 2,
    emotes: ["second_place_medal", "dragon"],
    text: "A challenge might not go your way on the first try. That's not a loss, it's practice for the next round."
  },
  {
    rarity: 2,
    emotes: ["magnet", "bubble_tea"],
    text: "Little temptations might be everywhere today. Enjoy a treat, just don't let it turn into five."
  },
  {
    rarity: 2,
    emotes: ["chess_pawn", "cyclone"],
    text: "Plans might get shuffled around today. Stay flexible and make the next small move instead of planning the whole game."
  },
  {
    rarity: 2,
    emotes: ["parachute", "game_die"],
    text: "A risk might feel tempting today. Make sure there's a safety net before you jump."
  },
  {
    rarity: 2,
    emotes: ["third_place_medal", "shirt"],
    text: "You might compare yourself to others today. Remember that everyone shows their best side, and you're doing fine."
  },
  {
    rarity: 2,
    emotes: ["sleeping_accommodation", "fireworks"],
    text: "You might feel torn between resting and going out. Listen to your body today, and the fun will keep."
  },
  {
    rarity: 2,
    emotes: ["world_map", "low_battery"],
    text: "Big plans to explore might need to wait a little. Recharge first, and the adventure will be even better."
  },
  {
    rarity: 2,
    emotes: ["writing_hand", "speak_no_evil"],
    text: "Be a little careful with what you put in writing today. Read it over once before you send it."
  },
  {
    rarity: 2,
    emotes: ["grey_heart", "barely_sunny"],
    text: "Old memories might cast a little cloud over your day. Let yourself feel it, then let the sun come back."
  },
  {
    rarity: 2,
    emotes: ["crystal_ball", "scales"],
    text: "A decision might feel hard to read today. Give it another day before you commit, and it'll be clearer."
  },
  {
    rarity: 3,
    emotes: ["airplane_departure", "world_map", "people_hugging"],
    text: "A trip, big or small, could be just what you need. Bring along someone who makes everything more fun."
  },
  {
    rarity: 3,
    emotes: ["art", "cherry_blossom", "tea"],
    text: "A calm, pretty moment could spark a creative idea today. Keep a notebook nearby."
  },
  {
    rarity: 3,
    emotes: ["battery", "broccoli", "zzz"],
    text: "Your energy depends on the basics today. Eat well and get some rest, and you'll feel the difference."
  },
  {
    rarity: 3,
    emotes: ["bouquet", "grey_heart", "writing_hand"],
    text: "Writing a few kind words to someone from your past could bring you both some peace."
  },
  {
    rarity: 3,
    emotes: ["busstop", "monorail", "book"],
    text: "Waiting time is good reading time today. A few pages on the go could teach you something useful."
  },
  {
    rarity: 3,
    emotes: ["champagne", "people_hugging", "confetti_ball"],
    text: "Celebrating with the people you love makes even small wins feel big. Gather them up today."
  },
  {
    rarity: 3,
    emotes: ["chess_pawn", "scales", "brain"],
    text: "Weigh your next move carefully today. A thoughtful choice now sets up a lot of good later."
  },
  {
    rarity: 3,
    emotes: ["construction", "screwdriver", "jigsaw"],
    text: "A project is coming together one piece at a time. Keep tinkering, it's closer to done than it looks."
  },
  {
    rarity: 3,
    emotes: ["crystal_ball", "grey_heart", "sparkling_heart"],
    text: "Your heart knows more than you think about what you want. Trust your feelings about someone today."
  },
  {
    rarity: 3,
    emotes: ["dart", "book", "hourglass_flowing_sand"],
    text: "Focused study time is worth more than long hours today. Set a timer, aim for one goal, and go."
  },
  {
    rarity: 3,
    emotes: ["first_place_medal", "dragon", "battery"],
    text: "You have the energy and courage to tackle something big today. Go for it with everything you've got."
  },
  {
    rarity: 3,
    emotes: ["game_die", "fireworks", "beers"],
    text: "A spontaneous plan could turn into a great night. Say yes to something unexpected."
  },
  {
    rarity: 3,
    emotes: ["gift", "bouquet", "people_hugging"],
    text: "A small gesture of kindness goes a long way today. Give a little, and you'll feel just as good as they do."
  },
  {
    rarity: 3,
    emotes: ["hear_no_evil", "tea", "sleeping_accommodation"],
    text: "Tuning out the noise and resting up could do wonders for you today. Give yourself a quiet evening."
  },
  {
    rarity: 3,
    emotes: ["house_buildings", "people_hugging", "bubble_tea"],
    text: "Spending time at home with people you care about is just what you need today. Keep it simple and cozy."
  },
  {
    rarity: 3,
    emotes: ["jigsaw", "brain", "crystal_ball"],
    text: "Your mind and your gut are working together today. A puzzle that's been bugging you could suddenly make sense."
  },
  {
    rarity: 3,
    emotes: ["lightning", "art", "writing_hand"],
    text: "A sudden burst of inspiration might hit today. Get it down on paper before it fades away."
  },
  {
    rarity: 3,
    emotes: ["low_battery", "tea", "zzz"],
    text: "If you're feeling worn out, slow down and rest. Something warm to drink and an early night will set you right."
  },
  {
    rarity: 3,
    emotes: ["magic_wand", "art", "confetti_ball"],
    text: "Something you create today could turn out better than you planned. Enjoy the little moment of magic."
  },
  {
    rarity: 3,
    emotes: ["magnet", "sparkling_heart", "shirt"],
    text: "You're giving off a warm, inviting feeling today. Don't be surprised if someone is drawn to you."
  },
  {
    rarity: 3,
    emotes: ["milky_way", "dragon", "dart"],
    text: "A big dream is worth chasing today. Set your sights on it and take one bold step closer."
  },
  {
    rarity: 3,
    emotes: ["mortar_board", "book", "trophy"],
    text: "All that studying is getting you somewhere. A milestone is close, so keep at it."
  },
  {
    rarity: 3,
    emotes: ["parachute", "airplane_departure", "cyclone"],
    text: "A big change might feel a little shaky at first. Trust that you'll land well, because you usually do."
  },
  {
    rarity: 3,
    emotes: ["pushpin", "writing_hand", "hourglass_flowing_sand"],
    text: "Pin down a plan and write it out today. Seeing it on paper will make the time feel more manageable."
  },
  {
    rarity: 3,
    emotes: ["second_place_medal", "book", "dart"],
    text: "You're close to where you want to be. A bit more focused effort could push you over the edge."
  },
  {
    rarity: 3,
    emotes: ["see_no_evil", "cyclone", "tea"],
    text: "Things might be chaotic around you today. Step back, have a calm moment, and let the storm pass without you."
  },
  {
    rarity: 3,
    emotes: ["sleeping_accommodation", "battery", "sunny"],
    text: "A restful day leaves you recharged and in a great mood. Don't feel bad about taking it slow."
  },
  {
    rarity: 3,
    emotes: ["speak_no_evil", "speaking_head_in_silhouette", "scales"],
    text: "Knowing when to talk and when to listen is the key today. Balance the two and conversations will go smoothly."
  },
  {
    rarity: 3,
    emotes: ["sunny", "cherry_blossom", "bouquet"],
    text: "It's a bright day for appreciating the little beauties around you. Stop and enjoy something lovely."
  },
  {
    rarity: 3,
    emotes: ["tea", "book", "brain"],
    text: "A calm study session with a warm drink could help you think clearly today. Slow and steady works best."
  },
  {
    rarity: 3,
    emotes: ["third_place_medal", "people_hugging", "confetti_ball"],
    text: "Even if you didn't win, the people around you are proud of you. Celebrate the effort."
  },
  {
    rarity: 3,
    emotes: ["trophy", "champagne", "fireworks"],
    text: "There's an achievement worth celebrating today, even if it's small. Let yourself enjoy the moment."
  },
  {
    rarity: 3,
    emotes: ["volcano", "tea", "sleeping_accommodation"],
    text: "If tension has been building, it's a good day to cool off. Rest and quiet will help you let it go."
  },
  {
    rarity: 3,
    emotes: ["world_map", "dragon", "airplane_departure"],
    text: "A bold adventure is calling. Whether it's a new place or a new idea, take the leap."
  },
  {
    rarity: 3,
    emotes: ["writing_hand", "grey_heart", "milky_way"],
    text: "Writing down your thoughts about the past could help you see where you're headed. Give it a try tonight."
  },
  {
    rarity: 3,
    emotes: ["zzz", "brain", "crystal_ball"],
    text: "A good night's sleep could bring the answer you've been looking for. Your mind works things out while you rest."
  },
  {
    rarity: 3,
    emotes: ["airplane_departure", "moneybag", "scales"],
    text: "A trip or new start is worth planning carefully. Balance the budget, and it'll be even more enjoyable."
  },
  {
    rarity: 3,
    emotes: ["art", "shirt", "magnet"],
    text: "Showing a bit of your creative side today could catch someone's eye. Let your style shine."
  },
  {
    rarity: 3,
    emotes: ["battery", "dart", "trophy"],
    text: "With your energy high and your focus sharp, you could accomplish something to be proud of today."
  },
  {
    rarity: 3,
    emotes: ["bouquet", "sparkling_heart", "gift"],
    text: "A sweet surprise for someone you care about would brighten both your days. It doesn't have to be big."
  },
  {
    rarity: 3,
    emotes: ["busstop", "game_die", "lightning"],
    text: "Something unexpected might pop up while you're waiting today. It could turn out to be a pleasant surprise."
  },
  {
    rarity: 3,
    emotes: ["champagne", "mortar_board", "people_hugging"],
    text: "A learning milestone deserves a celebration. Share it with the people who helped you get there."
  },
  {
    rarity: 3,
    emotes: ["cherry_blossom", "airplane_departure", "milky_way"],
    text: "A new chapter is starting to bloom. Look ahead with hope, because good things are growing."
  },
  {
    rarity: 3,
    emotes: ["chess_pawn", "dart", "hourglass_flowing_sand"],
    text: "A patient, focused plan will get you further than rushing today. Take it one move at a time."
  },
  {
    rarity: 3,
    emotes: ["confetti_ball", "book", "bubble_tea"],
    text: "You finished something worth a little reward. Treat yourself, you've earned it."
  },
  {
    rarity: 3,
    emotes: ["construction", "house_buildings", "screwdriver"],
    text: "A small project around the house could be satisfying today. Roll up your sleeves and fix something."
  },
  {
    rarity: 3,
    emotes: ["crystal_ball", "game_die", "moneybag"],
    text: "Trust your gut on small choices today, but think twice before betting big. A little caution goes a long way."
  },
  {
    rarity: 3,
    emotes: ["dart", "writing_hand", "pushpin"],
    text: "Writing down a clear goal and pinning it somewhere you'll see it could keep you on track today."
  },
  {
    rarity: 3,
    emotes: ["first_place_medal", "speaking_head_in_silhouette", "people_hugging"],
    text: "Cheering someone else on today could feel just as good as winning yourself."
  },
  {
    rarity: 3,
    emotes: ["game_die", "magnet", "sparkling_heart"],
    text: "Taking a small chance on someone could pay off today. Be open to a little romance or a new friendship."
  },
  {
    rarity: 3,
    emotes: ["gift", "house_buildings", "bouquet"],
    text: "A kind gesture toward a neighbor or someone at home could brighten everyone's day."
  },
  {
    rarity: 3,
    emotes: ["hear_no_evil", "brain", "pushpin"],
    text: "Block out distractions today and focus on what you've committed to. You'll get more done than you expect."
  },
  {
    rarity: 3,
    emotes: ["hourglass_flowing_sand", "grey_heart", "tea"],
    text: "Time has a way of softening old hurts. Take a quiet moment to notice how far you've come."
  },
  {
    rarity: 3,
    emotes: ["house_buildings", "sunny", "cherry_blossom"],
    text: "Your surroundings feel especially pleasant today. Take a walk around your neighborhood and enjoy it."
  },
  {
    rarity: 3,
    emotes: ["jigsaw", "people_hugging", "speaking_head_in_silhouette"],
    text: "A good conversation could help you and someone close finally understand each other better."
  },
  {
    rarity: 3,
    emotes: ["lightning", "monorail", "pushpin"],
    text: "A sudden change of plans might come up on the go. Pin down the essentials and you'll handle it fine."
  },
  {
    rarity: 3,
    emotes: ["low_battery", "bubble_tea", "sleeping_accommodation"],
    text: "A little treat and a lot of rest is the perfect combination today. Take it easy and be kind to yourself."
  },
  {
    rarity: 3,
    emotes: ["magic_wand", "screwdriver", "jigsaw"],
    text: "Your handiness might look like magic today. Something tricky could come together with surprising ease."
  },
  {
    rarity: 3,
    emotes: ["magnet", "people_hugging", "house_buildings"],
    text: "People might gather around you today. Opening your home or your time to them could make for a lovely day."
  },
  {
    rarity: 3,
    emotes: ["milky_way", "sheep", "zzz"],
    text: "Counting stars or counting sheep, a peaceful night is on its way. Let your mind drift and rest well."
  },
  {
    rarity: 3,
    emotes: ["mortar_board", "dragon", "dart"],
    text: "A big learning goal is within reach. Aim high and face it with courage."
  },
  {
    rarity: 3,
    emotes: ["parachute", "moneybag", "pushpin"],
    text: "Setting aside a little for a rainy day could give you peace of mind. Pin down a small savings plan."
  },
  {
    rarity: 3,
    emotes: ["pushpin", "house_buildings", "rotating_light"],
    text: "A small task at home might need your attention. Take care of it now so it doesn't nag at you later."
  },
  {
    rarity: 3,
    emotes: ["second_place_medal", "people_hugging", "bouquet"],
    text: "Even if things didn't go perfectly, someone is ready to remind you how well you did. Let them."
  },
  {
    rarity: 3,
    emotes: ["see_no_evil", "shirt", "magnet"],
    text: "Don't worry so much about how you look today. The people who matter are drawn to you for who you are."
  },
  {
    rarity: 3,
    emotes: ["sleeping_accommodation", "book", "brain"],
    text: "Resting after a long stretch of learning helps everything sink in. Give your brain a break today."
  },
  {
    rarity: 3,
    emotes: ["speak_no_evil", "grey_heart", "tea"],
    text: "Letting an old disagreement stay quiet could bring you some peace today."
  },
  {
    rarity: 3,
    emotes: ["sunny", "beers", "people_hugging"],
    text: "A sunny hangout with good friends could be the highlight of your day. Make some time for it."
  },
  {
    rarity: 3,
    emotes: ["tea", "writing_hand", "milky_way"],
    text: "A quiet moment with a warm drink and a notebook could help you dream up something new."
  },
  {
    rarity: 3,
    emotes: ["third_place_medal", "dart", "battery"],
    text: "You're making steady progress. Keep your energy up and your aim steady, and you'll climb higher."
  },
  {
    rarity: 3,
    emotes: ["trophy", "people_hugging", "bouquet"],
    text: "Someone around you deserves some recognition today. Celebrating them will make you feel good too."
  },
  {
    rarity: 3,
    emotes: ["volcano", "dragon", "speaking_head_in_silhouette"],
    text: "Strong feelings could give you the courage to speak up today. Just keep it kind."
  },
  {
    rarity: 3,
    emotes: ["world_map", "book", "crystal_ball"],
    text: "Reading or learning about somewhere new could spark a feeling about where you want to go next."
  },
  {
    rarity: 3,
    emotes: ["writing_hand", "art", "cherry_blossom"],
    text: "Creative writing or drawing could flow easily today. Let the season inspire you."
  },
  {
    rarity: 3,
    emotes: ["zzz", "sunny", "battery"],
    text: "A great night's rest leaves you bright and full of energy. Make the most of it."
  },
  {
    rarity: 3,
    emotes: ["barely_sunny", "tea", "book"],
    text: "A slow, quiet day is perfect for curling up with something to read. Let the clouds pass on their own."
  },
  {
    rarity: 3,
    emotes: ["construction", "dragon", "jigsaw"],
    text: "A challenging project is coming together. Stay brave, the pieces are falling into place."
  },
  {
    rarity: 3,
    emotes: ["confetti_ball", "sparkling_heart", "gift"],
    text: "A sweet little surprise could make someone's day, maybe even yours. Keep an eye out for it."
  },
  {
    rarity: 3,
    emotes: ["chess_pawn", "people_hugging", "speaking_head_in_silhouette"],
    text: "A thoughtful word to the right person could open some doors. Plan what you want to say, then say it."
  },
  {
    rarity: 3,
    emotes: ["busstop", "sheep", "people_hugging"],
    text: "Waiting in line with others could lead to a nice chat. Sometimes the best moments happen in between."
  },
  {
    rarity: 3,
    emotes: ["airplane_departure", "sparkling_heart", "milky_way"],
    text: "Daydreaming about the future with someone special could bring a warm feeling today."
  },
  {
    rarity: 3,
    emotes: ["battery", "beers", "fireworks"],
    text: "You've got the energy for a fun night out today. Make plans with people who match your excitement."
  },
  {
    rarity: 3,
    emotes: ["champagne", "moneybag", "trophy"],
    text: "A small financial win deserves a little celebration. Just don't spend it all in one place."
  },
  {
    rarity: 3,
    emotes: ["gift", "game_die", "lightning"],
    text: "A surprise might come your way out of nowhere today. Enjoy the luck of the draw."
  },
  {
    rarity: 3,
    emotes: ["hourglass_flowing_sand", "dragon", "rotating_light"],
    text: "A deadline might feel like a big challenge. Face it head on, and you'll have more time than you think."
  },
  {
    rarity: 4,
    emotes: ["trophy", "trophy", "champagne", "champagne"],
    text: "A big achievement is close at hand. When it arrives, take the time to really celebrate it."
  },
  {
    rarity: 4,
    emotes: ["milky_way", "milky_way", "crystal_ball", "crystal_ball"],
    text: "Your hopes and your instincts are pointing the same way. Trust where they're leading you."
  },
  {
    rarity: 4,
    emotes: ["airplane_departure", "airplane_departure", "world_map", "world_map"],
    text: "Adventure is on your side. A trip or a fresh start could bring something wonderful into your life."
  },
  {
    rarity: 4,
    emotes: ["magic_wand", "magic_wand", "game_die", "game_die"],
    text: "Luck and skill are working together for you today. Take a chance on something you're good at."
  },
  {
    rarity: 4,
    emotes: ["sunny", "sunny", "cherry_blossom", "cherry_blossom"],
    text: "It's a beautiful day, inside and out. Good moods and good moments are easy to find."
  },
  {
    rarity: 4,
    emotes: ["battery", "battery", "dart", "dart"],
    text: "Your energy and focus are both at their peak. It's a great day to make real progress on a goal."
  },
  {
    rarity: 4,
    emotes: ["gift", "gift", "bouquet", "bouquet"],
    text: "Kindness is flowing your way today. Someone has something nice planned for you."
  },

  /* ---------- more readings to fill the gaps ---------- */
  {
    rarity: 1,
    emotes: ["zzz"],
    text: "Sleep might be a little restless tonight. Put the screens away a bit earlier and give your mind a chance to wind down."
  },
  {
    rarity: 1,
    emotes: ["busstop"],
    text: "Something you're counting on might run late today. Have a backup plan so a delay doesn't sour your mood."
  },
  {
    rarity: 1,
    emotes: ["pushpin"],
    text: "A promise you made might be slipping through the cracks. It's not too late to follow through, just pick it back up today."
  },
  {
    rarity: 1,
    emotes: ["game_die"],
    text: "Luck might not be on your side for games of chance today. Keep the stakes small and play just for fun."
  },
  {
    rarity: 1,
    emotes: ["magnet"],
    text: "You might find yourself pulled into someone else's drama today. It's okay to step back and stay out of it."
  },
  {
    rarity: 1,
    emotes: ["world_map"],
    text: "Plans to go somewhere might hit a small snag. A little flexibility will save the day."
  },
  {
    rarity: 1,
    emotes: ["tea"],
    text: "You might feel restless and unable to settle today. Take a few slow breaths before diving into anything."
  },
  {
    rarity: 1,
    emotes: ["parachute"],
    text: "A safety net you've been relying on might feel a little thin today. It's a good time to check your backup plans."
  },
  {
    rarity: 5,
    emotes: ["trophy", "trophy", "trophy", "trophy", "trophy"],
    text: "A big win is in the air. Something you've worked hard for is about to be recognized in a way that feels really good."
  },
  {
    rarity: 5,
    emotes: ["champagne", "champagne", "champagne", "champagne", "champagne"],
    text: "This is a day worth celebrating. Good news, good company or a happy surprise is on its way, so be ready to raise a glass."
  },
  {
    rarity: 5,
    emotes: ["milky_way", "milky_way", "milky_way", "milky_way", "milky_way"],
    text: "The stars are lining up for you. A hope you've held onto for a long time feels closer than ever."
  },
  {
    rarity: 5,
    emotes: ["magic_wand", "magic_wand", "magic_wand", "magic_wand", "magic_wand"],
    text: "Everything you touch seems to turn out right today. It's the kind of day where small efforts create surprising results."
  },
  {
    rarity: 5,
    emotes: ["crystal_ball", "crystal_ball", "crystal_ball", "crystal_ball", "crystal_ball"],
    text: "Your intuition is almost uncanny today. Trust what you feel, because it's leading you exactly where you need to go."
  },
  {
    rarity: 5,
    emotes: ["sunny", "sunny", "sunny", "sunny", "sunny"],
    text: "A bright, golden day is ahead. Your mood is high, your energy is good and the people around you feel it too."
  },
  {
    rarity: 5,
    emotes: ["first_place_medal", "first_place_medal", "first_place_medal", "first_place_medal", "first_place_medal"],
    text: "You're at the top of your game today. Whatever you set out to do, you'll do it with confidence and do it well."
  },
  {
    rarity: 5,
    emotes: ["gift", "gift", "gift", "gift", "gift"],
    text: "Something wonderful is coming your way, maybe when you least expect it. Accept it with open arms, you deserve it."
  },
  {
    rarity: 5,
    emotes: ["cherry_blossom", "cherry_blossom", "cherry_blossom", "cherry_blossom", "cherry_blossom"],
    text: "A beautiful new chapter is opening up. Everything feels fresh and full of promise, so enjoy every moment of it."
  },
  {
    rarity: 5,
    emotes: ["airplane_departure", "airplane_departure", "airplane_departure", "airplane_departure", "airplane_departure"],
    text: "A fresh start or a big adventure is ready to take off. Take the leap, the timing is on your side."
  },
  {
    rarity: 2,
    emotes: ["tea", "volcano"],
    text: "Something small might bother you more than it should today. A slow cup of something warm and a few deep breaths will cool things down."
  },
  {
    rarity: 2,
    emotes: ["house_buildings", "construction"],
    text: "Noise or mess around your home might test your patience today. Find a quiet corner to recharge when you can."
  },
  {
    rarity: 2,
    emotes: ["dart", "hourglass_flowing_sand"],
    text: "You might feel short on time to hit your goal today. Narrow it down to the one thing that matters most."
  },
  {
    rarity: 2,
    emotes: ["magic_wand", "screwdriver"],
    text: "A quick fix might not hold up today. Take the time to do it properly, and it'll last."
  },
  {
    rarity: 2,
    emotes: ["mortar_board", "low_battery"],
    text: "Studying might feel harder than usual today. Shorter sessions with real breaks will help it stick."
  },
  {
    rarity: 2,
    emotes: ["trophy", "see_no_evil"],
    text: "You might play down something you did well. Let yourself take the credit for once."
  },
  {
    rarity: 2,
    emotes: ["champagne", "moneybag"],
    text: "A celebration could cost more than you planned. Set a budget, and you'll enjoy it without the worry afterward."
  },
  {
    rarity: 2,
    emotes: ["gift", "speak_no_evil"],
    text: "A surprise you're planning might be hard to keep quiet. Hold onto it a little longer, it'll be worth it."
  },
  {
    rarity: 2,
    emotes: ["sunny", "low_battery"],
    text: "The day might look bright, but your energy might not match it. Enjoy what you can and don't push too hard."
  },
  {
    rarity: 2,
    emotes: ["cherry_blossom", "hourglass_flowing_sand"],
    text: "A nice moment might feel like it's passing too quickly. Slow down and savor it while it's here."
  },
  {
    rarity: 2,
    emotes: ["jigsaw", "cyclone"],
    text: "Things might feel scattered and hard to piece together today. Sort out one corner of the puzzle at a time."
  },
  {
    rarity: 2,
    emotes: ["milky_way", "barely_sunny"],
    text: "Your big dreams might feel a little out of reach today. That's just a cloudy moment, not the whole sky."
  },
  {
    rarity: 2,
    emotes: ["confetti_ball", "rotating_light"],
    text: "Celebrate the small wins today, but keep an eye on anything that still needs finishing."
  },
  {
    rarity: 2,
    emotes: ["airplane_departure", "busstop"],
    text: "A delay might push back plans to go somewhere. Patience now makes the trip more enjoyable later."
  },
  {
    rarity: 2,
    emotes: ["art", "hear_no_evil"],
    text: "Someone's opinion might discourage your creative side today. Make what you love, for yourself first."
  },
  {
    rarity: 3,
    emotes: ["trophy", "book", "mortar_board"],
    text: "All the learning you've done is building toward something worth being proud of. Keep it up a little longer."
  },
  {
    rarity: 3,
    emotes: ["champagne", "sparkling_heart", "people_hugging"],
    text: "A happy occasion with people you love could make today feel special. Make some time to celebrate together."
  },
  {
    rarity: 3,
    emotes: ["milky_way", "writing_hand", "crystal_ball"],
    text: "Writing down your dreams could help you understand them better. Your intuition is ready to guide the pen."
  },
  {
    rarity: 3,
    emotes: ["magic_wand", "bouquet", "sparkling_heart"],
    text: "A small romantic gesture could feel like magic today. It's the thought and the timing that count."
  },
  {
    rarity: 3,
    emotes: ["sunny", "world_map", "airplane_departure"],
    text: "Good weather for an adventure. A trip, even a short one, could brighten the whole week."
  },
  {
    rarity: 3,
    emotes: ["first_place_medal", "battery", "broccoli"],
    text: "Your body is ready to perform well today. Fuel up and give it your best effort."
  },
  {
    rarity: 3,
    emotes: ["gift", "confetti_ball", "bubble_tea"],
    text: "A little treat or a small surprise could be the highlight of the day. Enjoy the simple joys."
  },
  {
    rarity: 3,
    emotes: ["cherry_blossom", "grey_heart", "tea"],
    text: "A gentle moment of reflection could help you let go of something from the past. A new season is starting."
  },
  {
    rarity: 3,
    emotes: ["chess_pawn", "moneybag", "hourglass_flowing_sand"],
    text: "Patience with your money pays off. Small, steady moves add up over time."
  },
  {
    rarity: 3,
    emotes: ["jigsaw", "art", "brain"],
    text: "A creative puzzle might be the perfect challenge today. Let your mind play with it for a while."
  },
  {
    rarity: 3,
    emotes: ["dart", "trophy", "first_place_medal"],
    text: "You're aiming for something big, and you're closer than you think. Keep your focus sharp."
  },
  {
    rarity: 3,
    emotes: ["house_buildings", "tea", "zzz"],
    text: "A quiet night at home is just what you need. Rest up and enjoy the comfort of your own space."
  },
  {
    rarity: 3,
    emotes: ["parachute", "dragon", "world_map"],
    text: "A brave step into something unfamiliar could pay off. You have more safety nets than you realize."
  },
  {
    rarity: 3,
    emotes: ["pushpin", "people_hugging", "sparkling_heart"],
    text: "Making a plan with someone you care about could bring you closer. Pin down a time and stick to it."
  },
  {
    rarity: 3,
    emotes: ["crystal_ball", "brain", "scales"],
    text: "Your gut and your logic agree on something today. When they line up, it's a good sign to go ahead."
  },
  {
    rarity: 3,
    emotes: ["volcano", "bubble_tea", "sleeping_accommodation"],
    text: "If you've been feeling heated lately, a sweet treat and a long rest might be the best way to cool off."
  },
  {
    rarity: 3,
    emotes: ["busstop", "writing_hand", "brain"],
    text: "Waiting around could be the perfect time to jot down a few ideas. Inspiration often shows up in the in-between moments."
  },
  {
    rarity: 3,
    emotes: ["lightning", "dragon", "fireworks"],
    text: "A sudden burst of courage could lead to something exciting today. Trust the spark when it comes."
  },
  {
    rarity: 3,
    emotes: ["low_battery", "sunny", "battery"],
    text: "You might start the day slow, but your energy picks up as it goes. Give yourself time to warm up."
  },
  {
    rarity: 3,
    emotes: ["magnet", "gift", "people_hugging"],
    text: "Your generosity is drawing good people toward you. Kindness tends to come back around."
  },
  {
    rarity: 3,
    emotes: ["see_no_evil", "hear_no_evil", "speak_no_evil"],
    text: "Sometimes the best thing to do is stay out of it. Let a situation sort itself out without you."
  },
  {
    rarity: 3,
    emotes: ["champagne", "fireworks", "confetti_ball"],
    text: "There's something worth celebrating today, big or small. Let yourself enjoy the moment fully."
  },
  {
    rarity: 3,
    emotes: ["mortar_board", "writing_hand", "pushpin"],
    text: "Taking good notes today could really pay off later. Write down what matters and keep it somewhere safe."
  },
  {
    rarity: 3,
    emotes: ["third_place_medal", "second_place_medal", "first_place_medal"],
    text: "Every step up the podium counts. Keep climbing, you're getting better each time."
  },
  {
    rarity: 3,
    emotes: ["construction", "house_buildings", "people_hugging"],
    text: "Fixing up your space with help from others could be a fun project today. Many hands make light work."
  },
  {
    rarity: 3,
    emotes: ["game_die", "chess_pawn", "brain"],
    text: "A little strategy can turn luck in your favor. Think a step ahead before you roll the dice."
  },
  {
    rarity: 3,
    emotes: ["art", "sparkling_heart", "writing_hand"],
    text: "Making something for someone you care about could mean a lot to them today. Handmade gestures go far."
  },
  {
    rarity: 3,
    emotes: ["airplane_departure", "grey_heart", "milky_way"],
    text: "Leaving something from the past behind could make room for new hopes. You're ready for the next chapter."
  },
  {
    rarity: 3,
    emotes: ["bouquet", "house_buildings", "tea"],
    text: "Making your home feel welcoming could lift your spirits. Fresh flowers or a tidy corner go a long way."
  },
  {
    rarity: 3,
    emotes: ["sleeping_accommodation", "milky_way", "crystal_ball"],
    text: "Your dreams tonight might bring a little insight. Pay attention to what you remember in the morning."
  },
  {
    rarity: 3,
    emotes: ["dart", "screwdriver", "construction"],
    text: "Focus on fixing one thing at a time today. A clear target makes even big projects manageable."
  },
  {
    rarity: 3,
    emotes: ["jigsaw", "grey_heart", "people_hugging"],
    text: "An old friendship might fit back into your life in a new way. Reconnecting could feel natural."
  },
  {
    rarity: 3,
    emotes: ["trophy", "speaking_head_in_silhouette", "people_hugging"],
    text: "Telling someone how proud you are of them could make their day. Recognition means a lot."
  },
  {
    rarity: 3,
    emotes: ["parachute", "rotating_light", "scales"],
    text: "Taking a moment to check your safety nets could ease your mind. Balance a little risk with a bit of caution."
  },
  {
    rarity: 3,
    emotes: ["volcano", "writing_hand", "tea"],
    text: "Writing out your frustrations could help you let them go. A calm moment afterward will feel even better."
  },
  {
    rarity: 3,
    emotes: ["magic_wand", "book", "brain"],
    text: "Something you're learning could suddenly click in a way that feels like magic. Keep at it."
  },
  {
    rarity: 3,
    emotes: ["cherry_blossom", "bubble_tea", "people_hugging"],
    text: "A sweet afternoon with friends could be the perfect way to enjoy the season. Make plans to get together."
  },
  {
    rarity: 3,
    emotes: ["lightning", "jigsaw", "crystal_ball"],
    text: "A sudden realization might connect the dots on something that's been puzzling you. Trust the spark."
  },
  {
    rarity: 3,
    emotes: ["battery", "dragon", "trophy"],
    text: "With your energy up and your courage high, you could achieve something to be proud of today."
  },
  {
    rarity: 3,
    emotes: ["hourglass_flowing_sand", "sheep", "busstop"],
    text: "Waiting with everyone else might feel slow, but your turn is coming. Patience will be rewarded."
  },
  {
    rarity: 4,
    emotes: ["first_place_medal", "first_place_medal", "trophy", "trophy"],
    text: "You're on a winning streak. Something you've worked hard on is about to pay off in a big way."
  },
  {
    rarity: 4,
    emotes: ["sparkling_heart", "sparkling_heart", "magnet", "magnet"],
    text: "Love and affection are drawn to you today. Someone special might be thinking about you."
  },
  {
    rarity: 4,
    emotes: ["crystal_ball", "crystal_ball", "dart", "dart"],
    text: "Your instincts and your focus are both sharp today. Trust your aim, it's right on target."
  },
  {
    rarity: 4,
    emotes: ["house_buildings", "house_buildings", "people_hugging", "people_hugging"],
    text: "Home and the people in it bring you joy today. A warm gathering could be the highlight of your week."
  },
  {
    rarity: 4,
    emotes: ["mortar_board", "mortar_board", "book", "book"],
    text: "A big learning milestone is within reach. All your hard work is about to pay off."
  },
  {
    rarity: 4,
    emotes: ["art", "art", "magic_wand", "magic_wand"],
    text: "Your creativity is at its peak. Whatever you make today will feel inspired."
  },
  {
    rarity: 4,
    emotes: ["sunny", "sunny", "beers", "beers"],
    text: "Good times with good friends are on the horizon. Make plans to enjoy the day together."
  },
  {
    rarity: 4,
    emotes: ["tea", "tea", "sleeping_accommodation", "sleeping_accommodation"],
    text: "Rest and calm come easily today. A peaceful day leaves you refreshed and ready for anything."
  },
  {
    rarity: 4,
    emotes: ["world_map", "world_map", "dragon", "dragon"],
    text: "A bold adventure is calling, and you're ready for it. Say yes to something new and exciting."
  },
  {
    rarity: 4,
    emotes: ["chess_pawn", "chess_pawn", "moneybag", "moneybag"],
    text: "Smart choices with money are starting to pay off. Your patience has put you in a strong position."
  },
  {
    rarity: 4,
    emotes: ["jigsaw", "jigsaw", "brain", "brain"],
    text: "Everything is clicking into place today. A problem that seemed tough suddenly makes perfect sense."
  },
  {
    rarity: 4,
    emotes: ["writing_hand", "writing_hand", "speaking_head_in_silhouette", "speaking_head_in_silhouette"],
    text: "Your words carry real weight today. Whether written or spoken, they'll land just right."
  },
  {
    rarity: 4,
    emotes: ["confetti_ball", "confetti_ball", "fireworks", "fireworks"],
    text: "Celebrations are in the air. Small wins add up to something worth cheering about."
  },
  {
    rarity: 4,
    emotes: ["battery", "battery", "broccoli", "broccoli"],
    text: "You're feeling strong and healthy today. It's a great day to take on something active."
  },
  {
    rarity: 4,
    emotes: ["parachute", "parachute", "airplane_departure", "airplane_departure"],
    text: "A leap of faith is ready to pay off. Take the jump, you'll land somewhere wonderful."
  }
];
