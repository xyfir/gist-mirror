#!/usr/bin/env node

import { isAbsolute, basename, resolve } from 'path';
import { readJSON, copyFile, remove } from 'fs-extra';
import { promisify } from 'util';
import * as _glob from 'glob';
import * as cp from 'child_process';

const glob = promisify(_glob);
const exec = promisify(cp.exec);

interface GistMirrorConfig {
  /**
   * username/gist-id
   * @example "MrXyfir/23ae904cf7ec9f399d110196cc3ec113"
   */
  gist: string;
  /**
   * Glob patterns.
   */
  files: string[];
}

(async () => {
  try {
    let configPath = process.argv[2];
    const cwd = process.cwd();

    // Get path to config file
    if (!configPath) configPath = resolve(cwd, 'gist-mirror.json');
    else if (!isAbsolute(configPath)) configPath = resolve(cwd, configPath);

    // Load config file
    console.log(`Loading config from ${configPath}`);
    const config: GistMirrorConfig = await readJSON(configPath);
    const [, id] = config.gist.split('/');

    // Delete local gist if needed
    const gistDir = resolve(cwd, id);
    await remove(gistDir);

    // Load list of files from glob matches
    let filesPaths: string[] = [];
    for (let fileGlob of config.files) {
      filesPaths = filesPaths.concat(await glob(fileGlob));
    }
    filesPaths = [...new Set(filesPaths)];
    console.log('Found matching files');
    console.log(`\t${filesPaths.join('\n\t')}`);

    // Clone gist
    await exec(`git clone -q git@gist.github.com:${id}.git`);

    // Wipe gist
    const gistFiles = await glob(`${id}/**`);
    console.log('Wiping gist');
    for (let filePath of gistFiles.slice(1)) {
      const file = basename(filePath);
      console.log(`\t${file}`);
      await remove(resolve(gistDir, file));
    }

    // Copy in files and overwrite existing
    console.log('Copying files');
    for (let filePath of filesPaths) {
      const to = resolve(gistDir, basename(filePath));
      console.log(`\t${filePath} -> ${to}`);
      await copyFile(filePath, to);
    }

    // Commit and push changes
    await exec('git add -A', { cwd: gistDir });
    await exec('git commit -q -m "Mirror changes"', { cwd: gistDir });
    await exec('git push origin master', { cwd: gistDir });

    // Delete local gist
    await remove(gistDir);

    console.log('Mirroring complete');
  } catch (err) {
    console.error('Something went wrong...', err);
  }
})();
