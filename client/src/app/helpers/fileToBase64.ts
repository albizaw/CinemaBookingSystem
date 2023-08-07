export function fileToBase64(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('No file provided.');
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject('Error converting file to Base64.');
      }
    };

    reader.onerror = () => {
      reject('Error reading the file.');
    };

    reader.readAsDataURL(file);
  });
}
