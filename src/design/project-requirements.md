# Project Requirements

## Business Requirements

The idea of applications ([Tachiyomi](https://github.com/tachiyomiorg), [Vencord](https://vencord.dev/)) and games ([Mindustry](https://github.com/Anuken/Mindustry)) having addons has always fascinated me. Users of such software can extend or change existing features at runtime by using easily pluggable parts of code. While the execution of user code may be dangerous, it also allows one to customize the software to a way greater extent.

Despite plugin systems being useful and popular in various projects, most Minecraft Launchers lack such feature. At the moment of writing, only [SJMCL](https://github.com/UNIkeEN/SJMCL) and [nitrolaunch](https://github.com/Nitrolaunch/nitrolaunch) have implemented user plugins, both launchers being written in [Tauri](https://v2.tauri.app/). Yet, they provide a very restricted set of capabilities to those plugins, significantly lacking in User Interface customizations.

Since none of the existing solutions fulfill my desires, I decided to create Kaede. This project aims to be a Minecraft Launcher with a robust plugin system that also provides a sandboxed version of plugins (similar to an Android permission system).

## User Requirements

Every Minecraft player has their own vision of what a great launcher should look like. Therefore, it is hard to make a launcher that will appeal to a majority. However, should we even worry about such things? In case of this launcher - probably no since it is my hobby project and not some company's software. I code Kaede primarily for myself, so sometimes I may not add a really popular feature that exists in other launchers if I do not use it. That is when user plugins can be useful, though.

Since the project is being made mainly for myself, I am the main user of it. So, as a user, I should know what I need, right?.. Well, to some extent. The general idea and direction are known, but the actual features that will be implemented are hard to specify. Therefore, I decided first to compare all popular launchers in a table:

## Functional Requirements


