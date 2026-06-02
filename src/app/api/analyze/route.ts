export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 })
    }

    const prompt = `Analyze this article URL and extract structured information about harmful societal actions: ${url}

Extract the article publication date and the country/location mentioned. Format date as YYYY-MM-DD if possible.

Return ONLY valid JSON with this exact structure (no other text):
{
  "title": "concise title capturing the main claim",
  "summary": "one sentence describing the core harm or issue",
  "categories": ["category1", "category2"],
  "arguments": [
    {"text": "key claim from article", "relevance": 85},
    {"text": "another key claim", "relevance": 75}
  ],
  "sources": ["${url}", "other url if mentioned"],
  "article_date": "YYYY-MM-DD or original format if cannot parse",
  "country": "country or location mentioned in article"
}`

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3:8b',
        prompt: prompt,
        stream: false,
        temperature: 0.5
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

    if (!responseText) {
      return Response.json({ error: 'Empty response from analysis service' }, { status: 500 })
    }

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('Failed to extract JSON from response:', responseText)
        return Response.json({ error: 'Could not extract JSON from analysis response' }, { status: 500 })
      }

      const analysis = JSON.parse(jsonMatch[0])

      if (!analysis.title || !analysis.summary) {
        return Response.json({ error: 'Analysis missing required fields (title, summary)' }, { status: 500 })
      }

      return Response.json({
        title: analysis.title || '',
        summary: analysis.summary || '',
        categories: Array.isArray(analysis.categories) ? analysis.categories : [],
        arguments: Array.isArray(analysis.arguments) ? analysis.arguments : [],
        sources: Array.isArray(analysis.sources) ? analysis.sources : [url],
        article_date: analysis.article_date || '',
        country: analysis.country || ''
      })
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Text:', responseText)
      return Response.json({ error: 'Invalid JSON in analysis response' }, { status: 500 })
    }
  } catch (error) {
    console.error('Analysis error:', error)
    return Response.json(
      { error: 'Analysis failed: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
