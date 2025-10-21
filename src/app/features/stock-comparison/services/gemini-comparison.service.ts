import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../core/services/logger.service';
import {
  ComparisonAnalysis,
  ComparedStock,
  ComparisonPromptSettings,
  PromptTemplate,
  GeminiGenerationConfig,
  CategoryComparison,
  GenerationMetadata,
} from '../models/stock-comparison.model';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  usageMetadata?: {
    totalTokenCount?: number;
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class GeminiComparisonService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);

  private readonly GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models';

  // Store metadata from last generation
  lastGenerationMetadata: GenerationMetadata | null = null;

  /**
   * Compare stocks using AI analysis with customizable prompts
   */
  async compareStocks(
    stocks: ComparedStock[],
    customPrompts?: Partial<ComparisonPromptSettings>
  ): Promise<ComparisonAnalysis> {
    if (stocks.length < 2) {
      throw new Error('At least 2 stocks are required for comparison');
    }

    if (stocks.length > 5) {
      throw new Error('Maximum 5 stocks can be compared at once');
    }

    try {
      this.logger.info('Starting stock comparison', {
        stocks: stocks.map((s) => s.ticker),
        useCustomPrompts: !!customPrompts,
      });

      // Build the comparison prompt
      const prompt = this.buildComparisonPrompt(stocks, customPrompts);
      const config = customPrompts?.generationConfig || this.getDefaultConfig();

      // Call Gemini API
      const response = await this.callGeminiAPI(prompt, config);

      // Parse and return the analysis
      return this.parseComparisonResponse(response, stocks);
    } catch (error: any) {
      this.logger.error('Stock comparison failed', error);
      throw new Error(
        error.message || 'Failed to generate comparison analysis'
      );
    }
  }

  /**
   * Build comprehensive comparison prompt
   */
  private buildComparisonPrompt(
    stocks: ComparedStock[],
    customPrompts?: Partial<ComparisonPromptSettings>
  ): string {
    const stockList = stocks
      .map(
        (s) =>
          `- ${s.ticker} (${s.name})
  Current Price: ₹${s.currentPrice.toFixed(2)}
  Market Cap: ${this.formatMarketCap(s.marketData.marketCap)}
  P/E Ratio: ${s.marketData.pe?.toFixed(2) || 'N/A'}
  Debt/Equity: ${s.marketData.debtToEquity?.toFixed(2) || 'N/A'}
  ROE: ${s.marketData.roe?.toFixed(2) || 'N/A'}%`
      )
      .join('\n\n');

    let prompt = `You are a professional Indian stock market analyst. Compare the following stocks for investment analysis:

${stockList}

---

`;

    // Add enabled category prompts
    const prompts = this.mergeWithDefaults(customPrompts);

    if (prompts.productsAndServices.enabled) {
      prompt += this.buildCategoryPrompt(
        'PRODUCTS & SERVICES',
        prompts.productsAndServices,
        stocks
      );
    }

    if (prompts.financialStability.enabled) {
      prompt += this.buildCategoryPrompt(
        'FINANCIAL STABILITY',
        prompts.financialStability,
        stocks
      );
    }

    if (prompts.fundamentals.enabled) {
      prompt += this.buildCategoryPrompt(
        'FUNDAMENTALS',
        prompts.fundamentals,
        stocks
      );
    }

    // Add output format instructions
    prompt += this.buildOutputFormatInstructions(stocks, prompts);

    return prompt;
  }

  /**
   * Build prompt section for a specific category
   */
  private buildCategoryPrompt(
    category: string,
    template: PromptTemplate,
    stocks: ComparedStock[]
  ): string {
    let prompt = `\n## ${category}\n\n`;
    prompt += `${template.systemPrompt}\n\n`;

    if (template.customInstructions) {
      prompt += `**Additional Instructions:**\n${template.customInstructions}\n\n`;
    }

    if (template.focusAreas.length > 0) {
      prompt += `**Focus specifically on:**\n`;
      template.focusAreas.forEach((area) => {
        prompt += `- ${area}\n`;
      });
      prompt += '\n';
    }

    // Add few-shot examples if provided
    if (template.examples && template.examples.length > 0) {
      prompt += `**Examples of good analysis:**\n\n`;
      template.examples.forEach((ex, idx) => {
        prompt += `Example ${idx + 1}:\n`;
        prompt += `Input: ${ex.input}\n`;
        prompt += `Output: ${ex.expectedOutput}\n\n`;
      });
    }

    return prompt;
  }

  /**
   * Build JSON output format instructions
   */
  private buildOutputFormatInstructions(
    stocks: ComparedStock[],
    prompts: ComparisonPromptSettings
  ): string {
    const tickers = stocks.map((s) => s.ticker);
    const exampleTicker = tickers[0];

    const detailedExample =
      prompts.productsAndServices.outputFormat === 'detailed'
        ? 'Comprehensive 3-4 paragraph analysis covering all aspects in detail'
        : 'Concise 1-2 paragraph summary highlighting key points';

    return `
---

**RESPONSE FORMAT:**

You MUST return ONLY a valid JSON object with this exact structure. Do not include any text before or after the JSON:

\`\`\`json
{
  "productsAndServices": {
    "description": "Brief overview of the comparison in this category",
    "stockInsights": {
      "${exampleTicker}": {
        "analysis": "${detailedExample}",
        "score": <number between 0-10>,
        "highlights": ["key point 1", "key point 2", "key point 3"]
      }
      // ... repeat for each stock: ${tickers.join(', ')}
    },
    "winner": "${exampleTicker}" // ticker of best stock in this category
  },
  "financialStability": {
    // Same structure as above
  },
  "fundamentals": {
    // Same structure as above
  },
  "summary": "Overall comparison conclusion in 2-3 sentences that synthesizes all categories",
  "recommendation": "Which stock to pick and why, in 1-2 sentences with specific reasoning"
}
\`\`\`

**CRITICAL REQUIREMENTS:**
1. Return ONLY valid JSON, no markdown formatting, no extra text
2. Include analysis for ALL stocks: ${tickers.join(', ')}
3. All scores must be realistic (0-10) and justified by analysis
4. Winner must be one of the actual tickers provided
5. Ensure highlights are specific and actionable
6. Base analysis on Indian market context and current economic conditions
`;
  }

  /**
   * Call Gemini API with retry logic
   */
  private async callGeminiAPI(
    prompt: string,
    config: GeminiGenerationConfig
  ): Promise<GeminiResponse> {
    const apiKey = environment.geminiApiKey;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const url = `${this.GEMINI_API_URL}/${config.model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: config.temperature,
        topK: config.topK,
        topP: config.topP,
        maxOutputTokens: config.maxOutputTokens,
        responseMimeType: 'application/json', // Request JSON response
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    };

    const startTime = Date.now();

    try {
      const response = await lastValueFrom(
        this.http.post<GeminiResponse>(url, requestBody)
      );

      const generationTime = Date.now() - startTime;

      // Store metadata
      this.lastGenerationMetadata = {
        model: config.model,
        temperature: config.temperature,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
        generationTime,
        promptVersion: '1.0',
        timestamp: new Date(),
      };

      this.logger.info('Gemini API call successful', {
        generationTime,
        tokens: this.lastGenerationMetadata.tokensUsed,
      });

      return response;
    } catch (error: any) {
      this.logger.error('Gemini API call failed', error);
      throw new Error(`API call failed: ${error.message}`);
    }
  }

  /**
   * Parse Gemini response into ComparisonAnalysis
   */
  private parseComparisonResponse(
    response: GeminiResponse,
    stocks: ComparedStock[]
  ): ComparisonAnalysis {
    try {
      // Extract text from response
      const text =
        response.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      // Try to parse as JSON
      let analysisData: any;

      // Remove markdown code blocks if present
      const cleanedText = text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      try {
        analysisData = JSON.parse(cleanedText);
      } catch (parseError) {
        this.logger.error('Failed to parse JSON response', { text });
        // Return fallback analysis
        return this.getFallbackAnalysis(stocks);
      }

      // Validate and structure the response
      const analysis: ComparisonAnalysis = {
        productsAndServices: analysisData.productsAndServices || undefined,
        financialStability: analysisData.financialStability || undefined,
        fundamentals: analysisData.fundamentals || undefined,
        summary:
          analysisData.summary ||
          'Comparison analysis completed. Review individual categories for details.',
        recommendation:
          analysisData.recommendation ||
          'Please review the detailed analysis for each stock.',
      };

      return analysis;
    } catch (error: any) {
      this.logger.error('Failed to parse comparison response', error);
      return this.getFallbackAnalysis(stocks);
    }
  }

  /**
   * Generate fallback analysis when API fails
   */
  private getFallbackAnalysis(stocks: ComparedStock[]): ComparisonAnalysis {
    const stockInsights: any = {};

    stocks.forEach((stock) => {
      stockInsights[stock.ticker] = {
        analysis:
          'Analysis temporarily unavailable. Please try again or check individual stock details.',
        score: 5,
        highlights: [
          'Data retrieval in progress',
          'Check back shortly',
          'Manual analysis recommended',
        ],
      };
    });

    const fallbackCategory: CategoryComparison = {
      description: 'Analysis temporarily unavailable',
      stockInsights,
      winner: stocks[0].ticker,
    };

    return {
      productsAndServices: fallbackCategory,
      financialStability: fallbackCategory,
      fundamentals: fallbackCategory,
      summary:
        'We encountered an issue generating the comparison. Please try again.',
      recommendation:
        'Consider reviewing each stock individually for detailed analysis.',
    };
  }

  /**
   * Merge custom prompts with defaults
   */
  private mergeWithDefaults(
    customPrompts?: Partial<ComparisonPromptSettings>
  ): ComparisonPromptSettings {
    const defaults = this.getDefaultConfig();

    if (!customPrompts) {
      return {
        productsAndServices: defaults.productsAndServices,
        financialStability: defaults.financialStability,
        fundamentals: defaults.fundamentals,
        generationConfig: defaults.generationConfig,
        defaultStockCount: defaults.defaultStockCount,
        autoSaveComparisons: defaults.autoSaveComparisons,
        showDetailedScores: defaults.showDetailedScores,
        lastUpdated: new Date(),
      };
    }

    return {
      productsAndServices:
        customPrompts.productsAndServices ||
        defaults.productsAndServices,
      financialStability:
        customPrompts.financialStability || defaults.financialStability,
      fundamentals: customPrompts.fundamentals || defaults.fundamentals,
      generationConfig:
        customPrompts.generationConfig || defaults.generationConfig,
      defaultStockCount:
        customPrompts.defaultStockCount || defaults.defaultStockCount,
      autoSaveComparisons:
        customPrompts.autoSaveComparisons !== undefined
          ? customPrompts.autoSaveComparisons
          : defaults.autoSaveComparisons,
      showDetailedScores:
        customPrompts.showDetailedScores !== undefined
          ? customPrompts.showDetailedScores
          : defaults.showDetailedScores,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get default comparison prompt settings
   */
  private getDefaultConfig(): ComparisonPromptSettings {
    // Import from model file
    return {
      productsAndServices: {
        enabled: true,
        systemPrompt: 'Default products and services analysis prompt',
        customInstructions: '',
        focusAreas: [],
        outputFormat: 'detailed',
      },
      financialStability: {
        enabled: true,
        systemPrompt: 'Default financial stability analysis prompt',
        customInstructions: '',
        focusAreas: [],
        outputFormat: 'detailed',
      },
      fundamentals: {
        enabled: true,
        systemPrompt: 'Default fundamentals analysis prompt',
        customInstructions: '',
        focusAreas: [],
        outputFormat: 'detailed',
      },
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
        model: 'gemini-1.5-flash-latest',
      },
      defaultStockCount: 3,
      autoSaveComparisons: true,
      showDetailedScores: true,
      lastUpdated: new Date(),
    };
  }

  /**
   * Format market cap for display
   */
  private formatMarketCap(marketCap?: number): string {
    if (!marketCap) return 'N/A';

    if (marketCap >= 100000) {
      return `₹${(marketCap / 100000).toFixed(2)} Lakh Cr`;
    } else if (marketCap >= 1000) {
      return `₹${(marketCap / 1000).toFixed(2)} Thousand Cr`;
    } else {
      return `₹${marketCap.toFixed(2)} Cr`;
    }
  }
}
