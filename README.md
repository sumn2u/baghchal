Bagchal: The Hunt for Goats
======

[![GitHub issues](https://img.shields.io/github/issues/sumn2u/baghchal)](https://github.com/sumn2u/baghchal/issues) [![GitHub forks](https://img.shields.io/github/forks/sumn2u/baghchal)](https://github.com/sumn2u/baghchal/network)
[![GitHub stars](https://img.shields.io/github/stars/sumn2u/baghchal)](https://github.com/sumn2u/baghchal/stargazers)
[![GitHub license](https://img.shields.io/github/license/sumn2u/baghchal)](https://github.com/sumn2u/baghchal/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/sumn2u/bagchal.svg?style=social)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fsumn2u%2Fbaghchal)


**Bagh-Chal** (बाघ चाल) is a traditional strategic board game that originated in Nepal. The name translates to "Tiger's Move" in Nepali. This asymmetric two-player game pits four tigers against twenty goats in a battle of wits and strategy. The game is also played in southern India as Aadu Puli Aatam (ஆடு புலி ஆட்டம்), typically on a different board layout, though the core rules remain identical.

[![bagchal banner](./screenshots/bagchal_banner.png)](https://youtu.be/cyQjHWMCXNE)


<!-- Minimal Download Badges -->
<div align="center">
  <div style="display: flex; justify-content: center; align-items: center; gap: 15px; flex-wrap: wrap; margin: 25px 0;">
    <a href="https://play.google.com/store/apps/details?id=com.baghchal.live">
      <img src="https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white"  alt="Android"/>
    </a>
    <a href="https://apps.apple.com/us/app/baghchal-the-hunt-for-goats/id6753636764">
      <img src="https://img.shields.io/badge/App_Store-000000?style=for-the-badge&logo=apple&logoColor=white"   alt="iOS"/>
    </a>
    <a href="https://sumn2u.github.io/baghchal/">
      <img src="https://img.shields.io/badge/Web_Version-FF7139?style=for-the-badge&logo=firefox-browser&logoColor=white"  alt="Web"/>
    </a>
  </div>
</div>


This project was initially built for [Community Challenge hackathon](https://developercircles2019.devpost.com) by Facebook Developers Community and submitted as a [baghchal-nepali-board-game](https://devpost.com/software/baghchal-nepali-board-game).


## 🎯 Game Concept

- **Tigers (बाघ)**: Hunt the goats by jumping over them (similar to checkers)
- **Goats (बाख्रा)**: Block the tigers' movements and trap them
- **Asymmetric gameplay**: Different win conditions for each side
- **Strategic depth**: Simple rules but complex tactical possibilities


## Screenshots
<div align="center">
<table>
<tr>
<td align="center">
<strong>Home Screen</strong><br>
<img alt="game-home-screen" width="300" src="./screenshots/Slice 1.png">
</td>
<td align="center">
<strong>Game Levels</strong><br>
<img alt="game-level-screen" width="300" src="./screenshots/Slice 2.png">
</td>
<td align="center">
<strong>Player Selection</strong><br>
<img alt="game-player-screen" width="300" src="./screenshots/Slice 3.png">
</td>
</tr>
<tr>
<td align="center">
<strong>Instructions for goat</strong><br>
<img alt="game-board-screen" width="300" src="./screenshots/Slice 4.png">
</td>
<td align="center">
<strong>Gameplay</strong><br>
<img alt="game-gameplay" width="300" src="./screenshots/Slice 5.png">
</td>
<td align="center">
<strong>Strategy View</strong><br>
<img alt="game-strategy" width="300" src="./screenshots/Slice 6.png">
</td>
</tr>
<tr>
<td align="center">
<strong>Victory Screen</strong><br>
<img alt="game-winner" width="300" src="./screenshots/Slice 7.png">
</td>
<td align="center">
<strong>Sound Settings</strong><br>
<img alt="game-instructions" width="300" src="./screenshots/Slice 8.png">
</td>
<td align="center">
<strong>Instructions for Tiger</strong><br>
<img alt="game-in-fb" width="300" src="./screenshots/Slice 9.png">
</td>
</tr>
</table>
</div>

## Installation

Installing `bagh-chal` is easy.  You can clone the repo from here.

```bash
git clone https://github.com/sumn2u/baghchal.git
```

... and run the following command

```bash
cd baghchal && yarn install && yarn start
```

Then open your browser to [https://localhost:5001](https://localhost:5001).

## Instructions
<img alt="Instructions"  src="./screenshots/Instructions.png">

## Support the project ⭐

If you feel awesome and want to support us in a small way, please consider starring and sharing the repo! This helps us get visibility and allow the community to grow. 🙏

<img alt="Botpress" width="250" src="./screenshots/star_us.gif">

## Demos

▶️ **Open demo:** [https://sumn2u.github.io/baghchal/](https://sumn2u.github.io/baghchal/)



## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3/Sass, Vanilla JavaScript
- **Build Tool**: Webpack 5 with Babel
- **Audio**: Howler.js for sound management
- **Networking**: Socket.io for multiplayer
- **Backend**: Node.js/Express server
- **Deployment**: GitHub Pages, Firebase, and native wrappers



## Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting a pull request.

Feel free to pull and contribute! If you do, please make a separate branch on your Pull Request, rather than pushing your changes to the Master. It would also be greatly appreciated if you ran the appropriate tests before submitting the request. Hope you enjoy playing this game 💜.


## License

[BSD-3-Clause License](./LICENSE)
