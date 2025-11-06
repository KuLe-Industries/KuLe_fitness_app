// Google Sheets API Integration
// This service handles all Google Sheets operations

export interface GoogleSheetsConfig {
  apiKey: string;
  spreadsheetId: string;
}

class GoogleSheetsService {
  private config: GoogleSheetsConfig | null = null;
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  initialize(config: GoogleSheetsConfig) {
    this.config = config;
  }

  private async request(endpoint: string, method: string = 'GET', body?: unknown) {
    if (!this.config) {
      throw new Error('Google Sheets not initialized. Please configure in Settings.');
    }

    const url = `${this.baseUrl}/${this.config.spreadsheetId}/${endpoint}?key=${this.config.apiKey}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || 'Google Sheets API error');
    }

    return response.json();
  }

  async appendRow(sheetName: string, values: unknown[]) {
    // First, ensure headers exist
    await this.ensureHeaders(sheetName);
    
    const endpoint = `values/${sheetName}:append?valueInputOption=RAW`;
    return this.request(endpoint, 'POST', {
      values: [values],
    });
  }

  private async ensureHeaders(sheetName: string) {
    try {
      const data = await this.getRange(sheetName, 'A1:Z1');
      if (!data.values || data.values.length === 0) {
        // Add headers based on sheet name
        const headers = this.getHeadersForSheet(sheetName);
        await this.updateRange(sheetName, 'A1', [headers]);
      }
    } catch (error) {
      // If sheet doesn't exist or error, try to create headers
      try {
        const headers = this.getHeadersForSheet(sheetName);
        await this.updateRange(sheetName, 'A1', [headers]);
      } catch (e) {
        console.warn(`Could not create headers for ${sheetName}:`, e);
      }
    }
  }

  private getHeadersForSheet(sheetName: string): string[] {
    switch (sheetName) {
      case 'Users':
        return ['ID', 'Display Name', 'Preferences', 'Created At'];
      case 'Exercises':
        return ['ID', 'Name', 'Muscle Groups', 'Equipment', 'Tags', 'Instructions', 'Created At'];
      case 'Plans':
        return ['ID', 'Name', 'Description', 'Blocks', 'Schedule', 'Created At', 'Updated At', 'Is Favorite'];
      case 'Sessions':
        return ['ID', 'User ID', 'Plan ID', 'Started At', 'Ended At', 'Notes', 'Items', 'Created At'];
      default:
        return [];
    }
  }

  async getRange(sheetName: string, range: string) {
    const endpoint = `values/${sheetName}!${range}`;
    return this.request(endpoint);
  }

  async updateRange(sheetName: string, range: string, values: unknown[][]) {
    const endpoint = `values/${sheetName}!${range}?valueInputOption=RAW`;
    return this.request(endpoint, 'PUT', {
      values,
    });
  }

  async clearRange(sheetName: string, range: string) {
    const endpoint = `values/${sheetName}!${range}:clear`;
    return this.request(endpoint, 'POST');
  }

  async batchUpdate(requests: unknown[]) {
    const endpoint = `values:batchUpdate`;
    return this.request(endpoint, 'POST', {
      valueInputOption: 'RAW',
      data: requests,
    });
  }
}

export const googleSheetsService = new GoogleSheetsService();

// Helper functions for specific data types
export async function saveUserToSheets(user: { id: string; displayName: string; preferences: unknown }) {
  const values = [
    user.id,
    user.displayName,
    JSON.stringify(user.preferences),
    new Date().toISOString(),
  ];
  await googleSheetsService.appendRow('Users', values);
}

export async function saveExerciseToSheets(exercise: { id: string; name: string; muscleGroups: string[]; equipment?: string[]; tags?: string[]; instructions?: string }) {
  const values = [
    exercise.id,
    exercise.name,
    exercise.muscleGroups.join(', '),
    exercise.equipment?.join(', ') || '',
    exercise.tags?.join(', ') || '',
    exercise.instructions || '',
    new Date().toISOString(),
  ];
  await googleSheetsService.appendRow('Exercises', values);
}

export async function savePlanToSheets(plan: { id: string; name: string; description?: string; blocks: unknown; schedule?: unknown; createdAt: string; updatedAt: string; isFavorite: boolean }) {
  const values = [
    plan.id,
    plan.name,
    plan.description || '',
    JSON.stringify(plan.blocks),
    JSON.stringify(plan.schedule || {}),
    plan.createdAt,
    plan.updatedAt,
    plan.isFavorite ? 'TRUE' : 'FALSE',
  ];
  await googleSheetsService.appendRow('Plans', values);
}

export async function saveSessionToSheets(session: { id: string; userId: string; planId?: string; startedAt: string; endedAt?: string; notes?: string; items: unknown }) {
  const values = [
    session.id,
    session.userId,
    session.planId || '',
    session.startedAt,
    session.endedAt || '',
    session.notes || '',
    JSON.stringify(session.items),
    new Date().toISOString(),
  ];
  await googleSheetsService.appendRow('Sessions', values);
}

