# Medable Dev Tools Atom Package

This atom package makes it easy to download all of your Medable Cortex org configuration for versioning. Additionally, you can edit your scripts and save your scripts back to your org, making it much easier to develop your Cortex scripts.

## Installing

Download and install Atom from https://atom.io

Open Atom, open up `Atom > Preferences` and select `Install`

<p align="center">
<img src="https://cloud.githubusercontent.com/assets/1857984/20955426/099fdaf8-bbf8-11e6-90fa-423a616881a0.png" width="250" align="center"/>
</p>

In the search field, type `medable` and hit `enter`. This will bring up the `medable-dev-tools` package. Click `Install` to install the package.

<p align="center">
<img src="https://cloud.githubusercontent.com/assets/1857984/20955427/09a8e576-bbf8-11e6-80fa-880b9cd782bd.png" width="600" align="center"/>
</p>

From `Atom > Preferences` select `Core` settings. Then, add `.medable` to the list of ignored file names.

<p align="center">
<img src="https://cloud.githubusercontent.com/assets/1857984/21082603/a1959d36-bf93-11e6-996b-044eca00f156.png" width="600" align="center"/>
</p>

Then, select `Packages` and search for `Tree-View` and click on the `Settings` button.

<p align="center">
<img src="https://cloud.githubusercontent.com/assets/1857984/21082625/2985381e-bf94-11e6-8aeb-43f68a5e6167.png" width="500" align="center"/>
</p>

From the Tree-View package settings, check the check box to `Hide Ignored Names`

<p align="center">
<img src="https://cloud.githubusercontent.com/assets/1857984/21082604/a1a9e23c-bf93-11e6-8f4c-f3ae0b498989.png" width="500" align="center"/>
</p>

Now restart Atom

## Using Medable Dev Tools

To get started, create a new folder for your project and open it in Atom.

<p align="center">
<img src="https://cloud.githubusercontent.com/assets/1857984/21078592/ee47be1c-bf29-11e6-871f-af47ca57fb06.png" width="450" align="center"/>
</p>

You'll have a new empty project that looks similar to this.

<p align="center">
<img src="https://cloud.githubusercontent.com/assets/1857984/20955425/098ac6d6-bbf8-11e6-89b1-8881e07e0482.png" width="600" align="center"/>
</p>

To enable Medable Dev Tools in your project, from the Packages menu choose Medable > Enable

<p align="center">
<img src="https://cloud.githubusercontent.com/assets/1857984/21078593/ee4873e8-bf29-11e6-8f66-6c581f9fcf81.png" width="600" align="center"/>
</p>

Specify the Medable settings for your project:
 - Environment
  - `api.dev.medable.com` for your dev environment (recommended)
  - `api.medable.com` for you prod environment
 - Org Name
  - The unique name for your org. This is the org name you specified when signing up.
 - API Key
  - A session-based API key for your org. You can get this key from the `Settings > Apps` menu in your org control panel. You can also click on the `Get API Key` link which will take you to your control panel to log in.
  - If you don't yet have an API key, see[Generating an API Key](https://docs.medable.com/getting_started/generating_api_key) in the Medable docs.

<p align="center">
<img src="https://cloud.githubusercontent.com/assets/1857984/21078596/ee4ae768-bf29-11e6-89b5-7fbf6cbeb3fa.png" width="600" align="center"/>
</p>

Now, you'll see a `Medable` menu in the menu bar. From the `Medable`, select `Pull All`.

<p align="center">
<img src="https://cloud.githubusercontent.com/assets/1857984/21078594/ee498896-bf29-11e6-94f9-5dabbbcb5bbd.png" width="450" align="center"/>
</p>

You'll then be prompted to log into your org.

<p align="center">
<img src="https://cloud.githubusercontent.com/assets/1857984/20955433/09b99a1a-bbf8-11e6-84b8-c86f3e52f860.png" width="600" align="center"/>
</p>

After logging in, you'll see the Pull take place. You'll see a new folder structure appear in your project for all of your org elements.

<p align="center">
<img src="https://cloud.githubusercontent.com/assets/1857984/20955434/09bd390e-bbf8-11e6-82aa-702fa8687c5f.png" width="250" align="center"/>
</p>

These folders contain all of the definitions for your org configuration. From here, you can now commit this project to source control to begin versioning your org config.

Also you can use Atom as your IDE for your custom scripts. In your `scripts` folder, you'll find sub-folders for all the different types of scripts you've created in your org. You'll also notice that for each scripts, you have a `.js` file and a `.json` file. The `.js` file is your script itself, while the `.json` file holds all of the definition detail about your script. You can modify these files and save them locally. Then, when ready, you can select `Push Scripts` from the `Medable` menu to save your scripts back to your org.

Happy coding!
