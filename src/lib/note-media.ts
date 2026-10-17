// Heavy note media (comparison videos and their audio tracks) streams from the
// owner's Hugging Face dataset when a reader presses play; posters and stills
// stay same-origin. A page links each file at one commit, so published bytes
// never change, and data/note-media.json records every file's size and SHA-256.
export const noteMediaRepository =
  'https://huggingface.co/datasets/DennySORA/dennysora-site-media';

/** The pinned URL of a recorded file. */
export function noteMediaUrl(file: { revision: string; path: string }): string {
  return `${noteMediaRepository}/resolve/${file.revision}/${file.path}`;
}
