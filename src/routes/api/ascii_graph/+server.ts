import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

//  import { session } from '$app/stores';

 

import { env } from '$env/dynamic/private';
// You may want to replace the above with a static private env variable
// for dead-code elimination and build-time type-checking:
// import { OPENAI_API_KEY } from '$env/static/private'

import type { RequestHandler } from './$types';
const apiKey = import.meta.env.VITE_OPENAI_API_KEY //env.OPENAI_API_KEY 
// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: apiKey
});

let directiveToApi = ''
// console.log("I AMsdsdsd  API KEy", apiKey)

export const POST = (async ({ request }) => {
  // Extract the `prompt` from the body of the request
  const { prompt } = await request.json();

  console.log("i is prompt", prompt)
  if (prompt.startsWith("flow_graph_320_")) {
    // The prompt starts with "flow_graph_320_"

    // Remove the prefix from the prompt
    const prefixLength = "flow_graph_320_".length;
    const cleanPrompt = prompt.substring(prefixLength);

    // Now, 'cleanPrompt' contains the prompt without the "flow_graph_320_" prefix
    // You can use 'cleanPrompt' in your directive or anywhere else you need the adjusted string

    directiveToApi = `Given this prompt: ${cleanPrompt}, create an ascii flow chart that describes the elements derived from the prompt. The chart should be well-structured, visually engaging, and self-explanatory, with a logical flow from one node to the next.`;
}
 else {
    // The prompt does not start with "make_outline_320_"
    // Handle accordingly
    directiveToApi = `Create a comprehensive ASCII bubble graph based on the elements derived from the prompt: ${prompt}. 
    
    The graph should embody a hierarchical structure with multiple levels, similar to a mind map or organizational chart, to illustrate the interconnectedness and relationship between the main topic and its sub-elements.

    For instance, if the prompt is "good software engineer", the resulting graph could look like:
    
                Good Software Engineer
                       |_______|
                      |        |        |
          Technical Skills   Soft Skills  Problem-Solving
              |______|______|      |______|______|
             |       |      |      |       |      |
          Coding  Debugging System  Critical  Logical   Adaptability
                                 Design   Thinking  Reasoning
    
    The graph should exhibit depth, with at least 15 nodes encompassing multiple levels of hierarchy. Each node should represent a distinct element or concept related to the main prompt, and the connections between nodes should clearly depict the relationships among these elements. The nodes should be arranged in a manner that is easy to follow, with a clear demarcation between different levels of hierarchy. The graph should be well-organized, visually engaging, and self-explanatory, with a logical flow from one node to the next. 
    
    Please ensure the ASCII bubble graph is detailed, well-structured, and provides a visually appealing and informative representation of the elements contained in the prompt. Only output the title of the graph and the graph itself.
    
`
}


  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    // messages: messages.map((message: any) => ({
    //   content: message.content,
    //   role: message.role,
    // })),
    messages: [
            {
              role: 'user',
              content: directiveToApi
            },
            {
              role: 'assistant',
              content: '',
            },
          ],
          max_tokens: 2000,
          temperature: 0.8, // Adjust as needed for creativity vs consistency
          top_p: 1,
          frequency_penalty: 0.5, // Adjust as needed
          presence_penalty: 0.5, // Adjust as needed
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // console.log("STREAM", stream)
  // Respond with the stream
  return new StreamingTextResponse(stream);
}) satisfies RequestHandler;
