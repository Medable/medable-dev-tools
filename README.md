# medable-dev-tools package

This atom package makes it easy to download all of your Medable Cortex org configuration for versioning. Additionally, you can edit your scripts and save your scripts back to your org, making it much easier to develop your Cortex scripts. 

## Installing

To get started, create a new folder for your project and open it in Atom. You'll have a new empty project that looks something like this.
![Empty project](https://cloud.githubusercontent.com/assets/1857984/20955425/098ac6d6-bbf8-11e6-89b1-8881e07e0482.png)

Then you'll need to install the `medable-developer-tools` package. To do so, just go to `Atom > Preferences > Install`
![Install Packages](https://cloud.githubusercontent.com/assets/1857984/20955426/099fdaf8-bbf8-11e6-90fa-423a616881a0.png)

And in the search field, type `medable` and hit `enter`. This will bring up the `medable-developer-tools` package. Click `Install` to install the package. 
![Install](https://cloud.githubusercontent.com/assets/1857984/20955427/09a8e576-bbf8-11e6-80fa-880b9cd782bd.png)

Once the packge is installed, you'll see a `Settings` button appear for the packge. Click on that button to enter in the setting for your org.
![Settings](https://cloud.githubusercontent.com/assets/1857984/20955428/09abdf6a-bbf8-11e6-8130-6dc32127c993.png)

From the settings page, select the `Environment` for your org (eithe rdev or prod), enter in the `Org Name` for your org, and the `API Key`.
![Settings Entered](https://cloud.githubusercontent.com/assets/1857984/20955431/09ae4408-bbf8-11e6-8ac1-60a887cc8e6c.png)

If you haven't been prompted to already, restart Atom.

Now, you'll see a `Medable` menu in the menu bar. From the `Medable`, select `Pull All`. 
![Pull all](https://cloud.githubusercontent.com/assets/1857984/20955432/09b1d6b8-bbf8-11e6-8ae3-54a2c6e1ef3c.png)

You'll then be prompted to log into your org.
![Log in](https://cloud.githubusercontent.com/assets/1857984/20955433/09b99a1a-bbf8-11e6-84b8-c86f3e52f860.png)

After logging in, you'll see the Pull take place. You'll see a new folder structure appear in your project for all of your org elements.
![Folders](https://cloud.githubusercontent.com/assets/1857984/20955434/09bd390e-bbf8-11e6-82aa-702fa8687c5f.png)

These folders contain all of the definitions for your org configuration. From here, you can now commit this project to source control to begin versioning your org config.

Also you can use Atom as your IDE for your custom scripts. In your `scripts` folder, you'll find sub-folders for all the different types of scripts you've created in your org. You'll also notice that for each scripts, you have a `.js` file and a `.json` file. The `.js` file is your script itself, while the `.json` file holds all of the definition detail about your script. You can modify these files and save them locally. Then, when ready, you can select `Push Scripts` from the `Medable` menu to save your scripts back to your org.

Happy coding!



