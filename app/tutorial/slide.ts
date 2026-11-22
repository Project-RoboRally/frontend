/**
 * Content for the tutorial slideshow (Only text)
 *
 * @author Kerem
 */

// --- The structure of a slide ---

export type Item = string; // Think of it as when making a list on latex overleaf (\begin{itemize}) where each point is \item

export type Block =
  // One piece of component, that we can build the slides up as
  | { type: 'p'; text: string }
  | { type: 'list'; items: Item[]; ordered?: boolean }
  | { type: 'note'; tone: 'warning' | 'joke' | 'tip'; text: string }
  | { type: 'link'; label: string; href: string };
// And its shortcuts, so we can for example write p('text') instead of { type: 'p', text: 'text } every single time
const p = (text: string): Block => ({ type: 'p', text });
const list = (items: Item[], ordered = false): Block => ({ type: 'list', items, ordered });
const note = (tone: 'warning' | 'joke' | 'tip', text: string): Block => ({
  type: 'note',
  tone,
  text,
});
const link = (label: string, href: string): Block => ({ type: 'link', label, href });

export type Slide = {
  section: number;
  title: string;
  image?: string;
  blocks: Block[];
};

export const SECTIONS = [
  'Welcome',
  'Getting started',
  'The basics',
  'Upgrade phase',
  'Programming phase',
  'Offline players',
  'Activation phase',
  'Next round',
];

// --- All of the slides that will be implemented for the tutorial (scripts improved via. Claude)   ---

export const SLIDES: Slide[] = [
  {
    section: 0,
    title: 'Welcome to RoboRally',
    blocks: [
      p(
        'This short tutorial walks you through the web version of RoboRally, from logging in to winning your first game. Use the arrows to move through the steps.',
      ),
      p(
        'You program a robot with movement cards, race it across a hazardous factory floor and try to reach every checkpoint before anyone else. Expect your plans to go wrong when rival robots push and shoot their way through.',
      ),
      p(
        'This is a quick-start guide. For the complete rules, see the official game guide linked on the last slide.',
      ),
    ],
  },
  {
    section: 0,
    title: 'Work in progress',
    blocks: [
      note(
        'warning',
        'This web application is still being developed and will change as new features and bug fixes are added. Some screens, buttons or rules may look different from the screenshots here, and you may run into bugs. Thanks for your patience!',
      ),
    ],
  },
  {
    section: 1,
    title: 'Login',
    image: '/tutorial/01.png',
    blocks: [
      p('Enter your username and password and press Login.'),
      note(
        'tip',
        "No account yet? Just type a new username and password and you'll be signed up automatically.",
      ),
      p(
        'Under Accessibility settings you can turn on a dyslexic-friendly font and a colorblind high-contrast mode.',
      ),
    ],
  },
  {
    section: 1,
    title: 'Main menu',
    image: '/tutorial/02.png',
    blocks: [
      p('This is your home screen. Your username is shown in the top right.'),
      list([
        "My Games: lobbies and games you're already part of.",
        'Create Lobby: type a name and press the button to host a game.',
        'Search available lobbies: open lobbies you can join appear on the right.',
        'Tutorial / Sign Out: open this guide, or log out.',
      ]),
    ],
  },
  {
    section: 1,
    title: 'Your lobby',
    image: '/tutorial/03.png',
    blocks: [
      p(
        'You created the lobby, so you have the Owner badge and can rename the lobby by clicking its name.',
      ),
      p(
        'Pick your robot under Your robot. The Start button stays greyed out until at least one more player has joined. Press Exit to leave.',
      ),
    ],
  },
  {
    section: 1,
    title: 'Joining a lobby',
    image: '/tutorial/04.png',
    blocks: [
      p(
        'This is the main menu of a second player (AnonNOTser). The new lobby shows up in the list on the right. Click its name to join.',
      ),
    ],
  },
  {
    section: 1,
    title: 'Waiting for everyone to be ready',
    image: '/tutorial/05.png',
    blocks: [
      p(
        'The new player appears with the robot they chose. Robots that are already taken are greyed out, so everyone gets a different one.',
      ),
      p(
        'The empty circle means the player is not ready yet. As owner you can remove a player with the x button. The Start button tells you why it is disabled.',
      ),
    ],
  },
  {
    section: 1,
    title: 'Ready to start',
    image: '/tutorial/06.png',
    blocks: [
      p(
        'The owner renamed the lobby to Tournament, and the checkmark shows the other player is ready. The Start button is now active. Press it to begin.',
      ),
    ],
  },
  {
    section: 2,
    title: 'Goal of the game and how a round works',
    blocks: [
      p(
        'Goal: program your robot to reach every checkpoint in numerical order. A checkpoint only counts if your robot ends a register on it. The first robot to do this on the final checkpoint wins.',
      ),
      p('Every round has three phases:'),
      list(
        [
          'Upgrade: spend energy on upgrades.',
          'Programming: everyone programs their robot at the same time.',
          'Activation: the programs run, one register at a time.',
        ],
        true,
      ),
      p(
        'When players take turns (upgrades and activation), the robot closest to the priority antenna goes first.',
      ),
    ],
  },
  {
    section: 2,
    title: 'The game board',
    image: '/tutorial/07.png',
    blocks: [
      list([
        'Board: the factory. Reach the numbered checkpoint flags in order.',
        "Top: your opponent's name and their five register slots.",
        'Right side: the round, the phase, your checkpoints, energy (everyone starts with 5) and upgrades.',
        'Upgrade shop: one upgrade per player. You buy in priority order and may buy only one, or press Skip.',
        'Bottom: your deck counter and five registers. Press Run when ready.',
      ]),
    ],
  },
  {
    section: 3,
    title: 'Upgrade tooltips',
    image: '/tutorial/08.png',
    blocks: [
      p(
        'Hover over an upgrade to read what it does. Recharge (cost 0) gives you three energy. The cost in energy is shown on each button.',
      ),
      p(
        'Temporary upgrades like Recharge are used once and then discarded. Permanent upgrades last for the rest of the game. You can hold up to three of each.',
      ),
    ],
  },
  {
    section: 3,
    title: 'Upgrade bought',
    image: '/tutorial/09.png',
    blocks: [
      p(
        'Recharge now appears under Upgrades. The shop says Waiting for AnonNOTser, because upgrades are bought in priority order. When everyone is done, the game moves on to programming.',
      ),
    ],
  },
  {
    section: 4,
    title: 'Programming phase',
    image: '/tutorial/10.png',
    blocks: [
      p(
        'The phase changed to Programming. Everyone programs at the same time. You can also use temporary upgrades now, for example Use Recharge.',
      ),
      p(
        'The deck counter shows draw pile – discard pile. You start with 20 cards, so after drawing your hand of 9 it reads 11–0.',
      ),
    ],
  },
  {
    section: 4,
    title: 'Pick your cards',
    image: '/tutorial/11.png',
    blocks: [
      p(
        'You draw 9 cards and choose 5, one for each register. Drag a card onto a register, or click a card and then a slot.',
      ),
      p(
        'Register 1 runs first. AGAIN cannot go in register 1, because it repeats the previous register. Once you place your last card you cannot change it.',
      ),
    ],
  },
  {
    section: 4,
    title: 'Card cheat sheet',
    blocks: [
      list([
        'Move 1 / 2 / 3: move forward that many spaces.',
        'Back Up: move one space back, without turning.',
        'Turn Left / Turn Right: rotate 90° in place.',
        'U-Turn: rotate 180° in place.',
        'Power Up: gain one energy.',
        'Again: repeat the previous register.',
      ]),
    ],
  },
  {
    section: 4,
    title: 'Waiting for others',
    image: '/tutorial/12.png',
    blocks: [
      p(
        'After you press Run, your cards are locked in and the game waits for the other players. The cards you did not use go to the discard pile.',
      ),
      p(
        'The timer (Time left) starts when the first player finishes. If you run out of time, your unfinished registers are filled with random cards from your deck.',
      ),
    ],
  },
  {
    section: 5,
    title: 'A player is offline',
    image: '/tutorial/13.png',
    blocks: [
      p(
        'A red banner says Waiting for AnonNOTser, who is offline. Click their name to start a kick vote. My five cards are placed and Run is ready, but the round cannot continue without him.',
      ),
      note(
        'joke',
        'AnonNOTser could see that I was about to be the first to reach the checkpoint, so he decided to rage quit lol.',
      ),
    ],
  },
  {
    section: 5,
    title: 'Kick vote',
    image: '/tutorial/14.png',
    blocks: [
      p(
        'A window asks: Start a vote to kick AnonNOTser? Their robot leaves the game only if every online player votes yes. Press Start vote to begin or Cancel to keep waiting.',
      ),
      p('(Spoiler: he came back.)'),
    ],
  },
  {
    section: 6,
    title: 'Activation phase',
    image: '/tutorial/15.png',
    blocks: [
      p(
        "Now the programs run. Everyone's cards are revealed and register 1 runs first, in priority order. Then board elements and lasers fire, and the next register starts. The highlighted card is the register being executed.",
      ),
      p('In this round my robot reached checkpoint 1 and my energy went up to 6.'),
    ],
  },
  {
    section: 6,
    title: 'Board elements',
    blocks: [
      p('They only affect a robot that ends a register on them, and fire in this order:'),
      list(
        [
          'Blue conveyor belts: move you 2 spaces.',
          'Green conveyor belts: move you 1 space.',
          'Push panels: push you one space, only in the registers numbered on them.',
          'Gears: rotate you 90°.',
          'Board lasers: shoot you.',
          'Robot lasers: shoot whoever they face.',
          'Energy spaces: give you an energy cube.',
          'Checkpoints: are scored.',
        ],
        true,
      ),
      note('tip', 'Walls block movement and lasers. Pits make you reboot.'),
    ],
  },
  {
    section: 6,
    title: 'Damage and rebooting',
    blocks: [
      list([
        'SPAM: a laser hit puts one in your discard pile, where it clogs your deck.',
        'Programmed damage: a damage card takes effect, goes back to the pile, and a random top card is played instead.',
        'Special damage: Virus spreads to nearby robots, Worm forces a reboot, Trojan Horse gives you 2 SPAM.',
        'Reboot: falling into a pit or off the board costs 2 SPAM and cancels your program for the round. You return to the reboot token, facing any direction.',
      ]),
      p('Robots can also be pushed into pits.'),
    ],
  },
  {
    section: 7,
    title: 'Round 3: more upgrades',
    image: '/tutorial/16.png',
    blocks: [
      p(
        'After register 5 your cards go to the discard pile and a new Upgrade phase starts. The shop now offers:',
      ),
      list([
        'Blue Screen of Death (4 energy): permanent. When you shoot or push an adjacent robot, you may give them a Worm instead of SPAM.',
        'Firewall (3 energy): permanent. You take no SPAM when rebooting.',
      ]),
      p('The buttons are greyed out because AnonNOTser has priority and buys first.'),
    ],
  },
  {
    section: 7,
    title: 'Game over',
    image: '/tutorial/17.png',
    blocks: [
      p(
        'The first robot to end a register on the final checkpoint wins. Press Back to Main Menu to play again. Good luck, and have fun!',
      ),
      note(
        'tip',
        'Want the full rules, all racing courses and every upgrade card? This tutorial only covers the basics. Read the official rulebook:',
      ),
      link(
        'Richard Garfield: RoboRally Game Guide, Hasbro Gaming, 2015',
        'http://media.wizards.com/2017/rules/roborally_rules.pdf',
      ),
    ],
  },
];
