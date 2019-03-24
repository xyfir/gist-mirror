Mirror files from a local repository to a Github gist.

Built and maintained by **[Ptorx](https://ptorx.com)** and other **[Xyfir Network](https://www.xyfir.com)** projects.

# Install

```bash
npm install -g gist-mirror
```

# Usage

Let's assume you're in a repository/directory with the following structure:

```
server/
  ...files to ignore...
mobile/
  ...files to ignore...
types/
  ...files to ignore...
docs/
  contribute.md
  help.md
  legal/
    terms-of-service.md
    privacy-policy.md
web/
  ...files to ignore...
```

Then let's say we want to mirror our `docs/` folder to Github Gist so that our documentation files can be easily embedded elsewhere, for example with [react-github-gist](https://github.com/Xyfir/react-github-gist). Now, we don't want to create a new gist every time, instead, we want the same one to be updated whenever we change `docs/` in our main repository. So, we create a gist, then get its id, something like `GithubUser/23ae904cf7ec9f399d110196cc3ec113`.

Next, wherever you like, create a JSON file, preferrably called `gist-mirror.json`. We'll fill it out with the following object:

```json
{
  "gist": "GithubUser/23ae904cf7ec9f399d110196cc3ec113",
  "files": ["docs/**"]
}
```

Note that `files` accepts an array of glob patterns, so it could also look like:

```json
["docs/contribute.md", "**/privacy-policy.md", "terms-of-service.md", "..."]
```

Next, run the following:

```bash
gist-mirror [path/to/gist-mirror-file.json]
```

**Note**: Omitting the argument will load `gist-mirror.json` from the current directory.

If you check your gist, you should see now all of the files from `docs/` flattened (remember, gists don't have folders) into your gist, so that its structure will look like:

```
contribute.md
help.md
terms-of-service.md
privacy-policy.md
```

Now, whenever you make a change to a file in `docs/`, simply run `gist-mirror` again and it'll mirror your changes to your gist.

# Important Notes

Git must be installed and available on the command line.

Github and git will need to be configured to use SSH and the appropriate credentials from the command line for pulling and pushing your gist.

The gist will be cloned to and deleted from the current working directory. Meaning, don't keep a local copy of your gist in the same directory you run `gist-mirror` from because it'll be deleted.

Due to gists not having folders, if your glob patterns match multiple files with the same name in different directories, the last one found will be used.
