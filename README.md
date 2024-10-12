# ReNameIt 

An AI-based renamer for Visual Studio Code.

## Overview

Tired of coming up with file names that just don’t quite fit? ReNameIt is here to save you time and hassle. This smart VSCode extension analyzes the content of your files and suggests more right, relevant names—so you don’t have to. Whether you're working with code, documentation, or configurations, ReNameIt ensures your file names stay sharp and aligned with their purpose. From coding best practices to project clarity, let ReNameIt take the guesswork out of naming.

### Features

- Provides suggestions for improved file names.
- Allows users to accept or deny the suggestions.
- Supports various naming conventions such as camelCase, PascalCase, snake_case, and more.
- Supports the following file types:
  - Markdown (.md)
  - Plain Text (.txt)
  - TypeScript (.ts)
  - JavaScript (.js)
  - TypeScript JSX (.tsx)
  - JavaScript JSX (.jsx)
  - YAML (.yaml)
  - YML (.yml)

### Usage

1. Open a file in VSCode.
2. ***Optional***: Set your preferred Naming Convention
   - Go to Settings or press `Ctrl + ,`.
   - Search for `ReNameIt` in the settings.
   - Choose your preferred naming convention, for example, camelCase, PascalCase, snake_case, etc.
3. **Run the command** to rename the file. There are several ways to trigger this:
   - **Via Command Palette**: Press `Ctrl+Shift+P`, type **ReNameIt: Improve the name of the current file**, and hit Enter.
   - **Via File Explorer**: Right-click on any file in the file explorer and select **ReNameIt: Improve the name of the current file** from the context menu.
   - **Via Editor**: Right-click anywhere inside an open file in the editor and select **ReNameIt: Improve the name of the current file** from the editor's context menu.
4. Choose whether to accept, deny, or retry the renaming process.

### Requirements

- You need to have an active internet connection to use the extension.
- Visual Studio Code version 1.58.0 or higher.

### Installation

To install the extension:

- Download it from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/).
- Install it directly from VSCode via the Extensions tab.

### Contribution

Feel free to open issues or contribute improvements by submitting a pull request.
