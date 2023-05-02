// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
import * as pdfparser from 'pdf-parse';

export const getPDFText = async (pdfFile, maxPages) => {
  try {
    if (!fs.existsSync(pdfFile)) {
      throw new Error('PDF file not found');
    }

    const pdfBuffer = fs.readFileSync(pdfFile);
    const options = maxPages ? { max: maxPages } : undefined;
    const parsedPDF = await pdfparser(pdfBuffer, options);

    if (!parsedPDF) {
      throw new Error('Failed to parse PDF');
    }
    console.log(parsedPDF.text);
    return parsedPDF.text;
  } catch (err) {
    return err.message;
  }
};
