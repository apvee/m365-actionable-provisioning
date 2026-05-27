#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

interface LocalizedResources {
    ControlStrings?: string;
    [key: string]: string | undefined;
}

interface ConfigJson {
    localizedResources?: LocalizedResources;
    [key: string]: unknown;
}

console.info(
    "### Adding the required localized resource configuration for '@apvee/spfx-actionable-provisioning' to the config.json file. ###"
);

// Get the current directory
const crntDir = path.resolve(__dirname);

// Split the whole directory path (handle both Unix and Windows)
const nesting = crntDir.split(path.sep);

// Check if correctly split
if (nesting.length > 0) {
    // Find the first node_modules folder index
    const idx = nesting.indexOf('node_modules');

    // Check if index of the folder was found
    if (idx !== -1) {
        // Slice unnecessary nodes
        const nest = nesting.slice(idx);

        if (nest.length > 0) {
            const paths = nest.map(() => '..');
            // Get the path of the project's root location
            const rootDir = path.resolve(path.join(__dirname, ...paths));
            const fileLoc = path.join(rootDir, 'config', 'config.json');

            // Check if config.json file exists
            if (fs.existsSync(fileLoc)) {
                // Get the config file
                const config = fs.readFileSync(fileLoc, 'utf8');

                if (config && typeof config === 'string') {
                    const contents: ConfigJson = JSON.parse(config);

                    if (contents?.localizedResources && !contents.localizedResources.SPFxProvisioningUIStrings) {
                        contents.localizedResources.SPFxProvisioningUIStrings = 'node_modules/@apvee/spfx-actionable-provisioning/lib/provisioning-ui/loc/{locale}.js';

                        // Update the file
                        fs.writeFileSync(fileLoc, JSON.stringify(contents, null, 2));
                        console.info("INFO: Localized resource for '@apvee/spfx-actionable-provisioning' added");
                    } else {
                        console.warn(
                            'WARNING: It seems something is wrong with the config.json file or the "SPFxProvisioningUIStrings" reference was already set.'
                        );
                    }
                } else {
                    console.warn('WARNING: The config.json file was not correctly retrieved.');
                }
            } else {
                console.warn('WARNING: The config.json file does not exist.');
            }
        } else {
            console.warn('WARNING: Something is wrong with the installation path.');
        }
    } else {
        console.warn("WARNING: Something went wrong during with retrieving the project's root location.");
    }
} else {
    console.warn('WARNING: Something is wrong with the installation path.');
}

console.info("### Post-installation script for '@apvee/spfx-actionable-provisioning' completed. ###");
