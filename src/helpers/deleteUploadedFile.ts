const fs = require('fs');

// This function deletes the uploaded file after it has been processed
export function deleteUploadedFile(filename: string): void {
  const path = `./uploads/${filename}`;
  fs.unlink(path, (err) => {
    if (err) {
      console.error(`Error deleting file: ${path}`, err);
    } else {
      console.log(`Deleted file: ${path}`);
    }
  });
}
