# medable-dev-tools package

This atom package makes it easy to download all of your Medable Cortex org configuration for versioning. Additionally, you can edit your scripts and save your scripts back to your org, making it much easier to develop your Cortex scripts.

## Installing

To get started, create a new folder for your project and open it in Atom.
![Open...](https://cloud.githubusercontent.com/assets/1857984/21078592/ee47be1c-bf29-11e6-871f-af47ca57fb06.png)

You'll have a new empty project that looks something like this.

![Empty project](https://cloud.githubusercontent.com/assets/1857984/20955425/098ac6d6-bbf8-11e6-89b1-8881e07e0482.png)

Then you'll need to install the `medable-developer-tools` package. To do so, just go to `Atom > Preferences > Install`

![Install Packages](https://cloud.githubusercontent.com/assets/1857984/20955426/099fdaf8-bbf8-11e6-90fa-423a616881a0.png)

And in the search field, type `medable` and hit `enter`. This will bring up the `medable-dev-tools` package. Click `Install` to install the package.

![Install](https://cloud.githubusercontent.com/assets/1857984/20955427/09a8e576-bbf8-11e6-80fa-880b9cd782bd.png)

Once the packge is installed, click on the Packages menu and choose Medable > Enable

![Endable](https://cloud.githubusercontent.com/assets/1857984/21078593/ee4873e8-bf29-11e6-8f66-6c581f9fcf81.png)

This will bring up the Medable Settings for your project. Enter the `Environment` for your org (for either dev or prod), enter in the `Org Name` for your org, and the `API Key`.

![Settings Entered](https://cloud.githubusercontent.com/assets/1857984/21078596/ee4ae768-bf29-11e6-89b5-7fbf6cbeb3fa.png)

Now, you'll see a `Medable` menu in the menu bar. From the `Medable`, select `Pull All`.

![Pull all](https://cloud.githubusercontent.com/assets/1857984/21078594/ee498896-bf29-11e6-94f9-5dabbbcb5bbd.png)

You'll then be prompted to log into your org.

![Log in](https://cloud.githubusercontent.com/assets/1857984/20955433/09b99a1a-bbf8-11e6-84b8-c86f3e52f860.png)

After logging in, you'll see the Pull take place. You'll see a new folder structure appear in your project for all of your org elements.

![Folders](https://cloud.githubusercontent.com/assets/1857984/20955434/09bd390e-bbf8-11e6-82aa-702fa8687c5f.png)

These folders contain all of the definitions for your org configuration. From here, you can now commit this project to source control to begin versioning your org config.

Also you can use Atom as your IDE for your custom scripts. In your `scripts` folder, you'll find sub-folders for all the different types of scripts you've created in your org. You'll also notice that for each scripts, you have a `.js` file and a `.json` file. The `.js` file is your script itself, while the `.json` file holds all of the definition detail about your script. You can modify these files and save them locally. Then, when ready, you can select `Push Scripts` from the `Medable` menu to save your scripts back to your org.

Happy coding!
