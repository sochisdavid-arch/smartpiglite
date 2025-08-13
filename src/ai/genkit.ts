import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({
    apiKey: "AIzaSyD3TdAFwymZzevFIIKopTd4FMQ4ZXcjDiU"
  })],
  model: 'googleai/gemini-2.0-flash',
});
