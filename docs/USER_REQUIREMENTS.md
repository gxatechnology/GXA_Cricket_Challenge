

PROJECT: GXA CRICKET CHALLENGE

PUBLISHER: GXA GAMES STUDIO



ROLE:

Act as a principal HTML5 sports-game engineer, senior Three.js developer, mobile UX designer, cricket gameplay designer, animation specialist, and production QA engineer.



TASK:

Perform a major final UX, gameplay pacing, scoreboard, controls, camera, and player progression upgrade on the EXISTING GXA Cricket Challenge application.



DO NOT REBUILD THE GAME FROM SCRATCH.



Preserve all existing working:

- Batting gameplay
- Bowling physics and variation
- Shot timing and collision logic
- Character animation engine
- Match modes
- Scoring system
- Cricket stadium
- Player achievements
- Audio
- Existing earned coins and saved progression



Do not overwrite or reset existing player data.



REFERENCE:

Study successful mobile cricket games, particularly Miniclip Cricket League, for design principles such as fast match pacing, concise match information, accessible controls, clear progression, and rewards.



Use references for inspiration only. Never reproduce copyrighted graphics, assets, branded elements, or exact interface layouts.



\==================================================

1. REMOVE EXCESSIVE NEXT-BALL DELAYS

\==================================================



The current game has an 8-second forced delay after many deliveries.



This is too slow for an enjoyable arcade cricket experience.



Implement automatic delivery progression.



Normal completed deliveries:

2.5–3 seconds of transition after the shot is fully resolved.



Boundary deliveries:

Allow a short celebration without excessive waiting.



Wickets:

Allow slightly longer dismissal feedback, then continue automatically.



Do not count the ball's active flight or animations as idle waiting.



Do not start a new delivery before:

- The previous ball is fully resolved
- The score has been updated
- The fielder's applicable action has finished
- The ball is dead
- Character reset is safe



Use a robust delivery state machine.



Do not implement overlapping setTimeout chains.



Use cancellable, pause-aware timers.



\==================================================

2\. REMOVE NEXT BALL BUTTON FROM NORMAL PLAY

\==================================================



Completely remove the persistent Next Ball button from routine batting gameplay.



The user must never be forced to tap Next Ball after every delivery.



Automatically initialize the next bowler run-up.



Remove:

- Next Ball (Space) prompt
- Large countdown overlays
- Red or unnecessary button indicators
- Oversized transition cards
- Repeated instructions blocking the pitch



Keep keyboard shortcuts only where genuinely useful.



During gameplay, preserve a clear view of:

- Bowler
- Batsman
- Ball
- Pitch
- Fielders



\==================================================

3\. OPTIONAL REPLAY SYSTEM

\==================================================



Replay must not interrupt every ball.



Implement a compact replay action in the score HUD.



Players may watch the previous delivery by explicitly choosing Replay.



When replay starts:

- Pause the upcoming delivery
- Pause all countdowns
- Display replay with suitable camera framing
- Allow Skip or Exit Replay
- Restore the correct match state



After replay:

Resume with a short 1-second transition.



Replays must never:

- Award runs again
- Duplicate coins
- Change wickets
- Consume another ball
- Corrupt progression



Do not display a large replay popup during active play.



\==================================================

4\. PREMIUM COMPACT MATCH SCOREBOARD

\==================================================



Redesign the existing scoreboard into a compact, broadcast-inspired match HUD.



Show:



- Batting team name
- Bowling team name
- Runs and wickets
- Current overs
- Total overs
- Target when applicable
- Runs required
- Balls remaining
- Required run rate
- Current run rate
- Striker name
- Non-striker name
- Batsman runs and balls faced
- Bowler name
- Previous ball result



Important:

Correctly distinguish the strike and non-strike batsman.



Update striker rotation according to the game's cricket rules.



Maintain individual player statistics accurately.



Do not invent opposing scores in modes that do not have an opposing innings.



In challenge modes without two genuine teams, show a clear mode objective instead of fabricating match history.



Display target information only in applicable modes.



Provide local AI opponent names where appropriate.



Do not falsely represent AI opponents as real online players.



Keep the scoreboard compact on mobile screens.



\==================================================

5\. IMPROVE MATCH INFORMATION CLARITY

\==================================================



For Target Chase:



TARGET: 58

CURRENT: 42/2

NEED: 16

BALLS LEFT: 3

REQUIRED RATE: 32.0



Use actual game-state values.



For Quick Match:



Show current score, overs and individual batting statistics.



For Six Challenge:



Show sixes target, current six count, balls remaining and progress.



For Endless:



Show runs, wickets and personal best.



For Tournament:



Show match stage, opponent name, current score and objective.



Make the HUD mode-aware.



Never hard-code sample scores into live gameplay.



\==================================================

6\. ONE-TIME SHOT CONTROL SELECTION

\==================================================



Currently the user must manage too many controls during batting.



Redesign the control system:



- Shot direction: Cover / Straight / Pull
- Shot type: Defend / Drive / Loft
- Main action: Swing



The last selected shot direction and shot type must persist.



Do not reset them after every ball.



Store user preferences appropriately.



Allow players to change choices anytime.



Keep the main Swing button large and accessible.



Support touch, swipe, mouse and keyboard.



Never trigger duplicate swing actions from a single input.



Avoid control overlap with browser UI and safe areas.



\==================================================

7\. SEPARATE CAMERA CONTROLS

\==================================================



The Broadcast camera control is confusing and occupies too much interface space.



Create a compact camera settings icon.



Provide:



- Broadcast
- Batter Close
- Aerial



Show the current camera mode clearly.



Allow switching when safe.



Remember the last selection.



Camera switching must not interrupt active shots.



Improve camera framing to keep:

- Ball
- Pitch
- Batsman
- Bowler



visible during important moments.



Fix oversized empty stadium views.



Avoid clipping the batsman or placing active gameplay outside the viewport.



\==================================================

8\. FULL MOBILE HUD REDESIGN

\==================================================



Optimize for mobile portrait first.



Move all essential information to compact screen-edge panels.



Never obscure central cricket gameplay.



Header:

- GXA Cricket Challenge
- Compact coin balance
- Sound
- Pause
- Home



Match HUD:

- Teams
- Scores
- Target
- Overs
- Batsman names



Gameplay:

Maximum practical viewport for cricket pitch and characters.



Footer:

- Direction selector
- Shot-type selector
- Swing button



Allow safe-area padding.



Avoid horizontal page scrolling.



Buttons must be clearly readable and comfortably tappable.



Allow a compact landscape arrangement for desktop.



Remove development labels including:

- Phase 2
- Phase 3
- Phase 4
- PRO development badges
- Internal QA labels from the player-facing interface



Do not remove useful legitimate game information.



\==================================================

9\. COIN WALLET SYSTEM

\==================================================



Build a separate, transparent coin wallet.



Coins can be earned from:

- Match performance
- Match completion
- Valid achievements
- Daily challenges
- Tournament progression



Use configurable, balanced rewards.



Prevent duplicate coin grants.



Track transaction history.



Show coin balance clearly.



Never grant coins from unverified ad callbacks.



Never introduce fake monetization rewards.



Do not promise real money earnings to players.



\==================================================

10\. ADVANCED BAT GARAGE

\==================================================



Separate Bat Garage from the Wallet.



Create an attractive Bat Garage accessible through the main menu.



Display:

- Current equipped bat
- Bat collection
- Unlock requirements
- Upgrade level
- Upgrade cost
- Stat differences
- Equipped state
- Available coin balance



Suggested stats:

- Shot Power
- Timing Forgiveness
- Control
- Sweet Spot



Keep bat upgrade effects modest and skill-friendly.



Do not make the gameplay unfairly dependent on coins.



Use configurable upgrade levels.



Show before-and-after stat changes.



Require confirmation before spending coins.



Preserve already unlocked bats and previous purchases.



Migrate existing saved data without wiping progress.



\==================================================

11\. ANIMATION AND PRESENTATION POLISH

\==================================================



Keep the existing skeletal animation system.



Improve:

- Natural batsman preparation
- Bat grip alignment
- Shot follow-through
- Bowler reset
- Smooth delivery preparation
- Fielders returning to home positions
- Bowling release synchronization
- Foot placement and running animations
- Frame-rate-independent motion



Fix visible clipping and animation interruptions.



Do not replace existing characters with simplistic primitives.



Do not claim motion-captured animation without actual usable assets.



Maintain smooth WebGL performance on mobile.



\==================================================

12\. RELIABLE MATCH ENGINE

\==================================================



Review the delivery state machine.



Ensure:



- Each ball is counted exactly once
- Each run is credited exactly once
- Wickets are never duplicated
- Results finish before subsequent deliveries
- Correct over progression
- Correct strike changes
- Correct last-ball result
- Correct end-of-innings conditions
- Correct target completion
- Correct pause and resume
- Correct replay recovery



Never start another ball while the previous delivery is still active.



Prevent race conditions, stale timers and duplicate updates.



\==================================================

13\. GAME REWARD BALANCING

\==================================================



Make progression rewarding without unnecessary waiting.



Rewards should be reasonable for:

- Scoring runs
- Hitting boundaries
- Completing matches
- Achieving personal bests
- Winning tournament rounds



Avoid excessive rewards for repeated easy actions.



Do not show coins being earned without a valid game event.



Keep all virtual coins clearly separate from publisher advertising revenue.



\==================================================

14\. QUALITY ASSURANCE

\==================================================



Run automated and manual tests for:



- 2-over match
- 5-over match
- Target Chase
- Six Challenge
- Endless mode
- Tournament mode
- Next-ball automation
- Replay selection
- Pause during countdown
- Resume after replay
- Changing camera
- Changing shot controls
- Fast repeated taps
- Scoring accuracy
- Over completion
- Bat unlocks
- Bat upgrades
- Coin spending
- Save migration
- Android portrait layout
- iOS Safari layout
- Desktop layout



Verify the compiled production build.



Report tests actually executed.



Do not claim tests passed if they were not run.



\==================================================

15\. FINAL DELIVERABLES

\==================================================



Provide:



1. Updated existing source files

2\. Clean mobile-first HUD

3\. Automatic bowling flow

4\. Optional instant replay

5\. Clear player and match scoreboard

6\. Persistent batting controls

7\. Improved camera controls

8\. Separate coin wallet

9\. Separate Bat Garage

10\. Stable progression and save migration

11\. Improved animations

12\. Working production build

13\. Actual test results

14\. Exact list of changed files

15\. Deployment-ready dist folder

16\. Ready-to-upload HTML5 ZIP for Y8 evaluation



Preserve the original project structure where practical.



Do not create fake completed features.



Do not introduce unnecessary dependencies.



Do not change the existing GitHub repository or deploy automatically without authorization.



FINAL GOAL:



Create a highly polished, original, responsive HTML5 cricket game that is fast, easy to understand and satisfying to replay.



The user should be able to play a full cricket match without repeatedly clicking Next Ball.



The field should remain visible.



The controls should remain intuitive.



The scoreboard should clearly explain the match situation.



The player should understand how to earn coins and upgrade bats.



Work on the current GXA Cricket Challenge codebase and complete the implementation rather than generating a new prototype.
