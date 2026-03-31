import apiClient from './axiosConfig';

export const aiApi = {
  ask: async (question: string): Promise<string> => {
    try {
      // The backend creates a raw JSON string using .formatted(question).
      // We must strip quotes and newlines so the backend's manual JSON builder doesn't break.
      const sanitizedQuestion = question
        .replace(/"/g, '\\"')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '');

      const response = await apiClient.get('/ai/ask', {
        params: { question: sanitizedQuestion }
      });
      
      const responseData = response.data;
      
      // Spring Boot might return the raw xAI JSON as a String or parse it into an object if Jackson intercepts it.
      let json = responseData;
      if (typeof responseData === 'string') {
        try {
          json = JSON.parse(responseData);
        } catch (e) {
          // If it fails to parse, maybe it's just plain text response, so return it directly
          return responseData;
        }
      }

      // xAI Chat completion response format
      if (json && json.choices && json.choices.length > 0) {
        return json.choices[0].message?.content || "No content returned.";
      }
      
      return "Received empty response from the backend AI.";
    } catch (error) {
      console.error("Error communicating with AI backend:", error);
      throw error;
    }
  }
};
