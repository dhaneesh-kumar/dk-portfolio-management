import { Injectable, signal, computed, inject, effect } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { AuthService } from '../../../core/services/auth.service';
import { LoggerService } from '../../../core/services/logger.service';
import {
  ComparisonPromptSettings,
  DEFAULT_COMPARISON_PROMPT_SETTINGS,
  PromptTemplate,
  GeminiGenerationConfig,
} from '../../stock-comparison/models/stock-comparison.model';

export interface UserPreferences {
  // Existing preferences (can be extended later)
  theme?: 'light' | 'dark' | 'auto';
  currency?: string;
  language?: string;

  // Stock Comparison Prompt Settings
  comparisonPrompts: ComparisonPromptSettings;
}

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private logger = inject(LoggerService);

  // Reactive state
  private preferencesSignal = signal<UserPreferences | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  preferences = this.preferencesSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  // Computed signal for comparison prompts
  comparisonPrompts = computed(() => {
    const prefs = this.preferences();
    if (prefs?.comparisonPrompts) {
      return prefs.comparisonPrompts;
    }
    return this.getDefaultPrompts();
  });

  constructor() {
    // Load preferences when user changes using effect
    effect(() => {
      const user = this.authService.user()();
      if (user) {
        this.loadPreferences(user.uid);
      } else {
        this.preferencesSignal.set(null);
      }
    });
  }

  /**
   * Load user preferences from Firestore
   */
  async loadPreferences(userId: string): Promise<void> {
    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      const docRef = doc(
        this.firestore,
        `users/${userId}/preferences/comparison`
      );
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();

        // Merge with defaults to ensure all fields exist
        const preferences: UserPreferences = {
          theme: data.theme || 'auto',
          currency: data.currency || 'INR',
          language: data.language || 'en',
          comparisonPrompts: {
            ...this.getDefaultPrompts(),
            ...data.comparisonPrompts,
          },
        };

        this.preferencesSignal.set(preferences);
        this.logger.info('User preferences loaded successfully');
      } else {
        // Initialize with defaults
        this.logger.info('No preferences found, using defaults');
        await this.initializeDefaultPreferences(userId);
      }
    } catch (error: any) {
      this.logger.error('Failed to load user preferences', error);
      this.errorSignal.set('Failed to load preferences');
      // Set defaults on error
      this.preferencesSignal.set({
        theme: 'auto',
        currency: 'INR',
        language: 'en',
        comparisonPrompts: this.getDefaultPrompts(),
      });
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Initialize default preferences for new user
   */
  private async initializeDefaultPreferences(userId: string): Promise<void> {
    const defaultPrefs: UserPreferences = {
      theme: 'auto',
      currency: 'INR',
      language: 'en',
      comparisonPrompts: this.getDefaultPrompts(),
    };

    this.preferencesSignal.set(defaultPrefs);
    await this.savePreferences(defaultPrefs.comparisonPrompts);
  }

  /**
   * Save comparison prompt settings to Firestore
   */
  async savePreferences(
    prompts: ComparisonPromptSettings
  ): Promise<boolean> {
    const user = this.authService.user()();
    if (!user) {
      this.errorSignal.set('User not authenticated');
      return false;
    }

    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      const docRef = doc(
        this.firestore,
        `users/${user.uid}/preferences/comparison`
      );

      // Convert Date to Timestamp for Firestore
      const promptsWithTimestamp = {
        ...prompts,
        lastUpdated: serverTimestamp(),
      };

      await setDoc(
        docRef,
        {
          comparisonPrompts: promptsWithTimestamp,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Update local state
      this.preferencesSignal.update((prefs) => ({
        ...prefs!,
        comparisonPrompts: {
          ...prompts,
          lastUpdated: new Date(),
        },
      }));

      this.logger.info('Comparison prompt settings saved successfully');
      return true;
    } catch (error: any) {
      this.logger.error('Failed to save preferences', error);
      this.errorSignal.set('Failed to save preferences');
      return false;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Update a specific prompt template
   */
  async updatePromptTemplate(
    category: 'productsAndServices' | 'financialStability' | 'fundamentals',
    template: PromptTemplate
  ): Promise<boolean> {
    const currentPrompts = this.comparisonPrompts();
    const updatedPrompts: ComparisonPromptSettings = {
      ...currentPrompts,
      [category]: template,
    };

    return await this.savePreferences(updatedPrompts);
  }

  /**
   * Update generation configuration
   */
  async updateGenerationConfig(
    config: GeminiGenerationConfig
  ): Promise<boolean> {
    const currentPrompts = this.comparisonPrompts();
    const updatedPrompts: ComparisonPromptSettings = {
      ...currentPrompts,
      generationConfig: config,
    };

    return await this.savePreferences(updatedPrompts);
  }

  /**
   * Reset to default prompt settings
   */
  async resetToDefaults(): Promise<boolean> {
    const defaultPrompts = this.getDefaultPrompts();
    return await this.savePreferences(defaultPrompts);
  }

  /**
   * Get default prompt configuration
   */
  getDefaultPrompts(): ComparisonPromptSettings {
    return { ...DEFAULT_COMPARISON_PROMPT_SETTINGS };
  }

  /**
   * Export settings as JSON string
   */
  exportSettings(): string {
    const prefs = this.preferences();
    if (!prefs) {
      return JSON.stringify(this.getDefaultPrompts(), null, 2);
    }
    return JSON.stringify(prefs.comparisonPrompts, null, 2);
  }

  /**
   * Import settings from JSON string
   */
  async importSettings(json: string): Promise<boolean> {
    try {
      const imported = JSON.parse(json);

      // Validate the imported data has required structure
      if (
        !imported.productsAndServices ||
        !imported.financialStability ||
        !imported.fundamentals ||
        !imported.generationConfig
      ) {
        throw new Error('Invalid settings format');
      }

      // Merge with defaults to ensure all fields exist
      const mergedPrompts: ComparisonPromptSettings = {
        ...this.getDefaultPrompts(),
        ...imported,
      };

      const success = await this.savePreferences(mergedPrompts);

      if (success) {
        this.logger.info('Settings imported successfully');
      }

      return success;
    } catch (error: any) {
      this.logger.error('Failed to import settings', error);
      this.errorSignal.set('Invalid settings file format');
      return false;
    }
  }

  /**
   * Get a specific prompt template
   */
  getPromptTemplate(
    category: 'productsAndServices' | 'financialStability' | 'fundamentals'
  ): PromptTemplate {
    return this.comparisonPrompts()[category];
  }

  /**
   * Check if custom prompts are configured (different from defaults)
   */
  hasCustomPrompts(): boolean {
    const current = this.comparisonPrompts();
    const defaults = this.getDefaultPrompts();

    return (
      JSON.stringify(current.productsAndServices) !==
        JSON.stringify(defaults.productsAndServices) ||
      JSON.stringify(current.financialStability) !==
        JSON.stringify(defaults.financialStability) ||
      JSON.stringify(current.fundamentals) !==
        JSON.stringify(defaults.fundamentals) ||
      current.generationConfig.temperature !==
        defaults.generationConfig.temperature ||
      current.generationConfig.maxOutputTokens !==
        defaults.generationConfig.maxOutputTokens
    );
  }
}
