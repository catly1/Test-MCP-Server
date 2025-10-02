# Local Media MCP Server

This project is a simple Node.js server that implements the Model Context Protocol (MCP). It exposes local media files (an image and an audio file) as tools that can be called by an MCP client. The server reads the specified files, encodes them in base64, and returns them in the standard MCP tool output format.

## Features

* Implements the Model Context Protocol (`@modelcontextprotocol/sdk`) for tool exposure.
* Exposes a `generate_image` tool to serve a local PNG file.
* Exposes a `generate_music` tool to serve a local MP3 file.
* Returns file data encoded in base64 with the correct MIME type.
* Uses robust, absolute path handling to locate files, so it can be run from any directory.

## Prerequisites

* [Node.js](https://nodejs.org/) (v18+ recommended)
* npm 

## Installation

1.  Clone the repository to your local machine:
    ```
    git clone https://github.com/catly1/Test-MCP-Server.git
    ```
2.  Navigate into the newly created project directory:
    ```
    cd Test-MCP-Server
    ```
3.  Install the required dependencies from the `package.json` file:
    ```
    npm install
    ```


## File Structure

For the server to work correctly, your files **must** be arranged in the following structure. The media files are located in an `output` subdirectory.

```
your-project-folder/
|-- node_modules/
|-- output/
|   |-- generated.mp3
|   +-- generated.png
|-- index.js          <-- Your Node.js script
+-- package.json
```
## Usage

To start the server manually, run the script using Node from the root of your project directory:

```
node index.js
```

## Client Configuration Example

If you are using an MCP client or manager that automatically launches servers, you will need to provide it with the command to start this server. Here is an example configuration for such a client:

```json
{
  "mcpServers": {
    "LocalMedia": {
      "command": "node",
      "args": [
        "<Path to>/Test MCP/index.js"
      ]
    }
  }
}
```
Important Notes:

You must provide the full, absolute path to your script in the args array.

Make sure to replace "<Path to>/Test MCP/index.js" with the actual path to your script file.

The server is named "LocalMedia" in this example, but you can name it anything you like in your client's configuration.

## Tools Exposed

The server exposes the following two tools to any connected MCP client.

### `generate_image`

* **Description**: Reads the `output/generated.png` file, encodes it, and returns it.
* **Input**: None.
* **Output**: An MCP content object containing the base64 data.
    * `type`: `image`
    * `mimeType`: `image/png`
    * `data`: `<base64_encoded_string_of_the_png>`

### `generate_music`

* **Description**: Reads the `output/generated.wav` file, encodes it, and returns it.
* **Input**: None.
* **Output**: An MCP content object containing the base64 data.
    * `type`: `audio`
    * `mimeType`: `audio/wav`
    * `data`: `<base64_encoded_string_of_the_wav>`

### `generate_multiple_images`

* **Description**: Reads all supported image files (PNG, JPG, GIF) from the `output/` directory, encodes each one, and returns them in a single response.
* **Input**: None.
* **Output**: An MCP content object containing an array of image data blocks. The structure for **each** block in the array is as follows:
    * `type`: `image`
    * `mimeType`: `image/png`, `image/jpeg`, or `image/gif` (depending on the file)
    * `data`: `<base64_encoded_string_of_the_image>`