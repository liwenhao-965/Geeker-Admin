/**
 * Extracts a JSON object from a PNG file.
 * Adapted from SillyTavern / Weaving Dreams
 * @param {Uint8Array} data The PNG data to extract the JSON from.
 * @param {string} identifier The identifier to look for in the PNG tEXT data.
 * @returns {object|null} The extracted JSON object.
 */
export function extractDataFromPng(data: Uint8Array, identifier: string = "chara"): any {
  const uint8 = new Uint8Array(4);
  const uint32 = new Uint32Array(uint8.buffer);

  // check if png header is valid
  if (
    !data ||
    data[0] !== 0x89 ||
    data[1] !== 0x50 ||
    data[2] !== 0x4e ||
    data[3] !== 0x47 ||
    data[4] !== 0x0d ||
    data[5] !== 0x0a ||
    data[6] !== 0x1a ||
    data[7] !== 0x0a
  ) {
    console.error("PNG header invalid");
    return null;
  }

  let ended = false;
  const chunks = [];
  let idx = 8;

  while (idx < data.length) {
    // Read the length of the current chunk
    uint8[3] = data[idx++];
    uint8[2] = data[idx++];
    uint8[1] = data[idx++];
    uint8[0] = data[idx++];

    const length = uint32[0] + 4;
    const chunk = new Uint8Array(length);
    chunk[0] = data[idx++];
    chunk[1] = data[idx++];
    chunk[2] = data[idx++];
    chunk[3] = data[idx++];

    // Get the name in ASCII
    const name =
      String.fromCharCode(chunk[0]) +
      String.fromCharCode(chunk[1]) +
      String.fromCharCode(chunk[2]) +
      String.fromCharCode(chunk[3]);

    if (name === "IEND") {
      ended = true;
      chunks.push({ name, data: new Uint8Array(0) });
      break;
    }

    // Read the contents of the chunk
    for (let i = 4; i < length; i++) {
      chunk[i] = data[idx++];
    }

    // Read CRC
    idx += 4;

    const chunkData = new Uint8Array(chunk.buffer.slice(4));
    chunks.push({ name, data: chunkData });
  }

  if (!ended) {
    console.error(".png file ended prematurely");
  }

  const found = chunks.filter(
    x =>
      x.name === "tEXt" &&
      x.data.length > identifier.length &&
      x.data.slice(0, identifier.length).every((v, i) => String.fromCharCode(v) === identifier[i])
  );

  if (found.length === 0) {
    // Try ccv3 if chara not found
    if (identifier === "chara") {
      return extractDataFromPng(data, "ccv3");
    }
    return null;
  } else {
    try {
      let b64buf = "";
      const bytes = found[0].data;
      for (let i = identifier.length + 1; i < bytes.length; i++) {
        b64buf += String.fromCharCode(bytes[i]);
      }
      return JSON.parse(decodeURIComponent(escape(atob(b64buf))));
    } catch (e) {
      console.error(`Error decoding b64 in image: ${e}`);
      return null;
    }
  }
}
