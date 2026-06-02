export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 })
    }

    const prompt = `You are analyzing an article for a database of social phenomena. Analyze this URL and extract information about harmful societal actions described: ${url}

Extract the following information:

1. title: A concise title capturing the main claim
2. summary: One sentence describing the core harm or issue
3. categories: 1-3 broad categories relevant to this article (suggest new ones if needed)
4. arguments: A list of 3-5 key claims from the article, each as one clear sentence. Include a relevance score (1-100) for each.
5. sources: The original URL plus any other URLs cited in the article

Return as valid JSON only, with this structure:
{
  "title": "string",
  "summary": "string",
  "categories": ["string"],
  "arguments": [{"text": "string", "relevance": number}],
  "sources": ["string"]
}`

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt: prompt,
        stream: false,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      return Response.json(
        { error: 'Ollama service not available. Make sure Ollama is running: ollama serve' },
        { status: 503 }
      )
    }

    const data = await response.json()
    const responseText = data.response || ''

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return Response.json({ error: 'Could not parse analysis response' }, { status: 500 })
      }

      const analysis = JSON.parse(jsonMatch[0])
      return Response.json(analysis)
    } catch (parseError) {
      return Response.json({ error: 'Invalid JSON in analysis response' }, { status: 500 })
    }
  } catch (error) {
    return Response.json(
      { error: 'Analysis failed: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
