# Dark Tower

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## Live Site

> [https://ianjstutor.github.io/dark-tower/](https://ianjstutor.github.io/dark-tower/)

## Description

![Dark Tower board and pieces](/media/img/tabletop.jpg)

The 1981 Board Game _Dark Tower_ by Milton Bradley was an electronic fantasy that fueled my adventurous childhood. Apparently, I'm not alone, as there's quite a lot of nostalgia for this game, even though its beeps and whirrs are wincingly archaic compared to modern electronic games. If you want to know what the game was like, Orson Welles can say it best:

> [https://www.youtube.com/watch?v=_3HVCwPp7j0](https://www.youtube.com/watch?v=_3HVCwPp7j0)

My old game, once loved and played weekly, is now dirty and with a partially collapsed box, having been living in my parents' basement for decades. I recovered it, which is great, but the electronics no longer function properly, which is sad. That's why I created this web app.

Built with vanilla JavaScript, my favorite flavor!

## Gameplay

### One app shared by all players

This simulates the original game in which there was one user interface to be used by all players. One player turned the Tower and interacted with it, and then ended the turn and waited for play to come around again. Here, the app is launched--perhaps on one mobile device--and that app is passed from one player to the next. If it's not your turn, you wait just as you would for the original game.

Any number of players may join the game, but see below for the single-player version.

* Winning the Wizard as treasure after a successful battle allows the player to curse any of the other players, transferring warriors and gold. This is the only true interaction among players.

### One app for each player (or single player)

In this version, each player (including a single player) has an open copy of the app. This enables all players to take a turn simultaneously and only wait until all players have ended the turn.

Any number of players may play the game in this way.

* Winning the Wizard as treasure after a successful battle acts as protection from a random Cursed event, much as the Healer protects from Plague. There is no true interaction among players.

## Security

None. This works completely in the front end and there is no back-end storage or database. There is an easily manipulated global object stored in the browser memory. The game can be hacked from the browser, so don't play with cheaters. There are no current plans to protect the game with better security.

## Author

> [Ian Marshall](https://ianjstutor.github.io/ian-marshall/)